import DetectionModeDetect from "./detect.mjs";

/**
 * The detection mode for Detect Thoughts.
 */
export default class DetectionModeDetectThoughts extends DetectionModeDetect {
    constructor() {
        super({
            id: "detectThoughts",
            label: "VISION5E.DetectThoughts",
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= foundry.canvas.rendering.filters.GlowOverlayFilter.create({
            glowColor: [0, 1, 1, 1],
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) {
            return false;
        }

        return target.document.hasStatusEffect(CONFIG.specialStatusEffects.THINKING);
    }
}
