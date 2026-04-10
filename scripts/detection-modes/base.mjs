export default class extends foundry.canvas.perception.DetectionMode {
    /** @override */
    static defineSchema() {
        return Object.assign(
            super.defineSchema(),
            {
                imprecise: new foundry.data.fields.BooleanField(),
                important: new foundry.data.fields.BooleanField(),
                sort: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0 }),
            },
        );
    }

    static {
        Hooks.once("init", () => {
            if (game.release.generation >= 14) {
                return;
            }

            const { PointSourcePolygon } = foundry.canvas.geometry;

            /**
             * @overload
             * @param {foundry.canvas.sources.PointVisionSource} visionSource
             * @param {Omit<foundry.types.CanvasVisibilityTest, "los">} test
             * @param {Partial<Omit<foundry.canvas.geometry.types.PointSourcePolygonConfig, "source">>} [config]
             * @returns {boolean}
             * @internal
             */
            /**
             * @overload
             * @param {foundry.canvas.sources.PointVisionSource} visionSource
             * @param {Pick<foundry.types.CanvasVisibilityTest, "point"|"los">} test
             * @param {foundry.canvas.geometry.PointSourcePolygon} los
             * @returns {boolean}
             * @internal
             */
            this._testCollision = function (visionSource, test, config) {
                const origin = visionSource.origin;
                const destination = test.point;
                let los;

                if (config instanceof PointSourcePolygon) {
                    los = config;
                    config = los.config;
                }

                if (los) {
                    return los.contains(destination.x, destination.y);
                }

                const { angle = 360, rotation = 0, externalRadius = 0 } = config;

                if (angle < 360 || externalRadius > 0) {
                    const dx = destination.x - origin.x;
                    const dy = destination.y - origin.y;

                    if (dx * dx + dy * dy <= externalRadius * externalRadius) {
                        if (angle <= 0) {
                            return true;
                        }

                        const aMin = rotation + 90 - (angle / 2);
                        const a = Math.toDegrees(Math.atan2(dy, dx));

                        if (((a - aMin) % 360 + 360) % 360 > angle) {
                            return true;
                        }
                    }
                }

                const type = config.type ?? visionSource.constructor.sourceType;

                config = { priority: visionSource.priority, ...config, type, mode: "any", source: visionSource };

                return CONFIG.Canvas.polygonBackends[type].testCollision(origin, destination, config);
            };
        });
    }
}
