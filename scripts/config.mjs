import { DetectionModeBlindsense } from "./detection-modes/blindsense.mjs";
import { DetectionModeBlindsight } from "./detection-modes/blindsight.mjs";
import { DetectionModeDarkvision } from "./detection-modes/darkvision.mjs";
import { DetectionModeDetectEvilAndGood } from "./detection-modes/detect-evil-and-good.mjs";
import { DetectionModeDetectMagic } from "./detection-modes/detect-magic.mjs";
import { DetectionModeDetectPoisonAndDisease } from "./detection-modes/detect-poison-and-disease.mjs";
import { DetectionModeDetectThoughts } from "./detection-modes/detect-thoughts.mjs";
import { DetectionModeDevilsSight } from "./detection-modes/devils-sight.mjs";
import { DetectionModeDivineSense } from "./detection-modes/divine-sense.mjs";
import { DetectionModeEcholocation } from "./detection-modes/echolocation.mjs";
import { DetectionModeEtherealSight } from "./detection-modes/ethereral-sight.mjs";
import { DetectionModeGhostlyGaze } from "./detection-modes/ghostly-gaze.mjs";
import { DetectionModeHearing } from "./detection-modes/hearing.mjs";
import { DetectionModeLightPerception } from "./detection-modes/light-perception.mjs";
import { DetectionModeSeeInvisibility } from "./detection-modes/see-invisibility.mjs";
import { DetectionModeTremorsense } from "./detection-modes/tremorsense.mjs";
import { DetectionModeTruesight } from "./detection-modes/truesight.mjs";
import { DetectionModeDetectWitchSight as DetectionModeWitchSight } from "./detection-modes/witch-sight.mjs";
import { VisionModeBlindsight } from "./vision-modes/blindsight.mjs";
import { VisionModeDarkvision } from "./vision-modes/darkvision.mjs";
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

    if (foundry.utils.isNewerVersion(game.system.id, 3)) {
        statusEffect._id = dnd5e.utils.staticID(id);
    }

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

export const statusEffectIds = {};

const specialStatusEffectsHooks = new Map();

export function registerSpecialStatusEffect(key, statusId, hook) {
    CONFIG.specialStatusEffects[key] = statusId;
    specialStatusEffectsHooks.set(statusId, hook);
}

Hooks.on("applyTokenStatusEffect", (token, statusId, active) => {
    specialStatusEffectsHooks.get(statusId)?.(token, statusId, active);
});

Hooks.once("init", () => {
    registerDetectionMode(new DetectionModeBlindsense());
    registerDetectionMode(new DetectionModeBlindsight());
    registerDetectionMode(new DetectionModeDarkvision());
    registerDetectionMode(new DetectionModeDetectEvilAndGood());
    registerDetectionMode(new DetectionModeDetectMagic());
    registerDetectionMode(new DetectionModeDetectPoisonAndDisease());
    registerDetectionMode(new DetectionModeDetectThoughts());
    registerDetectionMode(new DetectionModeDevilsSight());
    registerDetectionMode(new DetectionModeDivineSense());
    registerDetectionMode(new DetectionModeEcholocation());
    registerDetectionMode(new DetectionModeEtherealSight());
    registerDetectionMode(new DetectionModeGhostlyGaze());
    registerDetectionMode(new DetectionModeHearing());
    registerDetectionMode(new DetectionModeLightPerception());
    registerDetectionMode(new DetectionModeSeeInvisibility());
    registerDetectionMode(new DetectionModeTremorsense());
    registerDetectionMode(new DetectionModeTruesight());
    registerDetectionMode(new DetectionModeWitchSight());

    registerVisionMode(new VisionModeBlindsight());
    registerVisionMode(new VisionModeDarkvision());
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

    const initializeVision = () => canvas.perception.update({ initializeVision: true });
    const refreshVision = () => canvas.perception.update({ refreshVision: true });

    for (const id of ["burrow", "deaf", "disease", "ethereal", "fly", "hover", "inaudible", "petrified", "poison", "sleep", "unconscious"]) {
        statusEffectIds[id] = id;
    }

    if (foundry.utils.isNewerVersion(game.system.version, 3)) {
        statusEffectIds.burrow = "burrowing";
        statusEffectIds.deaf = "deafened";
        statusEffectIds.disease = "diseased";
        statusEffectIds.fly = "flying";
        statusEffectIds.hover = "hovering";
        statusEffectIds.poison = "poisoned";
        statusEffectIds.sleep = "sleeping";
        statusEffectIds.unconscious = "unconscious";
    }

    registerSpecialStatusEffect("BURROW", statusEffectIds.burrow, (token) => {
        // Workaround for #9687 (pre 11.304)
        if (token.parent !== token.layer.objects) {
            return;
        }

        token.updateLightSource();
        canvas.perception.update({ initializeVision: true });
    });
    registerSpecialStatusEffect("DEAF", statusEffectIds.deaf, refreshVision);
    registerSpecialStatusEffect("DISEASE", statusEffectIds.disease, refreshVision);
    registerSpecialStatusEffect("ETHEREAL", statusEffectIds.ethereal, initializeVision);
    registerSpecialStatusEffect("FLY", statusEffectIds.fly, refreshVision);
    registerSpecialStatusEffect("HOVER", statusEffectIds.hover, refreshVision);
    registerSpecialStatusEffect("INAUDIBLE", statusEffectIds.inaudible, refreshVision);
    registerSpecialStatusEffect("PETRIFIED", statusEffectIds.petrified, refreshVision);
    registerSpecialStatusEffect("POISON", statusEffectIds.poison, refreshVision);
    registerSpecialStatusEffect("SLEEP", statusEffectIds.sleep, refreshVision);
    registerSpecialStatusEffect("UNCONSCIOUS", statusEffectIds.unconscious, refreshVision);

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
            return super.emitsLight && !this.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
                && !this.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL);
        }
    };
});

VisionSource.prototype._initialize = ((_initialize) => function (data) {
    if (this.object instanceof Token) {
        const token = this.object.document;
        data.blinded ||= token.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
            || token.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || token.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)
            || token.hasStatusEffect(CONFIG.specialStatusEffects.SLEEP);
    }

    _initialize.call(this, data);
})(VisionSource.prototype._initialize);

Hooks.on("initializeVisionSources", () => {
    const visionModeData = canvas.effects.visibility.visionModeData;
    const object = visionModeData.source?.object;

    if (object instanceof Token && object.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
        foundry.utils.mergeObject(canvas.effects.visibility.lightingVisibility, {
            background: VisionMode.LIGHTING_VISIBILITY.DISABLED,
            illumination: VisionMode.LIGHTING_VISIBILITY.DISABLED,
            coloration: VisionMode.LIGHTING_VISIBILITY.DISABLED,
            any: false
        });

        const lightingOptions = foundry.utils.deepClone(visionModeData.activeLightingOptions);

        canvas.effects.resetPostProcessingFilters();

        for (const layer of ["background", "illumination", "coloration"]) {
            const options = lightingOptions[layer];

            if (!options.postProcessingModes.includes("SATURATION")) {
                options.postProcessingModes.push("SATURATION");
            }

            options.uniforms.saturation = -1;

            canvas.effects.activatePostProcessingFilters(layer, options.postProcessingModes, options.uniforms);
        }

        visionModeData.activeLightingOptions = lightingOptions;
    }
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

PrimaryCanvasGroup.BACKGROUND_ELEVATION = -Infinity;
