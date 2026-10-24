# Story-moment artwork, October 2026

Added nineteen reviewed assets: Rostam sleep (4 × 224), Rostam rise (6 × 224), blue Div sleep (4 × 170), two 1672 × 941 story paintings, four seamless 480 × 270 parallax layers, seven transparent 32 × 32 item sprites, and three 64 × 64 portraits.

Character animation frames were generated in PixelLab from the existing characters. The sleep loops use a forward/back selection of real generated breathing frames. The rise strip selects six chronological frames. Frames were aligned to the existing ground baseline without rescaling their pixel grid; the blue Div input was padded for PixelLab and cropped back to 170 pixels.

The paintings, static item art, layers and portraits were generated with the built-in imagegen tool. Paintings use the existing Khan V outro and Khan VII introduction as character/style references. Static atlases were split into individual assets and prepared at the requested sizes; layer edges were matched and mist opacity reduced to protect gameplay readability.

The Olad capture painting precedes the existing Khan V outro. The noon painting precedes the existing Khan VII introduction. Their new captions currently have no recorded narration; the established narrated panels remain in place. Portraits appear in the Book of Foes. Projectile replacements are fitted to the previous runtime texture dimensions, preserving collision footprints.

## Still pending

- `rostam-lasso.png`: first PixelLab attempt rejected because the hero turns toward the camera in the middle frames. Do not use it in production.
- `k3/rakhsh-idle.png`: needs a new PixelLab generation.
- `k6/divwarrior-sleep.png`: needs a posed sleeping frame and breathing loop.

The available subscription/daily PixelLab balance was exhausted. No credits were purchased. Existing animations remain in use for those three pending cases.

## Validation

- PNG geometry/transparency checked for all nineteen files; matching left/right edge pixels checked on all four parallax layers.
- Nineteen focused browser checks passed: frame geometry, loop modes, painted texture loading, six original projectile footprints, and the blue guard's sleep/harmless/wake behaviour.
- All seven bosses completed in the core self-test, with no script errors and all 132 tested sound/picture files loading. One Khan IV serpent attack probe fails identically on the unchanged baseline; this art change does not resolve that pre-existing behaviour/test issue.
- Audio remained muted. No claim of real-device or human difficulty validation.
