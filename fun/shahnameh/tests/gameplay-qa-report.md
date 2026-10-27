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

# Labour II — hands-on QA, 26 October 2026

Two normal-speed route passes reached the restored spring: careful collection (one heart remaining) and faster traversal (two hearts remaining, with one ordinary well-checkpoint retry). Both muted. No recorded script errors. The faster route intentionally skipped optional ledge pickups; it was not a no-death speedrun.

## Findings and fixes

- `map2()` now places thirteen fixed provisions deliberately, with separate feathers; Labour II bypasses blanket thinning. Three lambs precede the well fight and difficult crossings.
- The well arena widened from twelve to sixteen tiles (49–65), with a flat row-13 floor. The resident jackal starts above the floor; its clearance precedes the incoming waves rather than adding an extra attacker to them.
- Moved the buried scorpion before the clearing, removed the immediately adjacent vulture, separated the storm heart from food, and raised two water skins clear of their ledges.
- `fireStand()` / `standTick()` count resident foes and preserve the post-clear delay. Checkpoint restoration restarts an unfinished stand; a completed stand is marked in `resumeAt` so it is not repeated.
- A lit well now refills water when revisited. Returning during defence visibly restored water to 100; leaving it still drains water normally.
- `flyer()` now gives a half-second warning and contact damage only during the actual dive, leaving circling and recovery safe. Vultures remained killable by ordinary mace attacks.

## Reachable pickups

All thirteen fixed provisions were collected in the careful run, without a lasso. Snapshot inventory at the end contained only an uncollected bonus champion lamb, not a fixed-route pickup.

| Cell | Route |
| --- | --- |
| 9,12 | Walk starting ground |
| 21,11 | Walk up dune before gap |
| 28,10 | Jump across first gap |
| 46,8 — lamb | Jump onto row-10 perch |
| 51,11 | Walk into flat well clearing |
| 60,11 | Walk during well defence |
| 73,12 | Land beyond post-well gap |
| 77,9 — lamb | Jump onto raised dune |
| 89,11 | Walk across sand |
| 94,10 — lamb | Hop onto raised ground |
| 109,12 | Walk past second well |
| 123,12 | Walk after storm vulture |
| 136,12 | Walk following ram |

Water skins: (23,11), (44,8), (100,8), (116,11), (132,12), all collected. Hearts at columns 112 and 142, both reached; the latter by double-jumping onto the corner ledge. Feathers (29,8), (92,8), (137,9), all collected using ordinary jumps/double jumps. **13/13 fixed provisions reachable, plus the earned stand lamb**, excluding champion/streak rewards.

## Stand, boss and limits

- Arena 49–65 is sixteen tiles wide and flat. Same continuous flames as Labour I: centres span 225 px versus theoretical double-jump rise 151.24 px (179.90 px upgraded). Position bounds also retain airborne players.
- The retry test reproduced the unfinished stand with normal health, rather than silently removing it. All three waves subsequently cleared and walls fell; the earned lamb healed Rostam.
- Ram prayer, leading, pawing and sand-heave sequence preceded both Queen fights. No early Queen was observed. Both fights were won with ordinary attacks and movement; reflected venom and post-emergence openings caused damage as described by the hints. The faster run received the earned Rakhsh assist.
- Queen strips remain 256 px per frame and fitted height 150 in observed emerge, walk, sting, spit, underground and exposed states. Underground cropping is intentional; it does not rescale her.
- Rushing the well fight caused a death. This is recorded rather than concealed: the test demonstrates recovery, not guaranteed survival or a universal difficulty assessment. Later labours still require their own pass, including shared flyer and checkpoint regressions.

# Labour III — hands-on QA, 26 October 2026

Careful collection reached all thirteen fixed provisions and three separate feathers. Early stand attempts required ordinary checkpoint retries; these failures are retained in the QA captures. The final faster regression on the completed fixes ran from the starting point to victory without a death, finishing with three hearts. All movement, attacks, jumps and Farr calls used normal inputs, normal speed and earned resources; audio remained muted. No recorded script errors.

## Findings and fixes

