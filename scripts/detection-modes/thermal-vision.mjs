import DetectionMode from "./base.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * The detection mode for Thermal Vision.
 */
export default class DetectionModeThermalVision extends DetectionMode {
    constructor() {
        super({
            id: "thermalVision",
            label: "VISION5E.ThermalVision",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= foundry.canvas.rendering.filters.GlowOverlayFilter.create({
            glowColor: [1, 0.5, 0, 1],
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (!(target instanceof Token)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLINDED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.INCAPACITATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURNING)) {
            return true;
        }

        const creatureType = target.actor?.system.details?.type.value;

        if (!creatureType) {
            return false;
        }

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        if (game.modules.get("ember")?.active) {
            const override = target.actor.flags.ember?.warmBlooded;

            if (typeof override === "boolean") {
                return override;
            }
        }

        return creatureType === "beast"
            || creatureType === "celestial"
            || creatureType === "dragon"
            || creatureType === "fey"
            || creatureType === "fiend"
            || creatureType === "giant"
            || creatureType === "humanoid"
            || creatureType === "monstrosity";
    }
}
