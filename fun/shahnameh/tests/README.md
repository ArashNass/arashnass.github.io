# Local regression checks

Run `python3 tests/serve.py` from any directory. Open these URLs one at a time and wait for the report to complete:

- http://127.0.0.1:8770/selftest.html#selftest — all seven bosses, enemy collisions, checkpoints and assets.
- http://127.0.0.1:8770/regression.html#debug — controls, rewards, final save, audio, desert puzzle, normal-speed lion victory and rush timing.
- http://127.0.0.1:8770/audit.html#debug — story panels, progression, replay, checkpoints and rush transitions.
- `/fail-engine.html`, `/fail-game.html`, `/fail-tiles.html` — each should show a loading error with Try again.

The server binds only to localhost. The regression/flow pages reset storage on this dedicated port, and seed mute before loading; never use this port for real play. The JS harnesses refuse other origins. Production saves on the public website are separate. JSON results are saved under ignored `tests/results/`. Close each page before opening the next. The self-test restores existing `sh-*` storage in a finally block. These checks do not replace real-device touch/controller or human difficulty testing.
