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
