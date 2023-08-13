/**
 * The detection mode for See Invisibility.
 */
export class DetectionModeSeeInvisibility extends DetectionMode {
    priority = -1;

    constructor() {
        super({
            id: "seeInvisibility",
            label: "VISION5E.SeeInvisibility",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: false,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [0, 0.60, 0.33, 1]
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        // Only invisible and ethereal tokens can be detected.
        return target instanceof Token && (target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL));
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        if (!super._testPoint(visionSource, mode, target, test)) {
            return false;
        }

        const visionSources = this.#removeOtherVisionSources(visionSource);
        const detectionsModes = this.#removeNonSightDetectionModes(visionSource);
        const statuses = this.#removeInvisibleAndEtherealStatusEffects(target);

        // Test whether this vision source sees the target without the invisible status effect.
        const isVisible = canvas.effects.visibility.testVisibility(test.point, { tolerance: 0, object: target });

        this.#restoreOtherVisionSources(visionSources);
        this.#restoreNonSightDetectionModes(visionSource, detectionsModes);
        this.#restoreInvisibleAndEtherealStatusEffects(target, statuses);

        return isVisible;
    }

    /**
     * Temporarily remove other vision sources.
     * @param {VisionSource} visionSource             The vision source.
     * @returns {Collection<string, VisionSource>}    The vision sources that need to be restored later.
     */
    #removeOtherVisionSources(visionSource) {
        const visionSources = canvas.effects.visionSources;

        canvas.effects.visionSources = new foundry.utils.Collection();
        canvas.effects.visionSources.set("", visionSource);

        return visionSources;
    }

    /**
     * Restore the vision sources.
     * @param {Collection<string, VisionSource>} visionSources    The vision sources that need to be restored.
     */
    #restoreOtherVisionSources(visionSources) {
        canvas.effects.visionSources = visionSources;
    }

    /**
     * Temporarily remove all detection modes that are not sight-based from the source token.
     * @param {VisionSource} visionSource      The vision source.
     * @returns {TokenDetectionMode[]|null}    The detection modes that need to be restored later.
     */
    #removeNonSightDetectionModes(visionSource) {
        const object = visionSource.object;
        let detectionModes = null;

        if (object instanceof Token) {
            const document = object.document;

            detectionModes = document.detectionModes;
            document.detectionModes = detectionModes.filter(
                m => CONFIG.Canvas.detectionModes[m.id]?.type === DetectionMode.DETECTION_TYPES.SIGHT
            );
        }

        return detectionModes;
    }

    /**
     * Restore the detection modes.
     * @param {VisionSource} visionSource                   The vision source.
     * @param {TokenDetectionMode[]|null} detectionModes    The detection modes that need to be restored.
     */
    #restoreNonSightDetectionModes(visionSource, detectionModes) {
        if (detectionModes) {
            visionSource.object.document.detectionModes = detectionModes;
        }
    }

    /**
     * Temporarily remove the invisible and ethereal status effects from the target token.
     * @param {Token} target    The target token.
     * @returns {string[]}      The statuses that need to be restored later.
     */
    #removeInvisibleAndEtherealStatusEffects(target) {
        const document = target.document;
        let statuses;

        // See TokenDocument.hasStatusEffect
        if (!document.actor) {
            const icon = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.INVISIBLE
                || e.id === CONFIG.specialStatusEffects.ETHEREAL)?.icon;

            statuses = document.effects;
            document.effects = statuses.filter(e => e !== icon);
        } else {
            statuses = [];

            if (document.actor.statuses.delete(CONFIG.specialStatusEffects.INVISIBLE)) {
                statuses.push(CONFIG.specialStatusEffects.INVISIBLE);
            }

            if (document.actor.statuses.delete(CONFIG.specialStatusEffects.ETHEREAL)) {
                statuses.push(CONFIG.specialStatusEffects.ETHEREAL);
            }
        }

        return statuses;
    }

    /**
     * Restore the status effects.
     * @param {Token} target         The target token.
     * @param {string[]} statuses    The statuses that need to be restored.
     */
    #restoreInvisibleAndEtherealStatusEffects(target, statuses) {
        const document = target.document;

        if (!document.actor) {
            document.effects = statuses;
        } else {
            for (const status of statuses) {
                document.actor.statuses.add(status);
            }
        }
    }
}
