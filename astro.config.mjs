import { defineConfig } from 'astro/config';

// Static portfolio for egge.us. Plain static build — no SSR adapter.
// Target deploy: Cloudflare Pages (serves the static dist/).
export default defineConfig({
  site: 'https://egge.us',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
