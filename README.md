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

Each tool is maintained in its own public repository with GitHub Pages enabled. Because this user site owns the `arashnassirpour.com` custom domain, project sites are served beneath the paths shown above.

## Repository contents

- `index.html` — landing page and project cards.
- `CNAME` — custom-domain configuration.
- `404.html` — fallback page.
- `robots.txt` and `sitemap.xml` — search-engine discovery.
- `earthquake_rupture/`, `world_faults/`, and `dashboard/` — redirects from legacy Netlify-era paths.
- `contact/` — contact page.

Commits to `main` are published automatically by GitHub Pages.

## Licence

Copyright (C) 2026 Arash Nassirpour.

Licensed under the GNU Affero General Public License v3.0 only (`AGPL-3.0-only`). See [LICENSE](LICENSE).
