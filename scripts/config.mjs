import { DetectionModeBlindsight } from "./detection-modes/blindsight.mjs";
import { DetectionModeDarkvision } from "./detection-modes/darkvision.mjs";
import { DetectionModeDetectEvilAndGood } from "./detection-modes/detect-evil-and-good.mjs";
import { DetectionModeDetectMagic } from "./detection-modes/detect-magic.mjs";
import { DetectionModeDetectPoisonAndDisease } from "./detection-modes/detect-poison-and-disease.mjs";
import { DetectionModeDetectThoughts } from "./detection-modes/detect-thoughts.mjs";
import { DetectionModeDevilsSight } from "./detection-modes/devils-sight.mjs";
import { DetectionModeDivineSense } from "./detection-modes/divine-sense.mjs";
import { DetectionModeEcholocation } from "./detection-modes/echolocation.mjs";
import { DetectionModeGhostlyGaze } from "./detection-modes/ghostly-gaze.mjs";
import { DetectionModeHearing } from "./detection-modes/hearing.mjs";
import { DetectionModeLightPerception } from "./detection-modes/light-perception.mjs";
import { DetectionModeSeeInvisibility } from "./detection-modes/see-invisibility.mjs";
import { DetectionModeTremorsense } from "./detection-modes/tremorsense.mjs";
import { DetectionModeTruesight } from "./detection-modes/truesight.mjs";
import { VisionModeBlindsight } from "./vision-modes/blindsight.mjs";
import { VisionModeDetectEvilAndGood } from "./vision-modes/detect-evil-and-good.mjs";
import { VisionModeDetectMagic } from "./vision-modes/detect-magic.mjs";
import { VisionModeDetectPoisonAndDisease } from "./vision-modes/detect-poison-and-disease.mjs";
import { VisionModeDetectThoughts } from "./vision-modes/detect-thoughts.mjs";
import { VisionModeDevilsSight } from "./vision-modes/devils-sight.mjs";
import { VisionModeDivineSense } from "./vision-modes/divine-sense.mjs";
import { VisionModeEcholocation } from "./vision-modes/echolocation.mjs";
import { VisionModeGhostlyGaze } from "./vision-modes/ghostly-gaze.mjs";
import { VisionModeTremorsense } from "./vision-modes/tremorsense.mjs";
import { VisionModeTruesight } from "./vision-modes/truesight.mjs";

export function registerDetectionMode(mode) {
    CONFIG.Canvas.detectionModes[mode.id] = mode;
}

export function registerVisionMode(mode) {
    CONFIG.Canvas.visionModes[mode.id] = mode;
}

export function renameDetectionMode(id, label) {
    CONFIG.Canvas.detectionModes[id]?.updateSource({ label });
}

export function renameVisionMode(id, label) {
    CONFIG.Canvas.visionModes[id]?.updateSource({ label });
}

export function registerStatusEffect(id, name, icon, index) {
    if (CONFIG.statusEffects.find((s) => s.id === id)) {
        return;
    }

    const statusEffect = { id, name, icon };

    Object.defineProperty(statusEffect, "label", {
        get() { return this.name; },
        set(value) { this.name = value; },
        enumerable: false,
        configurable: true
    });

    if (Number.isFinite(index)) {
        CONFIG.statusEffects.splice(index, 0, statusEffect);
    } else {
        CONFIG.statusEffects.push(statusEffect);
    }
}

const specialStatusEffectsHooks = new Map();

export function registerSpecialStatusEffect(key, statusId, hook) {
    if (key in CONFIG.specialStatusEffects && CONFIG.specialStatusEffects[key] !== statusId) {
        throw new Error();
    }

    CONFIG.specialStatusEffects[key] = statusId;
    specialStatusEffectsHooks.set(statusId, hook);
}

Hooks.on("applyTokenStatusEffect", (token, statusId, active) => {
    specialStatusEffectsHooks.get(statusId)?.(token, statusId, active);
});

