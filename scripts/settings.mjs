const settings = {};

export default settings;

Hooks.once("init", () => {
    game.settings.register(
        "vision-5e",
        "units",
        {
            name: "DND5E.MovementUnits",
            hint: "VISION5E.Settings.UnitsL",
            scope: "world",
            config: true,
            requiresReload: true,
            type: String,
            choices: {
                ft: "DND5E.DistFt",
                m: "DND5E.DistM"
            },
            default: "ft"
        }
    );

    game.settings.register(
        "vision-5e",
        "defaultHearingRange",
        {
            name: "VISION5E.Settings.DefaultHearingRangeN",
            hint: "VISION5E.Settings.DefaultHearingRangeL",
            scope: "world",
            config: true,
            requiresReload: true,
            type: Number,
            default: 30
        }
    );

    game.settings.register(
        "vision-5e",
        "defaultHearingRangeFormula",
        {
            name: "VISION5E.Settings.DefaultHearingRangeFormulaN",
            hint: "VISION5E.Settings.DefaultHearingRangeFormulaL",
            scope: "world",
            config: true,
            requiresReload: true,
            type: String,
            default: ''
        }
    );

    const defaultHearingRange = game.settings.get("vision-5e", "defaultHearingRange") || 0;

    if (!Number.isNaN(defaultHearingRange)) {
        settings.defaultHearingRange = defaultHearingRange
    } else {
        settings.defaultHearingRange = 0;
    }
    settings.defaultHearingRangeFormula = game.settings.get("vision-5e", "defaultHearingRangeFormula") || '';
    settings.metric = game.settings.get("vision-5e", "units") === "m";
});

Hooks.on("renderSettingsConfig", (app, html) => {
    if (!game.user.isGM) {
        return;
    }

    const units = game.settings.get("vision-5e", "units");
    const defaultHearingRange = html[0].querySelector(`input[name="vision-5e.defaultHearingRange"]`);

    defaultHearingRange.value ||= 0;
    defaultHearingRange.min = 0;
    defaultHearingRange.step = 0.01;
    defaultHearingRange.required = true;
    defaultHearingRange.placeholder = "0";
    defaultHearingRange.dataset.units = units;

    html[0].querySelector(`[data-setting-id="vision-5e.defaultHearingRange"]`).classList.add("slim");
    html[0].querySelector(`[data-setting-id="vision-5e.defaultHearingRange"] label`)
        .insertAdjacentHTML("beforeend", ` <span class="units">(${units})</span>`);
    html[0].querySelector(`select[name="vision-5e.units"]`).addEventListener("change", (event) => {
        const newUnits = event.target.value;
        const oldUnits = defaultHearingRange.dataset.units;

        if (oldUnits !== newUnits) {
            defaultHearingRange.dataset.units = newUnits;

            if (newUnits === "m") {
                defaultHearingRange.value = (defaultHearingRange.value * 3 / 10).toNearest(defaultHearingRange.step);
            } else {
                defaultHearingRange.value = (defaultHearingRange.value * 10 / 3).toNearest(defaultHearingRange.step);
            }

            html[0].querySelector(`[data-setting-id="vision-5e.defaultHearingRange"] label > span.units`).innerHTML = `(${newUnits})`;
        }
    });
});
