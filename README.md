# arashnassirpour.com — Engineering Tools Hub

**Live site:** https://arashnassirpour.com/

The GitHub Pages user site for Arash Nassirpour, providing a single landing page and shared navigation for a collection of public earthquake, structural-engineering, and catastrophe-risk tools.

## Published tools

| Path | Repository | Purpose |
|---|---|---|
| `/` | `arashnass.github.io` | Main hub |
| `/earthquake-rupture/` | `earthquake-rupture` | Interactive 3D fault-mechanism visualisation |
| `/world-faults/` | `world-faults` | Global faults, plate boundaries, and recent earthquakes |
| `/earthquake-dashboard/` | `earthquake-dashboard` | Hourly rapid-earthquake briefing |
| `/modal-analysis/` | `modal-analysis` | Shear-building modal analysis |
| `/building-response/` | `building-response` | Educational building-response simulation |
| `/design-spectrum/` | `design-spectrum` | International seismic design-spectrum generator |
| `/performance-point-evaluator/` | `performance-point-evaluator` | N2 capacity-spectrum performance-point evaluation |
| `/ground-motion/` | `ground-motion` | Ground motion processing, intensity measures and response spectra |
| `/rc-section-designer/` | `rc-section-designer` | Reinforced-concrete section analysis and checks |
| `/hazus/` | `hazus` | Hazus vulnerability and fragility explorer |
| `/hazard-sequence-simulator/` | `hazard-sequence-simulator` | Compound-hazard and interrupted-recovery simulation |
| `/material-behaviour-explorer/` | `material-behaviour-explorer` | Interactive material stress-strain relationships |
| `/slope-seismic-vulnerability/` | `slope-seismic-vulnerability` | Newmark sliding-block displacement fragility and vulnerability for tailings dams and pit slopes |

Most tools are maintained in their own repository with GitHub Pages enabled independently; because those repositories' Pages sites inherit this site's verified `arashnassirpour.com` custom domain, they are served beneath the paths shown above without duplicated content here. `hazus` and `rc-section-designer` are the exception: their source repositories are private, their own Pages sites are disabled, and their built output is published from copies committed directly in this repository.

## Repository contents

- `index.html` — landing page and project cards.
- `CNAME` — custom-domain configuration.
- `404.html` — fallback page.
- `robots.txt` and `sitemap.xml` — search-engine discovery.
- `sentinel/` — the optional Sentinel mission-control theme (CSS, JS, loader and audit script) shared by the live pages: the earthquake dashboard, the global-faults globe and its statistics page. See `sentinel/README.md`.
- `llms.txt` — plain-text summary for AI search tools.
- `indexnow.sh` — notifies Bing and other IndexNow search engines when pages change.
- `about/` — about page.
- `contact/` — contact page.
- `hazus/` — built copy of the Hazus Vulnerability Explorer (source lives in the `hazus` repo; not auto-synced).
- `rc-section-designer/` — built copy of SectionForge (source lives in the `rc-section-designer` repo; not auto-synced).
- `earthquake_rupture/`, `world_faults/`, and `dashboard/` — redirects from legacy Netlify-era paths.

Commits to `main` are published automatically by GitHub Pages. Note that `hazus/` and `rc-section-designer/` require a manual rebuild-and-copy from their source repos whenever those tools change; they do not update automatically.

## Licence

Copyright (C) 2026 Arash Nassirpour.

Licensed under the GNU Affero General Public License v3.0 only (`AGPL-3.0-only`). See [LICENSE](LICENSE).

## Search submissions

`./indexnow.sh` reads canonical URLs directly from `sitemap.xml` and notifies IndexNow engines. Use `./indexnow.sh --dry-run` to inspect the payload, or pass paths such as `/fun/shahnameh/`. Non-HTTPS, foreign-host and query/fragment URLs are rejected; unsuccessful submissions return a nonzero exit code. A successful submission confirms receipt, not indexing.

## Engagement and field performance

Shared `/assets/engagement.js` records input-free action names, successful user-triggered calculations, prepared exports, related-tool navigation and contact clicks. Initial defaults, local/debug/audit visits, DNT/GPC requests and untrusted synthetic interactions do not create engagement events. Numerical results, input values, uploaded filenames and contact addresses are never event parameters.

`/assets/vitals.js` uses the vendored official `web-vitals` library to send actual LCP, INP and CLS field measurements to GA4. LCP/INP are milliseconds; CLS is a unitless score. These are measurements, not a Lighthouse score. The library version and license are in `assets/vendor/`.

Run metrics tests with `node tests/platform-metrics.cjs`. The canonical sitemap remains the source for IndexNow submissions.
