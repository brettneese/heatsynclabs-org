import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_HEADER, j as decodeKey } from './chunks/astro/server_Bb1dO9my.mjs';
import 'clsx';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/","adapterName":"@astrojs/netlify","routes":[{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/calendar","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/calendar","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/calendar\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"calendar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/calendar.ts","pathname":"/api/calendar","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/flickr","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/flickr","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/flickr\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"flickr","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/flickr.ts","pathname":"/api/flickr","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"calendar/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/calendar","isIndex":false,"type":"page","pattern":"^\\/calendar\\/?$","segments":[[{"content":"calendar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/calendar.astro","pathname":"/calendar","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"classes/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/classes","isIndex":false,"type":"page","pattern":"^\\/classes\\/?$","segments":[[{"content":"classes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/classes.astro","pathname":"/classes","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"membership/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/membership","isIndex":false,"type":"page","pattern":"^\\/membership\\/?$","segments":[[{"content":"membership","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/membership.astro","pathname":"/membership","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"register/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/register","isIndex":false,"type":"page","pattern":"^\\/register\\/?$","segments":[[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/register.astro","pathname":"/register","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"support/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/support","isIndex":false,"type":"page","pattern":"^\\/support\\/?$","segments":[[{"content":"support","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/support.astro","pathname":"/support","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/about.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/about@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/membership.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/membership@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/support.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/support@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/calendar.astro",{"propagation":"none","containsHead":true}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/classes.astro",{"propagation":"none","containsHead":true}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/pages/register.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/calendar@_@ts":"pages/api/calendar.astro.mjs","\u0000@astro-page:src/pages/api/flickr@_@ts":"pages/api/flickr.astro.mjs","\u0000@astro-page:src/pages/calendar@_@astro":"pages/calendar.astro.mjs","\u0000@astro-page:src/pages/classes@_@astro":"pages/classes.astro.mjs","\u0000@astro-page:src/pages/membership@_@astro":"pages/membership.astro.mjs","\u0000@astro-page:src/pages/register@_@astro":"pages/register.astro.mjs","\u0000@astro-page:src/pages/support@_@astro":"pages/support.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CSPixnPO.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/about.md?astroContentCollectionEntry=true":"chunks/about_CZcqI0WB.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/membership.md?astroContentCollectionEntry=true":"chunks/membership_CM3r5MUL.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/support.md?astroContentCollectionEntry=true":"chunks/support_BogXRseY.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/about.md?astroPropagatedAssets":"chunks/about_CElrTxTB.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/membership.md?astroPropagatedAssets":"chunks/membership_HC3nI7wJ.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/support.md?astroPropagatedAssets":"chunks/support_CWsEQVd5.mjs","\u0000astro:asset-imports":"chunks/_astro_asset-imports_D9aVaOQr.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BcEe_9wP.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/about.md":"chunks/about_DcFR2So1.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/membership.md":"chunks/membership_BA6DOvY_.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/content/pages/support.md":"chunks/support_DiCHhp2T.mjs","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/layout/LabStatusIndicator.vue":"assets/LabStatusIndicator.n9Hp6Tyi.js","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/graphics/PhotoCollage.vue":"assets/PhotoCollage.B4b5KWch.js","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/graphics/MobilePhotoCarousel.vue":"assets/MobilePhotoCarousel.DyBR4dqM.js","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/base/StyledDonateButton.vue":"assets/StyledDonateButton.BXrObYUx.js","/astro/hoisted.js?q=1":"assets/hoisted.CHFqpM-a.js","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/schedule/OpenHours.vue":"assets/OpenHours.CtDgrTp2.js","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/sections/CalendarSection.vue":"assets/CalendarSection.Cpa7P_YZ.js","@astrojs/vue/client.js":"assets/client.TC3TUiQH.js","/Users/brettneese/Development/git/github.com/brettneese/heatsynclabs-org/src/components/calendar/FullCalendar.vue":"assets/FullCalendar.CNcZEczP.js","/astro/hoisted.js?q=0":"assets/hoisted.CGey562G.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/assets/about.BQK0bOUx.css","/assets/calendar.CYXHBmLH.css","/assets/index.cBb0XB2n.css","/favicon.ico","/hsl-logo.png","/assets/CalendarSection.Cpa7P_YZ.js","/assets/EventModal.t8exL6Jf.js","/assets/FullCalendar.CNcZEczP.js","/assets/LabStatusIndicator.n9Hp6Tyi.js","/assets/MobilePhotoCarousel.DyBR4dqM.js","/assets/OpenHours.CtDgrTp2.js","/assets/PhotoCollage.B4b5KWch.js","/assets/StyledDonateButton.BXrObYUx.js","/assets/_plugin-vue_export-helper.DlAUqK2U.js","/assets/about.BRabCiuw.css","/assets/calendar.DOIp2jBg.css","/assets/calendar.DYAywxLN.css","/assets/calendarService.CEhum07R.js","/assets/client.TC3TUiQH.js","/assets/flickrService.Cq3GOZkV.js","/assets/hoisted.CGey562G.js","/assets/hoisted.CHFqpM-a.js","/assets/index.ByURXfO0.css","/assets/runtime-core.esm-bundler.DuyrnFW4.js","/assets/runtime-dom.esm-bundler.BEnN6wBa.js","/about/index.html","/api/calendar","/api/flickr","/calendar/index.html","/classes/index.html","/membership/index.html","/register/index.html","/support/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"+oHGIimnVeNs1WyfnB5mJuQggheFqisalwchJ3c4d4g=","experimentalEnvGetSecretEnabled":false});

export { manifest };
