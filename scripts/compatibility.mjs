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
    if (!game.modules.get("stealthy")?.active) {
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

Hooks.once("setup", () => {
    if (!game.modules.get("dfreds-convenient-effects")?.active) {
        return;
    }

    const customStatusEffects = [
        {
            id: "burrow",
            name: "Burrowing",
            icon: "modules/vision-5e/icons/burrow.svg"
        },
        {
            id: "disease",
            name: "Diseased",
            icon: "icons/svg/biohazard.svg"
        },
        {
            id: "ethereal",
            name: "Ethereal",
            icon: "modules/vision-5e/icons/ethereal.svg"
        },
        {
            id: "fly",
            name: "Flying",
            icon: "icons/svg/wing.svg"
        },
        {
            id: "inaudible",
            name: "Inaudible",
            icon: "modules/vision-5e/icons/inaudible.svg"
        }
    ];

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

    Hooks.once("dfreds-convenient-effects.ready", async () => {
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

    for (const detectionModeClass of [DetectionModeHearing, DetectionModeTremorsense]) {
        detectionModeClass.prototype._canDetect = wrap(detectionModeClass.prototype._canDetect);
    }
});
