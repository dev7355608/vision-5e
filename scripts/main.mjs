import ActorMixin from "./actor.mjs";
import TokenMixin from "./token.mjs";
import TokenConfigMixin from "./token-config.mjs";
import TokenDocumentMixin from "./token-document.mjs";
import TokenHUDMixin from "./token-hud.mjs";
import VisionSourceMixin from "./vision-source.mjs";
import CombatTrackerMixin from "./combat-tracker.mjs";
import DetectionModeBlindsense from "./detection-modes/blindsense.mjs";
import DetectionModeBlindsight from "./detection-modes/blindsight.mjs";
import DetectionModeBloodSense from "./detection-modes/blood-sense.mjs";
import DetectionModeDarkvision from "./detection-modes/darkvision.mjs";
import DetectionModeDetectEvilAndGood from "./detection-modes/detect-evil-and-good.mjs";
import DetectionModeDetectMagic from "./detection-modes/detect-magic.mjs";
import DetectionModeDetectPoisonAndDisease from "./detection-modes/detect-poison-and-disease.mjs";
import DetectionModeDetectThoughts from "./detection-modes/detect-thoughts.mjs";
import DetectionModeDevilsSight from "./detection-modes/devils-sight.mjs";
import DetectionModeDivineSense from "./detection-modes/divine-sense.mjs";
import DetectionModeEtherealSight from "./detection-modes/ethereral-sight.mjs";
import DetectionModeHearing from "./detection-modes/hearing.mjs";
import DetectionModeLifeSense from "./detection-modes/life-sense.mjs";
import DetectionModeLightPerception from "./detection-modes/light-perception.mjs";
import DetectionModeSeeInvisibility from "./detection-modes/see-invisibility.mjs";
import DetectionModeTremorsense from "./detection-modes/tremorsense.mjs";
import DetectionModeTruesight from "./detection-modes/truesight.mjs";
import DetectionModeDetectWitchSight from "./detection-modes/witch-sight.mjs";
import VisionModeBlindsight from "./vision-modes/blindsight.mjs";
import VisionModeDarkvision from "./vision-modes/darkvision.mjs";
import VisionModeDevilsSight from "./vision-modes/devils-sight.mjs";
import VisionModeEtherealness from "./vision-modes/etherealness.mjs";
import VisionModeTruesight from "./vision-modes/truesight.mjs";
import testVisibility from "./test-visibility.mjs";