Hooks.once("init", () => {
    registerDetectionMode(new DetectionModeBlindsight());
    registerDetectionMode(new DetectionModeDarkvision());
    registerDetectionMode(new DetectionModeDetectEvilAndGood());
    registerDetectionMode(new DetectionModeDetectMagic());
    registerDetectionMode(new DetectionModeDetectPoisonAndDisease());
    registerDetectionMode(new DetectionModeDetectThoughts());
    registerDetectionMode(new DetectionModeDevilsSight());
    registerDetectionMode(new DetectionModeDivineSense());
    registerDetectionMode(new DetectionModeEcholocation());
    registerDetectionMode(new DetectionModeGhostlyGaze());
    registerDetectionMode(new DetectionModeHearing());
    registerDetectionMode(new DetectionModeLightPerception());
    registerDetectionMode(new DetectionModeSeeInvisibility());
    registerDetectionMode(new DetectionModeTremorsense());
    registerDetectionMode(new DetectionModeTruesight());

    renameVisionMode("darkvision", "DND5E.SenseDarkvision");

    registerVisionMode(new VisionModeBlindsight());
    registerVisionMode(new VisionModeDetectEvilAndGood());
    registerVisionMode(new VisionModeDetectMagic());
    registerVisionMode(new VisionModeDetectPoisonAndDisease());
    registerVisionMode(new VisionModeDetectThoughts());
    registerVisionMode(new VisionModeDevilsSight());
    registerVisionMode(new VisionModeDivineSense());
    registerVisionMode(new VisionModeEcholocation());
    registerVisionMode(new VisionModeGhostlyGaze());
    registerVisionMode(new VisionModeTremorsense());
    registerVisionMode(new VisionModeTruesight());

    const refreshVision = () => canvas.perception.update({ refreshVision: true });

    registerSpecialStatusEffect("BURROW", "burrow", (token) => {
        // Workaround for #9687 (pre 11.304)
        if (token.parent !== token.layer.objects) {
            return;
        }

        token.updateLightSource();
        canvas.perception.update({ initializeVision: true });
    });
    registerSpecialStatusEffect("DEAF", "deaf", refreshVision);
    registerSpecialStatusEffect("DISEASE", "disease", refreshVision);
    registerSpecialStatusEffect("FLY", "fly", refreshVision);
    registerSpecialStatusEffect("ETHEREAL", "ethereal", refreshVision);
    registerSpecialStatusEffect("INAUDIBLE", "inaudible", refreshVision);
    registerSpecialStatusEffect("POISON", "poison", refreshVision);

    registerStatusEffect(
        CONFIG.specialStatusEffects.BURROW,
        "VISION5E.Burrowing",
        "modules/vision-5e/icons/burrow.svg",
        CONFIG.statusEffects.findIndex(s => s.id === CONFIG.specialStatusEffects.FLY) + 1
    );
    registerStatusEffect(
        CONFIG.specialStatusEffects.ETHEREAL,
        "VISION5E.Ethereal",
        "modules/vision-5e/icons/ethereal.svg"
    );
    registerStatusEffect(
        CONFIG.specialStatusEffects.INAUDIBLE,
        "VISION5E.Inaudible",
        "modules/vision-5e/icons/inaudible.svg",
        CONFIG.statusEffects.findIndex(s => s.id === CONFIG.specialStatusEffects.INVISIBLE) + 1
    );

    CONFIG.Token.objectClass = class Token5e extends CONFIG.Token.objectClass {
        /** @override */
        get emitsLight() {
            return super.emitsLight && !this.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW);
        }
    };
});

VisionSource.prototype._initialize = ((_initialize) => function (data) {
    if (this.object instanceof Token) {
        data.blinded ||= this.object.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW);
    }

    _initialize.call(this, data);
})(VisionSource.prototype._initialize);

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

PrimaryCanvasGroup.BACKGROUND_ELEVATION = -Infinity;
