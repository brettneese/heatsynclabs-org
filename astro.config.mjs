import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  output: "hybrid", // Hybrid mode: static pages + API routes as serverless functions
  adapter: netlify(),
  build: {
    assets: "assets",
  },
  server: {
    port: 4321,
  },
});
