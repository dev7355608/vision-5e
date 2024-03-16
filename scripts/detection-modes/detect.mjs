/**
 * Base class for Detect Magic, Thoughts, etc.
 * @abstract
 */
export class DetectionModeDetect extends DetectionMode {
    imprecise = true;
    important = true;
    priority = -3000;

    constructor(data = {}, options = {}) {
        super(foundry.utils.mergeObject({
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: true,
            angle: true
        }, data), options);
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!(target instanceof Token)) return false;
        const source = visionSource.object;
        return !(source instanceof Token && (source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEP)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)))
            && !(target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !(target.actor?.type === "npc" && target.actor.system.details.type?.value === "undead")
                && !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)));
    }
}
