import { DETECTION_LEVELS } from "./const.mjs";

export default function (point, options = {}) {
    const object = options.object ?? null;

    if (!canvas.effects.visionSources.some((source) => source.active)) {
        if (game.user.isGM) {
            if (object instanceof Token && object._detectionLevel === undefined) {
                object._detectionLevel = DETECTION_LEVELS.PRECISE;
                object._detectionFilter = null;
            }

            return true;
        }

        if (object instanceof Token && object._detectionLevel === undefined) {
            object._detectionLevel = DETECTION_LEVELS.NONE;
            object._detectionFilter = null;
        }

        return false;
    }

    const config = this._createVisibilityTestConfig(point, options);

    for (const lightSource of canvas.effects.lightSources) {
        if (!lightSource.data.vision || !lightSource.active) {
            continue;
        }

        const result = lightSource.testVisibility(config);

        if (result === true) {
            if (object instanceof Token && object._detectionLevel === undefined) {
                object._detectionLevel = DETECTION_LEVELS.PRECISE;
                object._detectionFilter = null;
            }

            return true;
        }
    }

    const sceneRect = canvas.dimensions.sceneRect;
    const inBuffer = !sceneRect.contains(point.x, point.y);
    const detectionFilters = new Set();
    let visible = false;
    let detectionLevel = DETECTION_LEVELS.NONE;

    for (const visionSource of canvas.effects.visionSources) {
        if (!visionSource.active || inBuffer === sceneRect.contains(visionSource.x, visionSource.y)) {
            continue;
        }

        const token = visionSource.object.document;

        // The detection modes have been sorted by TokenDocument#prepareBaseData
        for (const mode of token.detectionModes) {
            const detectionMode = CONFIG.Canvas.detectionModes[mode.id];
            const result = detectionMode?.testVisibility(visionSource, mode, config);

            if (result !== true) {
                continue;
            }

            visible = true;
            detectionLevel = Math.max(detectionLevel, detectionMode.imprecise ? DETECTION_LEVELS.IMPRECISE : DETECTION_LEVELS.PRECISE);

            if (object instanceof Token && object._detectionLevel === undefined) {
                const detectionFilter = detectionMode.constructor.getDetectionFilter(visionSource, object);

                if (detectionFilter) {
                    detectionFilters.add(detectionFilter);
                }
            }

            if (!detectionMode.important) {
                break;
            }
        }
    }

    if (!visible) {
        if (object instanceof Token && object._detectionLevel === undefined) {
            object._detectionLevel = DETECTION_LEVELS.NONE;
            object._detectionFilter = null;
        }

        return false;
    }

    if (object instanceof Token && object._detectionLevel === undefined) {
        object._detectionLevel = detectionLevel;

        if (detectionFilters.size > 1) {
            object._detectionFilter = new MultiDetectionFilter([...detectionFilters].reverse());
        } else if (detectionFilters.size === 1) {
            object._detectionFilter = detectionFilters.first();
        } else {
            object._detectionFilter = null;
        }
    }

    return true;
}

class MultiDetectionFilter extends PIXI.Filter {
    /** @type {PIXI.Filter[]} */
    filters;

    constructor(filters) {
        super();

        this.filters = filters;
    }

    /** @override */
    get enabled() {
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];

            if (filter.enabled) {
                return true;
            }
        }

        return false;
    }

    set enabled(value) { }

    /** @override */
    get autoFit() {
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];

            if (!filter.enabled) {
                continue;
            }

            if (!filter.autoFit) {
                return false;
            }
        }

        return true;
    }

    set autoFit(value) { }

    /** @override */
    get padding() {
        let padding = 0;
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];

            if (!filter.enabled) {
                continue;
            }

            padding = Math.max(padding, filter.padding);
        }

        return padding;
    }

    set padding(value) { }

    /** @override */
    get resolution() {
        let resolution = null;
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];
            if (!filter.enabled) {
                continue;
            }

            if (!filter.resolution) {
                return null;
            }

            resolution = Math.max(resolution, filter.resolution);
        }
        return resolution;
    }

    set resolution(value) { }

    /** @override */
    get multisample() {
        let multisample = PIXI.MSAA_QUALITY.NONE;
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];

            if (!filter.enabled) {
                continue;
            }

            if (filter.multisample === null) {
                return null;
            }

            multisample = Math.max(multisample, filter.multisample);
        }

        return multisample;
    }

    set multisample(value) { }

    /** @override */
    get legacy() {
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];

            if (!filter.enabled) {
                continue;
            }

            if (filter.legacy ?? true) {
                return true;
            }
        }

        return false;
    }

    set legacy(value) { }

    /** @override */
    apply(filterManager, input, output, clearMode, currentState) {
        const filters = this.filters;

        for (let i = 0, n = filters.length; i < n; i++) {
            const filter = filters[i];

            if (!filter.enabled) {
                continue;
            }

            filter.apply(filterManager, input, output, clearMode, currentState);
            clearMode = PIXI.CLEAR_MODES.BLEND;
        }
    }
}
