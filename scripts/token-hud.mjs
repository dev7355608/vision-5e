export default (TokenHUD) => class extends TokenHUD {
    /** @override */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        actions: {
            "vision-5e.visionMode": this.#onSelectVisionMode,
        },
    }, { inplace: false });

    /** @override */
    async _renderHTML(context, options) {
        const result = await super._renderHTML(context, options);

        const visionModes = this.#getSelectableVisionModes();

        if (visionModes.length > 1) {
            const button = document.createElement("button");

            button.classList.add("control-icon");
            button.dataset.action = "togglePalette";
            button.dataset.palette = "vision-5e.visionModes";
            button.dataset.tooltip = "VISION5E.TOOLTIPS.SelectVisionMode";
            button.ariaLabel = game.i18n.localize("VISION5E.TOOLTIPS.SelectVisionMode");

            const i = document.createElement("i");

            i.classList.add("fa-solid", "fa-eye");
            i.inert = true;

            button.append(i);

            result.hud.querySelector(`.control-icon[data-action="target"]`).insertAdjacentElement("beforebegin", button);

            const div = document.createElement("div");

            div.classList.add("palette");
            div.dataset.palette = "vision-5e.visionModes";

            for (const mode of visionModes) {
                const a = document.createElement("a");

                a.classList.add("flexrow");
                a.classList.toggle("active", mode.id === this.document.sight.visionMode);
                a.dataset.action = "vision-5e.visionMode";
                a.dataset.visionModeId = mode.id;

                const span = document.createElement("span");

                span.classList.add("ellipsis");
                span.textContent = game.i18n.localize(mode.label);

                a.append(span);
                div.append(a);
            }

            button.insertAdjacentElement("afterend", div);
        }

        return result;
    }

    /**
     * @returns {foundry.canvas.perception.VisionMode[]}
     */
    #getSelectableVisionModes() {
        const visionModes = [];

        if (!this.document || !this.document.sight.enabled || !this.document.isOwner) {
            return visionModes;
        }

        for (const [visionModeId, detectionModeId] of [
            ["blindsight", "blindsight"],
            ["darkvision", "basicSight"],
            ["devilsSight", "devilsSight"],
            ["truesight", "seeAll"],
        ]) {
            if (this.document.detectionModes.some((mode) => mode.id === detectionModeId && mode.enabled && mode.range > 0)) {
                visionModes.push(CONFIG.Canvas.visionModes[visionModeId]);
            }
        }

        visionModes.sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label), game.i18n.lang));

        return visionModes;
    }

    /**
     * @this
     * @param {PointerEvent} event
     * @param {HTMLButtonElement} target
     */
    static async #onSelectVisionMode(event, target) {
        await this.document.updateVisionMode(target.dataset.visionModeId);
    }
};
