import DetectionMode from "./base.mjs";

/**
 * The detection mode for Darkvision.
 */
export default class DetectionModeDarkvision extends DetectionMode {
    constructor() {
        super({
            id: "basicSight",
            label: "GURPS.SenseDarkvision",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            priority: 7,
        });
    }

    /** @override */
    static getDetectionFilter(visionSource, object) {
        if (visionSource?.data.detectionMode === "basicSight"
            && !(visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEVILS_SIGHT)
                && canvas.effects.testInsideDarkness(object.center, object.document.elevation))) {
            return;
        }

        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true,
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof Token) {
            if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.UMBRAL_SIGHT)) {
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

        if (visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEVILS_SIGHT)
            && visionSource.losDarknessExcluded !== visionSource.los) {
            return visionSource.losDarknessExcluded.contains(test.point.x, test.point.y);
        }

        return false;
    }
}
