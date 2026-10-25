# Labour I — hands-on QA, 25 October 2026

Tested local `?live#debug`, normal health, normal speed, ordinary movement/combat inputs. Audio muted, narration volume zero. The inspection controller pauses between input sequences; it does not teleport, damage foes directly or raise health. Two complete runs: careful collection and faster traversal. The final wave-entry change also received a fresh route-to-stand regression through all three waves. No script errors recorded.

## Findings and fixes

- Thinning left seven fixed provisions and one earned lamb: no spare margin for the eight-provision Rakhsh threshold. `buildMap()` now places thirteen provisions explicitly; Labour I bypasses blanket thinning.
- Automatic feather conversion consumed food and omitted the final third. `LEVELS[1].feathers` now specifies three separate feathers, before the boss entrance, without consuming provisions.
- Wave recovery was measured from spawn, so a slow clear could start the next wave immediately. `standTick()` starts a 1.7-second recovery after observing the clear.
- Camping at the right wall made the fallback spawn a jackal close behind Rostam. `waveSpot()` reserves clear entries, and `waveClear()` checks again after the warning. The final regression recorded eight wave entries: minimum player distance **7.43 tiles**, minimum other-foe distance **2 tiles**. Pending entries prevent premature wave completion.
- A large rage-fire effect obscured the lion. The shared rage overlay and lion roar rings were removed; boss-bar text, body tells, dazed stars and actual attack/death effects remain.
- The last provision was moved from column 84 to 83 to separate it from the pre-boss heart at column 85.

## Pickups

Coordinates below are map cells (zero based); item centres are at column + 0.5. Every provision route was reached in normal play without a lasso. The final one-cell shift to column 83 retains the same flat, accessible bank.

| Cell | Kind | Reach proof |
| --- | --- | --- |
| 8,12 | rotating food | Walk along starting ground |
| 12,12 | rotating food | Walk after first jackal |
| 19,12 | rotating food | Walk before jumping the gap |
| 26,12 | rotating food | Land beyond the first gap |
| 39,12 | rotating food | Walk after paired jackals |
| 43,12 | rotating food | Walk past the Div |
| 48,12 | rotating food | Walk into the fire clearing |
| 57,12 | rotating food | Walk through the cleared stand |
| 62,9 | rotating food | Jump onto the first sinking raft |
| 67,8 | rotating food | Air jump from the marsh crossing |
| 75,8 | rotating food | Land on the row-10 reed ledge |
| 80,5 | roast lamb | Jump from row-10 ledge to row-7 ledge |
| 83,12 | rotating food | Drop onto the far bank; walk back if overshot |
| 53.125,13.5 (world tiles) | earned roast lamb | Drops on flat ground after the stand |
| 85,ground | heart | Walk before the lion encounter |
| 24,10 | hidden feather | Jump across the first gap |
| 69,3 | hidden feather | Double jump to the row-5 high reed ledge |
| 87,11 | hidden feather | Walk before the encounter trigger at column 88 |

**Reachable provisions: 13/13 fixed, plus the stand lamb (14 total), excluding streak, champion and optional-trial rewards.** The careful run also collected the high lamb; the faster run finished with four hearts. All three hidden feathers were confirmed collected on the journey before the second boss fight.

## Fire stand and animations

- Arena columns 40–60: 20 tiles wide; its playable ground is flat. Waves contain 2, 3 and 3 foes.
- Flame centres span 225 world pixels; overlapping flame art extends roughly 243 pixels from the floor. The theoretical unupgraded double-jump rise is 151.24 pixels; Wings of the Simurgh reaches 179.90 pixels. Position bounds also prevent an airborne escape. A double-jump attempt at the right wall remained inside (Rostam centre 59.2, right boundary 60).
- Walls faded out and the lamb appeared after the final foe; no wave remained stuck or completed while entries were pending.
- Lion walk/run/roar/pounce/swipe/dazed/death frames are all 279 pixels; the fitted frame height stayed 148 in observed states. Rostam's 224-pixel strips stayed 112. Rakhsh's 229-pixel strips all share `RAKHSH1`; no frame-size correction was needed.

## Limits

Two successful playthroughs and targeted checks do not establish that every random attack sequence is bug-free. The narrow stand configurations in later labours still need their individual gameplay pass; the shared entry helper scales its player clearance to available arena width. No later labour is counted as completed by this report.
