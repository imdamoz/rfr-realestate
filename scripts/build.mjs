import { readdirSync, rmSync, cpSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(fileURLToPath(import.meta.url), "../..");
const distDir = path.join(rootDir, "dist");

const EXCLUDE = new Set([
  ".git",
  ".github",
  ".wrangler",
  "node_modules",
  "dist",
  "scripts",
  "src",
  "wrangler.jsonc",
  ".assetsignore",
  "package.json",
  "package-lock.json",
  ".gitignore",
]);

rmSync(distDir, { recursive: true, force: true });

for (const entry of readdirSync(rootDir)) {
  if (EXCLUDE.has(entry)) continue;
  cpSync(path.join(rootDir, entry), path.join(distDir, entry), { recursive: true });
}

/* ---------- ItemList JSON-LD for /listings and /off-plan, generated from data.js ----------
   Built here (not hand-written in the HTML) so the structured data can't drift from data.js.
   Only items whose card is actually on the page are included, and only with the price that
   card shows. Injected into dist/ only; the source HTML is untouched. */
const SITE = "https://www.rfrrealestate.com";
const BUSINESS = { "@id": `${SITE}/#business` };
const SELL = "http://purl.org/goodrelations/v1#Sell";
const LEASE_OUT = "http://purl.org/goodrelations/v1#LeaseOut";

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(path.join(rootDir, "data.js"), "utf8"), sandbox);
const R = sandbox.window.RFR;
if (!R || !Array.isArray(R.listings) || !Array.isArray(R.projects)) throw new Error("build: data.js has no RFR.listings / RFR.projects");

const areaName = (slug) => (R.areas.find((a) => a.slug === slug) || {}).name;
const prop = (name, value) => ({ "@type": "PropertyValue", name, value });
const absUrl = (p) => `${SITE}/${p.replace(/^\/+/, "")}`;
const aed = (n) => "AED " + Number(n).toLocaleString("en-US");

function injectJsonLd(file, data) {
  const fp = path.join(distDir, file);
  const html = readFileSync(fp, "utf8");
  if (!html.includes("</head>")) throw new Error(`build: no </head> in ${file}`);
  // JSON.stringify output is valid JSON; escape "<" so no string can close the <script>
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  writeFileSync(fp, html.replace("</head>", `<script type="application/ld+json">${json}</script>\n</head>`));
}

// /listings: one node per listing card on the page
{
  const html = readFileSync(path.join(distDir, "listings.html"), "utf8");
  const items = [];
  for (const l of R.listings) {
    const area = areaName(l.area);
    if (!area || !html.includes(`data-slug="${l.slug}"`)) { console.warn(`build: listing ${l.slug} not on listings.html, left out of ItemList`); continue; }
    const rent = l.cat === "rent";
    const kind = rent ? "For rent" : l.offplan ? "Off-plan, for sale" : "For sale";
    const props = [prop("Listing type", kind), prop("Property type", l.type), prop("Area", `${area}, Ras Al Khaimah`)];
    if (l.beds) props.push(prop("Bedrooms", l.beds));
    else if (!/plot/i.test(l.type)) props.push(prop("Bedrooms", "Studio"));
    if (l.baths) props.push(prop("Bathrooms", l.baths));
    if (l.sqft) props.push({ "@type": "PropertyValue", name: "Size", value: l.sqft, unitCode: "FTK", unitText: "sq ft" });
    if (l.furnishing && l.furnishing !== "—") props.push(prop("Furnishing", l.furnishing));
    if (l.view) props.push(prop("View", l.view));
    if (l.developer) props.push(prop("Developer", l.developer));
    if (l.handover) props.push(prop("Handover", l.handover));
    if (l.plan) props.push(prop("Payment plan", l.plan));
    const node = {
      "@type": "Product",
      "@id": `${SITE}/listings#${l.slug}`,
      name: `${l.title}, ${area}`,
      description: `${kind}. ${l.desc}`,
      url: `${SITE}/listings#${l.slug}`,
      category: l.type,
      sku: l.slug,
      additionalProperty: props,
    };
    if (l.imgs && l.imgs[0]) node.image = absUrl(l.imgs[0]);
    if (l.price != null) {
      // only state a price the card visibly shows
      if (!html.includes(`data-aed="${l.price}">${aed(l.price)}<`)) throw new Error(`build: listing ${l.slug} price ${l.price} not shown on listings.html`);
      const offer = { "@type": "Offer", price: l.price, priceCurrency: "AED", businessFunction: rent ? LEASE_OUT : SELL, url: node.url, offeredBy: BUSINESS };
      if (rent) offer.priceSpecification = { "@type": "UnitPriceSpecification", price: l.price, priceCurrency: "AED", unitCode: "ANN", unitText: "per year" };
      node.offers = offer;
    }
    items.push(node);
  }
  injectJsonLd("listings.html", {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}/listings#itemlist`,
    name: "Property for sale and rent in Ras Al Khaimah",
    url: `${SITE}/listings`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  });
}

