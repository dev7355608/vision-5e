const settings = {};

export default settings;

Hooks.once("init", () => {
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

    const defaultHearingRange = game.settings.get("vision-5e", "defaultHearingRange") || 0;

    if (!Number.isNaN(defaultHearingRange)) {
        settings.defaultHearingRange = defaultHearingRange
    } else {
        settings.defaultHearingRange = 0;
    }

    game.settings.register(
        "vision-5e",
        "defaultOutlineThickness",
        {
            name: "VISION5E.Settings.DefaultOutlineThicknessN",
            hint: "VISION5E.Settings.DefaultOutlineThicknessL",
            scope: "world",
            config: true,
            requiresReload: true,
            type: Number,
            default: 3
        }
    );

    const defaultOutlineThickness = game.settings.get("vision-5e", "defaultOutlineThickness") || 3;

    if (!Number.isNaN(defaultOutlineThickness)) {
        settings.defaultHearingRange = defaultOutlineThickness
    } else {
        settings.defaultHearingRange = 3;
    }
});

Hooks.on("renderSettingsConfig", (app, html) => {
    const defaultHearingRange = html[0].querySelector(`input[name="vision-5e.defaultHearingRange"]`);

    defaultHearingRange.value ||= 0;
    defaultHearingRange.min = 0;
    defaultHearingRange.step = 0.01;
    defaultHearingRange.required = true;

    html[0].querySelector(`[data-setting-id="vision-5e.defaultHearingRange"]`).classList.add("slim");
    html[0].querySelector(`[data-setting-id="vision-5e.defaultHearingRange"] label`)
        .insertAdjacentHTML("beforeend", ` <span class="units">(ft)</span>`);

    const defaultOutlineThickness = html[0].querySelector(`input[name="vision-5e.defaultOutlineThickness"]`);

    defaultOutlineThickness.value ||= 3;
    defaultOutlineThickness.min = 0;
    defaultOutlineThickness.step = 1;
    defaultOutlineThickness.required = true;
});
