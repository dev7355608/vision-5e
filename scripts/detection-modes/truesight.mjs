import DetectionMode from "./base.mjs";

/**
 * The detection mode for Truesight.
 */
export default class DetectionModeTruesight extends DetectionMode {

    constructor() {
        super({
            id: "seeAll",
            label: "DND5E.SenseTruesight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            priority: 5
        });
    }


    /** @override */
    static getDetectionFilter(visionSource) {
        if (visionSource?.data.detectionMode === "seeAll") {
            return;
        }

        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.basicSight.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof Token && target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)) {
            return false;
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
