export default function (point, { tolerance = 2, object = null } = {}) {
    if (!canvas.effects.visionSources.some((source) => source.active)) {
        return game.user.isGM;
    }

    const t = tolerance;
    const offsets = t > 0 ? [[0, 0], [-t, -t], [-t, t], [t, t], [t, -t], [-t, 0], [t, 0], [0, -t], [0, t]] : [[0, 0]];
    const config = {
        object,
        tests: offsets.map(o => ({
            point: { x: point.x + o[0], y: point.y + o[1] },
            los: new Map()
        }))
    };

    for (const lightSource of canvas.effects.lightSources) {
        if (!lightSource.data.vision || !lightSource.active) {
            continue;
        }

        const result = lightSource.testVisibility(config);

        if (result === true) {
            return true;
        }
    }

    const sceneRect = canvas.dimensions.sceneRect;
    const inBuffer = !sceneRect.contains(point.x, point.y);
    const levels = CONFIG.Token.objectClass.DETECTION_LEVELS;
    const detectionFilters = new Set();
    let visible = false;
    let detectionLevel = CONFIG.Token.objectClass.DETECTION_LEVELS.VAGUE;

    for (const visionSource of canvas.effects.visionSources) {
        if (!visionSource.active || inBuffer === sceneRect.contains(visionSource.x, visionSource.y)) {
            continue;
        }

        const token = visionSource.object.document;

        for (const mode of token.detectionModes) {
            const detectionMode = CONFIG.Canvas.detectionModes[mode.id];
            const result = detectionMode?.testVisibility(visionSource, mode, config);

            if (result !== true) {
                continue;
            }

            visible = true;

            if (object instanceof Token) {
                const detectionFilter = detectionMode.constructor.getDetectionFilter(visionSource);

                if (detectionFilter) {
                    detectionFilters.add(detectionFilter);
                }
            }

            detectionLevel = Math.max(detectionLevel, detectionMode.imprecise ? levels.IMPRECISE : levels.PRECISE);

            if (!detectionMode.important) {
                break;
            }
        }
    }

    if (!visible) {
        return false;
    }

    if (object instanceof Token) {
        if (detectionFilters.size > 1) {
            object.detectionFilter = new MultiDetectionFilter([...detectionFilters]);
        } else if (detectionFilters.size === 1) {
            object.detectionFilter = detectionFilters.first();
        } else {
            object.detectionFilter = undefined;
        }

        object._detectionLevel = detectionLevel;
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
