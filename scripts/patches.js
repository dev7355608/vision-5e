VisionSource._initializeShaderKeys.push("deafened");

VisionSource.prototype._initialize = ((_initialize) => function (data) {
    _initialize.call(this, data);

    if (this.object instanceof Token) {
        this.data.lightRadius = data.lightRadius ?? Math.clamped(this.object.lightPerceptionRange, 0, canvas.dimensions.maxR);
        this.data.deafened = data.deafened ?? this.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAF);
    } else {
        this.data.lightRadius = data.lightRadius ?? canvas.dimensions.maxR;
        this.data.deafened = data.deafened ?? false;
    }
})(VisionSource.prototype._initialize);

VisionSource.prototype._configure = function (changes) {
    this.los = this.shape;

    // Determine the active VisionMode
    this._initializeVisionMode();

    // Configure animation, if any
    this.animation = {
        animation: this.visionMode.animate,
        seed: this.data.seed ?? this.animation.seed ?? Math.floor(Math.random() * 100000)
    };

    // Compute the light polygon
    this.light = this._createLightPolygon();

    // Compute the constrained vision polygon
    this.shape = this._createRestrictedPolygon();

    // Parent class configuration
    return RenderedPointSource.prototype._configure.call(this, changes);
};

VisionSource.prototype._initializeVisionMode = function () {
    const previousVM = this.visionMode;
    // Assign the vision mode
    const visionMode = this.data.visionMode in CONFIG.Canvas.visionModes ? this.data.visionMode : "basic";
    this.visionMode = CONFIG.Canvas.visionModes[visionMode];
    if (!(this.visionMode instanceof VisionMode)) {
        throw new Error("The VisionSource was not provided a valid VisionMode identifier");
    }

    // Assign the detection mode
    const detectionMode = this.visionMode.detectionMode in CONFIG.Canvas.detectionModes
        ? this.visionMode.detectionMode : DetectionMode.BASIC_MODE_ID;
    this.detectionMode = CONFIG.Canvas.detectionModes[detectionMode];
    if (!(this.detectionMode instanceof DetectionMode)) {
        throw new Error("The VisionSource was not provided a valid DetectionMode identifier");
    }

    // Call specific configuration for handling the blinded/deafened condition
    if (this.detectionMode._applyBlindness?.(this) ?? (
        this.data.blinded && this.detectionMode.type === DetectionMode.DETECTION_TYPES.SIGHT
        || this.data.deafened && this.detectionMode.type === DetectionMode.DETECTION_TYPES.SOUND)) {
        this.visionMode = CONFIG.Canvas.visionModes.blindness;
        this.data.radius = this.data.externalRadius;
        this._configureColorAttributes(null);
        foundry.utils.mergeObject(this.data, this.visionMode.vision.defaults);
    }

    if (canvas.effects.illumination.globalLight && this.visionMode.neutralIfGlobalLight === true) {
        this.visionMode = CONFIG.Canvas.visionModes.basic;
        this._configureColorAttributes(null);
        foundry.utils.mergeObject(this.data, this.visionMode.vision.defaults);
    }

    if (!this.visionMode.perceivesLight) this.data.lightRadius = 0;

    const deactivateHandler = ((previousVM?.id !== this.visionMode.id) && previousVM);
    // Process deactivation and activation handlers
    if (deactivateHandler) previousVM.deactivate(this);
    this.visionMode.activate(this);
};

Object.defineProperties(VisionSource.prototype, {
    _createLightPolygon: {
        value: function () {
            const radius = this.data.lightRadius;
            if (radius >= canvas.dimensions.maxR) return this.los;
            const origin = { x: this.data.x, y: this.data.y };
            const density = PIXI.Circle.approximateVertexDensity(radius);
            const circle = new PIXI.Circle(origin.x, origin.y, radius);
            return this.los.applyConstraint(circle, { density, scalingFactor: 100 });
        },
        configurable: true,
        enumerable: false,
        writable: true
    }
});

