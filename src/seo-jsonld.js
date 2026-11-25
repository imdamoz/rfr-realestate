// Build-time structured data for /listings, /off-plan and /areas, generated
// from data.js so it can't drift from the cards actually on the page. This
// mirrors the old static site's scripts/build.mjs injectors exactly; the
// difference is only that it runs in each page's Astro frontmatter and takes
// that page's <main> HTML (the ?raw partial) as input instead of reading the
// built file. Only items whose card is on the page are included, and only
// with the price that card shows.
import { existsSync } from "node:fs";
import path from "node:path";
import { RFR as R } from "./data.js";

// A project render exists if public/media/projects/<slug>.jpg is present.
// Resolved from the project root (cwd during `astro build`) rather than
// import.meta.url, which Vite virtualises at build time.
const projectImageExists = (slug) =>
  existsSync(path.join(process.cwd(), "public/media/projects", `${slug}.jpg`));

const SITE = "https://www.rfrrealestate.com";
const BUSINESS = { "@id": `${SITE}/#business` };
const SELL = "http://purl.org/goodrelations/v1#Sell";
const LEASE_OUT = "http://purl.org/goodrelations/v1#LeaseOut";

const areaName = (slug) => (R.areas.find((a) => a.slug === slug) || {}).name;
const prop = (name, value) => ({ "@type": "PropertyValue", name, value });
const absUrl = (p) => `${SITE}/${p.replace(/^\/+/, "")}`;
const aed = (n) => "AED " + Number(n).toLocaleString("en-US");

// /listings: one Product node per listing card on the page.
export function listingsItemList(html) {
  const items = [];
  for (const l of R.listings) {
    const area = areaName(l.area);
    if (!area || !html.includes(`data-slug="${l.slug}"`)) continue;
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
    if (l.price == null) {
      // No price shown on the card (price on request). A Product without
      // offers/review/aggregateRating is an invalid product snippet, and we
      // never invent a price, so describe it as a RealEstateListing instead
      // (no Product-only properties, no offer).
      const listing = {
        "@type": "RealEstateListing",
        "@id": node["@id"],
        name: node.name,
        description: node.description,
        url: node.url,
        contentLocation: { "@type": "Place", name: `${area}, Ras Al Khaimah` },
        provider: BUSINESS,
      };
      if (node.image) listing.image = node.image;
      items.push(listing);
      continue;
    }
    {
      if (!html.includes(`data-aed="${l.price}">${aed(l.price)}<`)) throw new Error(`seo: listing ${l.slug} price ${l.price} not shown`);
      const offer = { "@type": "Offer", price: l.price, priceCurrency: "AED", businessFunction: rent ? LEASE_OUT : SELL, url: node.url, offeredBy: BUSINESS };
      if (rent) offer.priceSpecification = { "@type": "UnitPriceSpecification", price: l.price, priceCurrency: "AED", unitCode: "ANN", unitText: "per year" };
      node.offers = offer;
    }
    items.push(node);
  }
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}/listings#itemlist`,
    name: "Property for sale and rent in Ras Al Khaimah",
    url: `${SITE}/listings`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  };
}

// /off-plan: one Product node per launch card on the page.
export function offPlanItemList(html, hasImage = projectImageExists) {
  const items = [];
  for (const p of R.projects) {
    if (!html.includes(`id="${p.slug}" data-p="${p.slug}"`)) continue;
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
    if (hasImage(p.slug)) node.image = `${SITE}/media/projects/${p.slug}.jpg`;
    if (p.from != null) {
      if (!html.includes(`data-aed="${p.from}">${p.fromTxt}<`)) throw new Error(`seo: project ${p.slug} price ${p.from} not shown`);
      node.offers = { "@type": "AggregateOffer", lowPrice: p.from, priceCurrency: "AED", businessFunction: SELL, url: node.url, offeredBy: BUSINESS };
    }
    items.push(node);
  }
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}/off-plan#itemlist`,
    name: "Off-plan launches on Al Marjan Island, Ras Al Khaimah",
    url: `${SITE}/off-plan`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  };
}

// /areas: one Place per area section on the page. Description is the first
// sentence of the visible "Living in ..." answer.
export function areasPlaces(html) {
  const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/&rsquo;/g, "’").replace(/&ndash;/g, "–").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const RAK = { "@type": "AdministrativeArea", name: "Ras Al Khaimah", containedInPlace: { "@type": "Country", name: "United Arab Emirates" } };
  const places = [];
  for (const a of R.areas) {
    const m = html.match(new RegExp(`<div class="ans" id="living-${a.slug}">\\s*<h3>[^<]*</h3>\\s*<p>([\\s\\S]*?)</p>`));
    if (!html.includes(`id="${a.slug}"`) || !m) continue;
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
  return { "@context": "https://schema.org", "@graph": places };
}

// FAQPage built from the visible <details> FAQ in a page's #faq section, so
// the JSON-LD answers always match the text on the page word for word.
export function faqFromHtml(html) {
  const plain = (s) => s.replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”")
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&middot;/g, "·").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const sec = (html.match(/<section[^>]*id="faq"[\s\S]*?<\/section>/) || [""])[0];
  const qa = [...sec.matchAll(/<details><summary>([\s\S]*?)<span class="pm"[^>]*><\/span><\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
  if (!qa.length) throw new Error("seo: no FAQ found in #faq");
  if (qa.length !== (sec.match(/<details/g) || []).length) throw new Error("seo: an FAQ item in #faq does not match the expected markup");
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((m) => ({ "@type": "Question", name: plain(m[1]), acceptedAnswer: { "@type": "Answer", text: plain(m[2]) } })),
  };
}
