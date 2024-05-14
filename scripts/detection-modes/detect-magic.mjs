import DetectionModeDetect from "./detect.mjs";

/**
 * The detection mode for Detect Magic.
 */
export default class DetectionModeDetectMagic extends DetectionModeDetect {

    constructor() {
        super({
            id: "detectMagic",
            label: "VISION5E.DetectMagic"
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 0, 1, 1]
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) {
            return false;
        }

        return target.document.hasStatusEffect(CONFIG.specialStatusEffects.MAGICAL);
    }
}