VisionSource.prototype._createRestrictedPolygon = function () {
    const config = this._getPolygonConfiguration();
    const origin = { x: this.data.x, y: this.data.y };
    const radius = this.disabled ? 0 : Math.min(this.data.radius || this.data.externalRadius, config.radius);
    const density = PIXI.Circle.approximateVertexDensity(radius);
    config.radius = radius;
    config.density = density;
    let create = false;
    let { sourceType, useThreshold, wallDirectionMode } = this.detectionMode;
    const type = this.detectionMode.walls ? (sourceType ?? config.type) : "universal";
    sourceType ??= this.constructor.sourceType;
    useThreshold ??= config.useThreshold;
    if (sourceType === "move") useThreshold = false;
    wallDirectionMode ??= config.wallDirectionMode;
    if (config.type !== type) {
        config.type = type;
        create = true;
    }
    if (config.useThreshold !== useThreshold) {
        config.useThreshold = useThreshold;
        if (sourceType !== "move") create = true;
    }
    if (config.wallDirectionMode !== wallDirectionMode) {
        config.wallDirectionMode = wallDirectionMode;
        create = true;
    }
    if (!this.detectionMode.angle && (config.angle ?? 360) !== 360) {
        config.angle = 360;
        create = true;
    }
    const polygonBackends = CONFIG.Canvas.polygonBackends;
    create ||= polygonBackends[sourceType] !== polygonBackends[this.constructor.sourceType];
    if (create) {
        return polygonBackends[sourceType].create(origin, config);
    }
    const circle = new PIXI.Circle(origin.x, origin.y, radius);
    const fov = this.los.applyConstraint(circle, { density, scalingFactor: 100 });
    fov.config.type = type;
    return fov;
};

Object.defineProperties(VisionMode.prototype, {
    detectionMode: {
        get() { return DetectionMode.BASIC_MODE_ID; },
        configurable: true,
        enumerable: false
    },
    perceivesLight: {
        get() {
            const { background, illumination, coloration } = this.lighting;
            return !!(background.visibility || illumination.visibility || coloration.visibility);
        },
        configurable: true,
        enumerable: false
    },
    neutralIfGlobalLight: {
        value: false,
        configurable: true,
        enumerable: false,
        writable: true
    }
});

CONFIG.specialStatusEffects.DEAF = "deaf";
CONFIG.specialStatusEffects.INAUDIBLE = "inaudible";

Object.defineProperties(DetectionMode, {
    LIGHT_MODE_ID: {
        value: "lightPerception",
        configurable: true,
        enumerable: false,
        writable: true
    }
});

Object.defineProperties(DetectionMode.prototype, {
    sourceType: {
        value: undefined,
        configurable: true,
        enumerable: false,
        writable: true
    },
    wallDirectionMode: {
        value: undefined,
        configurable: true,
        enumerable: false,
        writable: true
    },
    useThreshold: {
        value: undefined,
        configurable: true,
        enumerable: false,
        writable: true
    },
    priority: {
        value: 0,
        configurable: true,
        enumerable: false,
        writable: true
    },
    imprecise: {
        value: false,
        configurable: true,
        enumerable: false,
        writable: true
    },
    important: {
        value: false,
        configurable: true,
        enumerable: false,
        writable: true
    },
    _testPoint: {
        value: function (visionSource, mode, target, test) {
            if (!this._testRange(visionSource, mode, target, test)) return false;
            return this._testLOS(visionSource, mode, target, test);
        },
        configurable: true,
        enumerable: false,
        writable: true
    }
});

DetectionModeBasicSight.getDetectionFilter = function (revealed) {
    if (revealed) return;
    return this._detectionFilter ??= OutlineOverlayFilter.create({
        outlineColor: [1, 1, 1, 1],
        knockout: true
    });
};

DetectionMode.prototype._canDetect = function (visionSource, target) {
    const src = visionSource.object.document;
    const tgt = target?.document;
    switch (this.type) {
        case DetectionMode.DETECTION_TYPES.SIGHT:
            if ((src instanceof TokenDocument) && src.hasStatusEffect(CONFIG.specialStatusEffects.BLIND)) return false;
            const isInvisible = (tgt instanceof TokenDocument) && tgt.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE);
            return !isInvisible;
        case DetectionMode.DETECTION_TYPES.SOUND:
            if ((src instanceof TokenDocument) && src.hasStatusEffect(CONFIG.specialStatusEffects.DEAF)) return false;
            const isAudible = (tgt instanceof TokenDocument) && tgt.hasStatusEffect(CONFIG.specialStatusEffects.INAUDIBLE);
            return !isAudible;
    }
    return true;
};

Object.defineProperties(DetectionModeBasicSight.prototype, {
    priority: {
        value: Number.MAX_SAFE_INTEGER - 1,
        configurable: true,
        enumerable: false,
        writable: true
    }
});

delete DetectionModeBasicSight.prototype._testPoint;

Object.defineProperties(DetectionModeTremor.prototype, {
    detectionMode: {
        value: "feelTremor",
        configurable: true,
        enumerable: false,
        writable: true
    }
});

class DetectionModeLightPerception extends DetectionMode {
    priority = Number.MAX_SAFE_INTEGER;

