# arashnassirpour.com - Hub Site

**Live:** https://arashnassirpour.com

The homepage of arashnassirpour.com. A single landing page with cards linking
to each project, plus the routing glue that holds the whole setup together.

How the pieces fit: each project lives in its own repository with its own
Netlify site, and the `_redirects` file here proxies the nice URLs on the main
domain to those sites:

| Path on arashnassirpour.com | Repository | Netlify site |
|---|---|---|
| `/` | personal-site (this repo) | arash-hub |
| `/earthquake_rupture/` | earthquake-rupture | arash-earthquake-rupture |
| `/world_faults/` | world-faults | arash-world-faults |
| `/dashboard/` | earthquake-dashboard | arash-eq-dashboard |

Any commit to `main` goes live automatically via Netlify.
