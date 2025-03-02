import { defaultHearingRange } from "./settings.mjs";
import { Matcher, convertUnits, toFeet } from "./utils.mjs";

export default (Actor) => class extends Actor {
    /**  @type {Record<string, number>} */
    detectionModes = this.detectionModes;

    /** @override */
    prepareData() {
        const detectionModes = this.detectionModes;
        const wasEthereal = this.statuses?.has(CONFIG.specialStatusEffects.ETHEREAL);

        super.prepareData();

        if (!detectionModes || foundry.utils.objectsEqual(this.detectionModes, detectionModes)
            && wasEthereal === this.statuses.has(CONFIG.specialStatusEffects.ETHEREAL)) {
            return;
        }

        for (const token of this.getDependentTokens()) {
            if (!token.sight.enabled) {
                continue;
            }

            token.prepareData();

            if (token.rendered && token.object.vision) {
                token.object.initializeVisionSource();
            }
        }
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        const itemPile = game.itempiles?.API.getActorFlagData(this);

        if (itemPile && itemPile.enabled && (itemPile.type === game.itempiles.pile_types.PILE
            || itemPile.type === game.itempiles.pile_types.CONTAINER
            || itemPile.type === game.itempiles.pile_types.VAULT)) {
            this.statuses.add(CONFIG.specialStatusEffects.OBJECT);
            this.statuses.add(CONFIG.specialStatusEffects.INAUDIBLE);
        }

        if (hasMagicalAura(this)) {
            this.statuses.add(CONFIG.specialStatusEffects.MAGICAL);
        }

        if (isPoisonous(this)) {
            this.statuses.add(CONFIG.specialStatusEffects.POISONOUS);
        }

        if (isThinking(this)) {
            this.statuses.add(CONFIG.specialStatusEffects.THINKING);
        }

        if (this.type === "vehicle") {
            this.statuses.add(CONFIG.specialStatusEffects.OBJECT);
        }

        if (CONFIG.specialStatusEffects.SHAPECHANGER
            && /(?<=^|[\s,;])(?:Shapechanger|Gestaltwandler|Métamorphe|Cambiaformas|Metamorfo)(?=$|[\s,;])/i.test(this.system.details?.type?.subtype ?? "")) {
            this.statuses.add(CONFIG.specialStatusEffects.SHAPECHANGER);
        }

        this.detectionModes = { lightPerception: null };

        const senses = this.system.attributes?.senses;

        if (senses) {
            this.detectionModes.basicSight = senses.darkvision;
            this.detectionModes.seeAll = senses.truesight;
            this.detectionModes.blindsight = senses.blindsight;
            this.detectionModes.feelTremor = senses.tremorsense;
            this.detectionModes.hearing = Math.max(toFeet(typeof defaultHearingRange === "string"
                ? new Roll(defaultHearingRange, this.getRollData({ deterministic: true })).evaluateSync().total
                : defaultHearingRange, senses.units), 0);
        }

        const featRegistry = FEAT_REGISTRY[this.type];

        if (featRegistry) {
            const featMatcher = FEAT_MATCHERS[this.type];

            for (const item of this.items) {
                if (item.type !== "feat") {
                    continue;
                }

                const id = featMatcher.match(item.name);

                if (id) {
                    featRegistry[id].call(this, item);
                }
            }
        }

        const effectRegistry = EFFECT_REGISTRY[this.type];

        if (effectRegistry) {
            const effectMatcher = EFFECT_MATCHERS[this.type];

            for (const effect of this.appliedEffects) {
                const id = effectMatcher.match(effect.name);

                if (id) {
                    effectRegistry[id].call(this, effect);
                }
            }
        }

        for (const id in this.detectionModes) {
            if (this.detectionModes[id] === 0) {
                delete this.detectionModes[id];
            }
        }
    }
};

/**
 * @param {Actor} actor
 * @param {string} id
 * @param {number | null | undefined} range
 * @param {string} [units]
 */
function upgradeDetectionMode(actor, id, range, units) {
    if (range === undefined || range !== null && range <= 0) {
        return;
    }

    const currentRange = actor.detectionModes[id];

    if (currentRange === null) {
        return;
    }

    if (range !== null && units !== undefined) {
        range = convertUnits(range, units, actor.system.attributes.senses.units);
    }

    if (currentRange !== undefined && range !== null) {
        range = Math.max(range, currentRange);
    }

    actor.detectionModes[id] = range;
}

