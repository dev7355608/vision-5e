/**
 * The detection mode for Blindsight.
 */
export class DetectionModeBlindsight extends DetectionMode {
    priority = 500;

    /**
     * @type {PointSourcePolygon.WALL_DIRECTION_MODES}
     * @protected
     */
    _wallDirectionMode = PointSourcePolygon.WALL_DIRECTION_MODES.NORMAL;

    constructor(data = {}, options = {}) {
        super(foundry.utils.mergeObject({
            id: "blindsight",
            label: "ED4.SenseBlindsight",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: true,
            angle: false
        }, data), options);
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true,
            wave: true
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        // Blindsight can detect anything.
        return true;
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        if (this.angle && !this.#testAngle(visionSource, test.point)) return false;
        return !CONFIG.Canvas.polygonBackends.sight.testCollision(
            { x: visionSource.x, y: visionSource.y },
            test.point,
            {
                type: "sight",
                mode: "any",
                source: visionSource,
                wallDirectionMode: this._wallDirectionMode,
                // Blindsight is restricted by total cover and therefore cannot see
                // through windows. So we do not want blindsight to see through
                // a window as we get close to it. That's why we ignore thresholds.
                // We make the assumption that all windows are configured as threshold
                // walls. A move-based visibility check would also be an option to check
                // for total cover, but this would have the undesirable side effect that
                // blindsight wouldn't work through fences, portcullises, etc.
                useThreshold: false
            }
        );
    }

    /**
     * Test whether the point is inside the vision cone.
     * @param {VisionSource} visionSource
     * @param {PIXI.Point} point
     * @returns {boolean}
     */
    #testAngle(visionSource, point) {
        const { angle, rotation, externalRadius } = visionSource.data;

        if (angle !== 360) {
            const dx = point.x - visionSource.x;
            const dy = point.y - visionSource.y;

            if ((dx * dx) + (dy * dy) > externalRadius * externalRadius) {
                const aMin = rotation + 90 - (angle / 2);
                const a = Math.toDegrees(Math.atan2(dy, dx));

                if ((((a - aMin) % 360) + 360) % 360 > angle) {
                    return false;
                }
            }
        }

        return true;
    }
}
