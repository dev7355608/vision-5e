export default (TokenConfig) => class extends TokenConfig {
    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);

        if (!options.parts.includes("vision")) {
            return;
        }

        // Disable input fields that are automatically managed by Vision 5e
        for (const element of this.element.querySelectorAll(`[name="sight.range"],[name="sight.brightness"],[name="sight.saturation"],[name="sight.contrast"]`)) {
            element.disabled = true;
            element.dataset.tooltip = "VISION5E.TOOLTIPS.AutomaticallyManaged";
        }

        if (!this._preview) {
            return;
        }

        // Set vision range to the prepared preview vision range
        this.element.querySelector(`[name="sight.range"]`).value = this._preview.sight.range;
        this.element.querySelector(`[name="sight.visionMode"]`).value = this._preview.sight.visionMode;
    }

    /** @override */
    _previewChanges(changes) {
        super._previewChanges(changes);

        if (!changes || !this._preview) {
            return;
        }

        // Set vision range to the prepared preview vision range
        this.element.querySelector(`[name="sight.range"]`).value = this._preview.sight.range;
    }
};
