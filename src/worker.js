// Canonicalises host/protocol, retires legacy Wix placeholder URLs, then serves
// static assets with asset-layer redirects upgraded to permanent (301).
const ORIGIN = "https://www.rfrrealestate.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol === "http:" || url.hostname === "rfrrealestate.com") {
      return Response.redirect(ORIGIN + url.pathname + url.search, 301);
    }

    if (/^\/blank(-\d+)?\/?$/i.test(url.pathname)) {
      return Response.redirect(ORIGIN + "/", 301);
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
