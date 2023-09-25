import { createNameRegExp } from "../utils.js";
import { DetectionModeDetect } from "./detect.mjs";

/**
 * The detection mode for Detect Evil and Good.
 */
export class DetectionModeDetectEvilAndGood extends DetectionModeDetect {
    static #racesRegex = createNameRegExp({
        en: ["Centaur", "Changeling", "Fairy", "Hexblood", "Satyr"],
        de: ["Zentaur", "Wechselbalg", "Fee", "Hexblut", "Satyr"],
        fr: ["Centaure", "Changelin", "Fée", "Sang maudit", "Satyre"],
    });

    constructor() {
        super({
            id: "detectEvilAndGood",
            label: "VISION5E.DetectEvilAndGood"
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
        if (!super._canDetect(visionSource, target)) return false;
        const actor = target.actor;
        if (!actor) return false;
        const type = actor.type;
        if (type === "character") {
            const race = actor.system.details.race;
            return DetectionModeDetectEvilAndGood.#racesRegex.test(race);
        }
        if (type === "npc") {
            const type = actor.system.details.type.value;
            return type === "aberration"
                || type === "celestial"
                || type === "elemental"
                || type === "fey"
                || type === "fiend"
                || type === "undead";
        }
        return false;
    }
}
