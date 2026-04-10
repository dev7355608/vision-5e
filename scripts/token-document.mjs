import { convertUnits, fromFeet } from "./utils.mjs";

export default (TokenDocument) => class extends TokenDocument {
    /** @override */
    prepareBaseData() {
        super.prepareBaseData();

        this._prepareSight();
    }

    /** @override */
    _prepareDetectionModes() {
        this._clearDetectionModes();

        if (!this.sight.enabled) {
            return;
        }

        for (const [id, { enabled, range }] of this._getDetectionModes(true)) {
            if (!(id in CONFIG.Canvas.detectionModes)) {
                continue;
            }

            this._setDetectionMode(id, range ?? Infinity, enabled);
        }

        const sceneUnits = this.parent?.grid.units || "";

        if (this.actor?.detectionModes) {
            const actorUnits = this.actor.system.attributes?.senses?.units ?? "ft";

            for (const [id, range] of Object.entries(this.actor.detectionModes)) {
                if (!this._hasDetectionMode(id)) {
                    this._setDetectionMode(id, convertUnits(range, actorUnits, sceneUnits));
                }
            }
        } else {
            if (!this._hasDetectionMode("lightPerception")) {
                this._setDetectionMode("lightPerception", Infinity);
            }
        }

        if (this.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
            const maxRange = fromFeet(60, sceneUnits);

            for (const [_id, mode] of this._getDetectionModes()) {
                mode.range = Math.min(mode.range, maxRange);
            }
        }
    }

    /** @protected */
    _prepareSight() {
        if (!this.sight.enabled) {
            this.sight.range = 0;
            this.sight.angle = 360;
            this.sight.visionMode = "darkvision";
            this.sight.detectionMode = "basicSight";
            this.sight.color = null;
            this.sight.attenuation = 0;
            this.sight.brightness = 0;
            this.sight.saturation = 0;
            this.sight.contrast = 0;

            return;
        }

        const detectionMode = VISION_TO_DETECTION_MODE_MAPPING[this._source.sight.visionMode];
        const mode = this._getDetectionMode(detectionMode);

        if (mode && mode.enabled && mode.range > 0) {
            this.sight.range = mode.range;
            this.sight.visionMode = this._source.sight.visionMode;
            this.sight.detectionMode = detectionMode;
        } else {
            this.sight.range = 0;
            this.sight.visionMode = "basic";
            this.sight.detectionMode = "basicSight";

            for (const [visionMode, detectionMode] of Object.entries(VISION_TO_DETECTION_MODE_MAPPING)) {
                const mode = this._getDetectionMode(detectionMode);

                if (!mode || !mode.enabled || this.sight.range >= mode.range) {
                    continue;
                }

                this.sight.range = mode.range;
                this.sight.visionMode = visionMode;
                this.sight.detectionMode = detectionMode;
            }
        }

        this.sight.angle = this._source.sight.angle;

        if (this.sight.visionMode === "basic") {
            this.sight.visionMode = "darkvision";
            this.sight.color = null;
            this.sight.attenuation = 0;
            this.sight.brightness = -1;
            this.sight.saturation = -1;
            this.sight.contrast = 0;
        } else {
            const { color, attenuation, brightness, saturation, contrast } = CONFIG.Canvas.visionModes[this.sight.visionMode].vision.defaults;

            this.sight.color = color !== undefined ? color : this._source.sight.color !== null ? foundry.utils.Color.from(this._source.sight.color) : null;
            this.sight.attenuation = attenuation !== undefined ? attenuation : this._source.sight.attenuation;
            this.sight.brightness = brightness !== undefined ? brightness : 0;
            this.sight.saturation = saturation !== undefined ? saturation : 0;
            this.sight.contrast = contrast !== undefined ? contrast : 0;
        }
    }

    /**
     * @param {string} id
     * @returns {{ range: number; enabled: boolean }}
     * @internal
     */
    _getDetectionMode(id) {
        if (game.release.generation >= 14) {
            return this.detectionModes[id];
        } else {
            return this.detectionModes.find((mode) => mode.id === id);
        }
    }

    /**
     * @param {string} id
     * @param {number} range
     * @param {boolean} [enabled]
     * @internal
     */
    _setDetectionMode(id, range, enabled = true) {
        if (game.release.generation >= 14) {
            this.detectionModes[id] = { range, enabled };
        } else {
            this.detectionModes.push({ id, range, enabled });
        }
    }

    /**
     * @param {string} id
     * @returns {boolean}
     * @internal
     */
    _hasDetectionMode(id) {
        if (game.release.generation >= 14) {
            return id in this.detectionModes;
        } else {
            return this.detectionModes.some((mode) => mode.id === id);
        }
    }

    /**
     * @param {boolean} [source]
     * @returns {Generator<{ range: number; enabled: boolean }>}
     * @internal
     */
    * _getDetectionModes(source = false) {
        const detectionModes = source ? this._source.detectionModes : this.detectionModes;

        if (game.release.generation >= 14) {
            for (const [id, mode] of Object.entries(detectionModes)) {
                yield [id, mode];
            }
        } else {
            for (const mode of detectionModes) {
                yield [mode.id, mode];
            }
        }
    }

    /** @internal */
    _clearDetectionModes() {
        if (game.release.generation >= 14) {
            this.detectionModes = {};
        } else {
            this.detectionModes = [];
        }
    }

    /**
     * @param {(id: string, range: number, enabled: boolean) => boolean} condition
     * @internal
     */
    _filterDetectionModes(condition) {
        let detectionModes;

        if (game.release.generation >= 14) {
            detectionModes = {};

            for (const [id, mode] of Object.entries(this.detectionModes)) {
                if (condition(id, mode.range, mode.enabled)) {
                    detectionModes[id] = mode;
                }
            }
        } else {
            detectionModes = this.detectionModes.filter((mode) => condition(mode.id, mode.range, mode.enabled));
        }

        this.detectionModes = detectionModes;
    }
};

const VISION_TO_DETECTION_MODE_MAPPING = {
    truesight: "seeAll",
    blindsight: "blindsight",
    devilsSight: "devilsSight",
    darkvision: "basicSight",
};
