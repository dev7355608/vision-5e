[![Latest Version](https://img.shields.io/github/v/release/dev7355608/vision-5e?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/dev7355608/vision-5e/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdev7355608%2Fvision-5e%2Fmain%2Fmodule.json)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fvision-5e&colorB=blueviolet)](https://forge-vtt.com/bazaar#package=vision-5e)
[![License](https://img.shields.io/github/license/dev7355608/vision-5e?label=License)](LICENSE)

# Vision 5e (Foundry VTT Module)

Additional and improved Vision/Detection modes for D&D 5e including automatic vision management based on the actor's senses, feats, and active effects.

The automation detects relevant feats and effects that affect the creatures senses and detection by their name (supported are English, German, French, Spanish, and Portuguese (Brazil)). No configuration is required unless you want to adjust the default hearing range formula or turn hearing off entirely by default.

---

### Detection Modes

- **Blindsense** _(Class Feature: Rogue, SRD / PHB 94)_
  - Detects PC/NPC actors that are not objects (e.g. [Item Piles](https://foundryvtt.com/packages/item-piles)).
  - Cannot detect actors that are _burrowing_, _defeated (dead)_, _ethereal_ (from the the material plane), or _petrified_.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _deafened_, _defeated_ (_dead_), _petrified_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for PC actors with the `Blindsense`[\*](#translations) feat.
- **Blindsight** _(Sense, SRD / PHB 183)_
  - Detects tokens, notes, and door controls.
  - Cannot detect actors that are _burrowing_ or _ethereal_ (from the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise).
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_. Also disabled if _deafened_ and the actor is a NPC and has the `Echolocation`[\*](#translations) _(Monster Feature, e.g. SRD / MM 318)_ or `Blind Senses`[\*](#translations) _(Monster Feature, e.g. SRD / MM 175)_ feat.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically from the actor's _Blindsight_.
- **Blood Sense** _(Homebrew)_
  - Detects PC/NPC actors that are not constructs, elementals, oozes, plants, undead, or objects (e.g. [Item Piles](https://foundryvtt.com/packages/item-piles)), and any actor that is _bleeding_.
  - Cannot detect actors that are _ethereal_ (from the the material plane), _petrified_ and not _bleeding_, or immune to _bleeding_.
  - Does not reveal the identity of detected tokens.
  - Disabled while _defeated_ (_dead_), _petrified_, or _unconscious_.
  - Is not restricted by walls or blocked by darkness sources.
  - Configured automatically for NPC actors that have the `Blood Sense`[\*](#translations) feat.
- **Darkvision** _(Sense, SRD / PHB 183)_
  - Detects tokens, notes, and door controls.
  - Cannot detect actors that are _burrowing_, _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise), or _invisible_. Also cannot detect PC actors with the `Umbral Sight`[\*](#translations) _(Subclass Feature: Gloom Stalker Ranger, XGE 41)_ feat.
  - Disabled while _blinded_, _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and is blocked by darkness sources unless the actor in a NPC with the `Devil's Sight`[\*](#translations) _(Monster Feature, e.g. SRD / MM 70)_ feat.
  - Configured automatically from the actor's _Darkvision_.
- **Detect Evil and Good** _(Spell, SRD / PHB 231)_
  - Detects aberrations, celestials, elementals, feys, fiends, undeads, and PC actors with the `Hollow One`[\*](#translations) _(Character Creation Option, EGW 182)_, `Supernatural Gift: Hollow One`, or `Supernatural Gifts: Hollow One` feat.
  - Cannot detect actors that are _burrowing_ or _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise). Also cannot detect actors with the `Mind Blank`[\*](#translations) _(Spell, SRD / PHB 259)_ or `Nondetection`[\*](#translations) _(Spell, SRD / PHB 263)_ effect.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for actors that have the `Detect Evil and Good`[\*](#translations) effect.
- **Detect Magic** _(Spell, SRD / PHB 231)_
  - Detects actors that carry a magic item or are affected by a spell effect.
  - Cannot detect actors that are _burrowing_ or _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise). Also cannot detect actors with the `Mind Blank`[\*](#translations) _(Spell, SRD / PHB 259)_ or `Nondetection`[\*](#translations) _(Spell, SRD / PHB 263)_ effect.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for actors with the `Detect Magic`[\*](#translations) effect, PC actors with the `Magic Awareness`[\*](#translations) _(Subclass Feature: Wild Magic Barbarian, TCE 25)_ feat, and NPC actors with the `Sense Magic`[\*](#translations) _(Monster Feature, e.g. SRD / MM 40)_ feat.
- **Detect Poison and Disease** _(Spell, SRD / PHB 231)_
  - Detects all actors that have a poisonous natural weapon attack or have the _poisoned_ or _diseased_ status effect.
  - Cannot detect actors that are _burrowing_ or _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise). Also cannot detect actors with the `Mind Blank`[\*](#translations) _(Spell, SRD / PHB 259)_ or `Nondetection`[\*](#translations) _(Spell, SRD / PHB 263)_ effect.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for actors that have the `Detect Poison and Disease`[\*](#translations) effect.
  - _Note: Some poisonous creatures might not be detected, because the Versatile Damage of the natural weapon attack is missing the `[poison]` flavor, which you'll need to fix yourself._
- **Detect Thoughts** _(Spell, SRD / PHB 231)_
  - Detects all PC/NPC actors that have an Intelligence of 4 or higher and speak at least one language and are not an object (e.g. [Item Piles](https://foundryvtt.com/packages/item-piles)).
  - Cannot detect actors that are _burrowing_ or _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise). Also cannot detect actors with the `Mind Blank`[\*](#translations) _(Spell, SRD / PHB 259)_ or `Nondetection`[\*](#translations) _(Spell, SRD / PHB 263)_ effect.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for actors that have the `Detect Thoughts`[\*](#translations) effect.
- **Devil's Sight** _(Eldritch Invocation, SRD / PHB 110)_
  - Can detect tokens, notes, and door controls.
  - Cannot detect actors that are _burrowing_, _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise), or _invisible_.
  - Disabled while _blinded_, _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for PC actors that have the `Devil's Sight`[\*](#translations), `Invocation: Devil's Sight`, `Invocations: Devil's Sight`, `Eldritch Invocation: Devil's Sight`, `Eldritch Invocations: Devil's Sight`, or `Eldritch Adept: Devil's Sight` feat.
  - _Note: Remove the active effect that gives 120 feet Darkvision from the Invocation: Devil's Sight feat if it exists: Devil's Sight doesn't increase the range of Darkvision._
- **Divine Sense** _(Class Feature: Paladin, SRD / PHB 82)_
  - Detects celestials, fiends, undead, and PC actors with the `Hollow One`[\*](#translations) _(Character Creation Option, EGW 182)_, `Supernatural Gift: Hollow One`, or `Supernatural Gifts: Hollow One` feat.
  - Cannot detect actors that are _burrowing_, _ethereal_ (from the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise), or _petrified_.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for PC actors with the `Divine Sense`[\*](#translations) effect.
- **Ethereal Sight** _(Monster Feature, e.g. SRD / MM 147)_
  - Allows detection _ethereal_ actors.
  - Cannot detect anything on its own and requires another sense to see the target without the _ethereal_ status.
  - Is not restricted by walls or blocked by darkness sources.
  - Configured automatically for NPC actors that have the `Ethereal Sight`[\*](#translations) feat and PC actors with the `The Third Eye: Ethereal Sight`[\*](#translations) feat.
- **Eyes of the Grave** _(Class Feature: Cleric, XGE 19)_
  - Detects undead, and PC actors with the `Hollow One`[\*](#translations) _(Character Creation Option, EGW 182)_, `Supernatural Gift: Hollow One`, or `Supernatural Gifts: Hollow One` feat.
  - Cannot detect actors that are _burrowing_, _ethereal_ (from the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise), or _petrified_. Also cannot detect actors with the `Nondetection`[\*](#translations) _(Spell, SRD / PHB 263)_ effect.
  - Does not reveal the identity of detected tokens.
  - Disabled while _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically for PC actors with the `Eyes of the Grave`[\*](#translations) effect.
- **Hearing**
  - Detects PC/NPC actors that are not objects (e.g. [Item Piles](https://foundryvtt.com/packages/item-piles)).
  - Cannot detect actors that are _defeated (dead)_, _ethereal_ (from the the material plane), _inaudible_, or _petrified_.
  - Disabled while _deafened_, _defeated_ (_dead_), _petrified_, or _unconscious_.
  - Is restricted by sound-blocking walls with reversed direction.
  - By default all tokens have hearing range of 15 + 2.5 * (*Passive Perception* - 10) feet (`15 + 2.5 * (@skills.prc.passive - 10)`). The default hearing range can be configured in the module settings.
- **Life Sense** _(Monster Feature, e.g. MPMM 250 / MTF 246)_
  - Detects PC/NPC actors that are not undead, constructs, or objects (e.g. [Item Piles](https://foundryvtt.com/packages/item-piles)).
  - Cannot detect actors that are _defeated (dead)_, _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise), or _petrified_.
  - Does not reveal the identity of detected tokens.
  - Disabled while _defeated_ (_dead_), _petrified_, or _unconscious_.
  - Is not restricted by walls or blocked by darkness sources.
  - Configured automatically for NPC actors that have the `Life Sense`[\*](#translations) feat.
- **Light Perception**
  - Detects tokens, notes, and door controls that are illuminated a light source or are _burning_.
  - Cannot detect actors that are _burrowing_, _ethereal_ (from the the material plane unless the `Etherealness`[\*](#translations) _(Monster Feature, e.g. SRD / MM 147)_ NPC feat says otherwise), or _invisible_.
  - Disabled while _blinded_, _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and is blocked by darkness sources.
  - Infinite range by default.
- **See Invisibility** _(Spell, SRD / PHB 274)_
  - Allows detection of _invisible_ and _ethereal_ actors.
  - Cannot detect anything on its own and requires another sense to see the target without the _ethereal_ and _invisible_ status.
  - Is not restricted by walls or blocked by darkness sources.
  - Configured automatically for actors with the `See Invisibility`[\*](#translations) effect and PC actors with the `The Third Eye: See Invisibility`[\*](#translations) _(Class Feature: Wizard, PHB 116)_ feat.
- **Tremorsense** _(Sense, SRD / MM 9)_
  - Detects PC/NPC actors that are not objects (e.g. [Item Piles](https://foundryvtt.com/packages/item-piles)).
  - Cannot detect actors that are _burrowing_, _defeated (dead)_, _ethereal_ (from the the material plane), _flying_, _hovering_, or _petrified_.
  - Does not reveal the identity of detected tokens.
  - Disabled while _defeated_ (_dead_), _flying_, _hovering_, _petrified_, or _unconscious_.
  - Is not restricted by walls or blocked by darkness sources.
  - Configured automatically from the actor's _Tremorsense_.
- **Truesight** _(Sense, SRD / PHB 183)_
  - Detects tokens, notes, and door controls.
  - Cannot detect actors that are _burrowing_.
  - Disabled while _blinded_, _burrowing_, _defeated_ (_dead_), _petrified_, _sleeping_, or _unconscious_.
  - Is restricted by sight-blocking walls and isn't blocked by darkness sources.
  - Configured automatically from the actor's _Truesight_.
- **Witch Sight** _(Eldritch Invocation, SRD / PHB 111)_
  - Allows detection of PC/NPC actors that have has the `Shapechanger`[\*](#translations) creature subtype and NPC actors with the `Shapechanger`[\*](#translations) _(Monster Feature, e.g. SRD / MM 220)_ feat.
  - Cannot detect anything on its own and requires another sense to see the target.
  - Is not restricted by walls or blocked by darkness sources.
  - Configured automatically for PC actor that have the `Witch Sight`[\*](#translations), `Invocation: Witch Sight`, `Invocations: Witch Sight`, `Eldritch Invocation: Witch Sight`, `Eldritch Invocations: Witch Sight`, or `Eldritch Adept: Witch Sight` feat.

PC actors that have the `Ghostly Gaze`[\*](#translations) _(Eldritch Invocation, XGE 56)_, `Invocation: Ghostly Gaze`, `Invocations: Ghostly Gaze`, `Eldritch Invocation: Ghostly Gaze`, `Eldritch Invocations: Ghostly Gaze`, or `Eldritch Adept: Ghostly Gaze` feat gain 30 feet _Darkvision_ and can see through walls within 30 feet.

---

### Vision Modes

This module restricts the available vision modes to _Blindsight_, _Darkvision_, _Devil's Sight_, and _Truesight_. The vision mode can be changed in token's HUD (<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/eye.svg" width="16px" height="16px" style="filter: invert(100%);">) if the token has at least two of these senses. Players can select their preferred vision mode for their owned tokens on their own this way.

---

### Spectator Mode

While a player controls/owns only tokens with vision that are _defeated_ (_dead_), _petrified_, or _unconscious_, tokens with vision owned by other players become a source of vision for this player if they have limited permission over the token's actor. This behavior aims to prevent players from missing out on all the fun when their character dies, is knocked unconscious, or is petrified, which are all conditions that make the token not perceive anything and are likely to affect the character more than one round of combat.

---

### Active Effects

| Detection Mode            | Attribute Key                                     |
| ------------------------- | ------------------------------------------------- |
| Blindsense                | `ATL.detectionModes.bindsense.range`              |
| Blindsight                | `system.attributes.senses.blindsight`             |
| Blood Sense               | `ATL.detectionModes.bloodSense.range`             |
| Darkvision                | `system.attributes.senses.darkvision`             |
| Detect Evil and Good      | `ATL.detectionModes.detectEvilAndGood.range`      |
| Detect Magic              | `ATL.detectionModes.detectMagic.range`            |
| Detect Poison and Disease | `ATL.detectionModes.detectPoisonAndDisease.range` |
| Detect Thoughts           | `ATL.detectionModes.detectThoughts.range`         |
| Devil's Sight             | `ATL.detectionModes.devilsSight.range`            |
| Divine Sense              | `ATL.detectionModes.divineSense.range`            |
| Ethereal Sight            | `ATL.detectionModes.etherealSight.range`          |
| Eyes of the Grave         | `ATL.detectionModes.eyesOfTheGrave.range`         |
| Hearing                   | `ATL.detectionModes.hearing.range`                |
| Life Sense                | `ATL.detectionModes.lifeSense.range`              |
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
| `Blood Sense`               | _Monster feat_                        | `Blutgespür`                   | `Perception du sang`                                                        | `Percepción de Sangre`            | `Percepção do Sangue`                             |
| `Detect Evil and Good`      | _Spell_                               | `Gutes und Böses entdecken`    | `Détection du mal et du bien`                                               | `Detectar el bien y el mal`       | `Detectar o Bem e o Mal` / `Detectar o Bem e Mal` |
| `Detect Magic`              | _Spell_                               | `Magie entdecken`              | `Détection de la magie`                                                     | `Detectar magia`                  | `Detectar Magia`                                  |
| `Detect Poison and Disease` | _Spell_                               | `Gift und Krankheit entdecken` | `Détection du poison et des maladies`                                       | `Detectar venenos y enfermedades` | `Detectar Veneno e Doença`                        |
| `Detect Thoughts`           | _Spell_                               | `Gedanken wahrnehmen`          | `Détection des pensées`                                                     | `Detectar pensamientos`           | `Detectar Pensamentos`                            |
| `Devil's Sight`             | _Warlock invocation / Monster feat_   | `Teufelssicht`                 | `Vision de diable` / `Vision du diable` / `Vue de diable` / `Vue du diable` | `Vista del diablo`                | `Visão Diabólica` / `Visão do Diabo`              |
| `Divine Sense`              | _Paladin feat_                        | `Göttliches Gespür`            | `Perception divine`                                                         | `Sentidos divinos`                | `Sentido Divino`                                  |
| `Echolocation`              | _Monster feat_                        | `Echolot`                      | `Écholocation` / `Écholocalisation`                                         | `Ecolocalización`                 | `Ecolocalização`                                  |
| `Eldritch Adept`            | _Feat_                                | `Schauerlicher Adept`          | `Adepte occulte`                                                            | `Adepto sobrenatural`             | `Adepto Místico`                                  |
| `Eldritch Invocation`       | _Warlock feat_                        | `Schauerliche Anrufung`        | `Invocation occulte` / `Manifestation occulte`                              | `Invocación sobrenatural`         | `Invocação Mística`                               |
| `Ethereal Sight`            | _Monster feat_                        | `Ätherische Sicht`             | `Vision éthérée` / `Vue éthérée`                                            | `Visión etérea`                   | `Visão Etérea`                                    |
| `Eyes of the Grave`         | _Cleric (Grave Domain) feat_          | `Grabesblick`                  | `Œil de la tombe`                                                           | `Ojos de la Tumba`                | `Olhos da Sepultura`                              |
| `Ghostly Gaze`              | _Warlock invocation_                  | `Geisterhafter Blick`          | `Regard fantomatique`                                                       | `Mirada fantasmal`                | `Olhar Fantasmagórico`                            |
| `Hollow One`                | _Supernatural Gift_                   | `Leerwandler`                  | `Celui-qui-est-creux`                                                       | `Aquel que está vacío`            | `Oco`                                             |
| `Life Sense`                | _Monster feat_                        | `Lebensgespür`                 | `Perception de la vie`                                                      | `Percepción de la Vida`           | `Percepção da Vida`                               |
| `Magic Awareness`           | _Barbarian (Path of Wild Magic) feat_ | `Magische Wahrnehmung`         | `Conscience magique`                                                        | `Conciencia mágica`               | `Percepção Mágica`                                |
| `Mind Blank`                | _Spell_                               | `Gedankenleere`                | `Esprit impénétrable`                                                       | `Mente en Blanco`                 | `Limpar a Mente`                                  |
| `Nondetection`              | _Spell_                               | `Unauffindbarkeit`             | `Antidétection`                                                             | `Indetectable`                    | `Indetectável`                                    |
| `See Invisibility`          | _Spell_                               | `Unsichtbares sehen`           | `Détection de l'invisibilité`                                               | `Ver invisibilidad`               | `Ver o Invisível`                                 |
| `Sense Magic`               | _Monster feat_                        | `Magie spüren`                 | `Détection de la magie` / `Perception de la magie`                          | `Sentir magia`                    | `Sentir Magia`                                    |
| `Shapechanger`              | _Monster feat / Subtype_              | `Gestaltwandler`               | `Métamorphe`                                                                | `Cambiaformas`                    | `Metamorfo`                                       |
| `Supernatural Gift`         | _Character Creation Option_           | `Übernatürliche Gabe`          | `Don surnaturel`                                                            | `Don supernatural`                | `Dom Sobrenatural`                                |
| `The Third Eye`             | _Wizard (Divination) feat_            | `Das dritte Auge`              | `Troisième œil`                                                             | `El Tercer Ojo`                   | `O Terceiro Olho`                                 |
| `Umbral Sight`              | _Ranger (Gloomstalker) feat_          | `Düstersicht`                  | `Vision des ombres`                                                         | `Visión en la umbra`              | `Visão Umbral`                                    |
| `Witch Sight`               | _Warlock invocation_                  | `Hexensicht`                   | `Vision de sorcier` / `Vision sorcière` / `Vue de sorcier` / `Vue sorcière` | `Visión bruja`                    | `Visão da Bruxa`                                  |

_Note: The automation is not case-sensitive._

_Note: You may use `'` or `’` for apostrophes._

_Note: In French the colon (`:`) is preceded by a space, but it isn't required in order for the automation to detect the feat. For example, both `Manifestation : Regard fantomatique` and `Manifestation: Regard fantomatique` work._