- `map3()` and `LEVELS[3].feathers`: seven fixed provisions after thinning/conversion were insufficient. Thirteen deliberate provisions now survive, with feathers placed independently. Lamb at (79,9) gives a recovery opportunity before the night stand.
- Removed the bat posts at columns 74 and 95: they crowded the stand's approach and final crossing. The three-wave fight retains its own bats and jackals.
- `FOES.jackal.init`: contact during stalking/crouching now stays harmless; only an unspent committed lunge damages. Jumping that lunge and countering recovery worked in play. Shared later jackals require their later-labour regression.
- `LEVELS[3].update`: waits for grounded feet before starting the dragon warnings; crossing the trigger airborne no longer starts a rearing pose in midair.
- Player attack start clears `ride-rear`, allowing the mounted strike to interrupt the cosmetic warning pose. Observed `pose:null` with `ride-strike` in the final fight.
- `startDragon()`: body contact damages only during the committed lunge. Breath and fireballs retain their own hazards. This removed damage from mere overlap during reveal/repositioning; the final fight still lost two hearts to attacks.

## Pickups

| Cell | Normal route |
| --- | --- |
| 8,12 | Ride starting ground |
| 19,10 | Jump onto raised dune |
| 29,8 | Jump onto first pit ledge |
| 38,12 | Ride beyond jackal |
| 47,10 | Jump onto raised bank |
| 55,12 | Ride before broken crossing |
| 61,7 — lamb | Jump across the upper crossing |
| 70,12 | Ride beyond pack leader |
| 79,9 — lamb | Jump onto raised bank before stand |
| 86,12 | Ride into clearing |
| 95,8 — lamb | Jump onto last pit ledge after stand |
| 100,12 | Drop onto final bank |
| 109,12 | Ride off the raised fire platform |

**13/13 fixed provisions reachable, plus the earned stand lamb.** The careful snapshot at column 109.8 had no remaining fixed food; only the last feather remained, then collected before the entrance. Feathers (30,6), (79,6), (110,10) were reached by jumps/double jumps without a lasso. The heart at column 105 was reached by jumping onto the raised platform.

## Stand, sizes and limits

- Arena 81–93: twelve tiles wide, flat row-14 floor. Flame centres span 225 px versus maximum double-jump rises 151.24 px base / 179.90 px upgraded; positional bounds also retain the rider. Walls faded after the final kill and the lamb healed normally.
- Three waves cleared with no pending-entry deadlock. Alternating directions, jumping dives and jumping the leader's lunge all worked; blindly repeating attacks in the wrong direction caused earlier deaths. The final pass used earned Farr against the final leader.
- All dragon strips are 257 px per frame and fitted height stayed 136 across observed lurk, reveal, lunge, breath, fireball, exposed and death states. Rider strips are 282 px and retain SIZE.rider. Complete ART frame/fit table: `gameplay-sprite-sizes.md`.
- Scripted dragon chase and marked fire remain dangerous during the road. Stopping in marked fire caused damage, while riding through it cleanly avoided that damage. This pass does not certify every random boss sequence or every future upgrade combination. Labours IV–VII remain outstanding.

# Labour IV — hands-on QA, 26 October 2026

Two complete muted playthroughs reached the ending: the collection run finished with three hearts and the second with four. Earlier failed attempts exposed checkpoint and combat issues and are retained in the local QA captures. The careful inventory confirmed thirteen fixed provisions and three feathers collected; remaining food consisted only of bonus lamb drops. No recorded script errors.

## Findings and fixes

- `map4()` now places thirteen provisions explicitly, independently of feathers. Lambs at (72,7), (81,10) and (109,12) support the crossings, stand and boss approach. Labour IV bypasses blanket thinning.
- Removed the row-10 ledge inside the stand at columns 96–100. Arena 91–110 is nineteen tiles wide, flat and unobstructed. Moved the final checkpoint fire from 107 to 112: the old fire was inside the active arena and could replace its checkpoint before the waves were finished.
- `FOES.serpent`: holds a raised-head warning for 450 ms, then lunges in its committed direction. Resting/winding-up contact is harmless; the lunge and jaws remain damaging. Animation completion creates a 70-frame recovery. The existing heavy/lasso cancellation flags prevent an interrupted tell from becoming stuck.
- Baiting the tell from four to five tiles, jumping the lunge and countering its landing repeatedly worked. The first two stand waves were cleared without health loss on both completed regression routes; the second final wave cost one heart. Remaining healing pickups restored health before the witch.
- `feastStory()` positions Rostam beside the ground-level feast instead of carrying his balcony height into the tanbur scene. The second route visibly placed him on the ground beside the table.
- `bossFall()` disables remaining summoned foes before the victory walk and clears hazards/projectiles. Previously a surviving serpent caused damage after the witch had died. A focused test verifies the cleanup call; the second ending had no surviving active foe or further damage.
- `foeSpot()` now places witch summons on safe ground at least six tiles from Rostam and two from other foes. The recorded failure case (player 134.4, attempted summon 136.8) is covered by a focused geometry test. This last placement change was unit-tested after the two complete routes; it has not received a third complete playthrough.

