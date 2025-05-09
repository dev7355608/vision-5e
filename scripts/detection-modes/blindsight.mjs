import DetectionMode from "./base.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * The detection mode for Blindsight.
 */
export default class DetectionModeBlindsight extends DetectionMode {
    constructor() {
        super({
            id: "blindsight",
            label: "DND5E.SenseBlindsight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            sort: -4,
        });
    }

    /** @override */
    static getDetectionFilter(visionSource, object) {
        if (visionSource?.data.detectionMode === "blindsight"
            && !canvas.effects.testInsideDarkness(object.document.getCenterPoint())) {
            return;
        }

        return this._detectionFilter ??= foundry.canvas.rendering.filters.OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            thickness: [0, 0],
            knockout: true,
            wave: true,
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof Token) {
            if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)) {
                return false;
            }
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        if ((source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLIND_SENSES)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.ECHOLOCATION))
        && source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAFENED)) {
            return false;
        }

        return true;
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        if (super._testLOS(visionSource, mode, target, test)) {
            return true;
        }

        const los = visionSource.getLOS(Infinity);

        if (los !== visionSource.los) {
            return los.contains(test.point.x, test.point.y);
        }

        return false;
    }
}
