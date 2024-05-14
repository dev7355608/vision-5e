/**
 * The detection mode for Light Perception.
 */
export default class DetectionModeLightPerception extends new Function("return DetectionModeLightPerception")() {
    priority = 8;

    constructor() {
        super({
            id: "lightPerception",
            label: "DETECTION.LightPerception",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: true,
            angle: true
        });
    }

    /** @override */
    static getDetectionFilter(visionSource) {
        if (visionSource?.visionMode.perceivesLight) {
            return;
        }

        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.basicSight.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (visionSource.blinded.darkness) {
            return false;
        }

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
}
