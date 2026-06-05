# egge.us — Mark Egge portfolio

A data-driven static portfolio for **Mark Egge** — applied data scientist and
transportation planner in Bozeman, Montana. Single long-scroll page: Hero →
About → Selected work → Research & writing → Beyond work → Contact/footer.

Built with **[Astro](https://astro.build)** (static output) using **content
collections** for the data model. The professional complement to
[eateggs.com](https://eateggs.com).

---

## Stack

- **Astro 6** — `output: 'static'`, no SSR adapter. Plain static `dist/`.
- **Content Layer collections** — projects as Markdown, writing/archive as YAML.
- **Self-hosted fonts** — Inter + Nunito (variable TTF, OFL) in `public/fonts/`;
  JetBrains Mono via Google Fonts.
- **No JS framework** — ~8 lines of vanilla JS for the sticky-header rule.

## Local development

```bash
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
npm run check    # astro check (typecheck + content schema validation)
```

> If `npm` cache/temp paths are sandboxed on this machine, prefix commands with
> `export TMPDIR=/Users/clippy2/.tmp-egge npm_config_cache=/Users/clippy2/.tmp-egge/npm-cache`.

---

## Content model — how to add or edit a project

**Adding a project is a one-file change. You never touch HTML or layout.**

Drop a new Markdown file into [`src/content/projects/`](src/content/projects/).
The Selected-work section iterates the collection and renders it automatically.

### Project front-matter schema

Defined and validated by Zod in
[`src/content.config.ts`](src/content.config.ts):

```yaml
---
title: GTFS·X                          # required
title_suffix: R package                # optional small muted suffix after title
url: https://gtfsx.com                 # optional; the visit link
display_url: gtfsx.com                 # optional; the visible link text
category: Transit & Planning Tools     # required; one of the three values below
status: live                           # live | beta | commercial | open-source | research
status_label: Live · In licensing      # exact chip text shown on the card
role: Built & owned                    # optional; small muted lead-in
featured: true                         # true → Selected-work card; false → archive list
flagship: false                        # true → coral "Flagship" pill (GTFS·X)
tentative: false                       # true → compact dashed "awaiting details" card
order: 10                              # manual sort across the whole list (ascending)
image: /images/gtfsx.png               # optional; omit → uses the image_kind motif
image_kind: gtfsx                      # placeholder SVG when no image (see below)
shot_caption: Documentation            # optional; overrides the "Product screenshot" pill
pending_label: Awaiting details        # tentative-card pill text (default "Awaiting details")
summary: >                             # required; rendered on the card. Backtick
  One- to three-sentence description.  # `code spans` render in the mono font.
---
```

**Categories** — one of `AI & Automation`, `Transit & Planning Tools`, or
`Research & Open Source`. Required and kept in the data, but the page currently
renders **one flat list ordered by `order`** rather than grouping by category.
(To restore the `01/02/03` category groups, see `src/pages/index.astro`.)

### How projects render

- **Order** — `featured: true` projects render as **one flat list sorted by
  `order`** (ascending), in exactly that sequence.
- **Feature cards** — `featured: true` and not `tentative`. The image side
  **alternates** down the page via a `.flip` modifier (1st image-right, 2nd
  image-left, 3rd image-right, …).
- **Flagship pill** — `flagship: true` adds the coral "Flagship" pill.
- **Tentative cards** — `tentative: true` renders a quieter, compact **dashed**
  "awaiting details" card at its `order` position (give tentatives a high
  `order` so they stay last).
- **Archive** — `featured: false` projects render in the buried
  "Earlier work & archive" `<details>` list near the bottom of *Research &
  writing*, never in the main grid.
- **No image** — falls back to the `image_kind` placeholder SVG motif
  (see [`src/components/ShotMotif.astro`](src/components/ShotMotif.astro)):
  - Feature motifs: `civiccast` (waveform), `gtfsx` (route arc + stops),
    `transitpeers` (bars + trend line), `suncloud` (choropleth + pin),
    `tpm` (code window).
  - Compact/placeholder motifs: `network`, `mapform`, `docs`.
  - Add a real screenshot later by setting `image: /images/<file>.png` (drop the
    file in `public/images/`). Card shots render at ~5:4 with `object-fit: cover`,
    so capture at **1200×960** (or that aspect) to avoid side-cropping. The
    image is wrapped in a link to the project `url` automatically.

### Reordering / removing

- **Reorder** — change `order` (lower = earlier in the list).
- **Recategorize** — change `category` (kept in the data; doesn't affect the
  current flat ordering).
- **Bury a project** — set `featured: false` (it moves to the archive list).
- **Remove** — delete the file.

### Research & writing and Archive

These are YAML data files (also collections), edited in place:

- [`src/data/writing.yaml`](src/data/writing.yaml) — schema
  `{ title, meta, role?, year, url }`. `role` renders as an accent lead-in;
  `year` is the right-aligned mono label (can be a kind, e.g. `Tool`,
  `Whitepaper`).
- [`src/data/archive.yaml`](src/data/archive.yaml) — schema
  `{ title, meta, url }`. The buried "Earlier work & archive" list.

---

## Project structure

```
egge.us/
├── wrangler.jsonc             # Cloudflare Workers static-assets config (serves ./dist)
├── .node-version              # pins Node 22 for the Cloudflare build
├── astro.config.mjs            # static output, site = https://egge.us
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon-monogram.svg    # ME monogram brand mark (+ peaks/arc alternates)
│   ├── fonts/{Inter,Nunito}/   # self-hosted variable TTFs (OFL)
│   └── images/mark.jpg         # headshot (4:5)
└── src/
    ├── content.config.ts       # Zod schemas + content-collection loaders
    ├── content/projects/*.md   # ← one file per project (the data model)
    ├── data/writing.yaml       # research & writing list
    ├── data/archive.yaml       # buried archive list
    ├── components/
    │   ├── Header.astro         # sticky nav + brand
    │   ├── FeatureCard.astro    # full feature card (+ flip / flagship)
    │   ├── CompactCard.astro    # compact dashed "tentative" card
    │   ├── CardShot.astro       # shot side; links the image to the project url
    │   └── ShotMotif.astro      # placeholder SVG motifs keyed by image_kind
    ├── layouts/Base.astro       # <head>, fonts, sticky-header script
    ├── lib/summary.ts           # safe summary → HTML (links, bold, italic, `code`)
    ├── pages/index.astro        # the page; iterates the collections
    └── styles/global.css        # all design tokens + layout + responsive
```

---

## Deploy

Hosted on **Cloudflare** as a **Workers Static-Assets** site (a Worker with no
server code that just serves `./dist`), connected to this GitHub repo via
Cloudflare's Git integration (Workers Builds). Config lives in
[`wrangler.jsonc`](wrangler.jsonc).

### Push to deploy (default)

Cloudflare watches `main` and builds + deploys on **every push** — no manual
step:

```bash
git add -A && git commit -m "your message" && git push
```

Watch progress in the Cloudflare dashboard under **Workers & Pages → the Worker
→ Deployments**. Build settings (set once when connecting the repo):

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Node version | 22 (via [`.node-version`](.node-version); Astro needs ≥22.12) |

The output directory and project name come from `wrangler.jsonc`
(`assets.directory = ./dist`, `name = egge-us-site`).

### Manual deploy (fallback)

From your machine (where the IP-restricted token in `.env` is valid):

```bash
npm run build
npx wrangler deploy
```

Wrangler needs Cloudflare credentials: run `npx wrangler login` once (browser
OAuth), or `export CLOUDFLARE_API_TOKEN=…` before deploying.

> Before a substantial change, run `npm run check` (typecheck + content-schema
> validation). The custom domain (egge.us) is managed in the Cloudflare
> dashboard — no CNAME file is needed.
