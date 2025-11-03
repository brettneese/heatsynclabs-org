import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_DQgxSYIg.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/calendar.astro.mjs');
const _page3 = () => import('./pages/api/flickr.astro.mjs');
const _page4 = () => import('./pages/calendar.astro.mjs');
const _page5 = () => import('./pages/classes.astro.mjs');
const _page6 = () => import('./pages/membership.astro.mjs');
const _page7 = () => import('./pages/register.astro.mjs');
const _page8 = () => import('./pages/support.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/calendar.ts", _page2],
    ["src/pages/api/flickr.ts", _page3],
    ["src/pages/calendar.astro", _page4],
    ["src/pages/classes.astro", _page5],
    ["src/pages/membership.astro", _page6],
    ["src/pages/register.astro", _page7],
    ["src/pages/support.astro", _page8],
    ["src/pages/index.astro", _page9]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "a1fc2852-511f-491a-917c-a5178fdb8df0"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
