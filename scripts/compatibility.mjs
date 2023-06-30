import { registerStatusEffect } from "./config.mjs";
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

    function reregisterStatusEffect(id, name, icon, index) {
        for (const statusEffect of CONFIG.statusEffects) {
            if (statusEffect.id === id) {
                return;
            }

            if (statusEffect.id.startsWith("Convenient Effect: ") && statusEffect.statuses?.includes(id)) {
                const otherStatuses = statusEffect.statuses.filter(s => s !== id);

                if (otherStatuses.length === 0 || otherStatuses.length === 1 && otherStatuses[0] === statusEffect.id) {
                    return;
                }
            }
        }

        registerStatusEffect(id, name, icon, index);
    }

    Hooks.once("dfreds-convenient-effects.ready", () => {
        reregisterStatusEffect(
            "disease",
            "EFFECT.StatusDisease",
            "icons/svg/biohazard.svg",
            CONFIG.statusEffects.findIndex(s => s.id === "Convenient Effect: Poisoned") + 1
        );
        reregisterStatusEffect(
            "fly",
            "EFFECT.StatusFlying",
            "icons/svg/wing.svg"
        );
        reregisterStatusEffect(
            "burrow",
            "VISION5E.Burrowing",
            "modules/vision-5e/icons/burrow.svg"
        );
        reregisterStatusEffect(
            "inaudible",
            "VISION5E.Inaudible",
            "icons/svg/sound-off.svg",
            CONFIG.statusEffects.findIndex(s => s.id === "Convenient Effect: Invisible") + 1
        );
    });
});
