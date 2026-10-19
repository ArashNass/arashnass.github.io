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
