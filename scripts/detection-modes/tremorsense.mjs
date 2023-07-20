/**
 * The detection mode for Tremorsense.
 */
export class DetectionModeTremorsense extends DetectionMode {
    sourceType = "move";
    wallDirectionMode = PointSourcePolygon.WALL_DIRECTION_MODES.NORMAL;
    useThreshold = false;
    imprecise = true;
    priority = -1000;

    constructor() {
        super({
            id: "feelTremor",
            label: "DND5E.SenseTremorsense",
            type: DetectionMode.DETECTION_TYPES.MOVE,
            walls: false,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        let filter = this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 0, 1, 1],
            knockout: true,
            wave: true
        });
        filter.thickness = game.settings.get("vision-5e", "defaultOutlineThickness");
        return filter;
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!(target instanceof Token)) return false;
        const source = visionSource.object;
        return !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.FLY))
            && !(target.document.hasStatusEffect(CONFIG.specialStatusEffects.FLY)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED));
    }
}
