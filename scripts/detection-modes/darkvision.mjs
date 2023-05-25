/**
 * The detection mode for Darkvision.
 */
export class DetectionModeDarkvision extends DetectionModeBasicSight {
    constructor(data = {}, options = {}) {
        super(foundry.utils.mergeObject({
            id: DetectionMode.BASIC_MODE_ID,
            label: "ED4.SenseDarkvision",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: true,
            angle: true
        }, data), options);
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (target instanceof Token) {
            const actor = target.actor;

            if (actor && (actor.type === "character" || actor.type === "npc")) {
                const localizedUmbralSight = game.i18n.localize("VISIONED4.UmbralSight");

                for (const item of actor.items) {
                    if (item.type === "feat" && (item.name === "Umbral Sight"
                        || item.name === localizedUmbralSight)) {
                        return true;
                    }
                }
            }
        }

        return super._canDetect(visionSource, target);
    }
}
