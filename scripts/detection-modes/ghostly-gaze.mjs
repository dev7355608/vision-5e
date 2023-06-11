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
}
