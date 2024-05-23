/** @type {string | number} */
export let defaultHearingRange;

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
                deterministic: true,
                initial: "15 + 2.5 * (@skills.prc.passive - 10)"
            })
        }
    );

    game.settings.register(
        "vision-5e",
        "unconsciousRetainsVision",
        {
            name: "Unconscious Retains Vision",
            hint: "Unconscious creatures retain their vision",
            scope: "world",
            config: true,
            requiresReload: false,
            type: Boolean,
            default: false
        }
    );

    Hooks.on("renderSettingsConfig", (app, html) => {
        if (!game.user.isGM) {
            return;
        }

        html[0].querySelector(`input[name="vision-5e.defaultHearingRange"]`).placeholder = "0";
        html[0].querySelector(`[data-setting-id="vision-5e.defaultHearingRange"] label`)
            .insertAdjacentHTML("beforeend", ` <span class="units">(ft)</span>`);
    });

    const formula = game.settings.get("vision-5e", "defaultHearingRange");

    if (Roll.validate(formula)) {
        try {
            defaultHearingRange = Roll.safeEval(formula);
        } catch (error) {
            defaultHearingRange = formula;
        }
    }
});
