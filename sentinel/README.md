# SENTINEL

A hidden mission-control theme for the live pages on arashnassirpour.com.

**Pages:** `/earthquake-dashboard/`, `/world-faults/` and `/world-faults/stats/`.

## Unlocking it

Any one of these, on any of the pages:

| Where | How |
|---|---|
| Keyboard | Konami code: `↑ ↑ ↓ ↓ ← → ← → B A` |
| Keyboard | Type `sentinel` with nothing focused (not available on the globe page, whose "type to search" shortcut takes the keys) |
| Phone | Tap the page title 7 times, quickly |
| Link | Add `?theme=sentinel` to the URL (`?theme=off` turns it back off) |

Once found it stays on across all three pages. `Esc` or the **EXIT** button in the HUD leaves it; a small
**SENTINEL** chip (bottom-left) lets you re-enter. The choice is remembered in `localStorage` (`sx-theme`, `sx-unlocked`).

## How it works

- `loader.html` is a ~1.5 KB inline script in each page's `<head>`. It does nothing (no network, no styles) until the
  theme is unlocked, so the normal pages are unchanged.
- `sentinel.css` / `sentinel.js` are fetched on demand. Everything in the CSS is scoped to `html.sx`.
- `sentinel.js` builds the boot sequence, the HUD bar, the toast and the chip, keeps `world-faults` on its own dark theme,
  and recolours the Chart.js charts on the stats page (all of it undone on exit).
- Respects `prefers-reduced-motion` (no boot animation, no sweep/radar) and `prefers-contrast`.

## Adding it to another page

1. Paste `loader.html` into the page's `<head>`.
2. Add the page to the `page` detection and `LABEL` / `BOOT_LINES` in `sentinel.js`.
3. Add a section to `sentinel.css` scoped with `html[data-sx-page="…"].sx`. Prefer overriding the page's CSS variables;
   for inline styles, match the colours with attribute selectors (see section 5 of the CSS).
4. Check contrast: paste `audit.js` into the console with the theme on (re-run after selecting another event, opening popovers
   or changing filters). Aim for no text under 4.5:1 and no leftover light surfaces.

When you change `sentinel.css` or `sentinel.js`, bump `V` in `loader.html` **and in every page that embeds it**, so
visitors don't keep a cached copy.
