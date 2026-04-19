/** @type {string | number} */
export let defaultHearingRange;

/** @type {boolean} */
export let spectatorMode;

const defaultHearingRangeField = new dnd5e.dataModels.fields.FormulaField({
    required: true,
    deterministic: true,
    initial: "15 + 2.5 * (@skills.prc.passive - 10)",
    placeholder: "0",
});

defaultHearingRangeField.toFormGroup = function (groupConfig = {}, inputConfig = {}) {
    groupConfig.units = "ft";

    return Object.getPrototypeOf(this).toFormGroup.call(this, groupConfig, inputConfig);
};

const spectatorModeField = new foundry.data.fields.BooleanField({ initial: true });

Hooks.once("init", () => {
    game.settings.register(
        "vision-5e",
        "defaultHearingRange",
        {
            name: "VISION5E.SETTINGS.defaultHearingRange.label",
            hint: "VISION5E.SETTINGS.defaultHearingRange.hint",
            scope: "world",
            config: true,
            requiresReload: true,
            type: defaultHearingRangeField,
        },
    );

    const formula = game.settings.get("vision-5e", "defaultHearingRange");

    if (foundry.dice.Roll.validate(formula)) {
        try {
            defaultHearingRange = foundry.dice.Roll.safeEval(formula);
        } catch (_error) {
            defaultHearingRange = formula;
        }
    } else {
        defaultHearingRange = Number(formula) || 0;
    }

    game.settings.register(
        "vision-5e",
        "spectatorMode",
        {
            name: "VISION5E.SETTINGS.spectatorMode.label",
            hint: "VISION5E.SETTINGS.spectatorMode.hint",
            scope: "world",
            config: true,
            type: spectatorModeField,
            onChange: (value) => {
                spectatorMode = value;

                if (!canvas.ready) {
                    return;
                }

                for (const token of canvas.tokens.placeables) {
                    if (!token.vision === token._isVisionSource()) {
                        token.initializeVisionSource();
                    }
                }
            },
        },
    );

    spectatorMode = game.settings.get("vision-5e", "spectatorMode");
});

Hooks.once("i18nInit", () => {
    defaultHearingRangeField.label = game.i18n.localize("VISION5E.SETTINGS.defaultHearingRange.label");
    defaultHearingRangeField.hint = game.i18n.localize("VISION5E.SETTINGS.defaultHearingRange.hint");
    spectatorModeField.label = game.i18n.localize("VISION5E.SETTINGS.spectatorMode.label");
    spectatorModeField.hint = game.i18n.localize("VISION5E.SETTINGS.spectatorMode.hint");
});

Hooks.once("setup", () => {
    if (game.release.generation >= 14 || !game.user.isGM) {
        return;
    }

    Hooks.on("renderSettingsConfig", (application, element, context, options) => {
        if (!options.parts.includes("main")) {
            return;
        }

        element.querySelector(`input[name="vision-5e.defaultHearingRange"]`).placeholder = "0";
    });
});

Hooks.once("ready", () => {
    if (!game.user.isGM) {
        return;
    }

    const content = window.document.createElement("div");

    if (!game.settings.storage.get("world").some((setting) => setting.key === "vision-5e.defaultHearingRange")) {
        const inputConfig = { name: "defaultHearingRange" };

        if (game.release.generation === 13) {
            inputConfig.placeholder = "0";
        }

        content.append(defaultHearingRangeField.toFormGroup({}, inputConfig));
    }

    if (!game.settings.storage.get("world").some((setting) => setting.key === "vision-5e.spectatorMode")) {
        content.append(spectatorModeField.toFormGroup({}, { name: "spectatorMode" }));
    }

    if (!content.hasChildNodes()) {
        return;
    }

    foundry.applications.api.DialogV2.prompt({
        window: {
            title: `${game.i18n.localize("SETTINGS.Title")}: Vision 5e`,
            icon: "fa-solid fa-gears",
        },
        position: {
            width: 520,
        },
        content,
        ok: {
            callback: async (event, button) => {
                const settings = new foundry.applications.ux.FormDataExtended(button.form).object;
                const promises = [];
                let requiresReload = false;

                for (const [key, value] of Object.entries(settings)) {
                    if (game.settings.settings.get(`vision-5e.${key}`).requiresReload) {
                        requiresReload ||= value !== game.settings.get("vision-5e", key);
                    }

                    promises.push(game.settings.set("vision-5e", key, value));
                }

                await Promise.all(promises);

                if (requiresReload) {
                    foundry.utils.debouncedReload();
                }
            },
        },
    });
});
