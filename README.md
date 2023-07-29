[![Latest Version](https://img.shields.io/github/v/release/dev7355608/vision-5e?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/dev7355608/vision-5e/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdev7355608%2Fvision-5e%2Fmain%2Fmodule.json)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fvision-5e&colorB=blueviolet)](https://forge-vtt.com/bazaar#package=vision-5e)
[![License](https://img.shields.io/github/license/dev7355608/vision-5e?label=License)](LICENSE)

# Vision 5e (Foundry VTT Module)

Additional and improved Vision/Detection modes for D&D 5e including automatic vision management based on the actor's senses and active effects.

---

- **Blindsense**
- **Blindsight**
  - _Note: Blindsight is blocked by total cover. There's no total cover wall restriction type. So Blindsight is blocked by sight-blocking walls, but doesn't go through proximity walls regardless of the distance to the wall. Therefore it is necessary to use proximity walls for glass windows._
- **Darkvision**
  - Unless blinded Darkvision detects any creature that isn't invisible and doesn't have the `Umbral Sight` feat.
- **Detect Evil and Good**
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
- **Detect Magic**
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
  - _Note: Magic items are considered magical if the rarity is common or higher. Mundane items should not have a rarity. Unfortunately, all mundane items in the system's item compendium are incorrectly given the common rarity, which means that all items that originated from this compendium pack are detected as magical. So you'll need to fix the rarity of these items if before you can use Detect Magic._
- **Detect Poison and Disease**
  - Detects all creatures that have a poisonous natural weapon attack or have the poisoned or diseased status effect.
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
  - _Note: Some poisonous creatures might not be detected, because the Versatile Damage of the natural weapon attack is missing the `[poison]` flavor, which you'll need to fix yourself._
- **Detect Thoughts**
  - Detects all creatures that have an Intelligence of 4 or higher and speak at least one language.
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
- **Devil's Sight**
  - _Note: You need the [Limits](https://github.com/dev7355608/limits) module for magical darkness._
- **Divine Sense**
- **Echolocation**
  - Detects the same things Blindsight does but doesn't work while deafened.
- **Ethereal Sight**
  - Allows detection of ethereal creatures.
- **Ghostly Gaze**
  - Detects anything Darkvision would but isn't blocked by walls.
- **Hearing**
  - Detects all creatures that do not have the _inaudible_ status effect and are not behind a sound-blocking walls. If the token is deafened, it cannot hear anything of course.
- **See Invisibility**
  - Allows detection of invisible and ethereal creatures.
- **Tremorsense**
  - Detects all creatures that do not have the _flying_ status effect.
  - Is unable to detect anything while the creature itself is flying.
  - _Note: Tremorsense works differently compared to core's Feel Tremor, which detects all creatures that are not above 0 elevation._
- **Truesight**
  - _Note: You need the [Limits](https://github.com/dev7355608/limits) module for magical darkness._
  - _Note: The original form of a shapechanger is not revealed nor highlighted with a special effect._

_Basic Sight_ no longer detects creatures that are illuminate by light sources, which is now handled by the _Light Perception_ detection mode. Light perception being a separate detection modes allows you to configure the range of light perception. _Basic Sight_ is renamed to _Darkvision_.

---

Detection modes of tokens are automatically configured based on the actor's senses. They are overridden by the token's detection modes though.

A token gains ...

- _Blindsense_ if the actor has a feat with the name `Blindsense`.
- _Echolocation_ instead of _Blindsight_ if the actor has an active effect with the name `Echolocation`.
- _Detect Evil and Good_ if the actor has an active effect with the name `Detect Evil and Good`.
- _Detect Magic_ if the actor has an active effect with the name `Detect Magic` or `Sense Magic`. An active effect named `Magic Awareness` grants 60 feet of Detect Magic.
- _Detect Poison and Disease_ if the actor has an active effect with the name `Detect Poison and Disease`.
- _Detect Thoughts_ if the actor has an active effect with the name `Detect Thoughts`.
- _Devil's Sight_ if the actor has a feat with the name `Invocation: Devil's Sight`.
- _Divine Sense_ if the actor has an active effect with the name `Divine Sense`.
- _Ethereal Sight_ if the actor has a feat with the name `Ethereal Sight` and its description contains the range in feet.
- _Ghostly Gaze_ if the actor has an active effect with the name `Ghostly Gaze`.
- _See Invisibility_ if the actor has an active effect with the name `See Invisibility`.

By default all tokens have hearing range of 30 feet. The default hearing range can be configured in the settings.

---

The vision modes can be changed in token HUD. The player can select the preferred vision mode for their token and change it at any time on their own.

![hud](images/hud.png)

---

If a creature is burrowing, give it the _burrowing_ status effect. A burrowing creature cannot be detected by senses that are blocked by walls, but can be detected by senses like Hearing or Tremorsense for example. While burrowing the creature is effectively blinded and any light that the creature emits is suppressed.

---

If a token is in the ethereal plane, give it the _ethereal_ status effect. Tokens in the ethereal plane can see other ethereal tokens. Tokens that are not need _Truesight_ or _See Invisibility_ to see ethereal tokens.

---

If a token doesn't produce any sound, give it the _inaudible_ status effect, which is right next to the _invisible_ status effect.

![hud](images/inaudible.png)

---

_Detect Evil and Good_, _Detect Magic_, _Detect Poison and Disease_, _Detect Thoughts_, _Divine Sense_, _Hearing_, and _Tremorsense_ are all imprecise senses. They do not reveal any information about the detected token except for size and location. The detected token is also not targetable by the player. You can target tokens as the GM for your players with the [Manage Player Targets](https://foundryvtt.com/packages/manage-player-targets) module.

![hud](images/imprecise.gif)