## Pickup reachability

| Cell | Route |
| --- | --- |
| 10,8 | Double jump onto starting shelf |
| 22,10 | Jump onto first raised bank |
| 30,12 | Walk beyond second serpent |
| 37,9 | Jump onto permanent ledge above living bridge |
| 45,8 | Vertical double jump from ground onto upper shelf |
| 55,10 | Jump the two-tile bank |
| 59,12 | Walk before crossing serpent |
| 69,8 | Jump onto lower crossing ledge |
| 72,7 — lamb | Hop to upper crossing ledge |
| 81,10 — lamb | Jump onto raised bank before stand |
| 94,12 | Walk into stand |
| 101,12 | Walk through cleared resident position |
| 109,12 — lamb | Walk to right side of stand |

**13/13 fixed provisions reachable, plus the earned stand lamb.** Feathers (12,6), (71,5), (111,10) were reached with jumps/double jumps; no lasso was required. Heart 105 was collected on flat arena ground. Optional champion and streak rewards are excluded from the fixed count.

## Walls, animation and limits

- Flame centres span 225 world pixels (roughly 243 including the art), versus theoretical double-jump rises of 151.24 base / 179.90 upgraded. Positional bounds retained Rostam until all waves cleared. Walls then faded and the reward appeared normally.
- Beauty, transformation, hag, vanish, dazed and death frames are all 225 px. Observed fitted height remained 108. Reflected curses dazed and damaged the witch; direct attacks worked while she was solid; teleport and serpent summons occurred only after unmasking.
- Living bridges still vanish after their violet warning. Waiting on one caused damage; crossing without stopping avoided that failure. Earlier deaths from mistimed approaches and attacks facing away are not treated as engine failures or hidden.
- The final summon-placement guard has focused unit coverage rather than a third complete route. This report does not certify every random attack sequence. Labours V–VII and the final live regression remain outstanding.


# Labour V — hands-on QA, 26 October 2026

Two muted routes reached the ending: the collection route finished with four hearts; the faster route finished with two after a normal boss-checkpoint retry. Earlier deaths are retained in local captures. No recorded script errors. The faster run deliberately skipped optional food and feathers; the collection route recorded all three feathers.

## Findings and fixes

- `map5()` places thirteen fixed provisions and separate feathers, bypassing blanket thinning. Lambs at (56,7), (84,7), (104,12) support difficult crossings and the stand.
- `STANDS[5]` expands 99–111 to 97–113, a flat sixteen-tile arena. Removed the 102–106 ledge. The old twelve-tile arena could delay queued entries until Rostam moved, with only 4.72 tiles of clearance. The final eight-entry capture records minimum player clearance **6.031 tiles**, minimum foe clearance **2.104 tiles**; all three waves completed. No overlapping entries or wave deadlock in the final pass.
- Moved the final resident spear guard to column 102 and the heart to 109, separating them from the stand approach and lamb.
- Spearmen hold a visible raised-spear pose for 450 ms, commit their thrust direction and recover for 70 frames. Only the active thrust hurts on contact. Jumping over the thrust and countering worked; charging straight into it still costs health.
- Olad enters only after column 114 with Rostam grounded. Sword warnings hold a visible raised weapon; knife warnings advance through the draw frames. Intent remains in the boss bar. All observed Olad states retained fitted height 92 (233-pixel frames).
- A knife parry at roughly four tiles returned damage and opened his guard without harming Rostam. Shield-facing attacks were blocked; jumping behind him and attacking during openings worked. The final retry ended with two hearts. Blindly charging or attacking away from him caused failed attempts.
- `oladYields()` clears remaining road foes and projectiles and stages Rostam three tiles beside the kneeling captive. The second ending verified their separation, normal lasso-key binding, guide movement and completion feather. A cleared stand stayed cleared after the boss retry.

