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
| `/ground-motion/` | `ground-motion` | Ground motion processing, intensity measures and response spectra |
| `/rc-section-designer/` | `rc-section-designer` | Reinforced-concrete section analysis and checks |
| `/hazus/` | `hazus` | Hazus vulnerability and fragility explorer |

Most tools are maintained in their own public repository with GitHub Pages enabled independently; because those repos' Pages sites inherit this site's verified `arashnassirpour.com` custom domain, they're served beneath the paths shown above without any content duplicated here. `hazus` and `rc-section-designer` are the exception: their own repos' GitHub Pages are currently disabled, and their built output is published from copies committed directly in this repo instead (see below).

## Repository contents

- `index.html` — landing page and project cards.
- `CNAME` — custom-domain configuration.
- `404.html` — fallback page.
- `robots.txt` and `sitemap.xml` — search-engine discovery.
- `about/` — about page.
- `contact/` — contact page.
- `hazus/` — built copy of the Hazus Vulnerability Explorer (source lives in the `hazus` repo; not auto-synced).
- `rc-section-designer/` — built copy of SectionForge (source lives in the `rc-section-designer` repo; not auto-synced).
- `earthquake_rupture/`, `world_faults/`, and `dashboard/` — redirects from legacy Netlify-era paths.

Commits to `main` are published automatically by GitHub Pages. Note that `hazus/` and `rc-section-designer/` require a manual rebuild-and-copy from their source repos whenever those tools change; they do not update automatically.

## Licence

Copyright (C) 2026 Arash Nassirpour.

Licensed under the GNU Affero General Public License v3.0 only (`AGPL-3.0-only`). See [LICENSE](LICENSE).
