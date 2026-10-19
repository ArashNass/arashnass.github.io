# Local regression checks

Run `python3 tests/serve.py` from any directory. Open these URLs one at a time and wait for the report to complete:

- http://127.0.0.1:8770/selftest.html#selftest — all seven bosses, enemy collisions, checkpoints and assets.
- http://127.0.0.1:8770/regression.html#debug — controls, rewards, final save, audio, desert puzzle, normal-speed lion victory and rush timing.
- http://127.0.0.1:8770/narration.html#debug — decode all new readings and check all tale pages, Listen/Stop, page changes and mute without audible output.
- http://127.0.0.1:8770/audit.html#debug — story panels, progression, replay, checkpoints and rush transitions.
- `/fail-engine.html`, `/fail-game.html`, `/fail-tiles.html` — each should show a loading error with Try again.

The server binds only to localhost. The regression/flow pages reset storage on this dedicated port, and seed mute before loading; never use this port for real play. The JS harnesses refuse other origins. Production saves on the public website are separate. JSON results are saved under ignored `tests/results/`. Close each page before opening the next. The self-test restores existing `sh-*` storage in a finally block. These checks do not replace real-device touch/controller or human difficulty testing.

## Boss regressions

Run `python3 fun/shahnameh/tests/serve-boss-regression.py` from the repository root, then open <http://127.0.0.1:8772/boss-fixes.html#debug> in a browser. Use the dedicated test origin; its local storage is reset. All sound is muted. Production saves are untouched. Stop the server with Ctrl-C.

The page reports each assertion and saves JSON in the system temporary directory as `shahnameh-boss-regression.json`. It must finish with `BOSS FIX REGRESSION COMPLETE`, every probe must have `pass: true`, and `errors` must be empty with no `error` field.

Coverage includes all seven bosses staying inside the arena for 30 simulated seconds at both 30 and 60 updates/second, real-time attack timing, blocked-hit reactions, stun safety, committed facing, post-death icicle cancellation, pounce anticipation, second-phase patterns, burrow scheduling, safe slam openings and out-of-world recovery.

Seven additional scenarios defeat bosses through actual player strike-box collisions without forcing damage, changing immunity or forcing opening states. The bot moves the player into range and raises player health/invulnerability to isolate completion. These scenarios establish reachability and damage integration, not human difficulty or enjoyment.

The harness uses the existing `#debug` interface and manually steps Phaser and tween clocks together using Phaser’s headless step (scene/physics updates without rendering every simulated frame). It never runs on the normal game page.

The boss suite also runs 21 seeded, 60-second behaviour profiles (seven bosses against ground pressure, repeated jumps, and stationary ledge play). Each must show at least two attack types and remain in bounds. It checks committed pounce targets, a real hit on a camping lion ledge, and the boss melee-impact cooldown. These checks describe decision variety and fair-mechanics integration; they do not score entertainment.

The accelerated boss suite skips darkness compositing, which is cosmetic but expensive even in a headless step. The core and general suites still exercise normal rendering.

## Lion movement audit

Run `python3 fun/shahnameh/tests/serve-lion-regression.py` and open <http://127.0.0.1:8773/lion-fixes.html#debug>. This dedicated muted origin clears only its own local save. The runner checks corner repositioning, directional wall detection, an airborne timeout, and reachable ledge choices; then runs twelve seeded 45-second scenarios at 30/60 Hz covering both corners, close pressure, crossing, and ledge camping. It also defeats the lion using actual player strike collisions.

Require `LION REGRESSION COMPLETE`, all 19 probes passing, and no errors. Results are written to the system temporary directory as `shahnameh-lion-regression.json`. The accelerated runner raises player health and places the player according to each policy; it verifies mechanics and state progress rather than human enjoyment.

For a normal-speed lion fight with normal health, open <http://127.0.0.1:8773/lion-play.html#debug> while this server is running. It skips the approach and starts in the lion arena, with audio disabled. This test route is local only.

