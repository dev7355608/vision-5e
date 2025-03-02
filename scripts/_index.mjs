import ActorMixin from "./actor.mjs";
import TokenMixin from "./token.mjs";
import TokenConfigMixin from "./token-config.mjs";
import TokenDocumentMixin from "./token-document.mjs";
import TokenHUDMixin from "./token-hud.mjs";
import VisibilityGroupMixin from "./visibility.mjs";
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
import DetectionModeEyesOfTheGrave from "./detection-modes/eyes-of-the-grave.mjs";
import DetectionModeHearing from "./detection-modes/hearing.mjs";
import DetectionModeLifeSense from "./detection-modes/life-sense.mjs";
import DetectionModeLightPerception from "./detection-modes/light-perception.mjs";
import DetectionModeSeeInvisibility from "./detection-modes/see-invisibility.mjs";
import DetectionModeTremorsense from "./detection-modes/tremorsense.mjs";
import DetectionModeTruesight from "./detection-modes/truesight.mjs";
import DetectionModeWitchSight from "./detection-modes/witch-sight.mjs";
import VisionModeBlindsight from "./vision-modes/blindsight.mjs";
import VisionModeDarkvision from "./vision-modes/darkvision.mjs";
import VisionModeDevilsSight from "./vision-modes/devils-sight.mjs";
import VisionModeEtherealness from "./vision-modes/etherealness.mjs";
import VisionModeTruesight from "./vision-modes/truesight.mjs";

Hooks.once("init", () => {
    const legacy = foundry.utils.isNewerVersion("4.0.0", game.system.version) || game.settings.get("dnd5e", "rulesVersion") === "legacy";

    // Extend Actor, TokenDocument, Token, and TokenHUD
    CONFIG.Actor.documentClass = ActorMixin(CONFIG.Actor.documentClass);
    CONFIG.Token.documentClass = TokenDocumentMixin(CONFIG.Token.documentClass);
    CONFIG.Token.objectClass = TokenMixin(CONFIG.Token.objectClass);
    CONFIG.Token.hudClass = TokenHUDMixin(CONFIG.Token.hudClass);

    // Extend CanvasVisibility
    CONFIG.Canvas.groups.visibility.groupClass = VisibilityGroupMixin(CONFIG.Canvas.groups.visibility.groupClass);

    // Extend PointVisionSource
    CONFIG.Canvas.visionSourceClass = VisionSourceMixin(CONFIG.Canvas.visionSourceClass);

    // Extend CombatTracker
    CONFIG.ui.combat = CombatTrackerMixin(CONFIG.ui.combat);

    // Register the Inaudible status effect
    CONFIG.statusEffects.push({
        id: "inaudible",
        name: "VISIONGURPS.Inaudible",
        img: "modules/vision-5e/icons/inaudible.svg",
        _id: dnd5e.utils.staticID("dnd5einaudible"),
    });

    // Register special status effects
    CONFIG.specialStatusEffects.BLEEDING = "bleeding";
    CONFIG.specialStatusEffects.BLIND_SENSES = "blindSenses";
    CONFIG.specialStatusEffects.BLINDED = "blinded";
    CONFIG.specialStatusEffects.BURNING = "burning";
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
    CONFIG.specialStatusEffects.SLEEPING = "sleeping";
    CONFIG.specialStatusEffects.THINKING = "thinking";
    CONFIG.specialStatusEffects.UMBRAL_SIGHT = "umbralSight";
    CONFIG.specialStatusEffects.UNCONSCIOUS = "unconscious";
    CONFIG.specialStatusEffects.DEAD = "dead";
    CONFIG.specialStatusEffects.DEAF = "deaf";


    // Shapechanger detection is not needed in PHB'24 at the momement, because Witch Sight has been changed
    if (legacy) {
        CONFIG.specialStatusEffects.SHAPECHANGER = "shapechanger";
    }

    // Create aliases for core special status effects
    Object.defineProperties(CONFIG.specialStatusEffects, {
        BLIND: {
            get() {
                return this.BLINDED;
            },
            set(id) {
                this.BLINDED = id;
            },
            configurable: true,
            enumerable: false,
        },
        BURROW: {
            get() {
                return this.BURROWING;
            },
            set(id) {
                this.BURROWING = id;
            },
            configurable: true,
            enumerable: false,
        },
        FLY: {
            get() {
                return this.FLYING;
            },
            set(id) {
                this.FLYING = id;
            },
            configurable: true,
            enumerable: false,
        },
        HOVER: {
            get() {
                return this.HOVERING;
            },
            set(id) {
                this.HOVERING = id;
            },
            configurable: true,
            enumerable: false,
        },
    });

    // Register detection modes
    for (const detectionModeClass of [
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
        DetectionModeEyesOfTheGrave,
        DetectionModeHearing,
        DetectionModeLifeSense,
        DetectionModeLightPerception,
        DetectionModeSeeInvisibility,
        DetectionModeTremorsense,
        DetectionModeTruesight,
    ]) {
        const mode = new detectionModeClass();

        CONFIG.Canvas.detectionModes[mode.id] = mode;
    }

    // Register legacy detection modes
    if (legacy) {
        for (const detectionModeClass of [
            DetectionModeBlindsense,
            DetectionModeWitchSight,
        ]) {
            const mode = new detectionModeClass();

            CONFIG.Canvas.detectionModes[mode.id] = mode;
        }
    }

    // Legacy Divine Sense
    if (legacy) {
        CONFIG.Canvas.detectionModes.divineSense.updateSource({ walls: true });
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

    // Legacy Devil's Sight
    if (legacy) {
        CONFIG.Canvas.visionModes.devilsSight.updateSource({
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: -0.15, saturation: 0, exposure: 0 },
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: -0.15, saturation: 0, brightness: 0.5 },
            },
        });
    }
});

Hooks.once("ready", () => {
    // Extend TokenConfig
    for (const config of Object.values(CONFIG.Token.sheetClasses.base)) {
        config.cls = TokenConfigMixin(config.cls);
    }

    CONFIG.Token.prototypeSheetClass = TokenConfigMixin(CONFIG.Token.prototypeSheetClass);
});
