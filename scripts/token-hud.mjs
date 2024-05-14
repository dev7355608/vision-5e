export default (TokenHUD) => class extends TokenHUD {

    /** @override */
    async _renderInner(data) {
        const html = await super._renderInner(data);

        if (!this.document || !this.document.sight.enabled || !this.document.isOwner) {
            return html;
        }

        const visionModes = [];

        for (const [visionId, detectionId] of [
            ["blindsight", "blindsight"],
            ["darkvision", "basicSight"],
            ["devilsSight", "devilsSight"],
            ["truesight", "seeAll"],
        ]) {
            if (this.document.detectionModes.some((mode) => mode.id === detectionId && mode.enabled && mode.range > 0)) {
                visionModes.push(CONFIG.Canvas.visionModes[visionId]);
            }
        }

        if (!visionModes.length) {
            return html;
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
                ${visionModes.map((mode) => `
                <div class="vision-5e vision-mode ${mode.id === this.document.sight.visionMode ? "active" : ""} flexrow" data-vision-mode="${mode.id}">
                    <span class="vision-5e vision-mode-label">${game.i18n.localize(mode.label)}</span>
                </div>`).join("")}
            </div>
        `);

        const visionModesList = visionControl.querySelector(`.vision-5e.vision-modes`);

        ["click", "contextmenu", "mouseenter", "mouseleave"].forEach(
            eventType => visionModesList.addEventListener(eventType, (event) => {
                event.preventDefault();
                event.stopPropagation();
            })
        );

        visionModesList.querySelectorAll(`.vision-5e.vision-mode`).forEach(
            element => element.addEventListener("click", (event) => {
                event.preventDefault();

                const target = event.currentTarget
                const visionMode = target.classList.contains("active") ? "basic" : target.dataset.visionMode;

                this.document.updateVisionMode(visionMode);
                this.clear();
            })
        );

        return html;
    }
};
