# SENTINEL

A hidden mission-control theme for the live pages on arashnassirpour.com.

**Pages:** `/earthquake-dashboard/`, `/world-faults/` and `/world-faults/stats/`.

## Choosing it

Each themed page has a **Theme: Standard | Sentinel** switch (bottom-left). The choice is remembered in `localStorage`
(`sx-theme`) and shared by the three pages. `Esc` or the **EXIT** button in the HUD also returns to Standard.
Links can set it too: `?theme=sentinel` / `?theme=off`.

## How it works

- `loader.html` is a small inline script in each page's `<head>`. It draws the theme switch and fetches nothing until
  Sentinel is chosen (or was chosen last time), so the Standard pages are unchanged.
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