/**
 * @param {Document} document
 * @returns {number | undefined}
 */
function findRange(description, units) {
    const result = new DOMParser().parseFromString(description, "text/html").body.textContent
        ?.match(/(?<=^|\D)(?<range>[1-9]\d*)\s*(?:(?<ft>ft|feet|Fuß|pieds?|pies?|pés?)|(?<m>m|meters?|metres?|Meter|mètres?|metros?))(?=$|[\s.:,;])/i);

    return result ? convertUnits(Number(result.groups.range), result.groups.ft !== undefined ? "ft" : "m", units) : undefined;
}

/** @type {Set<string>} */
const MAGIC_ITEM_TYPES = new Set([
    "consumable",
    "container",
    "equipment",
    "loot",
    "weapon",
    "tool",
    "feature",
]);

/**
 * @param {Item} item
 * @returns {boolean}
 */
function isVisibleMagicItem(item) {
    return MAGIC_ITEM_TYPES.has(item.type) && item.system.validProperties.has("spells") && item.system.properties.has("mgc")
        && (item.system.equipped === true || !item.container);
}

/**
 * @param {ActiveEffect} effect
 * @returns {boolean}
 */
function isMagicEffect(effect) {
    return effect.flags.gurps?.magic !== undefined && !effect.statuses.has(CONFIG.specialStatusEffects.CONCENTRATING);
}

/**
 * @param {Actor} actor
 * @returns {boolean}
 */
function hasMagicalAura(actor) {
    // Does the actor carry a visible magical item or is the actor affected by a spell effect?
    return actor.items.some(isVisibleMagicItem) || actor.appliedEffects.some(isMagicEffect);
}

/**
 * @param {DamageData} damage
 * @returns {boolean}
 */
function isPoisonDamage(damage) {
    return damage.types.has("poison") || damage.custom.enabled && /\[\s*poison\s*\]/i.test(damage.custom.formula);
}

/**
 * @param {Activity} activity
 * @returns {boolean}
 */
function isPoisonousAttack(activity) {
    return activity.type === "attack" && (activity.damage.parts.some(isPoisonDamage)
        || /\[\s*poison\s*\]/i.test(activity.damage.critical));
}

/**
 * @param {Item} item
 * @returns {boolean}
 */
function isPoisonousNaturalWeapon(item) {
    return item.type === "weapon" && item.system.type.value === "natural"
        && (isPoisonDamage(item.system.damage.base)
            || item.system.properties.has("ver") && isPoisonDamage(item.system.damage.versatile)
            || item.system.activities.some(isPoisonousAttack));
}

/**
 * A poisonous creature is a creature that has a poisonous natural weapon attack.
 * @param {Actor} actor
 * @returns {boolean}
 */
function isPoisonous(actor) {
    if (actor.statuses.has(CONFIG.specialStatusEffects.OBJECT)
        || actor.statuses.has(CONFIG.specialStatusEffects.PETRIFIED)) {
        return false;
    }

    return actor.items.some(isPoisonousNaturalWeapon);
}

/**
 * A thinking creature is a creature that speaks at least one language or is telepathic.
 * @param {Actor} actor
 * @returns {boolean}
 */
function isThinking(actor) {
    if (actor.statuses.has(CONFIG.specialStatusEffects.OBJECT)
        || actor.statuses.has(CONFIG.specialStatusEffects.PETRIFIED)) {
        return false;
    }

    return (actor.type === "character" || actor.type === "npc" || actor.type === "enemy")
        && (actor.system.attributes.IQ.value > 5);
}

/**
 * @template T
 * @typedef {{ character: Record<string, Function>, npc: Record<string, Function> }} Registry
 */