    /** @override */
    static getDetectionFilter(revealed) {
        if (revealed) return;
        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true
        });
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        if (!super._testPoint(visionSource, mode, target, test)) return false;
        for (const lightSource of canvas.effects.lightSources) {
            if (lightSource.disabled) continue;
            if (lightSource.shape.contains(test.point.x, test.point.y)) return true;
        }
        return false;
    }
}

CONFIG.Canvas.detectionModes.lightPerception = new DetectionModeLightPerception({
    id: "lightPerception",
    label: "Light Perception",
    type: DetectionMode.DETECTION_TYPES.SIGHT
});

CanvasVisibility.prototype.refreshVisibility = ((refreshVisibility) => {
    const TRUE = new Boolean(true);
    const FALSE = new Boolean(false);
    return function () {
        this.vision?.sight.clear();

        const visionSources = canvas.effects.visionSources;

        for (const visionSource of visionSources) {
            const blinded = visionSource.visionMode === CONFIG.Canvas.visionModes.blindness
                || visionSource.detectionMode.imprecise;

            if (visionSource.data.blinded === !blinded) {
                visionSource.data.blinded = blinded ? TRUE : FALSE;
            }
        }

        refreshVisibility.call(this);

        for (const visionSource of visionSources) {
            if (visionSource.data.blinded === TRUE) {
                visionSource.data.blinded = false;
            } else if (visionSource.data.blinded === FALSE) {
                visionSource.data.blinded = true;
            }
        }
    };
})(CanvasVisibility.prototype.refreshVisibility);

Object.defineProperties(CanvasVisibility.prototype, {
    _createTestConfig: {
        value: function (point, { tolerance = 2, object = null } = {}) {
            const t = tolerance;
            const offsets = t > 0 ? [[0, 0], [-t, -t], [-t, t], [t, t], [t, -t], [-t, 0], [t, 0], [0, -t], [0, t]] : [[0, 0]];
            const config = {
                object,
                tests: offsets.map(o => ({
                    point: new PIXI.Point(point.x + o[0], point.y + o[1]),
                    los: new Map()
                }))
            };
            return config;
        },
        configurable: true,
        enumerable: false,
        writable: true
    }
});