Hooks.once("init", () => {
    // Extend Actor, TokenDocument, Token, and TokenHUD
    CONFIG.Actor.documentClass = ActorMixin(CONFIG.Actor.documentClass);
    CONFIG.Token.documentClass = TokenDocumentMixin(CONFIG.Token.documentClass);
    CONFIG.Token.objectClass = TokenMixin(CONFIG.Token.objectClass);
    CONFIG.Token.hudClass = TokenHUDMixin(CONFIG.Token.hudClass);

    // Extend PointVisionSource
    CONFIG.Canvas.visionSourceClass = VisionSourceMixin(CONFIG.Canvas.visionSourceClass);

    // Extend CombatTracker
    CONFIG.ui.combat = CombatTrackerMixin(CONFIG.ui.combat);

    // Register the Inaudible status effect
    CONFIG.statusEffects.push({
        id: "inaudible",
        name: "VISION5E.Inaudible",
        img: "modules/vision-5e/icons/inaudible.svg",
        _id: dnd5e.utils.staticID("dnd5einaudible"),
    });

    // Register special status effects
    CONFIG.specialStatusEffects.BLEEDING = "bleeding";
    CONFIG.specialStatusEffects.BLIND_SENSES = "blindSenses";
    CONFIG.specialStatusEffects.BLINDED = "blinded";
    CONFIG.specialStatusEffects.BURROWING = "burrowing";
    CONFIG.specialStatusEffects.DEAFENED = "deafened";
    CONFIG.specialStatusEffects.DEVILS_SIGHT = "devilsSight";
    CONFIG.specialStatusEffects.DISEASED = "diseased";
    CONFIG.specialStatusEffects.ECHOLOCATION = "echolocation";
    CONFIG.specialStatusEffects.ETHEREAL = "ethereal";
    CONFIG.specialStatusEffects.FLYING = "flying";
    CONFIG.specialStatusEffects.GHOSTLY_GAZE = "ghostlyGaze";
    CONFIG.specialStatusEffects.HOVERING = "hovering";
    CONFIG.specialStatusEffects.INAUDIBLE = "inaudible";
    CONFIG.specialStatusEffects.MAGICAL = "magical";
    CONFIG.specialStatusEffects.MATERIAL = "material";
    CONFIG.specialStatusEffects.MIND_BLANK = "mindBlank";
    CONFIG.specialStatusEffects.NONDETECTION = "nondetection";
    CONFIG.specialStatusEffects.OBJECT = "object";
    CONFIG.specialStatusEffects.PETRIFIED = "petrified";
    CONFIG.specialStatusEffects.POISONED = "poisoned";
    CONFIG.specialStatusEffects.POISONOUS = "poisonous";
    CONFIG.specialStatusEffects.REVENANCE = "revenance";
    CONFIG.specialStatusEffects.SHAPECHANGER = "shapechanger";
    CONFIG.specialStatusEffects.SLEEPING = "sleeping";
    CONFIG.specialStatusEffects.THINKING = "thinking";
    CONFIG.specialStatusEffects.UMBRAL_SIGHT = "umbralSight";
    CONFIG.specialStatusEffects.UNCONSCIOUS = "unconscious";

    // Create aliases for core special status effects
    Object.defineProperties(CONFIG.specialStatusEffects, {
        BLIND: { get() { return this.BLINDED }, set(id) { this.BLINDED = id; }, configurable: true, enumerable: false },
        BURROW: { get() { return this.BURROWING }, set(id) { this.BURROWING = id; }, configurable: true, enumerable: false },
        FLY: { get() { return this.FLYING }, set(id) { this.FLYING = id; }, configurable: true, enumerable: false },
        HOVER: { get() { return this.HOVERING }, set(id) { this.HOVERING = id; }, configurable: true, enumerable: false },
    });

    // Register detection modes
    for (const detectionModeClass of [
        DetectionModeBlindsense,
        DetectionModeBlindsight,
        DetectionModeBloodSense,
        DetectionModeDarkvision,
        DetectionModeDetectEvilAndGood,
        DetectionModeDetectMagic,
        DetectionModeDetectPoisonAndDisease,
        DetectionModeDetectThoughts,
        DetectionModeDevilsSight,
        DetectionModeDivineSense,
        DetectionModeEtherealSight,
        DetectionModeHearing,
        DetectionModeLifeSense,
        DetectionModeLightPerception,
        DetectionModeSeeInvisibility,
        DetectionModeTremorsense,
        DetectionModeTruesight,
        DetectionModeDetectWitchSight,
    ]) {
        const mode = new detectionModeClass();

        CONFIG.Canvas.detectionModes[mode.id] = mode;
    }

    // Remove core detection modes that do not exist in D&D 5e
    delete CONFIG.Canvas.detectionModes.senseAll;
    delete CONFIG.Canvas.detectionModes.senseInvisibility;

    // Register vision modes
    for (const visionModeClass of [
        VisionModeBlindsight,
        VisionModeDarkvision,
        VisionModeDevilsSight,
        VisionModeEtherealness,
        VisionModeTruesight,
    ]) {
        const mode = new visionModeClass();

        CONFIG.Canvas.visionModes[mode.id] = mode;
    }

    // Hide the basic vision mode
    CONFIG.Canvas.visionModes.basic?.updateSource({ tokenConfig: false });

    // Remove core vision modes that are not D&D 5e senses
    delete CONFIG.Canvas.visionModes.lightAmplification;
    delete CONFIG.Canvas.visionModes.monochromatic;

    // Tremorsense is not supported as vision mode, because it is an imprecise sense and
    // we currently cannot prevent FOV from exploring the fog
    delete CONFIG.Canvas.visionModes.tremorsense;

    // Patch visiblity testing
    if (game.modules.get("lib-wrapper")?.active) {
        libWrapper.register(
            "vision-5e",
            "CanvasVisibility.prototype.testVisibility",
            testVisibility,
            libWrapper.OVERRIDE,
            { perf_mode: libWrapper.PERF_FAST }
        );
    } else {
        CanvasVisibility.prototype.testVisibility = testVisibility;
    }
});

Hooks.once("ready", () => {
    // Extend TokenConfig
    for (const config of Object.values(CONFIG.Token.sheetClasses.base)) {
        config.cls = TokenConfigMixin(config.cls);
    }

    CONFIG.Token.prototypeSheetClass = TokenConfigMixin(CONFIG.Token.prototypeSheetClass);
});
