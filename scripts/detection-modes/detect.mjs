/**
 * Base class for Detect Evil and Good / Magic / Poison and Disease / Thoughts.
 * @abstract
 */
export default class DetectionModeDetect extends DetectionMode {
    imprecise = true;
    important = true;

    constructor(data = {}) {
        super(foundry.utils.mergeObject({
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: true,
            angle: true
        }, data));
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (!(target instanceof Token)
            || !target.actor
            || target.actor.type !== "character" && target.actor.type !== "npc"
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
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
        return !CONFIG.Canvas.polygonBackends.sight.testCollision(
            { x: visionSource.x, y: visionSource.y },
            test.point,
            {
                type: "sight",
                mode: "any",
                source: visionSource,
                useThreshold: true
            }
        );
    }
}
