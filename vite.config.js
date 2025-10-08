import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import forwardToTrailingSlashPlugin from "./forward-to-trailing-slash-plugin";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Plugin to copy img folder to dist
const copyImgPlugin = () => ({
  name: 'copy-img',
  writeBundle() {
    const copyRecursiveSync = (src, dest) => {
      const exists = statSync(src, { throwIfNoEntry: false });
      const stats = exists && statSync(src);
      const isDirectory = exists && stats.isDirectory();
      if (isDirectory) {
        mkdirSync(dest, { recursive: true });
        readdirSync(src).forEach(childItemName => {
          copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
        });
      } else {
        copyFileSync(src, dest);
      }
    };
    copyRecursiveSync('./img', './dist/img');
  }
});

const build = {
  rollupOptions: {
    input: {
      main: resolve(__dirname, "index.html"),
      classes: resolve(__dirname, "classes/index.html"),
      donate: resolve(__dirname, "donate/index.html"),
      live: resolve(__dirname, "live/index.html"),
      register: resolve(__dirname, "register/index.html"),
      history: resolve(__dirname, "history/index.html"),
      fscalendar: resolve(__dirname, "fscalendar/index.html"),
      "app-privacy-policy": resolve(__dirname, "app-privacy-policy.html"),
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      forwardToTrailingSlashPlugin(Object.keys(build.rollupOptions.input)),
      react(),
      copyImgPlugin(),
    ],
    base: env.VITE_BASE ?? "/",
    appType: "mpa",
    build,
  };
});
