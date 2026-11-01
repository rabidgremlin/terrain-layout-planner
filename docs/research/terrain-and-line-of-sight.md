# Terrain and line of sight across games

Research checked 1 November 2026. These examples explain future modelling needs; they do not expand the first release beyond its agreed Firefight planning approximation.

## Source scope

- **Warhammer 40,000, 11th edition:** official terrain overview dated **8 April 2026**. The publisher's **1 June 2026** announcement identifies the new rules as 11th edition. Findings below come from the overview, not a verified reading of the core PDF: the web reader rejected its 32 MB download. They therefore illustrate the announced design, rather than establish the complete current rules or subsequent errata. [Terrain overview](https://www.warhammer-community.com/en-gb/articles/xlppkx5s/new40k-take-cover-with-updated-terrain-rules/), [edition announcement](https://www.warhammer-community.com/en-gb/articles/nhqt9wx3/new40k-rules-download-the-free-core-rules-now/).
- **Infinity N5.3:** official living rules wiki, displaying N5.3 and FAQ v0.1 notices when checked; the publisher announced N5.3 on **1 September 2026**. Wiki section links below identify the rules consulted. [N5.3 announcement](https://infinityuniverse.com/en/news/infinity-rules-update-5-3).
- **BattleTech: Alpha Strike:** **box-set Quick-Start Rulebook, third printing**, copyright **2025**, hosted under the publisher's January 2026 download path. This is the introductory rules subset, not a claim about the latest Commander's Edition. Page references use printed page numbers. [Official PDF](https://battletech.com/wp-content/uploads/2026/01/Alpha-Strike-Box-Set-Quick-Start-Rulebook-3rd-Print-12-29a.pdf#page=1).

## Sourced findings

### Warhammer 40,000: footprint effects coexist with physical scenery

The overview separates physical **terrain features** from **terrain areas**, their affected footprints. Obscuring areas prevent seeing entirely through them; physical features still determine visibility into and out of areas. Eligible Infantry, Beast and Swarm models can be Hidden in terrain, depending on whether their unit shot in the current or preceding player turn; enemy detection range is usually **15 inches**. This makes visibility depend on distance and history as well as terrain. Cover and elevated Plunging Fire separately affect shooting; the illustrated elevation threshold is **3 inches**. [Official overview, terrain areas, Hidden and Obscuring, and Plunging Fire sections](https://www.warhammer-community.com/en-gb/articles/xlppkx5s/new40k-take-cover-with-updated-terrain-rules/).

### Infinity: standard silhouettes and independent terrain properties

Troopers occupy fixed cylindrical volumes defined by base width and silhouette height, rather than their sculpt's pose. Ordinary LoF requires a target in the observer's front **180°** and an unobstructed view of at least a **3 × 3 mm** part of its volume. [Silhouettes](https://infinitythewiki.com/Silhouettes), [Line of Fire](https://infinitythewiki.com/Line_of_Fire).

Low and Poor Visibility apply **−3/−6** modifiers to relevant rolls into, out of, or through a zone; they do not inherently prevent LoF. Zero Visibility ordinarily prevents all three, with a specified exception for responding to an attack. Multiple visibility penalties use the most restrictive one instead of accumulating. White Noise affects specified skills/equipment rather than every observer. Multispectral Visors can change how other visibility zones affect a trooper. [Visibility Conditions](https://infinitythewiki.com/Visibility_Conditions), [Multispectral Visor](https://infinitythewiki.com/Multispectral_Visor).

Partial Cover separately requires contact with scenery that partly obscures the target's silhouette and changes attack and saving rolls. Optional Special Terrain combines type, movement difficulty, saturation and visibility; its height is infinite unless specified otherwise. A wooded area can therefore carry several independent effects. [Ballistic Skills, Cover](https://infinitythewiki.com/Ballistic_Skills#Cover), [Terrain and Scenery Structures, Special Terrain](https://infinitythewiki.com/Terrain_and_Scenery_Structures#Special_Terrain).

### Alpha Strike: physical visibility plus accumulated woodland depth

The QSR uses miniature eye-level visibility. Solid terrain blocks LOS when **less than one third** of the target is visible. Non-solid obstructions such as woods instead block after LOS traverses **6 inches or more** of intervening terrain. Intervening miniatures do not block LOS. Elevation matters: its example distinguishes a target hidden by a ridge from a higher flying target. [QSR, p. 17, Verify Line of Sight and accompanying diagram](https://battletech.com/wp-content/uploads/2026/01/Alpha-Strike-Box-Set-Quick-Start-Rulebook-3rd-Print-12-29a.pdf#page=17).

Woods can impose a shooting modifier without granting partial cover. The woods modifier distinguishes terrain near the attacker from terrain occupied by the target. Partial cover instead uses the amount of a miniature hidden by solid terrain; shallow water also grants it. [QSR, pp. 18–19, Terrain Modifiers and Partial Cover Modifier](https://battletech.com/wp-content/uploads/2026/01/Alpha-Strike-Box-Set-Quick-Start-Rulebook-3rd-Print-12-29a.pdf#page=19).

## Design implications — inference and recommendations

These are application design conclusions drawn from the examples above, not additional game rules.

| Distinction | Why clear / blocking / dense alone is insufficient |
| --- | --- |
| Physical obstacle versus area effect | A solid wall and an obscuring footprint can both interrupt a ray, but seeing into or out of them follows different rules. Windows and gaps need additional geometry. |
| Depth versus crossing | Crossing any woods footprint is different from accumulating a specified distance through woods. Separate patches may contribute to the same depth calculation. |
| Visibility versus cover | A visible target may receive protection or attack penalties. A cover tag should not automatically block LOS. |
| Height and model volume | A footprint does not describe a ridge, upper floor, silhouette, or the fraction of a target exposed. |
| Observer and state | Facing, sensors, unit categories, distance and shooting history cannot be inferred from a terrain polygon. Visibility can be directional. |

Keep the first release's explicit **clear, blocking and dense** behaviours. Firefight dense means seeing into/out of a footprint while preventing sight through it to a target beyond; it should not silently acquire another game's depth threshold or attack modifiers. Continue labelling results as a **2D planning approximation**, using the supplied Firefight v3.6.0 as its source rather than these other systems. [Existing Firefight source findings](../design.md#firefight-source-findings).

Keep footprint geometry, descriptive tags, selected visibility behaviour and game preset identity separate in saved application data. Let a game-specific visibility policy interpret geometric queries; avoid building the meaning of every game's terrain into colour or a global tag-name switch. A future policy could consume endpoint containment, crossed intervals and total distance within terrain. Optional height, observer/target traits and contextual state can be added when a supported planning use case requires them; do not add model tracking merely to claim exact rules support.

Version game policies and their source references. Adding a new system should make its approximation and unsupported distinctions explicit, instead of implying that a shared three-choice menu faithfully adjudicates all games.
