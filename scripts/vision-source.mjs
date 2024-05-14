export default (PointVisionSource) => class extends PointVisionSource {

    /** @override */
    static defaultData = {
        ...super.defaultData,
        includeDarkness: true,
        detectionMode: "basicSight"
    };

    /** @override */
    get isBlinded() {
        // Violates documentation of PointVisionSource#blinded, but it doesn't break anything
        return this.data.includeDarkness && this.blinded.darkness;
    }

    /** @type {PointSourcePolygon} */
    get losDarknessExcluded() {
        let polygon = this.#losDarknessExcluded;

        if (!polygon) {
            if (this.los.edges.every((edge) => edge.type !== "darkness")) {
                polygon = this.los;
            } else {
                const origin = { x: this.data.x, y: this.data.y };
                const config = this._getPolygonConfiguration();

                config.includeDarkness = false;

                const polygonClass = CONFIG.Canvas.polygonBackends[this.constructor.sourceType];

                polygon = polygonClass.create(origin, config);
            }

            this.#losDarknessExcluded = polygon;
        }

        return polygon;
    }

    /** @type {PointSourcePolygon} */
    #losDarknessExcluded;

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
