import { createNameRegExp } from "../utils.js";

const detectionModeLightPerceptionClass = ((detectionModeLightPerceptionClass) =>
    /**
     * The detection mode for Light Perception.
     */
    class DetectionModeLightPerception extends detectionModeLightPerceptionClass {
        constructor() {
            super({
                id: DetectionMode.LIGHT_MODE_ID,
                label: "VISION5E.LightPerception",
                type: DetectionMode.DETECTION_TYPES.SIGHT
            });
        }

        /** @override */
        _canDetect(visionSource, target) {
            const source = visionSource.object;
            return !(source instanceof Token && (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLIND)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEP)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)))
                && !(target instanceof Token && (target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)
                    || target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
                    || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL) && !isGhost(target.actor)
                    && !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL))));
        }

        /** @override */
        _testPoint(visionSource, mode, target, test) {
            if (!DetectionMode.prototype._testPoint.call(this, visionSource, mode, target, test)) return false;
            const source = visionSource.object;
            if (source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
                return true;
            }
            for (const lightSource of canvas.effects.lightSources) {
                if (lightSource.disabled) continue;
                if (lightSource.shape.contains(test.point.x, test.point.y)) return true;
            }
            return false;
        }
    }
)(DetectionModeLightPerception);

export { detectionModeLightPerceptionClass as DetectionModeLightPerception };

export function isGhost(actor) {
    if (!(actor && actor.type === "npc" && actor.system.details.type?.value === "undead")) return false;
    let hasEtherealness = false;
    let hasIncorporealMovement = false;
    for (const item of actor.items) {
        if (item.type !== "feat") continue;
        hasEtherealness ||= ETHEREALNESS_FEAT.test(item.name);
        hasIncorporealMovement ||= INCORPOREAL_MOVEMENT_FEAT.test(item.name);
        if (hasEtherealness && hasIncorporealMovement) return true;
    }
    return false;
}

const ETHEREALNESS_FEAT = createNameRegExp({
    en: "Etherealness",
    de: "Körperlosigkeit",
    fr: "Forme éthérée",
    es: "Excursion eterea",
    "pt-BR": "Forma Etérea",
});

const INCORPOREAL_MOVEMENT_FEAT = createNameRegExp({
    en: "Incorporeal Movement",
    de: "Körperlose Bewegung",
    fr: "Mouvement incorporel",
    es: "Movimiento incorpóreo",
    "pt-BR": "Movimento Incorpóreo",
});
