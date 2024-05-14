/**
 * The detection mode for Devil's Sight.
 */
export default class DetectionModeDevilsSight extends DetectionMode {
    priority = 6;

    constructor() {
        super({
            id: "devilsSight",
            label: "VISION5E.DevilsSight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: true,
            angle: true
        });
    }

    /** @override */
    static getDetectionFilter(visionSource) {
        if (visionSource?.visionMode.id === "devilsSight") {
            return;
        }

        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.basicSight.getDetectionFilter();
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
    _testLOS(visionSource, mode, target, test) {
        if (super._testLOS(visionSource, mode, target, test)) {
            return true;
        }

        if (visionSource.losDarknessExcluded !== visionSource.los) {
            return visionSource.losDarknessExcluded.contains(test.point.x, test.point.y);
        }

        return false;
    }
}
