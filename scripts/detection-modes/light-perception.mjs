import DetectionMode from "./base.mjs";

/**
 * The detection mode for Light Perception.
 */
export default class DetectionModeLightPerception extends DetectionMode {
    constructor() {
        super({
            id: "lightPerception",
            label: "DETECTION.LightPerception",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            priority: 8,
        });
    }

    /** @override */
    static getDetectionFilter(visionSource, object) {
        if (visionSource?.visionMode.perceivesLight && (!object.document.hasStatusEffect(CONFIG.specialStatusEffects.BURNING)
            || canvas.effects.testInsideLight(object.center, object.document.elevation))) {
            return;
        }

        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.basicSight.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof Token) {
            if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)) {
                return false;
            }
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLINDED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        return true;
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        return super._testPoint(visionSource, mode, target, test)
            && (canvas.effects.testInsideLight(test.point, test.elevation)
                || target instanceof Token && target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURNING));
    }
}
