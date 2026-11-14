// Redirects the apex host to the canonical www host, then serves static assets.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "rfrrealestate.com") {
      return Response.redirect("https://www.rfrrealestate.com" + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
