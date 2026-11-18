import { defineConfig } from "astro/config";

// Static output, flat .html files (about.html, not about/index.html) so the
// Cloudflare Worker assets layer's existing html_handling / _redirects /
// src/worker.js logic keeps working exactly as it does today.
export default defineConfig({
  site: "https://www.rfrrealestate.com",
  trailingSlash: "never",
  build: {
    format: "file",
  },
});
