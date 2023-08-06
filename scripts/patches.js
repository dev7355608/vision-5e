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
    const origin = { x: this.data.x, y: this.data.y };
    const radius = this.data.radius || this.data.externalRadius;
    const density = PIXI.Circle.approximateVertexDensity(radius);
    const config = {
        ...this._getPolygonConfiguration(),
        radius,
        density
    };
    if (this.disabled) config.radius = 0;
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
            this.detectionFilter = undefined;
            this.impreciseVisible = false;
            const visible = isVisible.call(this);
            if (visible
                && canvas.effects.visibility.tokenVision
                && canvas.effects.visionSources.has(this.sourceId)
                && this.vision.active
                && this.vision.detectionMode?.imprecise) {
                this.detectionFilter = DetectionModeLightPerception.getDetectionFilter();
                this.impreciseVisible = false;
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
            mesh.eventMode = "none";

            loadTexture(CONFIG.Token.documentClass.DEFAULT_ICON)
                .then((texture) => {
                    if (!mesh.destroyed) {
                        mesh.texture = texture;

                        const { w, h } = this;
                        const { width, height } = mesh.texture;
                        const s = Math.min(w / width, h / height);

                        mesh.width = width * s;
                        mesh.height = height * s;
                        mesh.x = this.x + (w - mesh.width) / 2;
                        mesh.y = this.y + (h - mesh.height) / 2;
                    }
                });

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
    token.layer._impreciseMeshes ??= token.layer.addChild(new PIXI.Container());
    token.layer._impreciseMeshes.addChild(token._impreciseMesh);
});

Hooks.on("refreshToken", (token) => {
    const mesh = token._impreciseMesh;
    const { w, h } = token;
    const { width, height } = mesh.texture;
    const s = Math.min(w / width, h / height);

    mesh.width = width * s;
    mesh.height = height * s;
    mesh.x = token.x + (w - mesh.width) / 2;
    mesh.y = token.y + (h - mesh.height) / 2;
});

Hooks.on("destroyToken", (token) => {
    token._impreciseMesh.destroy();
});