/** @type {Registry<Item>} */
const FEAT_REGISTRY = {
    character: {
        hollowOne(item) {
            this.statuses.add(CONFIG.specialStatusEffects.REVENANCE);
        },
        invocationDevilsSight(item) {
            upgradeDetectionMode(this, "devilsSight", 120, "ft");
        },
        umbralSight(item) {
            this.statuses.add(CONFIG.specialStatusEffects.UMBRAL_SIGHT);
        },
    },
    npc: {
        blindSenses(item) {
            this.statuses.add(CONFIG.specialStatusEffects.BLIND_SENSES);
        },
        bloodSense(item) {
            upgradeDetectionMode(this, "bloodSense", findRange(item.system.description.value, this.system.attributes.senses.units));
        },
        echolocation(item) {
            this.statuses.add(CONFIG.specialStatusEffects.ECHOLOCATION);
        },
        etherealness(item) {
            if (this.statuses.has(CONFIG.specialStatusEffects.ETHEREAL)
                && / (?:visible on the Material Plane|auf der Materiellen Ebene sichtbar|visible sur le plan matériel|visible también en el Plano Material|visível no Plano Material)[ .,]/i
                    .test(new DOMParser().parseFromString(item.system.description.value, "text/html").body.textContent || "")) {
                this.statuses.add(CONFIG.specialStatusEffects.MATERIAL);
            }
        },
        etherealSight(item) {
            upgradeDetectionMode(this, "etherealSight", findRange(item.system.description.value, this.system.attributes.senses.units));
        },
        devilsSight(item) {
            this.statuses.add(CONFIG.specialStatusEffects.DEVILS_SIGHT);
        },
        lifeSense(item) {
            upgradeDetectionMode(this, "lifeSense", findRange(item.system.description.value, this.system.attributes.senses.units));
        },
        senseMagic(item) {
            upgradeDetectionMode(this, "detectMagic", findRange(item.system.description.value, this.system.attributes.senses.units));
        },
    },
};

/** @type {Registry<ActiveEffect>} */
const EFFECT_REGISTRY = {
    character: {
        detectEvilAndGood(effect) {
            upgradeDetectionMode(this, "detectEvilAndGood", 30, "ft");
        },
        detectMagic(effect) {
            upgradeDetectionMode(this, "detectMagic", 30, "ft");
        },
        detectPoisonAndDisease(effect) {
            upgradeDetectionMode(this, "detectPoisonAndDisease", 30, "ft");
        },
        detectThoughts(effect) {
            upgradeDetectionMode(this, "detectThoughts", 30, "ft");
        },
        divineSense(effect) {
            upgradeDetectionMode(this, "divineSense", 60, "ft");
        },
        eyesOfTheGrave(item) {
            upgradeDetectionMode(this, "eyesOfTheGrave", 60, "ft");
        },
        invocationGhostlyGaze(effect) {
            upgradeDetectionMode(this, "basicSight", 30, "ft");
            this.statuses.add(CONFIG.specialStatusEffects.GHOSTLY_GAZE);
        },
        magicAwareness(effect) {
            upgradeDetectionMode(this, "detectMagic", 60, "ft");
        },
        mindBlank(item) {
            this.statuses.add(CONFIG.specialStatusEffects.MIND_BLANK);
        },
        nondetection(item) {
            this.statuses.add(CONFIG.specialStatusEffects.NONDETECTION);
        },
        seeInvisibility(effect) {
            upgradeDetectionMode(this, "seeInvisibility", null);
        },
    },
    npc: {
        detectEvilAndGood(effect) {
            upgradeDetectionMode(this, "detectEvilAndGood", 30, "ft");
        },
        detectMagic(effect) {
            upgradeDetectionMode(this, "detectMagic", 30, "ft");
        },
        detectPoisonAndDisease(effect) {
            upgradeDetectionMode(this, "detectPoisonAndDisease", 30, "ft");
        },
        detectThoughts(effect) {
            upgradeDetectionMode(this, "detectThoughts", 30, "ft");
        },
        mindBlank(item) {
            this.statuses.add(CONFIG.specialStatusEffects.MIND_BLANK);
        },
        nondetection(item) {
            this.statuses.add(CONFIG.specialStatusEffects.NONDETECTION);
        },
        seeInvisibility(effect) {
            upgradeDetectionMode(this, "seeInvisibility", null);
        },
    },
};