## Pickup reachability

| Cell | Normal route |
| --- | --- |
| 9,12 | Walk starting ground |
| 20,12 | Walk after first spear guard |
| 25,11 | Jump the raised bank |
| 30,10 | Jump onto second bank |
| 40,12 | Walk beyond mixed patrol |
| 47,8 | Jump onto crossing shelf |
| 56,7 — lamb | Double jump onto high shelf |
| 65,10 | Drop to lower shelf |
| 73,12 | Walk beyond the spear approach |
| 84,7 — lamb | Double jump onto upper bank |
| 90,12 | Drop beyond guard |
| 94,10 | Jump to bank before stand |
| 104,12 — lamb | Walk into clearing |

**13/13 reachable**, collected across the careful route and its normal fire-checkpoint retry. Feathers at (48,6), (57,4), (110,10) were collected using jump/double jump without needing the newly earned lasso. The faster route collected enough to earn Rakhsh's boss aid.

Flame centres span 225 px (roughly 243 with art), versus maximum double-jump rises 151.24 base / 179.90 upgraded. The stand bounds retained Rostam until completion, then dropped normally and released the earned lamb. Capture `labour-V-1793041256047.json` records the final arena entries; later captures record separated surrender. These checks do not certify every random boss sequence. VI–VII and the final live regression remain outstanding.

# Labour VI — hands-on QA, 26 October 2026

Two complete muted routes reached the ending, with three and two hearts. The second horde ended at five hearts. Earlier startup/pickup attempts and the overlapping-wave failure were retained in local captures. No script errors recorded.

- Fixed a real first-wave race: `hordeTick()` could start wave one before the 900 ms callback, which then started wave two over it. Five foes were observed together. Startup now blocks the tick until its scheduled wave begins.
- Horde entries reuse reserved, warned positions with a post-warning clearance check. Pending entries cannot count as cleared waves. Each clear has a 1.7-second breather. All six waves completed twice without deadlock; the second capture recorded sixteen entries including the bat, minimum player distance **7.580 tiles**, minimum foe distance **2.469 tiles**. Maximum wave size is three, plus the single bat.
- Div warriors and ghuls now hold a 450 ms warning before their committed strike/leap. Body contact during warning/recovery is harmless. The second road pass countered the last warrior without losing health; earlier always-damaging contact had cost multiple hearts during recovery.
- `map6()` places thirteen fixed food pickups with separate feathers; blanket thinning is bypassed. All thirteen were reached across the collection attempts and completed route. The faster route skips some. Optional lasso-ring supplies and champion/streak drops are excluded from the fixed count.
- Both war drums can be broken by normal strikes on the high platform. Olad moves, attacks and fades after the horde. The right gate opens after the last foe. The remaining left gate holds normally.
- Arzhang's entrance now requires grounded Rostam. Observed walk, raise, smash, stomp, rest and death states retain fitted height 136 with 259-pixel frames. Stale warning text is cleared during axe recovery. The first fight took roughly 27 seconds of active controls after the first observed axe sequence; this is a verified completion, not a claim that every careful player will take 1–3 minutes. Missed floor/high-band warnings still cost health. Ordinary mace attacks during recovery killed him in both routes.
- Floor fire runs across the 30-tile arena after the red warning; the corner platform provides refuge from floor strikes, while high sweeps require dropping. The second pass deliberately mistimed these and lost health; the warnings did not produce unmarked damage. No art, music or narration changes.

| Fixed food | Reach |
| --- | --- |
| 9,8 | Double jump onto first platform |
| 16,7 | Jump from first platform to higher shelf |
| 22,10 | Drop onto raised bank |
| 32,12 | Walk after first warrior |
| 39,8 — lamb | Jump from crossing's lower shelf |
| 45,12 | Walk past first checkpoint |
| 57,12 — lamb | Walk before gates |
| 72,7 | Double jump to horde platform |
| 82,12 | Walk out of horde |
| 90,10 | Jump onto bank |
| 97,7 — lamb | Jump/double jump onto crossing shelf |
| 104,12 | Walk before final bank |
| 120,12 — lamb | Walk before boss |

