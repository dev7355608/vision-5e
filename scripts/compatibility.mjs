import { reassignSpecialStatusEffect, registerStatusEffect } from "./config.mjs";
import { DetectionModeDarkvision } from "./detection-modes/darkvision.mjs";

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

Hooks.once("init", () => {
    if (!game.modules.get("dfreds-convenient-effects")?.active) {
        return;
    }

    function reregisterSpecialStatusEffect(key, id, name, icon, index) {
        const statusId = CONFIG.specialStatusEffects[key];

        if (CONFIG.statusEffects.find(s => s.id === id)) {
            reassignSpecialStatusEffect(key, id);
        } else if (!CONFIG.statusEffects.find(s => s.id === statusId)) {
            registerStatusEffect(statusId, name, icon, index);
        }
    }

    Hooks.once("dfreds-convenient-effects.ready", () => {
        if (foundry.utils.isNewerVersion("5.0.2", game.modules.get("dfreds-convenient-effects").version)) {
            CONFIG.specialStatusEffects.DEAF = "deaf";
            CONFIG.specialStatusEffects.FLY = "fly";
            CONFIG.specialStatusEffects.INAUDIBLE = "inaudible";
            CONFIG.specialStatusEffects.POISON = "poison";
            CONFIG.specialStatusEffects.DISEASE = "disease";
        }

        reregisterSpecialStatusEffect(
            "DEAF",
            "Convenient Effect: Deafened"
        );
        reregisterSpecialStatusEffect(
            "POISON",
            "Convenient Effect: Poisoned"
        );
        reregisterSpecialStatusEffect(
            "DISEASE",
            "Convenient Effect: Diseased",
            "EFFECT.StatusDisease",
            "icons/svg/biohazard.svg",
            CONFIG.statusEffects.findIndex(s => s.id === CONFIG.specialStatusEffects.POISON) + 1
        );
        reregisterSpecialStatusEffect(
            "INAUDIBLE",
            "Convenient Effect: Inaudible",
            "VISION5E.Inaudible",
            "icons/svg/sound-off.svg",
            CONFIG.statusEffects.findIndex(s => s.id === CONFIG.specialStatusEffects.INVISIBLE) + 1
        );
        reregisterSpecialStatusEffect(
            "FLY",
            "Convenient Effect: Flying",
            "EFFECT.StatusFlying",
            "icons/svg/wing.svg",
        );
        reregisterSpecialStatusEffect(
            "BURROW",
            "Convenient Effect: Burrowing",
            "VISION5E.Burrowing",
            "modules/vision-5e/icons/burrow.svg",
        );

        if (canvas.ready) {
            canvas.perception.update({ initializeVision: true, initializeLighting: true });
        }
    });
});