/** @type {Record<"en" | "de" | "fr" | "es" | "pt-BR", Record<string, (string | (string | string[])[])[]>>} */
const DATABASE = {
    "en": {
        blindSenses: [
            "Blind Senses",
        ],
        bloodSense: [
            "Blood Sense",
        ],
        detectEvilAndGood: [
            "Detect Evil and Good",
        ],
        detectMagic: [
            "Detect Magic",
        ],
        detectPoisonAndDisease: [
            "Detect Poison and Disease",
        ],
        detectThoughts: [
            "Detect Thoughts",
        ],
        devilsSight: [
            ["Devil", ["'", "’"], "s Sight"],
        ],
        divineSense: [
            "Divine Sense",
        ],
        echolocation: [
            "Echolocation",
        ],
        etherealSight: [
            "Ethereal Sight",
        ],
        etherealness: [
            "Etherealness",
        ],
        eyesOfTheGrave: [
            "Eyes of the Grave",
        ],
        hollowOne: [
            [["Supernatural Gift"], ["s", ""], ": Hollow One"],
            "Hollow One",
        ],
        invocationDevilsSight: [
            [["Eldritch ", ""], "Invocation", ["s", ""], ": Devil", ["'", "’"], "s Sight"],
            ["Eldritch Adept: Devil", ["'", "’"], "s Sight"],
            ["Devil", ["'", "’"], "s Sight"],
        ],
        invocationGhostlyGaze: [
            [["Eldritch ", ""], "Invocation", ["s", ""], ": Ghostly Gaze"],
            "Eldritch Adept: Ghostly Gaze",
            "Ghostly Gaze",
        ],
        lifeSense: [
            "Life Sense",
        ],
        magicAwareness: [
            "Magic Awareness",
        ],
        mindBlank: [
            "Mind Blank",
        ],
        nondetection: [
            "Nondetection",
        ],
        seeInvisibility: [
            "See Invisibility",
        ],
        senseMagic: [
            "Sense Magic",
        ],
        umbralSight: [
            "Umbral Sight",
        ],
    },
    "de": {
        blindSenses: [
            "Blinde Sinne",
        ],
        bloodSense: [
            "Blutgespür",
        ],
        detectEvilAndGood: [
            "Gutes und Böses entdecken",
        ],
        detectMagic: [
            "Magie entdecken",
        ],
        detectPoisonAndDisease: [
            "Gift und Krankheit entdecken",
        ],
        detectThoughts: [
            "Gedanken wahrnehmen",
        ],
        devilsSight: [
            "Teufelssicht",
        ],
        divineSense: [
            "Göttliches Gespür",
        ],
        echolocation: [
            "Echolot",
        ],
        etherealSight: [
            "Ätherische Sicht",
        ],
        etherealness: [
            "Körperlosigkeit",
        ],
        eyesOfTheGrave: [
            "Grabesblick",
        ],
        hollowOne: [
            [["Übernatürliche Gabe"], ["n", ""], ": ", ["Leerwandler", "Hollow One"]],
            "Leerwandler",
        ],
        invocationDevilsSight: [
            [["Schauerliche ", ""], "Anrufung", ["en", ""], ": Teufelssicht"],
            "Schauerlicher Adept: Teufelssicht",
            "Teufelssicht",
        ],
        invocationGhostlyGaze: [
            [["Schauerliche ", ""], "Anrufung", ["en", ""], ": Geisterhafter Blick"],
            "Schauerlicher Adept: Geisterhafter Blick",
            "Geisterhafter Blick",
        ],
        lifeSense: [
            "Lebensgespür",
        ],
        magicAwareness: [
            "Magische Wahrnehmung",
        ],
        mindBlank: [
            "Gedankenleere",
        ],
        nondetection: [
            "Unauffindbarkeit",
        ],
        seeInvisibility: [
            "Unsichtbares sehen",
        ],
        senseMagic: [
            "Magie spüren",
        ],
        umbralSight: [
            "Düstersicht",
        ],
    },
    "fr": {
        blindSenses: [
            "Sens aveugles",
        ],
        bloodSense: [
            "Perception du sang",
        ],
        detectEvilAndGood: [
            "Détection du mal et du bien",
        ],
        detectMagic: [
            "Détection de la magie",
        ],
        detectPoisonAndDisease: [
            "Détection du poison et des maladies",
        ],
        detectThoughts: [
            "Détection des pensées",
        ],
        devilsSight: [
            [["Vision", "Vue"], " ", ["de", "du"], " diable"],
        ],
        divineSense: [
            "Perception divine",
        ],
        echolocation: [
            "Écholocalisation",
            "Écholocation",
        ],
        etherealSight: [
            [["Vision", "Vue"], " éthérée"],
        ],
        etherealness: [
            "Forme éthérée",
        ],
        eyesOfTheGrave: [
            "Œil de la tombe",
        ],
        hollowOne: [
            [["Don surnaturel", "Dons surnaturels"], [": ", " : "], ["Celui-qui-est-creux", "Hollow One"]],
            "Celui-qui-est-creux",
        ],
        invocationDevilsSight: [
            [["Invocation", "Manifestation"], [" occulte", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de", "du"], " diable"],
            [["Invocations", "Manifestations"], [" occultes", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de", "du"], " diable"],
            ["Adepte occulte", [": ", " : "], ["Vision", "Vue"], " ", ["de", "du"], " diable"],
            [["Vision", "Vue"], " ", ["de", "du"], " diable"],
        ],
        invocationGhostlyGaze: [
            [["Invocation", "Manifestation"], [" occulte", ""], [": ", " : "], "Regard fantomatique"],
            [["Invocations", "Manifestations"], [" occultes", ""], [": ", " : "], "Regard fantomatique"],
            ["Adepte occulte: Regard fantomatique"],
            ["Regard fantomatique"],
        ],
        lifeSense: [
            "Perception de la vie",
        ],
        magicAwareness: [
            "Conscience magique",
        ],
        mindBlank: [
            "Esprit impénétrable",
        ],
        nondetection: [
            "Antidétection",
        ],
        seeInvisibility: [
            ["Détection de l", ["'", "’"], "invisibilité"],
        ],
        senseMagic: [
            [["Détection", "Perception"], " de la magie"],
        ],
        umbralSight: [
            "Vision des ombres",
        ],
    },
    "es": {
        blindSenses: [
            "Sentidos de Ciego",
        ],
        bloodSense: [
            "Percepción de Sangre",
        ],
        detectEvilAndGood: [
            "Detectar el Bien y el Mal",
        ],
        detectMagic: [
            "Detectar Magia",
        ],
        detectPoisonAndDisease: [
            "Detectar Venenos y Enfermedades",
        ],
        detectThoughts: [
            "Detectar Pensamientos",
        ],
        devilsSight: [
            "Vista del Diablo",
        ],
        divineSense: [
            "Sentidos Divinos",
        ],
        echolocation: [
            "Ecolocalización",
        ],
        etherealSight: [
            "Visión Etérea",
        ],
        etherealness: [
            "Excursión Etérea",
        ],
        eyesOfTheGrave: [
            "Ojos de la Tumba",
        ],
        hollowOne: [
            [["Don Supernatural", "Dones Supernaturales"], ": ", ["Aquel que está vacío", "Hollow One"]],
            "Aquel que está vacío",
        ],
        invocationDevilsSight: [
            ["Invocación", [" Sobrenatural", ""], ": Vista del Diablo"],
            ["Invocaciones", [" Sobrenaturales", ""], ": Vista del Diablo"],
            "Adepto Sobrenatural: Vista del Diablo",
            "Vista del Diablo",
        ],
        invocationGhostlyGaze: [
            ["Invocación", [" Sobrenatural", ""], ": Mirada Fantasmal"],
            ["Invocaciones", [" Sobrenaturales", ""], ": Mirada Fantasmal"],
            "Adepto Sobrenatural: Mirada Fantasmal",
            "Mirada Fantasmal",
        ],
        lifeSense: [
            "Percepción de la Vida",
        ],
        magicAwareness: [
            "Conciencia Mágica",
        ],
        mindBlank: [
            "Mente en Blanco",
        ],
        nondetection: [
            "Indetectable",
        ],
        seeInvisibility: [
            "Ver Invisibilidad",
        ],
        senseMagic: [
            "Sentir Magia",
        ],
        umbralSight: [
            "Visión en la Umbra",
        ],
    },
    "pt-BR": {
        blindSenses: [
            "Sentido Cego",
        ],
        bloodSense: [
            "Percepção do Sangue",
        ],
        detectEvilAndGood: [
            ["Detectar o Bem e", [" o", ""], " Mal"],
        ],
        detectMagic: [
            "Detectar Magia",
        ],
        detectPoisonAndDisease: [
            "Detectar Veneno e Doença",
        ],
        detectThoughts: [
            "Detectar Pensamentos",
        ],
        devilsSight: [
            "Visão Diabólica",
            "Visão do Diabo",
        ],
        divineSense: [
            "Sentido Divino",
        ],
        echolocation: [
            "Ecolocalização",
        ],
        etherealSight: [
            "Visão Etérea",
        ],
        etherealness: [
            "Forma Etérea",
        ],
        eyesOfTheGrave: [
            "Olhos da Sepultura",
        ],
        hollowOne: [
            [["Dom Sobrenatural", "Dons Sobrenaturais"], ": ", ["Oco", "Hollow One"]],
            "Oco",
        ],
        invocationDevilsSight: [
            ["Invocação", [" Mística", ""], ": ", ["Visão do Diabo", "Visão Diabólica"]],
            ["Invocações", [" Místicas", ""], ": ", ["Visão do Diabo", "Visão Diabólica"]],
            ["Adepto Místico: ", ["Visão do Diabo", "Visão Diabólica"]],
            "Visão do Diabo",
            "Visão Diabólica",
        ],
        invocationGhostlyGaze: [
            ["Invocação", [" Mística", ""], ": Olhar Fantasmagórico"],
            ["Invocações", [" Místicas", ""], ": Olhar Fantasmagórico"],
            "Adepto Místico: Olhar Fantasmagórico",
            "Olhar Fantasmagórico",
        ],
        lifeSense: [
            "Percepção da Vida",
        ],
        magicAwareness: [
            "Percepção Mágica",
        ],
        mindBlank: [
            "Limpar a Mente",
        ],
        nondetection: [
            "Indetectável",
        ],
        seeInvisibility: [
            "Ver o Invisível",
        ],
        senseMagic: [
            "Sentir Magia",
        ],
        umbralSight: [
            "Visão Umbral",
        ],
    },
};

/**
 * @param {Registry<*>} registry
 * @returns {{ character: Matcher, npc: Matcher }}
 */
function createMatchers(registry) {
    const database = Object.values(DATABASE).reduce((object, current) => {
        for (const key in current) {
            object[key] = (object[key] ?? []).concat(current[key]);
        }

        return object;
    });

    return Object.fromEntries(
        Object.entries(registry).map(([type, methods]) => [
            type,
            new Matcher(Object.keys(methods).reduce((object, name) => {
                object[name] = database[name];

                return object;
            }, {})),
        ]),
    );
}

/** @type {{ character: Matcher, npc: Matcher }} */
let FEAT_MATCHERS = createMatchers(FEAT_REGISTRY);

/** @type {{ character: Matcher, npc: Matcher }} */
let EFFECT_MATCHERS = createMatchers(EFFECT_REGISTRY);

Hooks.once("init", () => {
    if (foundry.utils.isNewerVersion("4.0.0", game.system.version)) {
        // eslint-disable-next-line no-func-assign
        isPoisonous = function (actor) {
            if (actor.statuses.has(CONFIG.specialStatusEffects.OBJECT)
                || actor.statuses.has(CONFIG.specialStatusEffects.PETRIFIED)) {
                return false;
            }

            for (const item of actor.items) {
                if (item.type === "weapon" && item.system.type.value === "natural"
                    && (item.system.damage.parts.some((part) => part[1] === "poison")
                        || [
                            item.system.critical.damage,
                            item.system.damage.versatile,
                            item.system.formula,
                        ].some((formula) => /\[poison\]/i.test(formula)))) {
                    return true;
                }
            }

            return false;
        };

        return;
    }

    if (game.settings.get("dnd5e", "rulesVersion") !== "legacy") {
        return;
    }

    // Detect Thoughts in PHB'14 requires an Intelligence of 4 or higher.
    // eslint-disable-next-line no-func-assign
    isThinking = function (actor) {
        if (actor.statuses.has(CONFIG.specialStatusEffects.OBJECT)
            || actor.statuses.has(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        return (actor.type === "character" || actor.type === "npc")
            && actor.system.abilities.int.value > 3
            && (actor.system.traits.languages.value.size > 0
                || !!actor.system.traits.languages.custom);
    };

    // Invocation: Witch Sight and The Third Eye have changed in PHB'24.
    Object.assign(FEAT_REGISTRY.character, {
        blindsense(item) {
            upgradeDetectionMode(this, "blindsense", 10, "ft");
        },
        invocationWitchSight(item) {
            upgradeDetectionMode(this, "witchSight", 30, "ft");
        },
    });
    Object.assign(FEAT_REGISTRY.npc, {
        shapechanger(item) {
            this.statuses.add(CONFIG.specialStatusEffects.SHAPECHANGER);
        },
    });
    Object.assign(EFFECT_REGISTRY.character, {
        theThirdEyeEtherealSight(effect) {
            upgradeDetectionMode(this, "etherealSight", 60, "ft");
        },
        theThirdEyeSeeInvisibility(effect) {
            upgradeDetectionMode(this, "seeInvisibility", 10, "ft");
        },
    });

    Object.assign(DATABASE.en, {
        blindsense: [
            "Blindsense",
        ],
        invocationWitchSight: [
            [["Eldritch ", ""], "Invocation", ["s", ""], ": Witch Sight"],
            "Eldritch Adept: Witch Sight",
            "Witch Sight",
        ],
        shapechanger: [
            "Shapechanger",
        ],
        theThirdEyeEtherealSight: [
            "The Third Eye: Ethereal Sight",
        ],
        theThirdEyeSeeInvisibility: [
            "The Third Eye: See Invisibility",
        ],
    });
    Object.assign(DATABASE.de, {
        blindsense: [
            "Blindgespür",
        ],
        invocationWitchSight: [
            [["Schauerliche ", ""], "Anrufung", ["en", ""], ": Hexensicht"],
            "Schauerlicher Adept: Hexensicht",
            "Hexensicht",
        ],
        shapechanger: [
            "Gestaltwandler",
        ],
        theThirdEyeEtherealSight: [
            "Das dritte Auge: Ätherische Sicht",
        ],
        theThirdEyeSeeInvisibility: [
            "Das dritte Auge: Unsichtbares sehen",
        ],
    });
    Object.assign(DATABASE.fr, {
        blindsense: [
            "Perception aveugle",
        ],
        invocationWitchSight: [
            [["Invocation", "Manifestation"], [" occulte", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de sorcier", "sorcière"]],
            [["Invocations", "Manifestations"], [" occultes", ""], [": ", " : "], ["Vision", "Vue"], " ", ["de sorcier", "sorcière"]],
            ["Adepte occulte", [": ", " : "], ["Vision", "Vue"], " ", ["de sorcier", "sorcière"]],
            [["Vision", "Vue"], " ", ["de sorcier", "sorcière"]],
        ],
        shapechanger: [
            "Métamorphe",
        ],
        theThirdEyeEtherealSight: [
            ["Troisième œil", [": ", " : "], "Vision éthérée"],
        ],
        theThirdEyeSeeInvisibility: [
            ["Troisième œil", [": ", " : "], "Voir l", ["'", "’"], "invisible"],
        ],
    });
    Object.assign(DATABASE.es, {
        blindsense: [
            "Sentir sin Ver",
        ],
        invocationWitchSight: [
            ["Invocación", [" Sobrenatural", ""], ": Visión Bruja"],
            ["Invocaciones", [" Sobrenaturales", ""], ": Visión Bruja"],
            "Adepto Sobrenatural: Visión Bruja",
            "Visión Bruja",
        ],
        shapechanger: [
            "Cambiaformas",
        ],
        theThirdEyeEtherealSight: [
            "El Tercer Ojo: Visión Etérea",
        ],
        theThirdEyeSeeInvisibility: [
            "El Tercer Ojo: Ver Invisibilidad",
        ],
    });
    Object.assign(DATABASE["pt-BR"], {
        blindsense: [
            "Sentido Cego",
        ],
        invocationWitchSight: [
            ["Invocação", [" Mística", ""], ": Visão da Bruxa"],
            ["Invocações", [" Místicas", ""], ": Visão da Bruxa"],
            "Adepto Místico: Visão da Bruxa",
            "Visão da Bruxa",
        ],
        shapechanger: [
            "Metamorfo",
        ],
        theThirdEyeEtherealSight: [
            "O Terceiro Olho: Visão Etérea",
        ],
        theThirdEyeSeeInvisibility: [
            "O Terceiro Olho: Ver Invisibilidade",
        ],
    });

    FEAT_MATCHERS = createMatchers(FEAT_REGISTRY);
    EFFECT_MATCHERS = createMatchers(EFFECT_REGISTRY);
});
