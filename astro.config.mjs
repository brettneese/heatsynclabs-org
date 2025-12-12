import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  output: "static", // Static mode: calendar API calls made directly from client
  build: {
    assets: "assets",
  },
  server: {
    port: 4321,
  },
});
