import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import yaml from 'js-yaml';

/**
 * Content model for egge.us (Astro Content Layer).
 *
 * `projects` — one Markdown file per project in `src/content/projects/`.
 * The Selected-work section iterates this collection, so adding, editing,
 * or reordering a project is a ONE-FILE change, never an HTML edit.
 *
 * Rendering rules (implemented in src/pages/index.astro):
 *  - `featured: true` projects render as ONE flat list sorted by `order`
 *    (ascending). The image side alternates per feature card via a `.flip`
 *    modifier (first image-right, next image-left, …).
 *  - `flagship: true` → coral "Flagship" pill.
 *  - `tentative: true` → compact dashed "awaiting details" card (renders at
 *    its `order` position, so put tentatives last).
 *  - `featured: false` → buried in "Earlier work & archive", not the list.
 *  - No `image` → falls back to the `image_kind` placeholder SVG motif.
 *  - `category` is retained for possible future regrouping; it no longer
 *    groups the rendered list.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // Optional small muted suffix after the title (e.g. "R package" on tpm).
    title_suffix: z.string().optional(),
    url: z.url().optional(),
    display_url: z.string().optional(),
    category: z.enum([
      'AI & Automation',
      'Transit & Planning Tools',
      'Research & Open Source',
    ]),
    status: z
      .enum(['live', 'beta', 'commercial', 'open-source', 'research'])
      .optional(),
    status_label: z.string().optional(),
    role: z.string().optional(),
    featured: z.boolean().default(true),
    flagship: z.boolean().default(false),
    tentative: z.boolean().default(false),
    order: z.number().default(100),
    image: z.string().optional(),
    // The 5 documented feature motifs, plus the lighter decorative motifs
    // used on the compact / tentative placeholder cards.
    image_kind: z
      .enum([
        'civiccast',
        'gtfsx',
        'transitpeers',
        'suncloud',
        'tpm',
        'network',
        'mapform',
        'docs',
      ])
      .optional(),
    // Optional override for the small caption pill on the placeholder shot.
    shot_caption: z.string().optional(),
    // Pending-state pill text on a tentative card (e.g. "Awaiting details",
    // "Inclusion to confirm"). Defaults to "Awaiting details".
    pending_label: z.string().optional(),
    summary: z.string(),
  }),
});

// Index-based id injector so the YAML data files stay clean (no synthetic
// id/slug fields needed in the source). The file() loader expects either an
// object map or an array of records, each with a unique id.
function withIds(text: string): Array<Record<string, unknown>> {
  const parsed = yaml.load(text);
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a YAML array of records.');
  }
  return parsed.map((item, i) => ({
    id: String(i),
    ...(item as Record<string, unknown>),
  }));
}

/** Research & writing list. Schema: { title, meta, role?, year, url } */
const writing = defineCollection({
  loader: file('src/data/writing.yaml', { parser: withIds }),
  schema: z.object({
    title: z.string(),
    meta: z.string(),
    role: z.string().optional(),
    year: z.string(),
    url: z.url(),
  }),
});

/** Earlier work & archive list. Schema: { title, meta, url } */
const archive = defineCollection({
  loader: file('src/data/archive.yaml', { parser: withIds }),
  schema: z.object({
    title: z.string(),
    meta: z.string(),
    url: z.url(),
  }),
});

export const collections = { projects, writing, archive };
