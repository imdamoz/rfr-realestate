// Canonicalises host/protocol, retires legacy Wix placeholder URLs and old
// single-page exports, then serves static assets with asset-layer redirects
// upgraded to permanent (301).
const ORIGIN = "https://www.rfrrealestate.com";

// Legacy paths -> canonical page on the current site. Keys are lower-case,
// decoded, without a trailing slash. Checked before the asset layer, so
// these 301 even though no matching file exists in the build. _redirects
// mirrors the rest of the retired URLs (old area/listing/off-plan/guide
// pages that no longer exist as separate pages).
const LEGACY = new Map([
  ["/rfr-about.dc", "/about"],
  ["/rfr-about.dc.html", "/about"],
  ["/rfr-areas.dc", "/areas"],
  ["/rfr-areas.dc.html", "/areas"],
  ["/rfr-listings.dc", "/listings"],
  ["/rfr-listings.dc.html", "/listings"],
  ["/rfr-buy-sell-lease.dc", "/buy-sell-lease"],
  ["/rfr-buy-sell-lease.dc.html", "/buy-sell-lease"],
  ["/rfr-market.dc", "/market"],
  ["/rfr-market.dc.html", "/market"],
  ["/rfr-offplan.dc", "/off-plan"],
  ["/rfr-offplan.dc.html", "/off-plan"],
  ["/rfr-services.dc", "/services"],
  ["/rfr-services.dc.html", "/services"],
  ["/rfr-island-3d", "/areas"],
  ["/rfr-island-3d.html", "/areas"],
  ["/rfr website v5.dc", "/"],
  ["/rfr website v5.dc.html", "/"],
  ["/rfr website v7.dc", "/"],
  ["/rfr website v7.dc.html", "/"],
  ["/rfr website v9.dc", "/"],
  ["/rfr website v9.dc.html", "/"],
]);

function legacyTarget(pathname) {
  let p;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    p = pathname;
  }
  p = p.toLowerCase().replace(/\+/g, " ");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  // Wix placeholders: /blank, /blank-3, /blank.html, /blank-2.html (and slash variants).
  if (/^\/blank(-\d+)?(\.html)?$/.test(p)) return "/";
  return LEGACY.get(p) || null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol === "http:" || url.hostname === "rfrrealestate.com") {
      return Response.redirect(ORIGIN + url.pathname + url.search, 301);
    }

    const legacy = legacyTarget(url.pathname);
    if (legacy) {
      return Response.redirect(ORIGIN + legacy + url.search, 301);
    }

    const res = await env.ASSETS.fetch(request);
    if (res.status === 307 || res.status === 308) {
      const location = res.headers.get("Location");
      if (location) {
        return new Response(null, {
          status: 301,
          headers: { Location: new URL(location, request.url).href },
        });
      }
    }
    return res;
  },
};
