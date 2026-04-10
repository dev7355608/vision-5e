import { DETECTION_LEVELS } from "./const.mjs";

export default (CombatTracker) => class extends CombatTracker {
    /** @override */
    _isTokenVisible(token) {
        return token.detectionLevel === DETECTION_LEVELS.PRECISE;
    }
};
