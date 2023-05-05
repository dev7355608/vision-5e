import { DetectionModeBlindsight } from "./detection-modes/blindsight.mjs";
import { DetectionModeDetectEvilAndGood } from "./detection-modes/detect-evil-and-good.mjs";
import { DetectionModeDetectMagic } from "./detection-modes/detect-magic.mjs";
import { DetectionModeDetectPoisonAndDisease } from "./detection-modes/detect-poison-and-disease.mjs";
import { DetectionModeDetectThoughts } from "./detection-modes/detect-thoughts.mjs";
import { DetectionModeDevilsSight } from "./detection-modes/devils-sight.mjs";
import { DetectionModeEcholocation } from "./detection-modes/echolocation.mjs";
import { DetectionModeHearing } from "./detection-modes/hearing.mjs";
import { DetectionModeSeeInvisibility } from "./detection-modes/see-invisibility.mjs";
import { DetectionModeTremorsense } from "./detection-modes/tremorsense.mjs";
import { DetectionModeTruesight } from "./detection-modes/truesight.mjs";
import { VisionModeBlindsight } from "./vision-modes/blindsight.mjs";
import { VisionModeDetectEvilAndGood } from "./vision-modes/detect-evil-and-good.mjs";
import { VisionModeDetectMagic } from "./vision-modes/detect-magic.mjs";
import { VisionModeDetectPoisonAndDisease } from "./vision-modes/detect-poison-and-disease.mjs";
import { VisionModeDetectThoughts } from "./vision-modes/detect-thoughts.mjs";
import { VisionModeDevilsSight } from "./vision-modes/devils-sight.mjs";
import { VisionModeEcholocation } from "./vision-modes/echolocation.mjs";
import { VisionModeTremorsense } from "./vision-modes/tremorsense.mjs";
import { VisionModeTruesight } from "./vision-modes/truesight.mjs";

function registerDetectionMode(mode) {
    CONFIG.Canvas.detectionModes[mode.id] = mode;
}

function registerVisionMode(mode) {
    CONFIG.Canvas.visionModes[mode.id] = mode;
}

function renameDetectionMode(id, label) {
    CONFIG.Canvas.detectionModes[id]?.updateSource({ label });
}

function renameVisionMode(id, label) {
    CONFIG.Canvas.visionModes[id]?.updateSource({ label });
}

const specialStatusEffectsHooks = new Map();

function registerSpecialStatusEffect(key, statusId, hook) {
    if (key in CONFIG.specialStatusEffects && CONFIG.specialStatusEffects[key] !== statusId) {
        throw new Error();
    }

    CONFIG.specialStatusEffects[key] = statusId;
    specialStatusEffectsHooks.set(statusId, hook);
}

function registerStatusEffect(statusEffect, index) {
    if (index !== undefined) {
        CONFIG.statusEffects.splice(index, 0, statusEffect);
    } else {
        CONFIG.statusEffects.push(statusEffect);
    }
}

function refreshVision() {
    canvas.perception.update({ refreshVision: true });
}

Hooks.once("init", () => {
    renameDetectionMode(DetectionMode.BASIC_MODE_ID, "DND5E.SenseDarkvision");
    renameDetectionMode(DetectionMode.LIGHT_MODE_ID, "VISION5E.LightPerception");

    registerDetectionMode(new DetectionModeBlindsight());
    registerDetectionMode(new DetectionModeDetectEvilAndGood());
    registerDetectionMode(new DetectionModeDetectMagic());
    registerDetectionMode(new DetectionModeDetectPoisonAndDisease());
    registerDetectionMode(new DetectionModeDetectThoughts());
    registerDetectionMode(new DetectionModeDevilsSight());
    registerDetectionMode(new DetectionModeEcholocation());
    registerDetectionMode(new DetectionModeHearing());
    registerDetectionMode(new DetectionModeTremorsense());
    registerDetectionMode(new DetectionModeTruesight());
    registerDetectionMode(new DetectionModeSeeInvisibility());

    renameVisionMode("darkvision", "DND5E.SenseDarkvision");

    registerVisionMode(new VisionModeBlindsight());
    registerVisionMode(new VisionModeDetectEvilAndGood());
    registerVisionMode(new VisionModeDetectMagic());
    registerVisionMode(new VisionModeDetectPoisonAndDisease());
    registerVisionMode(new VisionModeDetectThoughts());
    registerVisionMode(new VisionModeDevilsSight());
    registerVisionMode(new VisionModeEcholocation());
    registerVisionMode(new VisionModeTremorsense());
    registerVisionMode(new VisionModeTruesight());

    registerSpecialStatusEffect("DEAF", "deaf", refreshVision);
    registerSpecialStatusEffect("DISEASE", "disease", refreshVision);
    registerSpecialStatusEffect("FLY", "fly", refreshVision);
    registerSpecialStatusEffect("INAUDIBLE", "inaudible", refreshVision);
    registerSpecialStatusEffect("POISON", "poison", refreshVision);

    registerStatusEffect(
        {
            id: CONFIG.specialStatusEffects.INAUDIBLE,
            label: "VISION5E.Inaudible",
            icon: "icons/svg/sound-off.svg"
        },
        CONFIG.statusEffects.findIndex(s => s.id === CONFIG.specialStatusEffects.INVISIBLE) + 1
    );
});

Hooks.once("i18nInit", () => {
    function sort(modes) {
        const sorted = Object.values(modes)
            .sort((a, b) => game.i18n.localize(a.label).localeCompare(
                game.i18n.localize(b.label), game.i18n.lang));


        for (const id in modes) {
            delete modes[id];
        }

        for (const mode of sorted) {
            modes[mode.id] = mode;
        }
    }

    sort(CONFIG.Canvas.detectionModes);
    sort(CONFIG.Canvas.visionModes);
});

// TODO
Hooks.once("init", () => {
    CONFIG.Token.objectClass = class Token5e extends CONFIG.Token.objectClass {
        /** @override */
        _onApplyStatusEffect(statusId, active) {
            super._onApplyStatusEffect(statusId, active);

            specialStatusEffectsHooks.get(statusId)?.(statusId, active);
        }
    };
});
