export default (PointVisionSource) => class extends PointVisionSource {
    /** @override */
    static defaultData = {
        ...super.defaultData,
        // Let's the Limits module know which detection mode this vision source represents and so it can constrain the FOV accordingly
        detectionMode: "basicSight",
        // The radius within vision is not constrained by walls
        unconstrainedRadius: 0,
    };

    /** @type {boolean|undefined} */
    #losHasDarknessEdge;

    /** @type {boolean} */
    #blindedByDarkness;

    /** @type {Map<number, foundry.canvas.geometry.PointSourcePolygon>}} */
    #losCache = new Map();

    /**
     * @param {number} priority
     * @returns {foundry.canvas.geometry.PointSourcePolygon}
     */
    getLOS(priority) {
        let polygon = this.#losCache.get(priority);

        if (polygon) {
            return polygon;
        }

        if (this.data.disabled || this.suppressed) {
            polygon = this.los;
        } else if (!this.blinded.darkness && !(this.#losHasDarknessEdge ??= this.los.edges.some((edge) => edge.type === "darkness"))) {
            polygon = this.los;
        } else {
            const config = this._getPolygonConfiguration();
            const insideDarkness = canvas.effects.testInsideDarkness(this.origin,
                { condition: (darknessSource) => priority <= darknessSource.priority });

            config.radius = insideDarkness ? this.data.externalRadius : canvas.dimensions.maxR;
            config.priority = priority;

            const polygonClass = CONFIG.Canvas.polygonBackends[this.constructor.sourceType];

            polygon = polygonClass.create(this.origin, config);

            if (this.data.unconstrainedRadius > 0) {
                const radius = Math.min(this.data.unconstrainedRadius, polygon.config.radius);
                let union = new PIXI.Circle(this.origin.x, this.origin.y, radius).intersectPolygon(polygon, {
                    clipType: ClipperLib.ClipType.ctUnion,
                    scalingFactor: CONST.CLIPPER_SCALING_FACTOR,
                    density: PIXI.Circle.approximateVertexDensity(radius),
                });
                const bounds = polygon.config.useInnerBounds ? canvas.dimensions.sceneRect : canvas.dimensions.rect;

                if (Math.min(this.origin.x - bounds.left, bounds.right - this.origin.x,
                    this.origin.y - bounds.top, bounds.bottom - this.origin.y) < radius) {
                    union = bounds.intersectPolygon(union, { scalingFactor: CONST.CLIPPER_SCALING_FACTOR });
                }

                polygon.points = union.points;
                polygon.bounds = polygon.getBounds();
            }
        }

        this.#losCache.set(priority, polygon);

        return polygon;
    }

    /** @override */
    get isBlinded() {
        return this.data.radius === 0 && (this.data.lightRadius === 0 || !this.visionMode?.perceivesLight) || this.#blindedByDarkness;
    }

    /** @override */
    _createShapes() {
        this._updateVisionMode();

        this.#losHasDarknessEdge = undefined;
        this.#blindedByDarkness = this.blinded.darkness;

        if (this.priority !== 0) {
            this.blinded.darkness = canvas.effects.testInsideDarkness(this.origin);
        }

        const config = this._getPolygonConfiguration();

        config.priority = 0;

        const polygonClass = CONFIG.Canvas.polygonBackends[this.constructor.sourceType];

        this.los = polygonClass.create(this.origin, config);
        this.#losCache.clear();
        this.#losCache.set(0, this.los);

        if (this.data.unconstrainedRadius > 0) {
            const config = this._getPolygonConfiguration();

            config.type = "universal";
            config.radius = Math.min(this.data.unconstrainedRadius, this.los.config.radius);
            config.edgeTypes = foundry.utils.deepClone(this.los.config.edgeTypes);
            delete config.edgeTypes.wall;

            this.los.points = polygonClass.create(this.origin, config).intersectPolygon(this.los,
                { clipType: ClipperLib.ClipType.ctUnion, scalingFactor: CONST.CLIPPER_SCALING_FACTOR }).points;
            this.los.bounds = this.los.getBounds();
        }

        this.light = this._createLightPolygon();
        this.shape = this._createRestrictedPolygon();
    }

    /** @override */
    _createLightPolygon() {
        return this.#createConstrainedPolygon(this.lightRadius, 0);
    }

    /** @override */
    _createRestrictedPolygon() {
        return this.#createConstrainedPolygon(this.radius || this.data.externalRadius, this.priority);
    }

    /**
     * @param {number} radius
     * @param {number} priority
     * @returns {foundry.canvas.geometry.PointSourcePolygon}
     */
    #createConstrainedPolygon(radius, priority) {
        const los = this.getLOS(priority);

        if (radius >= los.config.radius) {
            return los;
        }

        const { x, y } = this.data;
        const circle = new PIXI.Circle(x, y, radius);
        const density = PIXI.Circle.approximateVertexDensity(radius);

        return los.applyConstraint(circle, { density, scalingFactor: CONST.CLIPPER_SCALING_FACTOR });
    }
};
