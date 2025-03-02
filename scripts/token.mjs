import { DETECTION_LEVELS } from "./const.mjs";
import { fromFeet } from "./utils.mjs";

export default (Token) => class extends Token {
    /**
     * The different levels of detection.
     * @enum {number}
     */
    static get DETECTION_LEVELS() {
        return DETECTION_LEVELS;
    }

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
    _detectionLevel = DETECTION_LEVELS.NONE;

    /**
     * @type {PIXI.Filter | null}
     * @internal
     */
    _detectionFilter = null;

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
    _isVisionSource() {
        if (!canvas.visibility.tokenVision || !this.hasSight) {
            return false;
        }

        const isGM = game.user.isGM;

        // Only display hidden tokens for the GM
        if (this.document.hidden && !isGM) {
            return false;
        }

        // Always display controlled tokens which have vision
        if (this.controlled) {
            return true;
        }

        // Otherwise, vision is ignored for GM users
        if (isGM) {
            return false;
        }

        // At this point only tokens with an actor could be a source of vision
        if (!this.actor) {
            return false;
        }

        // A token that is defeated, petrified, or unconscious cannot perceive anything
        const canPerceive = (token) => !token.document.hidden && token.hasSight
            && !(token.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
                || token.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
                || token.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS));

        // If the user controls that can perceive something, ...
        if (this.layer.controlled.some(canPerceive)) {
            // ... this token is not a source of vision
            return false;
        }

        // If the user is the owner of a token that can perceive something but isn't controlling it, ...
        if (this.layer.placeables.some((token) => !token.controlled && token.isOwner && canPerceive(token))) {
            // ... this token is a source of vision only if the user has observer permissions
            return this.actor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER);
        }

        // If the user does not have a token that can perceive something,
        // this token is a source of vision if the user has limited permissions and the actor has a player owner
        return this.actor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) && this.actor.hasPlayerOwner;
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

        // Senses other than Darkvision can see through magical darkness
        data.includeDarkness = data.detectionMode === "basicSight"
        && !this.document.hasStatusEffect(CONFIG.specialStatusEffects.DEVILS_SIGHT);

        // Handle Ghostly Gaze
        if (this.document.hasStatusEffect(CONFIG.specialStatusEffects.GHOSTLY_GAZE)) {
            data.unconstrainedRadius = this.getLightRadius(fromFeet(30, canvas.grid.units));
        } else {
            data.unconstrainedRadius = 0;
        }

        // Handle Etherealness
        if (this.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
            const defaults = CONFIG.Canvas.visionModes.etherealness.vision.defaults;
            const applyOverride = (key) => defaults[key] !== undefined ? defaults[key] : data[key];

            data.visionMode = "etherealness";
            data.color = applyOverride("color");
            data.attenuation = applyOverride("attenuation");
            data.brightness = applyOverride("brightness");
            data.contrast = applyOverride("contrast");
            data.saturation = applyOverride("saturation");
        }

        return data;
    }

    /** @override */
    _onApplyStatusEffect(statusId, active) {
        if (statusId === CONFIG.specialStatusEffects.BLEEDING
            || statusId === CONFIG.specialStatusEffects.DISEASED
            || statusId === CONFIG.specialStatusEffects.INAUDIBLE
            || statusId === CONFIG.specialStatusEffects.MAGICAL
            || statusId === CONFIG.specialStatusEffects.MATERIAL
            || statusId === CONFIG.specialStatusEffects.MIND_BLANK
            || statusId === CONFIG.specialStatusEffects.NONDETECTION
            || statusId === CONFIG.specialStatusEffects.OBJECT
            || statusId === CONFIG.specialStatusEffects.POISONED
            || statusId === CONFIG.specialStatusEffects.POISONOUS
            || statusId === CONFIG.specialStatusEffects.REVENANCE
            || statusId === CONFIG.specialStatusEffects.SHAPECHANGER
            || statusId === CONFIG.specialStatusEffects.THINKING
            || statusId === CONFIG.specialStatusEffects.UMBRAL_SIGHT) {
            canvas.perception.update({ refreshVision: true });
        } else if (statusId === CONFIG.specialStatusEffects.DEFEATED
            || statusId === CONFIG.specialStatusEffects.PETRIFIED
            || statusId === CONFIG.specialStatusEffects.UNCONSCIOUS) {
            if (!this.document.hidden && this.hasSight && !game.user.isGM && this.isOwner) {
                for (const token of this.layer.placeables) {
                    if (token !== this && !token.vision === token._isVisionSource()) {
                        token.initializeVisionSource();
                    }
                }
            }

            this.initializeVisionSource();
        } else if (statusId === CONFIG.specialStatusEffects.BLIND_SENSES
            || statusId === CONFIG.specialStatusEffects.DEAFENED
            || statusId === CONFIG.specialStatusEffects.DEAF
            || statusId === CONFIG.specialStatusEffects.DEVILS_SIGHT
            || statusId === CONFIG.specialStatusEffects.ECHOLOCATION
            || statusId === CONFIG.specialStatusEffects.GHOSTLY_GAZE
            || statusId === CONFIG.specialStatusEffects.SLEEPING) {
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

        // Patch because Token#_renderDetectionFilter uses Token#_detectionFilter instead of Token#detectionFilter
        this.detectionFilterMesh.render = (renderer) => this._renderDetectionFilter(renderer);

        const impreciseTexture = await loadTexture(this.document.constructor.DEFAULT_ICON);

        this.#impreciseMesh = this.addChildAt(
            new SpriteMesh(impreciseTexture),
            this.getChildIndex(this.detectionFilterMesh),
        );
        this.#impreciseMesh.anchor.set(0.5, 0.5);
        this.#impreciseMesh.renderable = false;
        this.#impreciseChildren = [this.border, this.detectionFilterMesh, this.tooltip, this.target];
    }

    /** @override */
    _refreshVisibility() {
        const priorDetectionLevel = this._detectionLevel;

        // The patched CanvasVisibility#testVisibility sets Token#_detectionLevel and Token#_detectionFilter
        // only if Token#_detectionLevel is undefined
        this._detectionLevel = undefined;
        this._detectionFilter = null;

        super._refreshVisibility();

        if (this.visible) {
            if (this.detectionFilter) {
                // The patched CanvasVisibilit#testVisibility does not set Token#detectionFilter:
                // if it was set, then some other module has, in which case we assume precise detection
                this._detectionLevel = DETECTION_LEVELS.PRECISE;
                this._detectionFilter = this.detectionFilter;
            } else if (this._detectionLevel === DETECTION_LEVELS.NONE) {
                // The patched CanvasVisibilit#testVisibility returned false, but some other module
                // returned true in Token#isVisible anyway: we assume precise detection
                this._detectionLevel = DETECTION_LEVELS.PRECISE;
                this.detectionFilter = this._detectionFilter;
            } else if (this._detectionLevel === undefined) {
                // If Token#isVisible returns true before CanvasVisibilit#testVisibility is tested, we assume precise detection
                this._detectionLevel = DETECTION_LEVELS.PRECISE;
            } else {
                this.detectionFilter = this._detectionFilter;
            }
        } else {
            this._detectionLevel = DETECTION_LEVELS.NONE;
            this._detectionFilter = null;
            this.detectionFilter = null;
        }

        const imprecise = this._detectionLevel !== DETECTION_LEVELS.PRECISE;

        this.#impreciseMesh.visible = imprecise;
        this.mesh.visible &&= !imprecise;

        if (this._detectionLevel !== priorDetectionLevel) {
            this.border.tint = this._getBorderColor();
            this._refreshTarget();
        }
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
        return this._detectionLevel === DETECTION_LEVELS.PRECISE
            ? super._getBorderColor()
            : CONFIG.Canvas.dispositionColors.INACTIVE;
    }

    /** @override */
    _renderDetectionFilter(renderer) {
        if (!this._detectionFilter) {
            return;
        }

        const mesh = this._detectionLevel === DETECTION_LEVELS.PRECISE ? this.mesh : this.#impreciseMesh;

        if (!mesh) {
            return;
        }

        detectionFilterArray[0] = this._detectionFilter;

        const originalFilters = mesh.filters;
        const originalTint = mesh.tint;
        const originalWorldAlpha = mesh.worldAlpha;

        mesh.filters = detectionFilterArray;
        mesh.tint = 0xFFFFFF;
        mesh.worldAlpha = 1;
        mesh.pluginName = BaseSamplerShader.classPluginName;
        this.#impreciseMesh.renderable = true;

        mesh.render(renderer);

        mesh.filters = originalFilters;
        mesh.tint = originalTint;
        mesh.worldAlpha = originalWorldAlpha;
        mesh.pluginName = null;
        this.#impreciseMesh.renderable = false;

        detectionFilterArray[0] = null;
    }

    /** @override */
    render(renderer) {
        if (this._detectionLevel === DETECTION_LEVELS.PRECISE) {
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

/**
 * @type {[detectionFilter: PIXI.Filter | null]}
 */
const detectionFilterArray = [null];
