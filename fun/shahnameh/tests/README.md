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

The harness uses the existing `#debug` interface and manually steps Phaser and tween clocks together. It never runs on the normal game page.
