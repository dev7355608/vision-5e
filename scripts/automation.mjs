import settings from "./settings.mjs";

const RANGE_REGEX = /\b(\d+)\s+(?:feet|ft.?)\b/i;

const effectMapping = new Map();
const featMapping = new Map();

function registerEffect(names, data) {
    for (const name of names) {
        effectMapping.set(name.toLowerCase(), data);
    }
}

function getEffect(name) {
    return effectMapping.get(name.toLowerCase());
}

function registerFeat(names, data) {
    for (const name of names) {
        featMapping.set(name.toLowerCase(), data);
    }
}

function getFeat(name) {
    return featMapping.get(name.toLowerCase());
}

function getInheritedDetectionModes(actor) {
    const modes = {};
    const senses = actor.system.attributes.senses;

    modes.lightPerception = 1e15;
    modes[DetectionMode.BASIC_MODE_ID] = senses.darkvision;
    modes.seeAll = senses.truesight;
    modes.blindsight = senses.blindsight;
    modes.feelTremor = senses.tremorsense;
    modes.hearing = settings.defaultHearingRange;

    for (const effect of actor.appliedEffects) {
        const mode = getEffect(effect.name);

        if (mode) {
            if (mode[actor.type] === false) {
                continue;
            }

            let range = mode.range;

            if (range && typeof range !== "number") {
                range = parseFloat(effect.description?.match(range)?.[1]);
            }

            if (range > 0 || mode.defaultRange) {
                modes[mode.id] = Math.max(modes[mode.id] ?? 0, range || mode.defaultRange);
            }
        }
    }

    for (const item of actor.items) {
        if (item.type !== "feat") {
            continue;
        }

        const mode = getFeat(item.name);

        if (mode) {
            if (mode[actor.type] === false) {
                continue;
            }

            let range = mode.range;

            if (range && typeof range !== "number") {
                range = parseFloat(item.system.description.value?.match(range)?.[1]);
            }

            if (range > 0 || mode.defaultRange) {
                modes[mode.id] = Math.max(modes[mode.id] ?? 0, range || mode.defaultRange);
            }
        }
    }

    if ("devilsSight_npc" in modes) {
        modes.devilsSight = Math.max(modes.devilsSight ?? 0, modes[DetectionMode.BASIC_MODE_ID] ?? 0);
        delete modes.devilsSight_npc;
    }

    if ("echolocation" in modes) {
        modes.echolocation = modes.blindsight;
        delete modes.blindsight;
    }

    return Object.entries(modes).filter(([id, range]) => id in CONFIG.Canvas.detectionModes
        && typeof range === "number" && (range > 0 || id === DetectionMode.BASIC_MODE_ID))
        .map(([id, range]) => ({ id, range, enabled: true }));
}

const resetActiveTokens = (() => {
    const actors = new Set();
    let promise = null;

    return function (actor) {
        actors.add(actor);

        return promise ??= Promise.resolve().then(() => {
            promise = null;

            let initializeVision = false;

            for (const actor of actors) {
                for (const token of actor.getActiveTokens(false, false)) {
                    if (!token.document.sight.enabled) {
                        continue;
                    }

                    token.document.reset();

                    if (canvas.ready && canvas.effects.visionSources.has(token.sourceId)) {
                        initializeVision = true;
                    }
                }
            }

            actors.clear();

            if (initializeVision) {
                canvas.perception.update({ initializeVision: true });
            }
        });
    };
})();

