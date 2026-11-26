// Runs after `astro build` on the generated dist/ folder.
//
// 1. Internal links: the page partials link to "about.html", "listings.html#x"
//    and so on. Those URLs 301 to the canonical extensionless URLs (/about,
//    /listings#x), so crawlers counted almost no direct internal links to the
//    canonical pages. Rewrite every href to a site page to its canonical form
//    (index.html -> /). Only static HTML hrefs are touched; canonicals,
//    sitemap and redirects are unchanged.
// 2. Minify /site.css, /site.js and /data.js in place (same file names/URLs).
//    Classic (non-module) scripts: esbuild's transform without a `format`
//    keeps top-level names, so globals such as window.RFR keep working.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { transform } from "esbuild";

const DIST = path.resolve("dist");
const PAGES = ["about", "apartments-for-rent-ras-al-khaimah", "apartments-for-sale-ras-al-khaimah", "al-hamra-village", "al-marjan-island", "areas", "buy-sell-lease", "can-foreigners-buy-property-in-ras-al-khaimah", "golden-visa-property-ras-al-khaimah", "listings", "manta-bay", "market", "mina-al-arab", "off-plan", "ras-al-khaimah-property-investment-guide", "services"];
const pageRe = new RegExp(`href="(?:\\./|/)?(index|${PAGES.join("|")})\\.html(#[^"]*)?"`, "g");

let linkCount = 0;
for (const f of readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
  const file = path.join(DIST, f);
  const html = readFileSync(file, "utf8");
  const out = html.replace(pageRe, (_, page, hash = "") => {
    linkCount++;
    return `href="${page === "index" ? "/" : `/${page}`}${hash}"`;
  });
  if (out !== html) writeFileSync(file, out);
}
console.log(`[postbuild] rewrote ${linkCount} internal links to canonical URLs`);

for (const [name, loader] of [["site.css", "css"], ["site.js", "js"], ["data.js", "js"]]) {
  const file = path.join(DIST, name);
  const src = readFileSync(file, "utf8");
  const { code } = await transform(src, { loader, minify: true, legalComments: "none" });
  writeFileSync(file, code);
  console.log(`[postbuild] minified ${name}: ${src.length} -> ${code.length} bytes`);
}
