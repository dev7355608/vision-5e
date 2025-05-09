/** @type {string | number} */
export let defaultHearingRange;

/** @type {boolean} */
export let spectatorMode;

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
            type: new dnd5e.dataModels.fields.FormulaField({
                required: true,
                deterministic: true,
                initial: "15 + 2.5 * (@skills.prc.passive - 10)",
            }),
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
            type: new foundry.data.fields.BooleanField({ initial: true }),
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

Hooks.once("ready", () => {
    let content = "";

    if (!game.settings.storage.get("world").some((setting) => setting.key === "vision-5e.defaultHearingRange")) {
        content += `
            <div class="form-group">
                <label>${game.i18n.localize("VISION5E.SETTINGS.defaultHearingRange.label")} <span class="units">(ft)</span></label>
                <div class="form-fields" style="flex: 1;">
                    <input type="text" name="defaultHearingRange" placeholder="0"
                        value="${foundry.utils.escapeHTML(game.settings.get("vision-5e", "defaultHearingRange"))}">
                </div>
                <p class="hint">${game.i18n.localize("VISION5E.SETTINGS.defaultHearingRange.hint")}</p>
            </div>
        `;
    }

    if (!game.settings.storage.get("world").some((setting) => setting.key === "vision-5e.spectatorMode")) {
        content += `
            <div class="form-group">
                <label>${game.i18n.localize("VISION5E.SETTINGS.spectatorMode.label")}</label>
                <div class="form-fields">
                    <input type="checkbox" name="spectatorMode" ${game.settings.get("vision-5e", "spectatorMode") ? "checked" : ""}>
                </div>
                <p class="hint">${game.i18n.localize("VISION5E.SETTINGS.spectatorMode.hint")}</p>
            </div>
        `;
    }

    if (!content) {
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

Hooks.on("renderSettingsConfig", (application, element, options) => {
    if (!game.user.isGM) {
        return;
    }

    if (!options.parts.includes("main")) {
        return;
    }

    const input = element.querySelector(`input[name="vision-5e.defaultHearingRange"]`);

    input.placeholder = "0";
    input.closest(".form-group").querySelector("label").insertAdjacentHTML("beforeend", ` <span class="units">(ft)</span>`);
});
