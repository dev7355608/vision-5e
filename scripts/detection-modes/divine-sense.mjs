/**
 * The detection mode for Divine Sense.
 */
export default class DetectionModeDivineSense extends DetectionMode {
    imprecise = true;
    important = true;

    constructor() {
        super({
            id: "divineSense",
            label: "VISION5E.DivineSense",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: true,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 1, 0, 1]
        });
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
            && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.REVENANCE)) {
            return true;
        }

        const type = target.actor.system.details.type.value;

        return type === "celestial"
            || type === "fiend"
            || type === "undead";
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
