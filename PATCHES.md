This module modifies and extends the vision and detection mode API.

- Separates the light perception part of Basic Sight into a separate mode to allow control over the range of light perception.
- Adds the possibility of imprecise detection modes that merely reveal the location and size of the token but nothing else.
- Each vision mode is linked to a detection mode that becomes the primary detection mode when it is active.

```js
class DetectionMode extends foundry.abstract.DataModel {
  /**
   * The detection modes of a token are sorted by priority in descending order.
   * Higher priority detection modes are tested before lower priority detection modes
   * with the exception that the detection mode of the vision mode is always tested first
   * and the light perception mode is always tested second.
   * @type {number}
   * @default 0
   */
  priority;

  /**
   * Imprecise detection modes do not reveal the token icon or other information about
   * detected the token. The detected token isn't selectable or targetable. Imprecise
   * detection doesn't make the token visible. Only the size and location of the detected
   * token is revealed.
   * Precise detection modes have priority over imprecise detection modes.
   * @type {boolean}
   * @default false
   */
  imprecise;

  /**
   * The ID of the light perception mode (`DetectionModeLightPerception`).
   * @type {string}
   */
  static LIGHT_MODE_ID = "lightPerception";

  /**
   * Get the detection filter pertaining to this mode. This function is called with `revealed`
   * being true if the token was detected by the detection mode of the vision mode or if
   * the token was detected by light perception and the vision mode perceives light.
   * @param {boolean} [revealed=false]
   * @returns {PIXI.Filter|undefined}
   */
  static getDetectionFilter(revealed) {
    /* ... */
  }
}

// No longer tests whether the target is illuminated by light sources.
class DetectionModeBasicSight extends DetectionMode {
  /* ... */
}

/**
 * This detection mode tests whether the target is visible because it is illuminated by a light source.
 * The separation from basic sight makes it possible to restrict the range of light perception.
 * By default tokens have light perception with an infinite range if light perception isn't explicitely
 * configured.
 */
class DetectionModeLightPerception extends DetectionMode {
  /* ... */
}

class VisionMode extends foundry.abstract.DataModel {
  /**
   * The detection modes that this vision modes represents. The range of vision is determined
   * by the range of the detection mode. Vision is disabled if the token is blinded and
   * the detection mode is sight-based; vision is disabled if the token is deafened and
   * the detection mode is sound-based. If the detection mode is imprecise, the vision source
   * won't explore the fog of war.
   * @type {string}
   * @default DetectionMode.BASIC_MODE_ID
   */
  detectionMode;

  /**
   * True if the vision mode disables light sources entirely; otherwise false.
   * @type {boolean}
   * @readonly
   */
  perceivesLight;
}

/**
 * @typedef {RenderedSourceData}          VisionSourceData
 * ...
 * @property {number} deafened            Is the source deafened?
 * @property {number} lightRadius         The radius of light perception.
 */

class VisionSource extends RenderedPointSource {
  /**
   * The polygon of light perception.
   * @type {PointSourcePolygon}
   * @readonly
   */
  light;

  /**
   * Creates the polygon that represents light perception.
   * @returns {PointSourcePolygon}
   * @protected
   */
  _createLightPolygon() {
    /* ... */
  }
}

class Token extends PlaceableObject {
  /**
   * The range of light perception.
   * @type {number}
   * @readonly
   */
  lightPerceptionRange;

  /**
   * True if the token was detected only by imprecise detection modes; otherwise false.
   * @type {boolean}
   * @readonly
   */
  impreciseVisible;
}

// Sound-based detection modes cannot detect anything if the vision source is deafened.
CONFIG.specialStatusEffects.DEAF = "deaf";

// Sound-based detection modes cannot detect inaudible tokens.
CONFIG.specialStatusEffects.INAUDIBLE = "inaudible";
```
