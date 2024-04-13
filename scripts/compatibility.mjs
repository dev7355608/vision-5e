import { statusEffectIds } from "./config.mjs";
import { DetectionModeBlindsense } from "./detection-modes/blindsense.mjs";
import { DetectionModeDarkvision } from "./detection-modes/darkvision.mjs";
import { DetectionModeHearing } from "./detection-modes/hearing.mjs";
import { DetectionModeTremorsense } from "./detection-modes/tremorsense.mjs";

Hooks.once("init", () => {
    if (foundry.utils.isNewerVersion(game.version, "11.304")) {
        return;
    }

    if (game.modules.get("levels")?.active) {
        return;
    }

    const elevation = Symbol("elevation");

    Object.defineProperty(TileDocument.prototype, "elevation", {
        get() {
            return this[elevation] ?? (this.overhead ? this.parent.foregroundElevation : PrimaryCanvasGroup.BACKGROUND_ELEVATION);
        },
        set(value) {
            if (!Number.isFinite(value) && (value !== undefined)) {
                throw new Error("Elevation must be a finite Number or undefined");
            }
            this[elevation] = value;
            if (this.rendered) {
                canvas.primary.sortDirty = true;
                canvas.perception.update({ refreshTiles: true });
                this._object.renderFlags.set({ refreshElevation: true });
            }
        },
        configurable: true,
        enumerable: false
    });
});

Hooks.once("init", () => {
    if (!game.modules.get("house-divided")?.active) {
        return;
    }

    Hooks.on("canvasInit", () => {
        PrimaryCanvasGroup.BACKGROUND_ELEVATION = ["rRY9Y8jNBkPbmcUl", "9fjzcw7xLMsg9dYX"].includes(canvas.scene?.id) ? 0 : -Infinity;
    });
});

Hooks.once("init", () => {
    if (!game.modules.get("stealthy")?.active) {
        return;
    }

    if (foundry.utils.isNewerVersion(game.modules.get("stealthy").version, "3.14")) {
        return;
    }

    Hooks.once("setup", () => {
        stealthy.engine.basicVision = function (wrapped, visionSource, mode, config) {
            return wrapped(visionSource, mode, config);
        };

        libWrapper.register(
            "vision-5e",
            "DetectionMode.prototype.testVisibility",
            function (wrapped, testHidden, visionSource, mode, config = {}) {
                if (testHidden[this.id] && stealthy.engine.isHidden(visionSource, config.object)) return false;
                return wrapped(visionSource, mode, config);
            },
            libWrapper.MIXED,
            {
                bind: [Object.freeze({
                    blindsight: true,
                    devilsSight: true,
                    echolocation: true,
                    feelTremor: true,
                    ghostlyGaze: true,
                    hearing: true,
                    lightPerception: true,
                    seeAll: true
                })],
                perf_mode: libWrapper.PERF_FAST
            }
        );

        const updateFriendlyUmbralSight = () => {
            const friendlyUmbralSight = game.settings.get("stealthy", "friendlyUmbralSight");
            const ignoreFriendlyUmbralSight = friendlyUmbralSight === "ignore"
                || friendlyUmbralSight === "inCombat" && !game.combat?.round;

            if (DetectionModeDarkvision.friendlyUmbralSight === ignoreFriendlyUmbralSight) {
                DetectionModeDarkvision.friendlyUmbralSight = !ignoreFriendlyUmbralSight;

                if (canvas.ready) {
                    canvas.perception.refresh({ refreshVision: true });
                }
            }
        };

        updateFriendlyUmbralSight();

        for (const hook of ["createSetting", "updateSetting", "deleteSetting"]) {
            Hooks.on(hook, (setting) => {
                if (setting.key === "stealthy.friendlyUmbralSight") {
                    updateFriendlyUmbralSight();
                }
            });
        }

        for (const hook of ["createCombat", "updateCombat", "deleteCombat"]) {
            Hooks.on(hook, updateFriendlyUmbralSight);
        }
    });
});

Hooks.once("init", () => {
    if (!game.modules.get("dfreds-convenient-effects")?.active) {
        return;
    }

    const customStatusEffects = [
        {
            id: statusEffectIds.burrow,
            name: "Burrowing",
            icon: "modules/vision-5e/icons/burrow.svg"
        },
        {
            id: statusEffectIds.disease,
            name: "Diseased",
            icon: "icons/svg/biohazard.svg"
        },
        {
            id: statusEffectIds.ethereal,
            name: "Ethereal",
            icon: "modules/vision-5e/icons/ethereal.svg"
        },
        {
            id: statusEffectIds.fly,
            name: "Flying",
            icon: "icons/svg/wing.svg"
        },
        {
            id: statusEffectIds.inaudible,
            name: "Inaudible",
            icon: "modules/vision-5e/icons/inaudible.svg"
        }
    ];

    function addConditions() {
        const EffectDefinitions = game.dfreds.effects.constructor;

        EffectDefinitions.prototype.initialize = ((initialize) => function () {
            this._conditions = this.conditions;

            for (const { id, name, icon } of customStatusEffects) {
                this._conditions.push(this._effectHelpers.createActiveEffect({
                    name,
                    icon,
                    statuses: [id]
                }));
            }

            this._conditions.sort((e1, e2) => e1.name.localeCompare(e2.name, "en"));

            return initialize.call(this);
        })(EffectDefinitions.prototype.initialize);
    }

    if (game.dfreds?.effects) {
        addConditions();
    } else {
        Hooks.once("socketlib.ready", addConditions);
    }

    game.settings.register(
        "vision-5e",
        "compatibility.dfreds-convenient-effects",
        {
            scope: "world",
            config: false,
            type: Object,
            default: {}
        }
    );

    async function addStatusEffects() {
        if (!game.users.activeGM?.isSelf) {
            return;
        }

        const compatibility = foundry.utils.deepClone(await game.settings.get("vision-5e", "compatibility.dfreds-convenient-effects"));
        const statusEffects = compatibility.addedStatusEffects ??= [];
        let addedStatusEffect = false;

        for (const { id, name } of customStatusEffects) {
            if (!statusEffects.includes(id)) {
                statusEffects.push(id);
                await game.dfreds.effectInterface.addStatusEffect(name);
                addedStatusEffect = true;
            }
        }

        if (addedStatusEffect) {
            statusEffects.sort((a, b) => a.localeCompare(b, "en"));
            await game.settings.set("vision-5e", "compatibility.dfreds-convenient-effects", compatibility);
            ui.notifications.warn("Foundry must be reloaded to update token status effects.", { permanent: true });
        }
    }

    Hooks.once("dfreds-convenient-effects.ready", () => {
        if (game.ready) {
            addStatusEffects();
        } else {
            Hooks.once("ready", addStatusEffects);
        }
    });
});

Hooks.once("init", () => {
    if (!game.modules.get("item-piles")?.active) {
        return;
    }

    const wrap = (_canDetect) => function (visionSource, target) {
        if (!_canDetect.call(this, visionSource, target)) {
            return false;
        }

        const data = target.document.flags["item-piles"]?.data;

        return !(data && data.enabled && data.type !== "merchant");
    };

    for (const detectionModeClass of [DetectionModeBlindsense, DetectionModeHearing, DetectionModeTremorsense]) {
        detectionModeClass.prototype._canDetect = wrap(detectionModeClass.prototype._canDetect);
    }
});