Feathers (16,5), (74,6), (108,8) were reached by jumps without lasso; the first completion recorded 3/3. The horde gates use tall full-height positional bounds rather than the smaller fire-stand walls. Shared stands retain 225-pixel flame-centre height against 151.24/179.90-pixel maximum double jumps. The high horde platform is intentionally retained as a taught combat refuge. Focused tests cover startup, pending entries, breather timing, food count and harmless recovery contact. VII and the final live regression remain outstanding.

# Labour VII — hands-on QA, 26–27 October 2026

Two routes reached the White Div's death, king rescue and final story ending, with two and four hearts. The faster route required normal sacred-fire retries after failed stand attempts; these failures are retained, not presented as clean runs. The final retry cleared the stand at three hearts. No recorded script errors.

- Expanded the mountain stand from 41–53 to **41–58**, seventeen tiles, and flattened the raised bank at 53–56 to the same row-13 floor. Three waves completed on both routes; the final capture records minimum entry distance **6.069 tiles from Rostam / 2 tiles from another foe**. Pending entries waited for clear ground and then arrived, with no deadlock.
- Placed thirteen fixed food pickups and independent feathers. Removed the last blanket thinning rule: all seven labour maps now use deliberate provisions. Moved the cave-approach food off the column of the guard at 116.
- Blue Divs previously damaged Rostam on resting contact and gave only a 250 ms wind-up. Failed stand attempts exposed the cost of their overlapping contact/recovery. They now warn for 450 ms, commit their facing, and hurt on contact only during the pounce. The final retry killed the second-wave blue Div without losing health to its resting body. A bat dive still caused damage when the counter was late; facing away or waiting through an attack still fails.
- Div warriors step back when within 32 px of Rostam during recovery, reducing the overlap observed beside the ice seal. The faster cave pass countered both sleepers and broke the seal normally. Sleeping hits, wake-up, crumbling platforms, their recovery, the final cave checkpoint and grounded White Div entrance were exercised.
- White Div warning text now clears when his club is stuck. Observed walk, raise, slam, stuck, roar, spent and death states stayed at height 204 (384-pixel frames). Moving off marked ice avoided its strikes; attacks during stuck/spent openings damaged him. Standing in a blue floor warning or marked ice caused health loss. Throw and charge variants were not both sampled in these two random fights; the ART audit confirms their consistent frame sizes, not every possible combat sequence.
- After death, remaining foes/projectiles were cleared. Walking to Kay Kavus triggered the anointing animation, rescue and ending in both completed routes. No art or sound files changed in this gameplay pass.

| Fixed food | Reach |
| --- | --- |
| 10,12 | Walk starting ground |
| 24,8 — lamb | Jump up the stepped mountain |
| 31,11 | Drop behind first warrior |
| 38,8 | Double jump across first gap |
| 47,11 | Walk into stand |
| 55,9 — lamb | Jump from flat stand floor |
| 62,12 | Walk beyond stand |
| 79,11 | Walk across raised bank |
| 94,12 | Walk to checkpoint before jumping |
| 102,7 — lamb | Double jump across cracking shelves |
| 114,12 | Drop off bank before cave checkpoint |
| 128,10 — lamb | Jump onto cave bank |
| 141,12 — lamb | Walk after sleeping guards |

**13/13 were reached across the collection route and faster/retry route**; (94,12) was skipped on the first route and collected on the second. Feathers (25,6), (87,8), (128,7) were reached by jumps/double jumps; all three were recorded in the first completed route. Optional lasso-ring supplies and earned drops are separate from the fixed count. Stand flames span 225 px at their centres (about 243 including art), against maximum double-jump rises 151.24 base / 179.90 upgraded. Positional bounds retained Rostam until the last foe died, then the flames faded and the lamb appeared.

The final live Labour I regression and a follow-up of Labour III's narrower entry clearance remain pending. This report is evidence of sampled playthroughs and fixes, not a claim that every random sequence or upgrade combination is flawless.