Hooks.once("init", () => {
    const SENSES = Symbol("senses");

    CONFIG.Actor.documentClass = class Actor5e extends CONFIG.Actor.documentClass {
        /** @override */
        prepareData() {
            super.prepareData();

            if (!(this.type === "character" || this.type === "npc")) {
                return;
            }

            const senses = this[SENSES] ??= {};

            for (const [key, value] of Object.entries(this.system.attributes.senses)) {
                if (senses[key] !== value) {
                    this[SENSES] = { ...this.system.attributes.senses };
                    resetActiveTokens(this);

                    break;
                }
            }
        }
    };

    CONFIG.Token.documentClass = class TokenDocument5e extends CONFIG.Token.documentClass {
        /** @override */
        _prepareDetectionModes() {
            const actor = this.actor;

            if (this.sight.enabled && actor && (actor.type === "character" || actor.type === "npc")) {
                const inheritedModes = getInheritedDetectionModes(actor);
                const basicId = CONFIG.Canvas.visionModes[this.sight.visionMode]?.detectionMode
                    ?? DetectionMode.BASIC_MODE_ID;
                const basicMode =
                    this.detectionModes.find((m) => m.id === basicId)
                    ?? inheritedModes.find((m) => m.id === basicId);

                this.sight.range = basicMode?.range ?? 0;

                if (this.sight.visionMode === "darkvision" && this.sight.range === 0) {
                    this.sight.visionMode = "basic";
                    foundry.utils.mergeObject(this.sight, CONFIG.Canvas.visionModes.darkvision.vision.defaults);
                }

                for (const mode of inheritedModes) {
                    if (!this.detectionModes.find((m) => m.id === mode.id)) {
                        this.detectionModes.push(mode);
                    }
                }
            }

            super._prepareDetectionModes();
        }

        /** @override */
        async _preUpdate(data, options, user) {
            await super._preUpdate(data, options, user);

            const basicId = DetectionMode.BASIC_MODE_ID;
            const range = (data.detectionModes ?? this._source.detectionModes).find((m) => m.id === basicId)?.range ?? 0;

            if (this._source.range !== range) {
                if (data.sight) {
                    data.sight.range = range;
                } else {
                    data.sight = { range };
                }
            }
        }
    };
});

Hooks.on("createActiveEffect", (effect) => {
    const target = effect.target;

    if (target instanceof Actor) {
        if (getEffect(effect.name)) {
            resetActiveTokens(target);
        }
    }
});

Hooks.on("updateActiveEffect", (effect, changes) => {
    const target = effect.target;

    if (target instanceof Actor) {
        if (getEffect(effect.name) || "name" in changes) {
            resetActiveTokens(target);
        }
    }
});

Hooks.on("deleteActiveEffect", (effect) => {
    const target = effect.target;

    if (target instanceof Actor) {
        if (getEffect(effect.name)) {
            resetActiveTokens(target);
        }
    }
});

Hooks.once("init", () => {
    registerEffect([
        "Detect Evil and Good",
        "Gutes und Böses entdecken"
    ], {
        id: "detectEvilAndGood",
        range: 30
    });

    registerEffect([
        "Detect Magic",
        "Magie entdecken"
    ], {
        id: "detectMagic",
        range: RANGE_REGEX,
        defaulRange: 30
    });

    registerEffect([
        "Sense Magic",
        "Magie spüren"
    ], {
        id: "detectMagic",
        range: RANGE_REGEX
    });

    registerEffect([
        "Magic Awareness",
        "Magische Wahrnehmung"
    ], {
        id: "detectMagic",
        range: 60
    });

    registerEffect([
        "Detect Poison and Disease",
        "Gift und Krankheit entdecken"
    ], {
        id: "detectPoisonAndDisease",
        range: 30
    });

    registerEffect([
        "Detect Thoughts",
        "Gedanken wahrnehmen"
    ], {
        id: "detectThoughts",
        range: 30
    });

    registerEffect([
        "Devil's Sight",
        "Teufelssicht"
    ], {
        id: "devilsSight",
        range: 120
    });

    registerEffect([
        "Divine Sense",
        "Göttliches Gespür"
    ], {
        id: "divineSense",
        range: 60
    });

    registerEffect([
        "Echolocation",
        "Echolot"
    ], {
        id: "echolocation",
        range: 1
    });

    registerEffect([
        "Ghostly Gaze",
        "Geisterhafter Blick"
    ], {
        id: "ghostlyGaze",
        range: 30
    });

    registerEffect([
        "See Invisibility",
        "Unsichtbares sehen"
    ], {
        id: "seeInvisibility",
        range: 1e15
    });

    registerFeat([
        "Blindsense",
        "Blindgespür"
    ], {
        id: "blindsense",
        range: RANGE_REGEX,
        defaultRange: 10
    });

    registerFeat([
        "Devil's Sight",
        "Teufelssicht"
    ], {
        id: "devilsSight_npc",
        character: false,
        range: 1
    });

    registerFeat([
        "Ethereal Sight",
        "Ätherische Sicht"
    ], {
        id: "etherealSight",
        range: RANGE_REGEX
    });

    registerFeat([
        "Invocation: Devil's Sight",
        "Anrufung: Teufelssicht"
    ], {
        id: "devilsSight",
        range: 120
    });

    registerFeat([
        "Invocation: Witch Sight",
        "Anrufung: Hexensicht"
    ], {
        id: "witchSight",
        range: 30
    });
});

