import settings from "./settings.mjs";
import { getLowerCaseNameSet } from "./utils.js";

const RANGE_REGEX = /\b([1-9]\d*)\b/i;

const effectMapping = new Map();
const featMapping = new Map();

function feetToMeters(ft) {
    return ft >= 1e15 ? 1e15 : ft * 3 / 10;
}

function convertRanges(data) {
    if (settings.metric) {
        if (typeof data.range === "number") {
            data.range = feetToMeters(data.range);
        }

        if (typeof data.defaultRange === "number") {
            data.defaultRange = feetToMeters(data.defaultRange);
        }
    }
}

function registerEffect(dictonary, data) {
    convertRanges(data);

    for (const name of getLowerCaseNameSet(dictonary)) {
        console.assert(!effectMapping.has(name));

        effectMapping.set(name, data);
    }
}

function getEffect(name) {
    return effectMapping.get(name.toLowerCase());
}

function registerFeat(dictonary, data) {
    convertRanges(data);

    for (const name of getLowerCaseNameSet(dictonary)) {
        console.assert(!featMapping.has(name));

        featMapping.set(name, data);
    }
}

function getFeat(name) {
    return featMapping.get(name.toLowerCase());
}

function getInheritedDetectionModes(actor) {
    const modes = {};
    const senses = actor[SENSES];

    modes.lightPerception = 1e15;
    modes[DetectionMode.BASIC_MODE_ID] = senses.darkvision;
    modes.seeAll = senses.truesight;
    modes.blindsight = senses.blindsight;
    modes.feelTremor = senses.tremorsense;
    modes.hearing = senses.hearing;

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

    if ("_devilsSight" in modes) {
        modes.devilsSight = Math.max(modes.devilsSight ?? 0, actor.type === "npc" ? modes[DetectionMode.BASIC_MODE_ID] ?? 0 : modes._devilsSight ?? 0);
        delete modes._devilsSight;
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

const SENSES = Symbol("vision-5e.senses");

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = class Actor5e extends CONFIG.Actor.documentClass {
        /** @override */
        prepareData() {
            super.prepareData();

            if (!(this.type === "character" || this.type === "npc")) {
                return;
            }

            let hearing;
            if (typeof settings.defaultHearingRange === "string") {
                const roll = new Roll(settings.defaultHearingRange, this.getRollData({ deterministic: true }));
                roll.evaluate({ async: false });
                hearing = roll.total;
            } else {
                hearing = settings.defaultHearingRange;
            }

            const senses = this.system.attributes.senses;
            const newSenses = {
                blindsight: Math.max(senses.blindsight ?? 0, 0),
                darkvision: Math.max(senses.darkvision ?? 0, 0),
                tremorsense: Math.max(senses.tremorsense ?? 0, 0),
                truesight: Math.max(senses.truesight ?? 0, 0),
                hearing: Math.max(hearing ?? 0, 0),
            };
            const oldSenses = this[SENSES] ??= {
                blindsight: 0,
                darkvision: 0,
                tremorsense: 0,
                truesight: 0,
                hearing: 0
            };
            let changed = false;

            for (const [key, value] of Object.entries(newSenses)) {
                if (oldSenses[key] !== value) {
                    oldSenses[key] = value;
                    changed = true;
                }
            }

            if (changed) {
                resetActiveTokens(this);
            }
        }
    };

    CONFIG.Token.documentClass = class TokenDocument5e extends CONFIG.Token.documentClass {
        /** @override */
        _prepareDetectionModes() {
            const actor = this.actor;

            if (this.sight.enabled && actor && (actor.type === "character" || actor.type === "npc")) {
                this.sight.visionMode = this._source.sight.visionMode;

                const inheritedModes = getInheritedDetectionModes(actor);
                const basicId = CONFIG.Canvas.visionModes[this.sight.visionMode]?.detectionMode
                    ?? DetectionMode.BASIC_MODE_ID;
                const basicMode =
                    this.detectionModes.find((m) => m.id === basicId)
                    ?? inheritedModes.find((m) => m.id === basicId);

                this.sight.range = basicMode?.range ?? 0;

                if (this.sight.range === 0 || this.sight.visionMode === "basic") {
                    const basicId = DetectionMode.BASIC_MODE_ID;
                    const basicMode =
                        this.detectionModes.find((m) => m.id === basicId)
                        ?? inheritedModes.find((m) => m.id === basicId);

                    this.sight.range = basicMode?.range ?? 0;
                    this.sight.visionMode = "darkvision";
                    foundry.utils.mergeObject(this.sight, this.sight.range > 0
                        ? CONFIG.Canvas.visionModes.darkvision.vision.defaults
                        : { attenuation: 0, contrast: 0, saturation: -1, brightness: 0 });
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

Hooks.on("createItem", (item) => {
    if (item.type !== "feat") {
        return;
    }

    const parent = item.parent;

    if (parent instanceof Actor) {
        if (getFeat(item.name)) {
            resetActiveTokens(parent);
        }
    }
});

Hooks.on("updateItem", (item, changes) => {
    if (item.type !== "feat") {
        return;
    }

    const parent = item.parent;

    if (parent instanceof Actor) {
        if (getFeat(item.name) || "name" in changes) {
            resetActiveTokens(parent);
        }
    }
});

Hooks.on("deleteItem", (item) => {
    if (item.type !== "feat") {
        return;
    }

    const parent = item.parent;

    if (parent instanceof Actor) {
        if (getFeat(item.name)) {
            resetActiveTokens(parent);
        }
    }
});

Hooks.once("init", () => {
    registerEffect({
        en: "Detect Evil and Good",
        de: "Gutes und Böses entdecken",
        fr: "Détection du mal et du bien",
        es: "Detectar el bien y el mal",
        "pt-BR": ["Detectar o Bem e", [" o", ""], " Mal"],
    }, {
        id: "detectEvilAndGood",
        range: 30
    });

    registerEffect({
        en: "Detect Magic",
        de: "Magie entdecken",
        fr: "Détection de la magie",
        es: "Detectar magia",
        "pt-BR": "Detectar Magia",
    }, {
        id: "detectMagic",
        range: 30
    });

    registerEffect({
        en: "Detect Poison and Disease",
        de: "Gift und Krankheit entdecken",
        fr: "Détection du poison et des maladies",
        es: "Detectar venenos y enfermedades",
        "pt-BR": "Detectar Veneno e Doença",
    }, {
        id: "detectPoisonAndDisease",
        range: 30
    });

    registerEffect({
        en: "Detect Thoughts",
        de: "Gedanken wahrnehmen",
        fr: "Détection des pensées",
        es: "Detectar pensamientos",
        "pt-BR": "Detectar Pensamentos",
    }, {
        id: "detectThoughts",
        range: 30
    });

    registerEffect({
        en: "Divine Sense",
        de: "Göttliches Gespür",
        fr: ["Perception divine", ["", " [Paladin]"]],
        es: "Sentidos divinos",
        "pt-BR": "Sentido Divino",
    }, {
        id: "divineSense",
        range: 60
    });

    registerEffect({
        en: [
            [["Eldritch ", ""], "Invocation", ["s", ""], ": Ghostly Gaze"],
            "Eldritch Adept: Ghostly Gaze",
            "Ghostly Gaze",
        ],
        de: [
            [["Schauerliche ", ""], "Anrufung", ["en", ""], ": Geisterhafter Blick"],
            "Schauerlicher Adept: Geisterhafter Blick",
            "Geisterhafter Blick",
        ],
        fr: [
            [["Invocation", "Manifestation"], [" occulte", ""], [": ", " : "], "Regard fantomatique", ["", " [Occultiste]"]],
            [["Invocations", "Manifestations"], [" occultes", ""], [": ", " : "], "Regard fantomatique", ["", " [Occultiste]"]],
            "Adepte occulte: Regard fantomatique",
            "Regard fantomatique",
        ],
        es: [
            [["Invocación sobrenatural", "Invocaciones sobrenaturales"], ": Mirada fantasmal"],
            "Adepto sobrenatural: Mirada fantasmal",
            "Mirada fantasmal",
        ],
        "pt-BR": [
            ["Invocação", [" Mística", ""], ": Olhar Fantasmagórico"],
            ["Invocações", [" Místicas", ""], ": Olhar Fantasmagórico"],
            "Adepto Místico: Olhar Fantasmagórico",
            "Olhar Fantasmagórico",
        ],
    }, {
        id: "ghostlyGaze",
        range: 30
    });

    registerEffect({
        en: "Magic Awareness",
        de: "Magische Wahrnehmung",
        fr: "Conscience magique",
        es: "Conciencia mágica",
        "pt-BR": "Percepção Mágica",
    }, {
        id: "detectMagic",
        range: 60
    });

    registerEffect({
        en: "See Invisibility",
        de: "Unsichtbares sehen",
        fr: ["Détection de l", ["'", "’"], "invisibilité"],
        es: "Ver invisibilidad",
        "pt-BR": "Ver o Invisível",
    }, {
        id: "seeInvisibility",
        range: 1e15
    });

    registerFeat({
        en: "Blindsense",
        de: "Blindgespür",
        fr: ["Perception aveugle", ["", " [Roublard]"]],
        es: "Sentir sin ver",
        "pt-BR": "Sentido Cego",
    }, {
        id: "blindsense",
        range: 10
    });

    registerFeat({
        en: ["Devil", ["'", "’"], "s Sight"],
        de: "Teufelssicht",
        fr: [["Vision", "Vue"], " ", ["de", "du"], " diable"],
        es: "Vista del diablo",
        "pt-BR": ["Visão Diabólica", "Visão do Diabo"],
    }, {
        id: "_devilsSight",
        range: 120
    });

    registerFeat({
        en: "Ethereal Sight",
        de: "Ätherische Sicht",
        fr: [["Vision", "Vue"], " éthérée"],
        es: "Visión etérea",
        "pt-BR": "Visão Etérea",
    }, {
        id: "etherealSight",
        range: RANGE_REGEX
    });

    registerFeat({
        en: [
            [["Eldritch ", ""], "Invocation", ["s", ""], ": Devil", ["'", "’"], "s Sight"],
            ["Eldritch Adept: Devil", ["'", "’"], "s Sight"],
        ],
        de: [
            [["Schauerliche ", ""], "Anrufung", ["en", ""], ": Teufelssicht"],
            "Schauerlicher Adept: Teufelssicht",
        ],
        fr: [
            [["Invocation", "Manifestation"], [" occulte", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de", "du"], " diable", ["", " [Occultiste]"]],
            [["Invocations", "Manifestations"], [" occultes", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de", "du"], " diable", ["", " [Occultiste]"]],
            ["Adepte occulte", [": ", " : "], ["Vision", "Vue"], " ", ["de", "du"], " diable"],
        ],
        es: [
            [["Invocación sobrenatural", "Invocaciones sobrenaturales"], ": Vista del diablo"],
            "Adepto sobrenatural: Vista del diablo",
        ],
        "pt-BR": [
            ["Invocação", [" Mística", ""], ": ", ["Visão do Diabo", "Visão Diabólica"]],
            ["Invocações", [" Místicas", ""], ": ", ["Visão do Diabo", "Visão Diabólica"]],
            ["Adepto Místico: ", ["Visão do Diabo", "Visão Diabólica"]],
        ],
    }, {
        id: "devilsSight",
        range: 120
    });

    registerFeat({
        en: [
            [["Eldritch ", ""], "Invocation", ["s", ""], ": Witch Sight"],
            "Eldritch Adept: Witch Sight",
            "Witch Sight",
        ],
        de: [
            [["Schauerliche ", ""], "Anrufung", ["en", ""], ": Hexensicht"],
            "Schauerlicher Adept: Hexensicht",
            "Hexensicht",
        ],
        fr: [
            [["Invocation", "Manifestation"], [" occulte", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de sorcier", "sorcière"], ["", " [Occultiste]"]],
            [["Invocations", "Manifestations"], [" occultes", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de sorcier", "sorcière"], ["", " [Occultiste]"]],
            ["Adepte occulte", [": ", " : "], ["Vision", "Vue"], " ", ["de sorcier", "sorcière"]],
            [["Vision", "Vue"], " ", ["de sorcier", "sorcière"]],
        ],
        es: [
            [["Invocación sobrenatural", "Invocaciones sobrenaturales"], ": Visión bruja"],
            "Adepto sobrenatural: Visión bruja",
            "Visión bruja",
        ],
        "pt-BR": [
            ["Invocação", [" Mística", ""], ": Visão da Bruxa"],
            ["Invocações", [" Místicas", ""], ": Visão da Bruxa"],
            "Adepto Místico: Visão da Bruxa",
            "Visão da Bruxa",
        ],
    }, {
        id: "witchSight",
        range: 30
    });

    registerFeat({
        en: "Sense Magic",
        de: "Magie spüren",
        fr: [["Détection", "Perception"], " de la magie"],
        es: "Sentir magia",
        "pt-BR": "Sentir Magia",
    }, {
        id: "detectMagic",
        range: RANGE_REGEX
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
