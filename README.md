# arashnassirpour.com - Hub Site

**Live:** https://arashnassirpour.com

The homepage of arashnassirpour.com, hosted on GitHub Pages as the user site
(this repo is named ArashNass.github.io). A single landing page with cards
linking to each project.

How the pieces fit: each project is its own public repository with GitHub
Pages enabled, and because this user site carries the custom domain, every
project is automatically served under it:

| Path on arashnassirpour.com | Repository |
|---|---|
| `/` | ArashNass.github.io (this repo) |
| `/earthquake-rupture/` | earthquake-rupture |
| `/world-faults/` | world-faults |
| `/earthquake-dashboard/` | earthquake-dashboard (rebuilds itself every 6 hours) |

The `earthquake_rupture`, `world_faults` and `dashboard` folders are redirect
stubs that forward the old Netlify-era URLs to the new paths. `CNAME` holds
the custom domain. Any commit to `main` goes live automatically - GitHub Pages
has no deploy limits or credits.