Hooks.on("renderTokenConfig", (sheet, html) => {
    const token = sheet.document;
    const sourceDetectionModes = new Set(token.toObject().detectionModes.map((m) => m.id));
    const activeDetectionModes = (sheet.isPrototype && ["character", "npc"].includes(token.actor?.type)
        ? getInheritedDetectionModes(token.actor) : token.detectionModes)
        .filter((m) => m.id in CONFIG.Canvas.detectionModes)
        .sort((a, b) => game.i18n.localize(CONFIG.Canvas.detectionModes[a.id].label).localeCompare(
            game.i18n.localize(CONFIG.Canvas.detectionModes[b.id].label), game.i18n.lang))
        .reverse();

    for (const select of html[0].querySelectorAll(`fieldset.detection-mode .detection-mode-id select`)) {
        if (select.value && !sourceDetectionModes.has(select.value)) {
            select.closest("fieldset.detection-mode").remove();
        }
    }

    for (const { id, range, enabled } of activeDetectionModes) {
        if (sourceDetectionModes.has(id) || !(id in CONFIG.Canvas.detectionModes)) {
            continue;
        }

        html[0].querySelector(`header.detection-mode`)
            .insertAdjacentHTML("afterend", `
                <fieldset class="detection-mode" disabled>
                    <div class="detection-mode-id">
                        <select disabled>
                            <option value="${id}">${game.i18n.localize(CONFIG.Canvas.detectionModes[id].label)}</option>
                        </select>
                    </div>
                    <div class="detection-mode-range">
                        <input type="number" value="${range < 1e15 ? range : ""}" disabled
                            class="vision-5e--range" placeholder="&#xF534;">
                    </div>
                    <div class="detection-mode-enabled">
                        <input type="checkbox" ${enabled ? "checked" : ""} disabled>
                    </div>
                    <div class="detection-mode-controls"></div>
                </fieldset>
            `);
    }

    const sightRangeInput = html[0].querySelector(`[name="sight.range"]`);

    sightRangeInput.disabled = true;
    sightRangeInput.dataset.tooltip = "Automatically managed based on the Vision Mode and Detection Modes.";
    sightRangeInput.dataset.tooltipDirection = "LEFT";

    const updateSightRangeInput = () => {
        const visionMode = html[0].querySelector(`[name="sight.visionMode"]`).value;
        const basicId = CONFIG.Canvas.visionModes[visionMode]?.detectionMode
            ?? DetectionMode.BASIC_MODE_ID;

        sightRangeInput.value = activeDetectionModes.find((m) => m.id === basicId)?.range ?? 0;
    };

    updateSightRangeInput();

    html[0].querySelector(`[name="sight.visionMode"]`).addEventListener("change", updateSightRangeInput);

    sheet.options.height = "auto";
    sheet.position.height = "auto";
    sheet.setPosition(sheet.position);
});
