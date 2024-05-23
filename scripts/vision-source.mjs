export default (PointVisionSource) => class extends PointVisionSource {

    /** @override */
    static defaultData = {
        ...super.defaultData,
        // Let's the Limits module know which detection mode this vision source represents and so it can constrain the FOV accordingly
        detectionMode: "basicSight",
        // Affects PointVisionSource#los, PointVisionSource#light, and PointVisionSource#shape
        ignoreDarkness: false,
        // Affects only PointVisionSource#shape but not PointVisionSource#los or ointVisionSource#light
        includeDarkness: true,
        // The radius within vision is not constrained by walls
        unconstrainedRadius: 0,
    };

    /** @override */
    get isBlinded() {
        return this.data.radius === 0 && (this.data.lightRadius === 0 || !this.visionMode?.perceivesLight)
            || !this.data.ignoreDarkness && this.data.includeDarkness && this.blinded.darkness;
    }

    /** @type {PointSourcePolygon} */
    get losDarknessExcluded() {
        let polygon = this.#losDarknessExcluded;

        if (!polygon) {
            if (this.data.disabled || this.suppressed || !this.blinded.darkness
                && this.los.edges.every((edge) => edge.type !== "darkness")) {
                polygon = this.los;
            } else {
                const origin = { x: this.data.x, y: this.data.y };
                const config = this._getPolygonConfiguration();

                config.radius = canvas.dimensions.maxR;
                config.includeDarkness = false;

                const polygonClass = CONFIG.Canvas.polygonBackends[this.constructor.sourceType];

                polygon = polygonClass.create(origin, config);

                if (this.data.unconstrainedRadius > 0) {
                    const radius = this.data.unconstrainedRadius;
                    const circle = new PIXI.Circle(origin.x, origin.y, radius);
                    const density = PIXI.Circle.approximateVertexDensity(radius);

                    polygon.points = WeilerAthertonClipper.union(this.los, circle, { density })[0].points;
                    polygon.bounds = this.los.getBounds();
                }
            }

            this.#losDarknessExcluded = polygon;
        }

        return polygon;
    }

    /** @type {PointSourcePolygon} */
    #losDarknessExcluded;

    /** @override */
    _getPolygonConfiguration() {
        const config = super._getPolygonConfiguration();

        if (this.data.ignoreDarkness) {
            config.radius = this.data.disabled || this.suppressed ? 0 : canvas.dimensions.maxR;
            config.includeDarkness = false;
        }

        return config;
    }

    /** @override */
    _createShapes() {
        this.#losDarknessExcluded = undefined;

        const origin = { x: this.data.x, y: this.data.y };
        const config = this._getPolygonConfiguration();
        const polygonClass = CONFIG.Canvas.polygonBackends[this.constructor.sourceType];

        this.los = polygonClass.create(origin, config);

        if (this.data.unconstrainedRadius > 0) {
            const config = this._getPolygonConfiguration();

            config.type = "universal";
            config.radius = this.data.unconstrainedRadius;

            this.los.points = polygonClass.create(origin, config).points;
            this.los.bounds = this.los.getBounds();
        }

        this.light = this._createLightPolygon();
        this.shape = this._createRestrictedPolygon();
    }

    /** @override */
    _createLightPolygon() {
        return this.#createConstrainedPolygon(this.lightRadius, true);
    }

    /** @override */
    _createRestrictedPolygon() {
        return this.#createConstrainedPolygon(this.radius || this.data.externalRadius, this.data.includeDarkness);
    }

    /**
     * @param {number} radius
     * @param {boolean} includeDarkness
     * @returns {PointSourcePolygon}
     */
    #createConstrainedPolygon(radius, includeDarkness) {
        const los = includeDarkness ? this.los : this.losDarknessExcluded;

        if (radius >= los.config.radius) {
            return los;
        }

        const { x, y } = this.data;
        const circle = new PIXI.Circle(x, y, radius);
        const density = PIXI.Circle.approximateVertexDensity(radius);

        return los.applyConstraint(circle, { density, scalingFactor: 100 });
    }
};