// /off-plan: one node per launch card. The page states all nine launches are on Al Marjan Island.
{
  const html = readFileSync(path.join(distDir, "off-plan.html"), "utf8");
  const items = [];
  for (const p of R.projects) {
    if (!html.includes(`id="${p.slug}" data-p="${p.slug}"`)) { console.warn(`build: project ${p.slug} not on off-plan.html, left out of ItemList`); continue; }
    const props = [prop("Location", "Al Marjan Island, Ras Al Khaimah")];
    if (p.dev) props.push(prop("Developer", p.dev));
    if (p.handover) props.push(prop("Handover", p.handover));
    if (p.plan) props.push(prop("Payment plan", p.plan));
    if (p.mix) props.push(prop("Unit mix", p.mix));
    const node = {
      "@type": "Product",
      "@id": `${SITE}/off-plan#${p.slug}`,
      name: p.name,
      url: `${SITE}/off-plan#${p.slug}`,
      category: "Off-plan residential project",
      additionalProperty: props,
    };
    if (p.note) node.description = `Off-plan launch on Al Marjan Island${p.dev ? ` by ${p.dev}` : ""}. ${p.note}`;
    if (existsSync(path.join(rootDir, "media/projects", `${p.slug}.jpg`))) node.image = `${SITE}/media/projects/${p.slug}.jpg`;
    if (p.from != null) {
      if (!html.includes(`data-aed="${p.from}">${p.fromTxt}<`)) throw new Error(`build: project ${p.slug} price ${p.from} not shown on off-plan.html`);
      node.offers = { "@type": "AggregateOffer", lowPrice: p.from, priceCurrency: "AED", businessFunction: SELL, url: node.url, offeredBy: BUSINESS };
    }
    items.push(node);
  }
  injectJsonLd("off-plan.html", {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}/off-plan#itemlist`,
    name: "Off-plan launches on Al Marjan Island, Ras Al Khaimah",
    url: `${SITE}/off-plan`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  });
}

// /areas: one Place per area section on the page. Description is the first sentence of the
// visible "Living in ..." answer, so the structured data says nothing the page doesn't.
{
  const html = readFileSync(path.join(distDir, "areas.html"), "utf8");
  const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/&rsquo;/g, "’").replace(/&ndash;/g, "–").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const RAK = { "@type": "AdministrativeArea", name: "Ras Al Khaimah", containedInPlace: { "@type": "Country", name: "United Arab Emirates" } };
  const places = [];
  for (const a of R.areas) {
    const m = html.match(new RegExp(`<div class="ans" id="living-${a.slug}">\\s*<h3>[^<]*</h3>\\s*<p>([\\s\\S]*?)</p>`));
    if (!html.includes(`id="${a.slug}"`) || !m) { console.warn(`build: area ${a.slug} has no section or answer on areas.html, left out of Place list`); continue; }
    const node = {
      "@type": "Place",
      "@id": `${SITE}/areas#${a.slug}`,
      name: a.name,
      url: `${SITE}/areas#${a.slug}`,
      description: plain(m[1]).split(/(?<=\.)\s/)[0],
      containedInPlace: RAK,
    };
    if (a.slug === "downtown-rak") node.alternateName = "Downtown Ras Al Khaimah";
    if (typeof a.lat === "number" && typeof a.lng === "number") node.geo = { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng };
    if (a.img) node.image = absUrl(a.img);
    places.push(node);
  }
  injectJsonLd("areas.html", { "@context": "https://schema.org", "@graph": places });
}
