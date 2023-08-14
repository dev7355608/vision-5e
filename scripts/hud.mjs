Hooks.on("renderTokenHUD", (hud, html) => {
    const token = hud.object;

    if (!token.document.sight.enabled
        || !token.document.testUserPermission(game.user, CONST.DOCUMENT_PERMISSION_LEVELS.OWNER)) {
        return;
    }

    const visionModes = [];

    for (const id of [
        "blindsight",
        "darkvision",
        "devilsSight",
        "ghostlyGaze",
        "tremorsense",
        "truesight"
    ]) {
        const visionMode = CONFIG.Canvas.visionModes[id];

        if (!visionMode) {
            continue;
        }

        const detectionMode = visionMode.detectionMode;

        if (!token.document.detectionModes.some((m) => m.id === detectionMode && m.enabled && m.range > 0)) {
            continue;
        }

        visionModes.push(visionMode);
    }

    if (!visionModes.length) {
        return;
    }

    visionModes.sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label), game.i18n.lang));

    html[0].querySelector(`.control-icon[data-action="target"]`)
        .insertAdjacentHTML("beforebegin", `
            <div class="control-icon" data-action="vision-mode">
                <i class="fas fa-eye"></i>
            </div>
        `);

    const visionControl = html[0].querySelector(`.control-icon[data-action="vision-mode"]`);

    visionControl.addEventListener("click", (event) => {
        event.preventDefault();

        const button = event.currentTarget;

        button.classList.toggle("active");
        button.querySelector(`.vision-5e.vision-modes`).classList.toggle("active");
    });

    visionControl.insertAdjacentHTML("beforeend", `
        <div class="vision-5e vision-modes">
            ${visionModes.map(mode => `
            <div class="vision-5e vision-mode ${mode.id === token.document.sight.visionMode ? "active" : ""} flexrow" data-vision-mode="${mode.id}">
                <span class="vision-5e vision-mode-label">${game.i18n.localize(mode.label)}</span>
            </div>`).join("")}
        </div>
    `);

    const visionModesList = visionControl.querySelector(`.vision-5e.vision-modes`);

    ["click", "contextmenu", "mouseenter", "mouseleave"].forEach(
        eventType => visionModesList.addEventListener(eventType, event => {
            event.preventDefault();
            event.stopPropagation();
        })
    );

    visionModesList.querySelectorAll(`.vision-5e.vision-mode`).forEach(
        element => element.addEventListener("click", (event) => {
            event.preventDefault();

            const visionMode = event.currentTarget.dataset.visionMode;
            const update = { sight: { visionMode } };

            foundry.utils.mergeObject(update.sight, CONFIG.Canvas.visionModes[visionMode].vision.defaults);

            if (visionMode === "basic") {
                foundry.utils.mergeObject(update.sight, CONFIG.Canvas.visionModes.darkvision.vision.defaults);
            }

            token.document.update(update);
            hud.clear();
        })
    );
});
