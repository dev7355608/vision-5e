/**
 * The detection mode for Darkvision.
 */
export class DetectionModeDarkvision extends DetectionModeBasicSight {
    /**
     * If false, Umbral Sight is ignored if the source and target have the same disposition.
     * @type {boolean}
     */
    static friendlyUmbralSight = true;

    constructor(data = {}, options = {}) {
        super(foundry.utils.mergeObject({
            id: DetectionMode.BASIC_MODE_ID,
            label: "DND5E.SenseDarkvision",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: true,
            angle: true
        }, data), options);
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (target instanceof Token) {
            const actor = target.actor;

            if (actor && (actor.type === "character" || actor.type === "npc")
                && (this.constructor.friendlyUmbralSight
                    || visionSource.object.document.disposition !== target.document.disposition)) {
                const localizedUmbralSight = game.i18n.localize("VISION5E.UmbralSight");

                for (const item of actor.items) {
                    if (item.type === "feat" && (item.name === "Umbral Sight"
                        || item.name === localizedUmbralSight)) {
                        return false;
                    }
                }
            }
        }

        return super._canDetect(visionSource, target);
    }
}