The normal-speed arena preview also accepts `?boss=2` through `?boss=7` before `#debug`, for example <http://127.0.0.1:8773/lion-play.html?boss=3#debug>. These local previews skip each labour's approach but retain normal player health and combat speed.

The boss suite now includes 96 probes: Queen rear-player tracking and honest eruption cues; dragon directional lunges, pinned movement and flame-safe recovery; witch committed casting, reflected-curse stagger and bounded teleport placement; Olad boundary footwork, ledge choices and clear guard-down cues; directional Div charges, Arzhang's committed stomp and per-blow combo cues; and the White Div's post-ice punish window after actual hazards expire.

## Regular-enemy crowding

Run `python3 fun/shahnameh/tests/serve-enemy-regression.py` and open <http://127.0.0.1:8774/enemy-fixes.html#debug>. This isolated muted origin clears only its own test storage. Require `ENEMY REGRESSION COMPLETE`, all probes passing, and no errors. Results are saved in the system temporary directory as `shahnameh-enemy-regression.json`.

The runner uses actual Arcade bodies at 30/60 Hz: identical/mixed-size exact-center spawns, body/sprite synchronization, a wall, a pit edge, a committed attacker, active three-enemy packs, and attacks/damage against the player. Static separation scenarios temporarily freeze movement intent while keeping real physics active, so the movement policy cannot hide overlap bugs. Active pack and damage scenarios use normal enemy AI.

For a muted normal-speed mixed-pack preview, open <http://127.0.0.1:8774/enemy-play.html#debug> with that server running. It places a deliberately overlapping trio on the first labour’s open ground and retains normal player health.

## First-labour encounter pacing

Run `python3 fun/shahnameh/tests/serve-labour-one.py` and open <http://127.0.0.1:8776/labour-one.html#debug>. All 13 probes must pass, ending with `FIRST LABOUR COMPLETE`; results are saved as `shahnameh-labour-one.json` in the system temporary directory. The isolated muted runner checks encounter grouping, three safe checkpoints, three optional feathers, quiet areas, healing placement, enemy roaming at 30/60 Hz, contextual cues, and a traversal from spawn through the lion victory using real movement/jump/strike inputs. Health is raised to isolate progression, so this is not a difficulty score.

For a normal-health playthrough from the beginning, open <http://127.0.0.1:8776/labour-one-play.html#debug>. It skips the story introduction for testing but retains the normal map, enemies, pickups and player health. Audio remains disabled.

All-labour encounter audit: `python3 fun/shahnameh/tests/serve-encounters.py`, then open `http://127.0.0.1:8777/encounters.html#debug`. This isolated, muted origin clears only its own test save and writes results to the system temporary directory as `shahnameh-encounters.json`. Covers map-foe assignments, safe checkpoint floors, optional feathers, 30/60 Hz encounter containment, checkpoint safety, contextual cues, input-based terrain traversal, and the flyer dive warning. Traversal bots use raised health, filled water, and bypass the horde/puzzle; run the core, boss, enemy-spacing and flow suites as well to verify combat and progression. Normal-health muted previews: `/encounters-play.html?level=2#debug` through `?level=7#debug`.

Gameplay-feel and optional-trial audit: `python3 fun/shahnameh/tests/serve-entertainment.py`, then open `http://127.0.0.1:8778/entertainment.html#debug`. This dedicated origin is muted and clears only its own test save. Results go to the system temporary directory as `shahnameh-entertainment.json`. Checks input buffering at 30/60 Hz, pause clearing, perfect-dodge rewards and counter damage, heavy interruption/recovery, normal-input reachability for every trial, failure/timeout/retry and first-clear reward rules, horde spawn warnings, and coordinated attackers. Reachability bots start at each trial marker with raised health/invulnerability; failure and reward behavior have separate tests. Use `/entertainment-play.html?level=1#debug` through `?level=7#debug` for paused, muted normal-health previews at trial markers. The main journey remains playable without accepting any trial.
