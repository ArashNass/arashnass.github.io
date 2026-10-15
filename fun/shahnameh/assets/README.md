# Sprites for Shahnameh: Khan I

Each file is **one animation**: a single horizontal strip of **square frames**,
transparent background, character **facing right**. PNG.
Frame count is worked out from the image (width ÷ height), so any size works
(64×64 or 96×96 frames are good choices from PixelLab).

| File | What | Suggested frames |
|---|---|---|
| rostam-idle.png | Rostam standing, breathing | 4 |
| rostam-run.png | Running | 6–8 |
| rostam-jump.png | Frame 1 rising, frame 2 falling | 2 |
| rostam-attack.png | Swinging the ox-head mace (gorz) | 4–6 |
| rostam-hurt.png | Knocked back | 1–2 |
| lion-walk.png | Prowling | 6 |
| lion-run.png | Charging | 6 |
| lion-roar.png | Roaring | 2–4 |
| jackal-run.png | Jackal running | 4–6 |
| div-hop.png | Small blue Div hopping | 4 |

Rostam: tiger-skin coat (babr-e bayan) over chain mail, helmet made from a
Div's head, black beard, red trousers, ox-head mace.

To use a file, put it in this folder and set its name in `ART` at the top of
`../game.js`, e.g. `'rostam-run': 'rostam-run.png'`. Anything not set keeps
the built-in placeholder art.

## Other art (all made with PixelLab)

| Path | What |
|---|---|
| bg/far.png | Moonlit sky with Mount Damavand (Pixen), the far backdrop |
| bg/ruins.png | Ruined fire temple and columns (Pixen); crossfades in near the lion's lair |
| food.png | Pickups, 27px cells: roast lamb (restores a heart), pomegranate, naan, grapes (Pixen) |
| altar.png, feather.png, ui/heart*.png | Fire altar, Simurgh feather and HUD hearts, drawn with the PixelLab pixel workbench |
| ui/pomegranate.png | HUD provisions icon (cut from food.png) |
| tiles.png | 16px tiles: grass top, soil, tiled ledge, thorns |
| fx/*.png | PixelLab VFX strips (hit, swing, dust, pickup, poof, heal, stun, fire, fireflies, glow); frame sizes in `FX` at the top of game.js |
