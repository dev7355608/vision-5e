import { DetectionModeDarkvision } from "./darkvision.mjs";

/**
 * The detection mode for Ghostly Gaze.
 */
export class DetectionModeGhostlyGaze extends DetectionModeDarkvision {
    constructor() {
        super({
            id: "ghostlyGaze",
            label: "VISION5E.GhostlyGaze",
            walls: false
        });
    }

    /** @override */
    static getDetectionFilter(revealed) {
        if (revealed) return false;
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 0.4, 1, 1]
        });
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        return this.#testAngle(visionSource, test.point);
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
