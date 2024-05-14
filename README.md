[![Latest Version](https://img.shields.io/github/v/release/dev7355608/vision-5e?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/dev7355608/vision-5e/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdev7355608%2Fvision-5e%2Fmain%2Fmodule.json)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fvision-5e&colorB=blueviolet)](https://forge-vtt.com/bazaar#package=vision-5e)
[![License](https://img.shields.io/github/license/dev7355608/vision-5e?label=License)](LICENSE)

# Vision 5e (Foundry VTT Module)

Additional and improved Vision/Detection modes for D&D 5e including automatic vision management based on the actor's senses and active effects.

The automation detects relevant feats and effects that affect the creatures senses by their name (supported are English, German, French, Spanish, and Portuguese (Brazil) translations). No configuration is required unless you want to change the default hearing range formula or turn hearing off by default.

---

- **Blindsense**
- **Blindsight**
  - If the actor has the `Echolocation`[\*](#translations) or `Blind Senses`[\*](#translations) feat, Blindsight doesn't work while deafened.
  - _Note: Blindsight is blocked by total cover. There's no total cover wall restriction type. So Blindsight is blocked by sight-blocking walls._
- **Darkvision**
  - Unless blinded Darkvision detects any creature that isn't invisible and doesn't have the `Umbral Sight`[\*](#translations) feat.
- **Detect Evil and Good**
  - Detects aberrations, celestials, elementals, feys, fiends, undeads, and PCs with the `Hollow One`[\*](#translations), `Supernatural Gift: Hollow One`, or `Supernatural Gifts: Hollow One` feat.
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
- **Detect Magic**
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
- **Detect Poison and Disease**
  - Detects all creatures that have a poisonous natural weapon attack or have the _poisoned_ or _diseased_ status effect.
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
  - _Note: Some poisonous creatures might not be detected, because the Versatile Damage of the natural weapon attack is missing the `[poison]` flavor, which you'll need to fix yourself._
- **Detect Thoughts**
  - Detects all creatures that have an Intelligence of 4 or higher and speak at least one language.
  - _Note: Restricted by any sight-blocking wall, because there's no way to know what material the wall is made of or how thick it is._
- **Devil's Sight**
  - Allows vision through darkness sources.
- **Divine Sense**
  - Detects celestials, fiends, undead, and PCs with the `Hollow One`[\*](#translations), `Supernatural Gift: Hollow One`, or `Supernatural Gifts: Hollow One` feat.
- **Ethereal Sight**
  - Allows detection of ethereal creatures.
- **Hearing**
  - Detects all creatures that do not have the _inaudible_ status effect and are not behind a sound-blocking walls. If the token is deafened, it cannot hear anything of course.
- **See Invisibility**
  - Allows detection of invisible and ethereal creatures.
  - Unlike core See Invisibility it does not allow the token to see the invisible token unless it has a detection mode that would see it if it wasn't invisible as per rules.
- **Tremorsense**
  - Detects all creatures that do not have the _flying_ status effect.
  - Is unable to detect anything while the creature itself is flying.
  - _Note: Tremorsense works differently compared to core's Feel Tremor, which detects all creatures that are not above 0 elevation._
- **Truesight**
  - Allows vision through darkness sources and detection of ethereal creatures.
  - _Note: The original form of a shapechanger is not revealed nor highlighted with a special effect._
- **Witch Sight**
  - Allows detection of shapechangers.
  - _Note: An actor is an shapechanger if it has the `Shapechanger`[\*](#translations) subtype or the `Shapechanger`[\*](#translations) feat._
  - _Note: The original form of the shapechanger is not revealed._

---

Detection modes of tokens are automatically configured based on the actor's senses. They can be overridden by the token's detection modes though.

By default all tokens have hearing range of 15 + 2.5 * (*Passive Perception* - 10) feet (`15 + 2.5 * (@skills.prc.passive - 10)`). The default hearing range can be configured in the module settings.

A token gains ...

- _Blindsense_ if the actor in a PC and has a feat with the name `Blindsense`[\*](#translations).
- _Detect Evil and Good_ if the actor has an active effect with the name `Detect Evil and Good`[\*](#translations).
- _Detect Magic_ if the actor has an active effect with the name `Detect Magic`[\*](#translations) or a feat with the name `Sense Magic`[\*](#translations). An active effect named `Magic Awareness`[\*](#translations) grants PC actors 60 feet of Detect Magic.
- _Detect Poison and Disease_ if the actor has an active effect with the name `Detect Poison and Disease`[\*](#translations).
- _Detect Thoughts_ if the actor has an active effect with the name `Detect Thoughts`[\*](#translations).
- _Devil's Sight_ if the actor is a PC and has a feat with the name `Devil's Sight`[\*](#translations), `Invocation: Devil's Sight`, `Invocations: Devil's Sight`, `Eldritch Invocation: Devil's Sight`, `Eldritch Invocations: Devil's Sight`, or `Eldritch Adept: Devil's Sight`. NPCs gain _Devil's Sight_ equal to their _Darkvision_ if they have the `Devil's Sight`[\*](#translations) feat.
  - _Note: Remove the active effect that gives 120 feet Darkvision from the *Invocation: Devil's Sight* feat if it exists: Devil's Sight doesn't increase the range of Darkvision._
- _Divine Sense_ if the actor is a PC and has an active effect with the name `Divine Sense`[\*](#translations).
- _Ethereal Sight_ if the actor is a NPC and has a feat with the name `Ethereal Sight`[\*](#translations).
- _See Invisibility_ if the actor has an active effect with the name `See Invisibility`[\*](#translations).
- _Sense Magic_ if the actor is a NPC and has a feat with the name `Sense Magic`[\*](#translations).
- _Witch Sight_ if the actor is a PC and has a feat with the name `Witch Sight`[\*](#translations), `Invocation: Witch Sight`, `Invocations: Witch Sight`, `Eldritch Invocation: Witch Sight`, `Eldritch Invocations: Witch Sight`, or `Eldritch Adept: Witch Sight`.

A PC actor that has an active effect with the name `Ghostly Gaze`[\*](#translations), `Invocation: Ghostly Gaze`, `Invocations: Ghostly Gaze`, `Eldritch Invocation: Ghostly Gaze`, `Eldritch Invocations: Ghostly Gaze`, or `Eldritch Adept: Ghostly Gaze` gains 30 feet _Darkvision_ and can see through walls within 30 feet.

`The Third Eye: Darkvision`[\*](#translations), `The Third Eye: Ethereal Sight`[\*](#translations), and `The Third Eye: See Invisibility`[\*](#translations) grants PC actors their respective senses.

---

The vision modes can be changed in token HUD. The player can select the preferred vision mode for their token and change it at any time on their own.

![hud](images/hud.png)

---

If a token doesn't produce any sound, give it the _inaudible_ status effect, which is right next to the _invisible_ status effect.

![hud](images/inaudible.png)

---

_Blindsense_, _Detect Evil and Good_, _Detect Magic_, _Detect Poison and Disease_, _Detect Thoughts_, _Divine Sense_, _Hearing_, and _Tremorsense_ are all imprecise senses. They do not reveal any information about the detected token except for size, location (position and elevation), and player targets.

![hud](images/imprecise.gif)

---

### Active Effects

| Sense                     | Attribute Key                                     |
| ------------------------- | ------------------------------------------------- |
| Blindsense                | `ATL.detectionModes.bindsense.range`              |
| Blindsight                | `system.attributes.senses.blindsight`             |
| Darkvision                | `system.attributes.senses.darkvision`             |
| Detect Evil and Good      | `ATL.detectionModes.detectEvilAndGood.range`      |
| Detect Magic              | `ATL.detectionModes.detectMagic.range`            |
| Detect Poison and Disease | `ATL.detectionModes.detectPoisonAndDisease.range` |
| Detect Thoughts           | `ATL.detectionModes.detectThoughts.range`         |
| Devil's Sight             | `ATL.detectionModes.devilsSight.range`            |
| Divine Sense              | `ATL.detectionModes.divineSense.range`            |
| Ethereal Sight            | `ATL.detectionModes.etherealSight.range`          |
| Hearing                   | `ATL.detectionModes.hearing.range`                |
| Light Perception          | `ATL.detectionModes.lightPerception.range`        |
| See Invisibility          | `ATL.detectionModes.seeInvisibility.range`        |
| Tremorsense               | `system.attributes.senses.tremorsense`            |
| Truesight                 | `system.attributes.senses.truesight`              |
| Witch Sight               | `ATL.detectionModes.witchSight.range`             |

_Note: Attribute keys starting with `ATL.` require the [Active Token Effects](https://foundryvtt.com/packages/ATL) module._

---

### Translations

| English                     | _Source_                              | German                         | French                                                                      | Spanish                           | Portuguese (Brazil)                               |
| --------------------------- | ------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| `Blind Senses`              | _Monster feat_                        | `Blinde Sinne`                 | `Sens aveugles`                                                             | `Sentidos de ciego`               | `Sentido Cego`                                    |
| `Blindsense`                | _Rogue feat_                          | `Blindgespür`                  | `Perception aveugle`                                                        | `Sentir sin ver`                  | `Sentido Cego`                                    |
| `Detect Evil and Good`      | _Spell_                               | `Gutes und Böses entdecken`    | `Détection du mal et du bien`                                               | `Detectar el bien y el mal`       | `Detectar o Bem e o Mal` / `Detectar o Bem e Mal` |
| `Detect Magic`              | _Spell_                               | `Magie entdecken`              | `Détection de la magie`                                                     | `Detectar magia`                  | `Detectar Magia`                                  |
| `Detect Poison and Disease` | _Spell_                               | `Gift und Krankheit entdecken` | `Détection du poison et des maladies`                                       | `Detectar venenos y enfermedades` | `Detectar Veneno e Doença`                        |
| `Detect Thoughts`           | _Spell_                               | `Gedanken wahrnehmen`          | `Détection des pensées`                                                     | `Detectar pensamientos`           | `Detectar Pensamentos`                            |
| `Devil's Sight`             | _Warlock invocation_ / _Monster feat_ | `Teufelssicht`                 | `Vision de diable` / `Vision du diable` / `Vue de diable` / `Vue du diable` | `Vista del diablo`                | `Visão Diabólica` / `Visão do Diabo`              |
| `Divine Sense`              | _Paladin feat_                        | `Göttliches Gespür`            | `Perception divine`                                                         | `Sentidos divinos`                | `Sentido Divino`                                  |
| `Echolocation`              | _Monster feat_                        | `Echolot`                      | `Écholocation` / `Écholocalisation`                                         | `Ecolocalización`                 | `Ecolocalização`                                  |
| `Eldritch Adept`            | _Feat_                                | `Schauerlicher Adept`          | `Adepte occulte`                                                            | `Adepto sobrenatural`             | `Adepto Místico`                                  |
| `Eldritch Invocation`       | _Warlock feat_                        | `Schauerliche Anrufung`        | `Invocation occulte` / `Manifestation occulte`                              | `Invocación sobrenatural`         | `Invocação Mística`                               |
| `Ethereal Sight`            | _Monster feat_                        | `Ätherische Sicht`             | `Vision éthérée` / `Vue éthérée`                                            | `Visión etérea`                   | `Visão Etérea`                                    |
| `Ghostly Gaze`              | _Warlock invocation_                  | `Geisterhafter Blick`          | `Regard fantomatique`                                                       | `Mirada fantasmal`                | `Olhar Fantasmagórico`                            |
| `Hollow One`                | _Supernatural Gift_                   | `Leerwandler`                  | `Celui-qui-est-creux`                                                       | `Aquel que está vacío`            | `Oco`                                             |
| `Magic Awareness`           | _Barbarian (Path of Wild Magic) feat_ | `Magische Wahrnehmung`         | `Conscience magique`                                                        | `Conciencia mágica`               | `Percepção Mágica`                                |
| `See Invisibility`          | _Spell_                               | `Unsichtbares sehen`           | `Détection de l'invisibilité`                                               | `Ver invisibilidad`               | `Ver o Invisível`                                 |
| `Sense Magic`               | _Monster feat_                        | `Magie spüren`                 | `Détection de la magie` / `Perception de la magie`                          | `Sentir magia`                    | `Sentir Magia`                                    |
| `Shapechanger`              | _Monster feat/subtype_                | `Gestaltwandler`               | `Métamorphe`                                                                | `Cambiaformas`                    | `Metamorfo`                                       |
| `Supernatural Gift`         | _Character Creation Option_           | `Übernatürliche Gabe`          | `Don surnaturel`                                                            | `Don supernatural`                | `Dom Sobrenatural`                                |
| `The Third Eye`             | _Wizard (Divination) feat_            | `Das dritte Auge`              | `Troisième œil`                                                             | `El Tercer Ojo`                   | `O Terceiro Olho`                                 |
| `Umbral Sight`              | _Ranger (Gloomstalker) feat_          | `Düstersicht`                  | `Vision des ombres`                                                         | `Visión en la umbra`              | `Visão Umbral`                                    |
| `Witch Sight`               | _Warlock invocation_                  | `Hexensicht`                   | `Vision de sorcier` / `Vision sorcière` / `Vue de sorcier` / `Vue sorcière` | `Visión bruja`                    | `Visão da Bruxa`                                  |

_Note: The automation is not case-sensitive._

_Note: You may use `'` or `’` for apostrophes._

_Note: In French the colon (`:`) is preceded by a space, but it isn't required in order for the automation to detect the feat. For example, both `Manifestation : Regard fantomatique` and `Manifestation: Regard fantomatique` work._
