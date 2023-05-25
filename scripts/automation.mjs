const effectMapping = new Map();

function getInheritedDetectionModes(actor) {
    const modes = {};
    const senses = actor.system.attributes.senses;

    modes.lightPerception = Infinity;
    modes[DetectionMode.BASIC_MODE_ID] = senses.darkvision;
    modes.seeAll = senses.truesight;
    modes.blindsight = senses.blindsight;
    modes.feelTremor = senses.tremorsense;
    modes.hearing = 30;

    for (const effect of actor.appliedEffects) {
        const mode = effectMapping.get(effect.name);

        if (mode) {
            modes[mode.id] = mode.range;
        }
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
                for (const token of actor.getActiveTokens(false, true)) {
                    if (token.sight.enabled) {
                        token.reset();
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
            if (this.sight.enabled && this.actor) {
                const inheritedModes = getInheritedDetectionModes(this.actor);
                const basicId = CONFIG.Canvas.visionModes[this.sight.visionMode]?.detectionMode
                    ?? DetectionMode.BASIC_MODE_ID;
                const basicMode =
                    this.detectionModes.find((m) => m.id === basicId)
                    ?? inheritedModes.find((m) => m.id === basicId);

                this.sight.range = basicMode?.range ?? 0;

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
        if (effectMapping.has(effect.name)) {
            resetActiveTokens(target);
        }
    }
});

Hooks.on("updateActiveEffect", (effect, changes) => {
    const target = effect.target;

    if (target instanceof Actor) {
        if (effectMapping.has(effect.name) || "name" in changes) {
            resetActiveTokens(target);
        }
    }
});

Hooks.on("deleteActiveEffect", (effect) => {
    const target = effect.target;

    if (target instanceof Actor) {
        if (effectMapping.has(effect.name)) {
            resetActiveTokens(target);
        }
    }
});

Hooks.once("i18nInit", () => {
    for (const name of [
        "Detect Evil and Good",
        game.i18n.localize("VISIONED4.DetectEvilAndGood")
    ]) {
        effectMapping.set(name, {
            id: "detectEvilAndGood",
            range: 30
        });
    }

    for (const name of [
        "Detect Magic",
        game.i18n.localize("VISIONED4.DetectMagic")
    ]) {
        effectMapping.set(name, {
            id: "detectMagic",
            range: 30
        });
    }

    for (const name of [
        "Detect Poison and Disease",
        game.i18n.localize("VISIONED4.DetectPoisonAndDisease")
    ]) {
        effectMapping.set(name, {
            id: "detectPoisonAndDisease",
            range: 30
        });
    }

    for (const name of [
        "Detect Thoughts",
        game.i18n.localize("VISIONED4.DetectThoughts")
    ]) {
        effectMapping.set(name, {
            id: "detectThoughts",
            range: 30
        });
    }

    for (const name of [
        "Devil's Sight",
        game.i18n.localize("VISIONED4.DevilsSight")
    ]) {
        effectMapping.set(name, {
            id: "devilsSight",
            range: 120
        });
    }

    for (const name of [
        "Echolocation",
        game.i18n.localize("VISIONED4.Echolocation")
    ]) {
        effectMapping.set(name, {
            id: "echolocation"
        });
    }

    for (const name of [
        "Ghostly Gaze",
        game.i18n.localize("VISIONED4.GhostlyGaze")
    ]) {
        effectMapping.set(name, {
            id: "ghostlyGaze",
            range: 30
        });
    }

    for (const name of [
        "See Invisibility",
        game.i18n.localize("VISIONED4.SeeInvisibility")
    ]) {
        effectMapping.set(name, {
            id: "seeInvisibility",
            range: Infinity
        });
    }
});

Hooks.on("renderTokenConfig", (sheet, html) => {
    const token = sheet.document;

    if (!["character", "npc"].includes(token.actor?.type)) {
        return;
    }

    const source = token.toObject();
    const sourceDetectionModes = source.detectionModes;
    const activeDetectionModes = (!sheet.isPrototype ? token.detectionModes : getInheritedDetectionModes(token.actor))
        .filter((m) => m.id in CONFIG.Canvas.detectionModes)
        .sort((a, b) => game.i18n.localize(CONFIG.Canvas.detectionModes[a.id].label).localeCompare(
            game.i18n.localize(CONFIG.Canvas.detectionModes[b.id].label), game.i18n.lang))
        .reverse();

    Array.from(html[0].querySelectorAll(`fieldset.detection-mode:not([data-index])`).values()).forEach((e) => e.remove());

    for (const { id, range, enabled } of activeDetectionModes) {
        if (sourceDetectionModes.find((m) => m.id === id) || !(id in CONFIG.Canvas.detectionModes)) {
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
                        <input type="number" value="${range !== Infinity ? range : ""}" disabled
                            class="vision-earthdawn--range" placeholder="&#xF534;">
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
