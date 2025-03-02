export default (TokenConfig) => class extends TokenConfig {
    /** @override */
    async getData(options) {
        const data = await super.getData(options);

        data.visionModes.sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label), game.i18n.lang));
        data.detectionModes.sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label), game.i18n.lang));
        data.preparedDetectionModes.sort((a, b) => game.i18n.localize(CONFIG.Canvas.detectionModes[a.id].label)
            .localeCompare(game.i18n.localize(CONFIG.Canvas.detectionModes[b.id].label), game.i18n.lang));

        return data;
    }

    /** @override */
    async _renderInner(data) {
        const html = await super._renderInner(data);

        for (const element of html[0].querySelectorAll(`[name="sight.range"],[name="sight.brightness"],[name="sight.saturation"],[name="sight.contrast"]`)) {
            element.disabled = true;
            element.dataset.tooltip = "VISIONGURPS.TOOLTIPS.AutomaticallyManaged";
            element.dataset.tooltipDirection = "LEFT";
        }

        html[0].querySelector(`[name="sight.range"]`).value = this.preview.sight.range;
        html[0].querySelector(`[name="sight.visionMode"]`).value = this.preview.sight.visionMode;

        return html;
    }

    /** @override */
    _previewChanges(data) {
        super._previewChanges(data);

        if (!this.preview || !this.rendered) {
            return;
        }

        this.element[0].querySelector(`[name="sight.range"]`).value = this.preview.sight.range;
    }
};
