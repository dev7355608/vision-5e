const detectionModeLightPerceptionClass = ((detectionModeLightPerceptionClass) =>
    /**
     * The detection mode for Light Perception.
     */
    class DetectionModeLightPerception extends detectionModeLightPerceptionClass {
        constructor() {
            super({
                id: DetectionMode.LIGHT_MODE_ID,
                label: "VISION5E.LightPerception",
                type: DetectionMode.DETECTION_TYPES.SIGHT
            });
        }

        /** @override */
        _canDetect(visionSource, target) {
            const source = visionSource.object;
            return !(source instanceof Token && (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLIND)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEP)
                || source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)))
                && !(target instanceof Token && (target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)
                    || target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
                    || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                    && !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL))));
        }

        /** @override */
        _testPoint(visionSource, mode, target, test) {
            if (!this._testRange(visionSource, mode, target, test)) return false;
            if (!this._testLOS(visionSource, mode, target, test)) return false;
            const source = visionSource.object;
            if (source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
                return true;
            }
            for (const lightSource of canvas.effects.lightSources) {
                if (lightSource.disabled) continue;
                if (lightSource.shape.contains(test.point.x, test.point.y)) return true;
            }
            return false;
        }
    }
)(DetectionModeLightPerception);

export { detectionModeLightPerceptionClass as DetectionModeLightPerception };
