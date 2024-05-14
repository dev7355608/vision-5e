export default (Token) => class extends Token {

    /**
     * The different levels of detection.
     * @enum {number}
     * @readonly
     */
    static DETECTION_LEVELS = Object.freeze({
        NONE: 0,
        VAGUE: 1,
        IMPRECISE: 2,
        PRECISE: 3
    });

    /**
     * The detection level of this token.
     * @type {number}
     */
    get detectionLevel() {
        return this._detectionLevel;
    }

    /**
     * @type {number}
     * @internal
     */
    _detectionLevel = this.constructor.DETECTION_LEVELS.NONE;

    /** @override */
    get isVisible() {
        this._detectionLevel = this.constructor.DETECTION_LEVELS.PRECISE;

        return super.isVisible;
    }

    /**
     * The mesh that represent the token in its less then precise state.
     * @type {SpriteMesh}
     */
    #impreciseMesh;

    /**
     * The children of the token that are still visible while the detection level is less than precise
     * @type {PIXI.DisplayObject[]}
     */
    #impreciseChildren;

    /** @override */
    _isLightSource() {
        // Don't emit light in the ethereal plane
        return super._isLightSource() && !this.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL);
    }

    /** @override */
    _getVisionBlindedStates() {
        // Blindness is handled in Token#_getVisionSourceData instead
        return {};
    }

    /** @override */
    _getVisionSourceData() {
        const data = super._getVisionSourceData();

        // Set detection mode
        data.detectionMode = this.document.sight.detectionMode;

        // Blindsight, Darkvision, Devil's Sight, and Truesight are disabled while any of these conditions affect the token
        if (this.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || this.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || this.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || this.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || this.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            data.radius = 0;
            data.lightRadius = 0;
        } else {
            // Darkvision, Devil's Sight, and Truesight are disabled while blinded
            if (this.document.hasStatusEffect(CONFIG.specialStatusEffects.BLINDED)) {
                data.lightRadius = 0;

                if (data.detectionMode !== "blindsight") {
                    data.radius = 0;
                }
            }

            // Blindsight with the Blind Senses or Echolocation feat is disabled while deafened
            if (data.detectionMode === "blindsight"
                && (this.document.hasStatusEffect(CONFIG.specialStatusEffects.BLIND_SENSES)
                    || this.document.hasStatusEffect(CONFIG.specialStatusEffects.ECHOLOCATION))
                && this.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAFENED)) {
                data.radius = 0;
            }
        }

        // The token is blinded if both the active sense and Light Perception are disabled
        if (data.radius === 0 && data.lightRadius === 0) {
            data.visionMode = "blindness";
        }

        // Senses other than Darkvision can see through magical darkness
        data.includeDarkness = data.detectionMode === "basicSight";

        return data;
    }

    /** @override */
    _onApplyStatusEffect(statusId, active) {
        if (statusId === CONFIG.specialStatusEffects.DEVILS_SIGHT
            || statusId === CONFIG.specialStatusEffects.DISEASED
            || statusId === CONFIG.specialStatusEffects.INAUDIBLE
            || statusId === CONFIG.specialStatusEffects.MAGICAL
            || statusId === CONFIG.specialStatusEffects.MATERIAL
            || statusId === CONFIG.specialStatusEffects.OBJECT
            || statusId === CONFIG.specialStatusEffects.POISONED
            || statusId === CONFIG.specialStatusEffects.POISONOUS
            || statusId === CONFIG.specialStatusEffects.REVENANCE
            || statusId === CONFIG.specialStatusEffects.SHAPECHANGER
            || statusId === CONFIG.specialStatusEffects.THINKING
            || statusId === CONFIG.specialStatusEffects.UMBRAL_SIGHT) {
            canvas.perception.update({ refreshVision: true });
        } else if (statusId === CONFIG.specialStatusEffects.BLIND_SENSES
            || statusId === CONFIG.specialStatusEffects.DEAFENED
            || statusId === CONFIG.specialStatusEffects.DEFEATED
            || statusId === CONFIG.specialStatusEffects.ECHOLOCATION
            || statusId === CONFIG.specialStatusEffects.GHOSTLY_GAZE
            || statusId === CONFIG.specialStatusEffects.PETRIFIED
            || statusId === CONFIG.specialStatusEffects.SLEEPING
            || statusId === CONFIG.specialStatusEffects.UNCONSCIOUS) {
            this.initializeVisionSource();
        } else if (statusId === CONFIG.specialStatusEffects.ETHEREAL) {
            this.initializeSources();
        }

        // Blinded, Burrowing, Hovering, Flying, and, Invisible are handled by core
        super._onApplyStatusEffect(statusId, active);
    }

    /** @override */
    async _draw(options) {
        await super._draw(options);

        const impreciseTexture = await loadTexture(this.document.constructor.DEFAULT_ICON);

        this.#impreciseMesh = this.addChildAt(
            new SpriteMesh(impreciseTexture),
            this.getChildIndex(this.detectionFilterMesh)
        );
        this.#impreciseMesh.anchor.set(0.5, 0.5);
        this.#impreciseMesh.renderable = false;
        this.#impreciseChildren = [this.border, this.detectionFilterMesh, this.tooltip, this.target];
    }

    /** @override */
    _refreshVisibility() {
        super._refreshVisibility();

        const imprecise = this.detectionLevel !== this.constructor.DETECTION_LEVELS.PRECISE;

        this.#impreciseMesh.visible = imprecise;
        this.mesh.visible &&= !imprecise;
    }

    /** @override */
    _refreshSize() {
        super._refreshSize();

        const { width, height } = this.getSize();
        const texture = this.#impreciseMesh.texture;
        const scale = Math.min(width / texture.width, height / texture.height);

        this.#impreciseMesh.position = this.getCenterPoint({ x: 0, y: 0 });
        this.#impreciseMesh.width = texture.width * scale;
        this.#impreciseMesh.height = texture.height * scale;
    }

    /** @override */
    _getBorderColor() {
        return this.detectionLevel === this.constructor.DETECTION_LEVELS.PRECISE
            ? super._getBorderColor() : CONFIG.Canvas.dispositionColors.INACTIVE;
    }

    /** @override */
    _renderDetectionFilter(renderer) {
        const mesh = this.detectionLevel === this.constructor.DETECTION_LEVELS.PRECISE ? this.mesh : this.#impreciseMesh;

        if (!mesh) {
            return;
        }

        const originalTint = mesh.tint;
        const originalWorldAlpha = mesh.worldAlpha;

        mesh.filters ??= [];
        mesh.filters.push(this.detectionFilter);
        mesh.tint = 0xFFFFFF;
        mesh.worldAlpha = 1;
        mesh.pluginName = BaseSamplerShader.classPluginName;
        this.#impreciseMesh.renderable = true;

        mesh.render(renderer);

        mesh.filters.pop();
        mesh.tint = originalTint;
        mesh.worldAlpha = originalWorldAlpha;
        mesh.pluginName = null;
        this.#impreciseMesh.renderable = false;
    }

    /** @override */
    render(renderer) {
        if (this.detectionLevel === this.constructor.DETECTION_LEVELS.PRECISE) {
            super.render(renderer);

            return;
        }

        const originalChildren = this.children;
        const originalFilters = this.filters;
        const originalMask = this.mask;

        this.children = this.#impreciseChildren;
        this.filters = null;
        this.mask = null;

        super.render(renderer);

        this.children = originalChildren;
        this.filters = originalFilters;
        this.mask = originalMask;
    }
};
