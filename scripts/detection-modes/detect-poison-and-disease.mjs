import DetectionModeDetect from "./detect.mjs";

/**
 * The detection mode for Detect Poison and Disease.
 */
export default class DetectionModeDetectPoisonAndDisease extends DetectionModeDetect {
    constructor() {
        super({
            id: "detectPoisonAndDisease",
            label: "VISIONGURPS.DetectPoisonAndDisease",
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [0, 1, 0, 1],
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) {
            return false;
        }

        return target.document.hasStatusEffect(CONFIG.specialStatusEffects.DISEASED)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.POISONED)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.POISONOUS);
    }
}