CanvasVisibility.prototype.testVisibility = (() => {
    class MultiDetectionFilter extends PIXI.Filter {
        #filters;

        constructor(filters) {
            super();
            this.#filters = filters;
        }

        get autoFit() {
            let autoFit = true;
            for (let i = 0; i < this.#filters.length; i++) {
                autoFit &&= this.#filters[i].autoFit;
            }
            return autoFit;
        }

        set autoFit(value) { }

        get padding() {
            let padding = 0;
            for (let i = 0; i < this.#filters.length; i++) {
                padding = Math.max(padding, this.#filters[i].padding);
            }
            return padding;
        }

        set padding(value) { }

        get resolution() {
            const renderer = canvas.app.renderer;
            const renderTextureSystem = renderer.renderTexture;
            if (renderTextureSystem.current) {
                return renderTextureSystem.current.resolution;
            }
            return renderer.resolution;
        }

        set resolution(value) { }

        get multisample() {
            const renderer = canvas.app.renderer;
            const renderTextureSystem = renderer.renderTexture;
            if (renderTextureSystem.current) {
                return renderTextureSystem.current.multisample;
            }
            return renderer.multisample;
        }

        set multisample(value) { }

        apply(filterManager, input, output, clearMode, currentState) {
            for (let i = 0; i < this.#filters.length; i++) {
                this.#filters[i].apply(filterManager, input, output, i === 0 ? clearMode : PIXI.CLEAR_MODES.BLEND, currentState);
            }
        }
    };

    return function (point, options = {}) {
        const object = options.object;

        if (object instanceof Token) {
            object.detectionFilter = undefined;
            object.impreciseVisible = false;
        }

        // If no vision sources are present, the visibility is dependant of the type of user
        if (!canvas.effects.visionSources.some(s => s.active)) return game.user.isGM;

        // Prepare an array of test points depending on the requested tolerance
        const config = this._createTestConfig(point, options);
        let preciseVisible = false;

        // First test basic detection for light sources which specifically provide vision
        for (const lightSource of canvas.effects.lightSources) {
            if (!lightSource.data.vision || !lightSource.active) continue;
            const result = lightSource.testVisibility(config);
            if (result) {
                preciseVisible = true;
                break;
            }
        }

        // Get scene rect to test that some points are not detected into the padding
        const sr = canvas.dimensions.sceneRect;
        const inBuffer = !sr.contains(point.x, point.y);
        // Skip sources that are not both inside the scene or both inside the buffer
        const activeVisionSources = canvas.effects.visionSources.filter(s => s.active && inBuffer !== sr.contains(s.x, s.y));
        const modes = CONFIG.Canvas.detectionModes;
        let importantModes;

        // Second test basic detection tests for vision sources
        for (const visionSource of activeVisionSources) {
            const token = visionSource.object.document;
            const mode = token.detectionModes.find(m => m.id === visionSource.detectionMode.id);
            const dm = modes[mode?.id];
            if (!dm || preciseVisible && !dm.important) continue;
            const result = dm.testVisibility(visionSource, mode, config);
            if (result === true) {
                if (object instanceof Token) {
                    if (dm.important) {
                        importantModes ??= new Set();
                        importantModes.add(dm);
                    }
                    if (!preciseVisible && !(dm.imprecise && object.impreciseVisible)) {
                        if (!dm.important) object.detectionFilter = dm.constructor.getDetectionFilter(true);
                        object.impreciseVisible = dm.imprecise;
                    }
                }
                if (!dm.imprecise) {
                    preciseVisible = true;
                }
            }
        }

        const basicVisible = preciseVisible || object instanceof Token && object.impreciseVisible;

        // Third test light perception for vision sources
        for (const visionSource of activeVisionSources) {
            const token = visionSource.object.document;
            const mode = token.detectionModes.find(m => m.id === DetectionMode.LIGHT_MODE_ID);
            const dm = modes[mode?.id];
            if (!dm || preciseVisible && !dm.important) continue;
            const result = dm.testVisibility(visionSource, mode, config);
            if (result === true) {
                if (object instanceof Token) {
                    if (dm.important) {
                        importantModes ??= new Set();
                        importantModes.add(dm);
                    }
                    if (!preciseVisible && !basicVisible && !(dm.imprecise && object.impreciseVisible)) {
                        if (!dm.important) object.detectionFilter = dm.constructor.getDetectionFilter(visionSource.visionMode.perceivesLight);
                        object.impreciseVisible = dm.imprecise;
                    }
                }
                if (!dm.imprecise) {
                    preciseVisible = true;
                }
            }
        }

        if (!(object instanceof Token)) return preciseVisible; // Special detection modes can only detect tokens

        // Lastly test special detection modes for vision sources
        for (const visionSource of activeVisionSources) {
            const token = visionSource.object.document;
            for (const mode of token.detectionModes) {
                if (mode.id === DetectionMode.LIGHT_MODE_ID || mode.id === visionSource.detectionMode.id) continue;
                const dm = modes[mode.id];
                if (!dm || preciseVisible && !dm.important) continue;
                const result = dm.testVisibility(visionSource, mode, config);
                if (result === true) {
                    if (dm.important) {
                        importantModes ??= new Set();
                        importantModes.add(dm);
                    }
                    if (!preciseVisible && !basicVisible && !(dm.imprecise && object.impreciseVisible)) {
                        if (!dm.important) object.detectionFilter = dm.constructor.getDetectionFilter(false);
                        object.impreciseVisible = dm.imprecise;
                    }
                    if (!dm.imprecise) {
                        preciseVisible = true;
                    }
                }
            }
        }

        if (object instanceof Token) {
            if (preciseVisible) {
                object.impreciseVisible = false;
            }

            if (importantModes) {
                const dmfs = object.detectionFilter ? [object.detectionFilter] : [];
                for (const dm of importantModes) {
                    dmfs.push(dm.constructor.getDetectionFilter(false));
                }
                object.detectionFilter = new MultiDetectionFilter(dmfs);
            }
        }

        return preciseVisible;
    };
})();

CanvasVisibility.prototype.restrictVisibility = ((restrictVisibility) => function () {
    for (const token of canvas.tokens.placeables) {
        token.impreciseVisible = false;
    }
    return restrictVisibility.call(this);
})(CanvasVisibility.prototype.restrictVisibility);

Hooks.on("drawCanvasVisibility", (layer) => {
    const vision = layer.vision;

    vision.sight = vision.addChild(new PIXI.LegacyGraphics());
    vision.sight.blendMode = PIXI.BLEND_MODES.MAX_COLOR;

    vision.mask = null;
    vision.fov.mask = vision.los;

    Object.defineProperty(vision.fov.tokens, "drawShape", {
        value: function clear(shape) {
            let graphics = this;

            if (shape instanceof PointSourcePolygon) {
                const source = shape.config.source;

                if (source instanceof VisionSource) {
                    graphics = vision.sight;
                }
            }

            const { drawShape, beginFill, endFill } = Object.getPrototypeOf(graphics);

            if (graphics !== this) {
                beginFill.call(graphics, 0xFF0000, 1.0);
            }

            drawShape.call(graphics, shape);

            if (graphics !== this) {
                endFill.call(graphics);
            }

            return this;
        },
        enumerable: false,
        configurable: true,
        writable: true
    });

    Object.defineProperty(vision.los, "drawShape", {
        value: function (shape) {
            if (shape instanceof PointSourcePolygon) {
                const source = shape.config.source;

                if (source instanceof VisionSource) {
                    shape = source.light;
                }
            }

            return Object.getPrototypeOf(this).drawShape.call(this, shape);
        },
        enumerable: false,
        configurable: true,
        writable: true
    });

    Object.defineProperty(vision.los.preview, "drawShape", {
        value: function (shape) {
            if (shape instanceof PointSourcePolygon) {
                const source = shape.config.source;

                if (source instanceof VisionSource) {
                    shape = source.light;
                }
            }

            return Object.getPrototypeOf(this).drawShape.call(this, shape);
        },
        enumerable: false,
        configurable: true,
        writable: true
    });
});

TokenDocument.prototype._prepareDetectionModes = function () {
    if (!this.sight.enabled) return;

    const lightId = DetectionMode.LIGHT_MODE_ID;
    const lightMode = this.detectionModes.find(m => m.id === lightId);
    if (!lightMode) this.detectionModes.push({ id: lightId, enabled: true, range: 1e15 });

    const basicId = DetectionMode.BASIC_MODE_ID;
    const basicMode = this.detectionModes.find(m => m.id === basicId);
    if (!basicMode) this.detectionModes.push({ id: basicId, enabled: true, range: this.sight.range });

    this.detectionModes.sort((a, b) => (CONFIG.Canvas.detectionModes[b.id]?.priority ?? 0) - (CONFIG.Canvas.detectionModes[a.id]?.priority ?? 0));
};

Object.defineProperties(Token.prototype, {
    isVisible: {
        get: ((isVisible) => function () {
            const wasImpreciseVisible = this.impreciseVisible;
            this.detectionFilter = undefined;
            this.impreciseVisible = false;
            let visible = isVisible.call(this);
            if (canvas.effects.visibility.tokenVision) {
                let overrideFilter = false;
                if (visible) {
                    const isVisionSource = this.vision.active && canvas.effects.visionSources.has(this.sourceId);
                    if (isVisionSource) {
                        if (this.vision.detectionMode?.imprecise) {
                            overrideFilter = true;
                        }
                    } else if (this.controlled) {
                        if ((!game.user.isGM || canvas.effects.visionSources.some(s => s.active))
                            && !canvas.effects.visibility.testVisibility(this.center, { tolerance: Math.min(this.w, this.h) / 4, object: this })) {
                            overrideFilter = true;
                        }
                    } else {
                        if (!game.user.isGM && !canvas.effects.visionSources.some(s => s.active)) {
                            overrideFilter = true;
                        }
                    }
                } else if (!game.user.isGM && this.isOwner && !this.document.hidden
                    && canvas.effects.visionSources.some(s => s.active)) {
                    visible = true;
                    overrideFilter = true;
                }
                if (overrideFilter) {
                    this.detectionFilter = DetectionModeLightPerception.getDetectionFilter();
                    this.impreciseVisible = false;
                }
            }
            if (wasImpreciseVisible !== this.impreciseVisible) {
                this._refreshBorder();
                this._refreshTarget();
            }
            return visible;
        })(Object.getOwnPropertyDescriptor(Token.prototype, "isVisible").get),
        configurable: true,
        enumerable: false
    },
    lightPerceptionRange: {
        get() {
            return this.getLightRadius(this.document.detectionModes.find(m => m.id === DetectionMode.LIGHT_MODE_ID && m.enabled)?.range ?? 0);
        },
        configurable: true,
        enumerable: false
    },
    impreciseVisible: {
        get() { return this._impreciseMesh.visible; },
        set(value) { this._impreciseMesh.visible = value; },
        configurable: true,
        enumerable: false
    },
    _impreciseMesh: {
        get() {
            const mesh = new SpriteMesh(PIXI.Texture.EMPTY, BaseSamplerShader);

            mesh.visible = false;
            mesh.alpha = 0;
            mesh.eventMode = "static";
            mesh.cursor = "pointer";
            mesh.hitArea = new PIXI.Rectangle();

            loadTexture(CONFIG.Token.documentClass.DEFAULT_ICON)
                .then((texture) => {
                    if (!mesh.destroyed) {
                        mesh.texture = texture;

                        const { w, h } = this;
                        const { width, height } = mesh.texture;
                        const s = Math.min(w / width, h / height);

                        mesh.width = width * s;
                        mesh.height = height * s;

                        const dx = (w - mesh.width) / 2;
                        const dy = (h - mesh.height) / 2;

                        mesh.x = this.x + dx;
                        mesh.y = this.y + dy;
                        mesh.hitArea.x = -dx / s;
                        mesh.hitArea.y = -dy / s;
                        mesh.hitArea.width = w / s;
                        mesh.hitArea.height = h / s;
                    }
                });

            const permissions = {
                hoverIn: () => true,
                hoverOut: () => true,
                clickLeft: () => true,
                clickLeft2: () => false,
                clickRight: () => false,
                clickRight2: () => true,
                dragStart: () => false
            };
            const callbacks = {
                hoverIn: (event) => {
                    if (event.buttons & 0x01) return;
                    this._impreciseHover = true;
                    this.layer._impreciseHover = this;
                    this.renderFlags.set({ refreshState: true });
                },
                hoverOut: (event) => {
                    this._impreciseHover = false;
                    if (this.layer._impreciseHover === this) {
                        this.layer._impreciseHover = null;
                    }
                    this.renderFlags.set({ refreshState: true });
                },
                clickLeft: (event) => {
                    event.stopPropagation();
                    if (game.activeTool === "target") {
                        this.setTarget(!this.isTargeted, { releaseOthers: !event.shiftKey });
                        return;
                    }
                    const hud = this.layer.hud;
                    if (hud) hud.clear();
                    if (this.controlled) {
                        if (event.shiftKey) this.release();
                    }
                    else this.control({ releaseOthers: !event.shiftKey });
                },
                clickLeft2: null,
                clickRight: null,
                clickRight2: (event) => {
                    event.stopPropagation();
                    if (this.isOwner && game.user.can("TOKEN_CONFIGURE")) return;
                    this.setTarget(!this.targeted.has(game.user), { releaseOthers: !event.shiftKey });
                },
                dragLeftStart: null,
                dragLeftMove: null,
                dragLeftDrop: null,
                dragLeftCancel: null,
                dragRightStart: null,
                dragRightMove: null,
                dragRightDrop: null,
                dragRightCancel: null,
                longPress: null
            };
            const options = { target: null };
            const mgr = new MouseInteractionManager(mesh, canvas.stage, permissions, callbacks, options);
            mesh.mouseInteractionManager = mgr.activate();

            mesh.render = ((render, token) => function (renderer) {
                if (this.visible && this.renderable) {
                    token.updateTransform();
                    token.border?.render(renderer);
                    token.tooltip?.render(renderer);
                    token.target?.render(renderer);
                }
                return render.call(this, renderer);
            })(mesh.render, this);

            Object.defineProperty(this, "_impreciseMesh", {
                value: mesh,
                configurable: true,
                enumerable: true,
                writable: true
            });

            return mesh;
        },
        configurable: true,
        enumerable: false
    },
});

Token.prototype._onDragLeftStart = ((_onDragLeftStart) => function (event) {
    _onDragLeftStart.call(this, event);

    const { clones, destination, origin } = event.interactionData;
    const preview = game.settings.get("core", "tokenDragPreview");

    // Determine dragged distance
    const dx = destination.x - origin.x;
    const dy = destination.y - origin.y;

    // Update the position of each clone
    for (let c of clones || []) {
        const o = c._original;
        const x = o.document.x + dx;
        const y = o.document.y + dy;
        if (preview && !game.user.isGM) {
            const collision = o.checkCollision(o.getCenter(x, y));
            if (collision) continue;
        }
        c.document.x = x;
        c.document.y = y;
        c.refresh();
        if (preview) c.updateSource({ defer: true });
    }

    // Update perception immediately
    if (preview) canvas.perception.update({ refreshLighting: true, refreshVision: true });
})(Token.prototype._onDragLeftStart);

Token.prototype._getBorderColor = ((_getBorderColor) => function (options = {}) {
    options.hover ??= this.hover || this._impreciseHover;

    let color = _getBorderColor.call(this, options);

    if (color !== null && this.impreciseVisible) {
        color = CONFIG.Canvas.dispositionColors.INACTIVE;
    }

    return color;
})(Token.prototype._getBorderColor);

Token.prototype._renderDetectionFilter = function (renderer) {
    const filter = this.detectionFilter;
    const mesh = !this.visible ? this._impreciseMesh : this.mesh;

    if (!(mesh && filter && this.renderable)) return;

    mesh.filters ??= [];
    mesh.filters.push(filter);

    const originalTint = mesh.tint;
    const originalAlpha = mesh.worldAlpha;

    mesh.tint = 0xFFFFFF;
    mesh.worldAlpha = 1;
    mesh.pluginName = BaseSamplerShader.classPluginName;

    mesh.render(renderer);

    mesh.tint = originalTint;
    mesh.worldAlpha = originalAlpha;
    mesh.pluginName = null;

    mesh.filters.pop();
};

Object.defineProperties(Token.prototype, {
    sightRange: {
        get() {
            const document = this.document;
            const visionId = document.sight.visionMode in CONFIG.Canvas.visionModes ? document.sight.visionMode : "basic";
            const visionMode = CONFIG.Canvas.visionModes[visionId];
            const basicId = visionMode.detectionMode in CONFIG.Canvas.detectionModes
                ? visionMode.detectionMode : DetectionMode.BASIC_MODE_ID;
            return this.getLightRadius(document.detectionModes.find(m => m.id === basicId && m.enabled)?.range ?? 0);
        },
        configurable: true,
        enumerable: false
    },
    optimalSightRange: {
        get() {
            return Math.max(this.sightRange, Math.min(this.lightPerceptionRange, Math.max(this.dimRadius, this.brightRadius)));
        },
        configurable: true,
        enumerable: false
    }
});

Hooks.on("applyTokenStatusEffect", (token, statusId, active) => {
    if (statusId === CONFIG.specialStatusEffects.DEAF) {
        canvas.perception.update({ initializeVision: true });
    } else if (statusId === CONFIG.specialStatusEffects.INAUDIBLE) {
        canvas.perception.update({ refreshVision: true });
    }
});

Hooks.on("tearDownTokenLayer", (layer) => {
    layer._impreciseMeshes = null;
});

Hooks.on("drawToken", (token) => {
    token.layer._impreciseMeshes ??= token.layer.addChildAt(new PIXI.Container(), token.layer.getChildIndex(token.layer.objects));
    token.layer._impreciseMeshes.eventMode = "static";
    token.layer._impreciseMeshes.addChild(token._impreciseMesh);
});

Hooks.on("refreshToken", (token, flags) => {
    const mesh = token._impreciseMesh;

    if (flags.refreshState) {
        const isSecret = (token.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET) && !token.isOwner;
        token.nameplate.renderable = !isSecret;
        token.bars.renderable = !isSecret;
        token.tooltip.renderable = !isSecret;
        token.effects.renderable = !isSecret;
        mesh.cursor = !isSecret ? "pointer" : null;
    }

    const { w, h } = token;
    const { width, height } = mesh.texture;
    const s = Math.min(w / width, h / height);

    mesh.width = width * s;
    mesh.height = height * s;

    const dx = (w - mesh.width) / 2;
    const dy = (h - mesh.height) / 2;

    mesh.x = token.x + dx;
    mesh.y = token.y + dy;
    mesh.hitArea.x = -dx / s;
    mesh.hitArea.y = -dy / s;
    mesh.hitArea.width = w / s;
    mesh.hitArea.height = h / s;

    if (flags.refreshVisibility && token.border) {
        token.border.visible = (token.visible || token.impreciseVisible) && token.renderable
            && (token.controlled || token.hover || token._impreciseHover || token.layer.highlightObjects)
            && !((token.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET) && !token.isOwner);
    }
});

Hooks.on("destroyToken", (token) => {
    if (token._impreciseMesh?.destroyed === false) {
        token._impreciseMesh.destroy();
    }
});

Token.prototype._onClickLeft = ((_onClickLeft) => function (event) {
    const tool = game.activeTool;
    if (tool === "target") {
        event.stopPropagation();
        if ((this.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET) && !this.isOwner) return;
        return this.setTarget(!this.isTargeted, { releaseOthers: !event.shiftKey });
    }
    _onClickLeft.call(this, event);
})(PlaceableObject.prototype._onClickLeft);

Token.prototype._onClickRight2 = ((_onClickRight2) => function (event) {
    if (!this._propagateRightClick(event)) event.stopPropagation();
    if (this.isOwner && game.user.can("TOKEN_CONFIGURE")) return _onClickRight2.call(this, event);
    if ((this.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET) && !this.isOwner) return;
    return this.setTarget(!this.targeted.has(game.user), { releaseOthers: !event.shiftKey });
})(PlaceableObject.prototype._onClickRight2);

TokenLayer.prototype.targetObjects = function ({ x, y, width, height }, { releaseOthers = true } = {}) {
    const user = game.user;

    // Get the set of targeted tokens
    const targets = this.placeables.filter(t => {
        if (!(t.visible || t.impreciseVisible)) return false;
        if ((t.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET) && !t.isOwner) return false;
        const c = t.center;
        return Number.between(c.x, x, x + width) && Number.between(c.y, y, y + height);
    });

    // Maybe release other targets
    if (releaseOthers) {
        for (let t of user.targets) {
            if (!targets.includes(t)) t.setTarget(false, { releaseOthers: false, groupSelection: true });
        }
    }

    // Acquire targets for tokens which are not yet targeted
    targets.forEach(t => {
        if (!user.targets.has(t)) t.setTarget(true, { releaseOthers: false, groupSelection: true });
    });

    // Broadcast the target change
    user.broadcastActivity({ targets: user.targets.ids });

    // Return the number of targeted tokens
    return user.targets.size;
};

ClientKeybindings._onTarget = function (context) {
    if (!canvas.ready) return false;
    const layer = canvas.activeLayer;
    if (!(layer instanceof TokenLayer)) return false;
    const hovered = layer.hover ?? layer._impreciseHover;
    if (!hovered) return false;
    if ((hovered.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET) && !hovered.isOwner) return false;
    hovered.setTarget(!hovered.isTargeted, { releaseOthers: !context.isShift });
    return true;
};

ClockwiseSweepPolygon.prototype._executeSweep = ((_executeSweep) => function () {
    _executeSweep.call(this);

    this._closePoints();
})(ClockwiseSweepPolygon.prototype._executeSweep);

ClockwiseSweepPolygon.prototype._getInternalEdgeCollisions = function (ray, internalEdges) {
    const collisions = [];
    const A = ray.A;
    const B = ray.B;
    for (let edge of internalEdges) {
        const x = foundry.utils.lineLineIntersection(A, B, edge.A, edge.B);
        if (!x) continue;

        const c = PolygonVertex.fromPoint(x);
        c.attachEdge(edge, 0);
        // Use the unrounded intersection point
        c.x = x.x;
        c.y = x.y;
        c._d2 = Math.pow(c.x - A.x, 2) + Math.pow(c.y - A.y, 2);
        c.isInternal = true;

        collisions.push(c);
    }

    return collisions;
};

ClockwiseSweepPolygon.prototype.addPoint = function ({ x, y }) {
    const points = this.points;
    const m = points.length;

    if (m >= 4) {
        let x3 = points[m - 4];
        let y3 = points[m - 3];
        let x2 = points[m - 2];
        let y2 = points[m - 1];
        let x1 = x;
        let y1 = y;

        if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
            if ((x1 > x2) !== (x1 < x3)) {
                if ((x2 > x1) === (x2 < x3)) {
                    [x1, y1, x2, y2] = [x2, y2, x1, y1];
                } else {
                    [x1, y1, x2, y2, x3, y3] = [x3, y3, x1, y1, x2, y2];
                }
            }
        } else if ((y1 > y2) !== (y1 < y3)) {
            if ((y2 > y1) === (y2 < y3)) {
                [x1, y1, x2, y2] = [x2, y2, x1, y1];
            } else {
                [x1, y1, x2, y2, x3, y3] = [x3, y3, x1, y1, x2, y2];
            }
        }

        const a = y2 - y3;
        const b = x3 - x2;
        const c = (a * (x1 - x2)) + (b * (y1 - y2));

        if ((c * c) / ((a * a) + (b * b)) >= 0.0625) {
            points.push(x, y);
        } else {
            const dx = points[m - 4] - x;
            const dy = points[m - 3] - y;

            points.length -= 2;

            if ((dx * dx) + (dy * dy) >= 0.0625) {
                points.push(x, y);
            }
        }
    } else if (m === 2) {
        const dx = points[m - 2] - x;
        const dy = points[m - 1] - y;

        if ((dx * dx) + (dy * dy) >= 0.0625) {
            points.push(x, y);
        }
    } else {
        points.push(x, y);
    }
};

ClockwiseSweepPolygon.prototype._closePoints = function () {
    const points = this.points;

    if (points.length < 6) {
        points.length = 0;
        return;
    }

    const [x1, y1, x2, y2] = points;

    this.addPoint({ x: x1, y: y1 });
    this.addPoint({ x: x2, y: y2 });

    const m = points.length;

    [points[0], points[1], points[2], points[3]] = [points[m - 4], points[m - 3], points[m - 2], points[m - 1]];
    points.length -= 4;
};
