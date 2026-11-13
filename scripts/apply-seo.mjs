/**
 * One-shot SEO build for the static RFR site.
 * Self-hosts Wix images, writes crawlable area/listing/project pages,
 * injects head tags, and emits sitemap, robots, llms.txt and _redirects.
 *
 * Re-run from the repo root after editing rfr-data.js:
 *   node scripts/apply-seo.mjs
 * The script is not idempotent on HTML that it has already rewritten.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.rfrrealestate.com';
const LIB = path.join(ROOT, 'brand/photos/library');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function assertMeta(title, description) {
  if (title.length > 60) throw new Error(`Title ${title.length} > 60: ${title}`);
  if (description.length > 155) throw new Error(`Description ${description.length} > 155: ${description}`);
}

function clip(s, n) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  const i = cut.lastIndexOf(' ');
  return (i > 40 ? cut.slice(0, i) : cut).replace(/[.,;:\s]+$/, '') + '…';
}

function money(aed) {
  if (aed === null || aed === undefined) return 'Price on request';
  return 'AED ' + Number(aed).toLocaleString('en-US');
}

function sliceTag(html, start) {
  const tag = html.slice(start).match(/^<([a-z0-9-]+)/i)[1];
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] === '/') {
      depth -= 1;
      if (depth === 0) return { start, end: re.lastIndex, html: html.slice(start, re.lastIndex) };
    } else depth += 1;
  }
  throw new Error('Unclosed <' + tag + '>');
}

function findTag(html, needle) {
  const start = html.indexOf(needle);
  if (start < 0) return null;
  return sliceTag(html, start);
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'RFR-site-mirror/1.0' } });
  if (!res.ok) throw new Error(res.status + ' ' + url);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error('not an image (' + type + ') ' + url);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function collectWixIds(text) {
  const ids = new Set();
  const re = /https:\/\/static\.wixstatic\.com\/media\/([^/"'\s]+)/g;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  const re2 = /wix\(\s*'([^']+)'/g;
  while ((m = re2.exec(text))) ids.add(m[1]);
  return ids;
}

function localName(id) {
  const clean = id.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return clean;
}

async function selfHostImages() {
  const files = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'library') continue;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (/\.(html|js)$/i.test(ent.name)) files.push(p);
    }
  }
  walk(ROOT);
  const ids = new Set();
  const blob = {};
  for (const f of files) {
    blob[f] = fs.readFileSync(f, 'utf8');
    for (const id of collectWixIds(blob[f])) ids.add(id);
  }
  console.log('Wix media ids:', ids.size);
  const map = {};
  const failures = [];
  const queue = [...ids];
  let bytes = 0;
  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      const file = localName(id);
      const dest = path.join(LIB, file);
      const pub = '/brand/photos/library/' + file;
      try {
        const n = await download('https://static.wixstatic.com/media/' + id, dest);
        bytes += n;
        map[id] = pub;
        console.log('  ok', file, n);
      } catch (err) {
        failures.push(id + ' (' + err.message + ')');
        console.warn('  FAIL', id, err.message);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log('Downloaded bytes', bytes, 'failures', failures.length);

  const replaceUrls = (text) => text.replace(/https:\/\/static\.wixstatic\.com\/media\/([^/"'\s]+)(?:\/[^"'\\\s]*)?/g, (full, id) => map[id] || full);
  for (const f of files) {
    let text = replaceUrls(blob[f]);
    if (f.endsWith('rfr-data.js') && text.includes('const wix =') && !text.includes('LOCAL_WIX')) {
      const literal = JSON.stringify(map, null, 2);
      text = text.replace(
        /const wix = \(id, name, w, h\) =>[\s\S]*?;/,
        'const LOCAL_WIX = ' + literal + ';\n  const wix = (id, name, w, h) => LOCAL_WIX[id] || (W + id + "/v1/fill/w_" + w + ",h_" + h + ",al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/" + (name || "image"));'
      );
    }
    if (text !== blob[f]) fs.writeFileSync(f, text);
  }
  return { map, failures, bytes };
}

function loadRfr() {
  const code = fs.readFileSync(path.join(ROOT, 'rfr-data.js'), 'utf8');
  const sandbox = {
    localStorage: { getItem() { return null; }, setItem() {} },
    CustomEvent: class CustomEvent {},
    dispatchEvent() {},
    addEventListener() {},
    document: {
      readyState: 'loading',
      addEventListener() {},
      getElementById() { return null; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      createElement() { return { style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {}, addEventListener() {} }; },
      body: { appendChild() {} },
      documentElement: { classList: { add() {} } }
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'rfr-data.js' });
  if (!sandbox.RFR) throw new Error('RFR data did not load');
  return sandbox.RFR;
}

function rewriteLinks(html) {
  const pairs = [
    ['rfr-listings.dc.html#l/', '/listings/'],
    ['rfr-areas.dc.html#a/', '/areas/'],
    ['RFR%20Website%20v9.dc.html', '/'],
    ['rfr-buy-sell-lease.dc.html', '/buy-sell-lease'],
    ['rfr-listings.dc.html', '/listings/'],
    ['rfr-offplan.dc.html', '/off-plan/'],
    ['rfr-areas.dc.html', '/areas/'],
    ['rfr-services.dc.html', '/services'],
    ['rfr-about.dc.html', '/about'],
    ['rfr-market.dc.html', '/market'],
    ['rfr-island-3d.html', '/island']
  ];
  for (const [from, to] of pairs) html = html.split(from).join(to);
  html = html.replaceAll("href: '#l/' +", "href: '/listings/' +");
  html = html.replaceAll("window.location.hash = '#l/' + x.slug;", "window.location.assign('/listings/' + x.slug);");
  html = html.replaceAll("href: '#a/' +", "href: '/areas/' +");
  html = html.replaceAll("window.location.hash = '#a/' + a.slug;", "window.location.assign('/areas/' + a.slug);");
  html = html.replaceAll('href="#a/', 'href="/areas/');
  return html;
}

function rootRelative(html) {
  return html.replace(/\b(src|href)="(?!\/|https?:|#|mailto:|tel:|data:|\/\/)([^"]*)"/g, (full, attr, url) => {
    if (!url || url.startsWith('{{')) return full;
    return attr + '="/' + url.replace(/^\.\//, '') + '"';
  });
}

const BUSINESS = {
  '@type': ['RealEstateAgent', 'LocalBusiness'],
  '@id': ORIGIN + '/#business',
  name: 'RFR Real Estate & Advisory FZ-LLC',
  alternateName: 'RFR Real Estate',
  url: ORIGIN + '/',
  logo: ORIGIN + '/brand/logo/rfr-gold.png',
  image: ORIGIN + '/brand/logo/rfr-navy.png',
  email: 'info@rfrrealestate.com',
  telephone: '+971585015885',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ras Al Khaimah',
    addressCountry: 'AE'
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Ras Al Khaimah' },
    { '@type': 'Place', name: 'Al Marjan Island' }
  ],
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '16:00' }
  ]
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': ORIGIN + '/#website',
  name: 'RFR Real Estate',
  url: ORIGIN + '/',
  publisher: { '@id': ORIGIN + '/#business' },
  inLanguage: 'en'
};

const FAQ = [
  ['Which areas do you cover?', 'Mainly Al Marjan Island, Mina Al Arab, Al Hamra Village and Downtown RAK. We don’t work outside Ras Al Khaimah.'],
  ['Do you work with both buyers and tenants?', 'Yes, and owners too. You keep the same contact whatever you need.'],
  ['Can you help if I’m buying from abroad?', 'Yes, many of our clients live overseas. We view properties for you on video and can manage the place once you own it.'],
  ['Is Ras Al Khaimah a good area for property investment?', 'Often, yes. Prices are well below Dubai, Wynn opens in 2027 and beachfront is limited. We’ll tell you if it doesn’t suit you.'],
  ['How do you screen tenants?', 'We check ID, visa, income and past landlord references. You approve every tenant.'],
  ['How do I get started?', 'Call, WhatsApp or email. It’s free, there’s no commitment, and we’ll suggest a next step.']
];

function jsonLd(crumbs, extra) {
  const graph = [
    BUSINESS,
    WEBSITE,
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: ORIGIN + c.path
      }))
    }
  ];
  if (extra) graph.push(...extra);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function headBlock({ title, description, path, crumbs, image, faq, extraLd }) {
  assertMeta(title, description);
  const url = ORIGIN + path;
  const img = image || (ORIGIN + '/brand/photos/hero-clean.jpg');
  const ld = [jsonLd(crumbs, extraLd)];
  if (faq) {
    ld[0] = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': JSON.parse(ld[0])['@graph'].concat([{
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      }])
    });
  }
  return [
    '<meta name="description" content="' + esc(description) + '">',
    '<link rel="canonical" href="' + esc(url) + '">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(description) + '">',
    '<meta property="og:url" content="' + esc(url) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="RFR Real Estate">',
    '<meta property="og:locale" content="en_AE">',
    '<meta property="og:image" content="' + esc(img) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(title) + '">',
    '<meta name="twitter:description" content="' + esc(description) + '">',
    '<meta name="twitter:image" content="' + esc(img) + '">',
    '<script type="application/ld+json">' + ld[0] + '</script>'
  ].join('\n');
}

function injectHead(html, meta) {
  html = html.replace(/<html\b[^>]*>/i, '<html lang="en">');
  html = html.replace(/\s*<title>[^<]*<\/title>/i, '');
  html = html.replace(/\s*<meta\s+name="description"[^>]*>/i, '');
  const title = '<title>' + esc(meta.title) + '</title>';
  const block = title + '\n' + headBlock(meta);
  if (/<head>/i.test(html)) html = html.replace(/<head>/i, '<head>\n' + block);
  else throw new Error('no head');
  return html;
}

const PAGE_META = {
  'index.html': {
    path: '/',
    title: 'Ras Al Khaimah Real Estate | RFR',
    description: 'Buy, sell and lease property on Al Marjan Island and across Ras Al Khaimah with RFR, a local advisory firm.',
    crumbs: [{ name: 'Home', path: '/' }]
  },
  'RFR Website v9.dc.html': {
    path: '/',
    title: 'Ras Al Khaimah Real Estate | RFR',
    description: 'Buy, sell and lease property on Al Marjan Island and across Ras Al Khaimah with RFR, a local advisory firm.',
    crumbs: [{ name: 'Home', path: '/' }]
  },
  'rfr-about.dc.html': {
    path: '/about',
    title: 'About RFR Real Estate in RAK',
    description: 'RFR is a Ras Al Khaimah brokerage for Al Marjan Island, Mina Al Arab, Al Hamra Village and Downtown RAK.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }],
    faq: true
  },
  'rfr-areas.dc.html': {
    path: '/areas/',
    title: 'Ras Al Khaimah Areas | RFR',
    description: 'Area guides for Al Marjan Island, Mina Al Arab, Al Hamra Village and Downtown RAK: prices, residents and what is nearby.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Areas', path: '/areas/' }]
  },
  'rfr-listings.dc.html': {
    path: '/listings/',
    title: 'RAK Property Listings | RFR',
    description: 'Homes for sale and rent in Ras Al Khaimah and on Al Marjan Island, plus off-plan launches listed by RFR.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Listings', path: '/listings/' }]
  },
  'rfr-buy-sell-lease.dc.html': {
    path: '/buy-sell-lease',
    title: 'Buy, Sell or Lease in RAK | RFR',
    description: 'Tell RFR if you are buying, selling or leasing in Ras Al Khaimah. Same-day advice from a local advisor, with no obligation.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Buy, sell or lease', path: '/buy-sell-lease' }]
  },
  'rfr-market.dc.html': {
    path: '/market',
    title: 'Al Marjan Market Note | RFR',
    description: 'What the Wynn opening means for Al Marjan Island prices, rents and off-plan launches in Ras Al Khaimah.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Market note', path: '/market' }]
  },
  'rfr-offplan.dc.html': {
    path: '/off-plan/',
    title: 'Off-Plan Property in RAK | RFR',
    description: 'Off-plan launches on Al Marjan Island: developers, payment plans, handover dates and starting prices, with RFR.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Off-plan', path: '/off-plan/' }]
  },
  'rfr-services.dc.html': {
    path: '/services',
    title: 'RAK Property Services | RFR',
    description: 'Sales, leasing, property management and investment advice in Ras Al Khaimah, with one RFR advisor throughout.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]
  },
  'rfr-island-3d.html': {
    path: '/island',
    title: 'Al Marjan Island Map | RFR',
    description: 'A study of Al Marjan Island in Ras Al Khaimah, the coast where RFR advises buyers, sellers and tenants.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Al Marjan Island map', path: '/island' }]
  }
};

function hashRedirect(kind) {
  const re = kind === 'listing' ? '^#l\\/([^?]+)' : '^#a\\/([^?]+)';
  const base = kind === 'listing' ? '/listings/' : '/areas/';
  return '<script>(function(){var m=(location.hash||"").match(/' + re + '/);if(m)location.replace("' + base + '"+decodeURIComponent(m[1]));})();</script>';
}

function listingCards(R) {
  return R.LISTINGS.map((l) => {
    const area = R.AREAS.find((a) => a.slug === l.area);
    const purpose = l.offplan ? 'Off-plan' : l.cat === 'rent' ? 'Rent' : 'Buy';
    const price = money(l.price) + (l.cat === 'rent' && l.price != null ? ' / yr' : '');
    const bits = [l.beds ? (l.beds + ' bed') : (l.type === 'Residential plot' ? null : 'Studio'), l.baths ? l.baths + ' bath' : null, l.sqft ? Number(l.sqft).toLocaleString('en-US') + ' sq ft' : null].filter(Boolean).join(' · ');
    return '<a href="/listings/' + l.slug + '" data-h="1" style="display:block;color:#071A2B;">'
      + '<div style="position:relative;aspect-ratio:4/3;overflow:hidden;background:#071A2B;"><img src="' + esc(l.img) + '" alt="' + esc(l.title) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></div>'
      + '<div style="display:flex;justify-content:space-between;gap:12px;margin-top:14px;"><span style="font-size:9.5px;letter-spacing:.2em;color:rgba(7,26,43,.55);font-weight:500;">' + esc((purpose + ' — ' + (area ? area.short : 'RAK')).toUpperCase()) + '</span><span style="font-family:\'The Seasons\',\'Cormorant Garamond\',serif;font-weight:500;">' + esc(price) + '</span></div>'
      + '<div style="margin-top:6px;font-family:\'The Seasons\',\'Cormorant Garamond\',serif;font-weight:500;font-size:clamp(19px,1.5vw,26px);line-height:1.25;">' + esc(l.title) + '</div>'
      + '<div style="margin-top:8px;font-size:11px;letter-spacing:.14em;color:rgba(7,26,43,.62);">' + esc(bits) + '</div>'
      + '</a>';
  }).join('\n');
}

function shell({ title, description, path, crumbs, image, body, extraLd }) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + esc(title) + '</title>\n'
    + headBlock({ title, description, path, crumbs, image, extraLd }) + '\n'
    + '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&amp;display=swap">\n'
    + '<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&amp;display=swap">\n'
    + '<style>\n'
    + 'html{scroll-behavior:smooth}body{margin:0;background:#F3EFE7;color:#071A2B;font-family:Satoshi,\'Helvetica Neue\',sans-serif;-webkit-font-smoothing:antialiased}\n'
    + 'a{color:inherit;text-decoration:none}a:hover{opacity:.72}img{max-width:100%}\n'
    + 'header{position:sticky;top:0;z-index:20;height:84px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 clamp(20px,3.4vw,64px);background:#071A2B;color:#F3EFE7}\n'
    + 'header nav{display:flex;gap:22px;font-size:12.5px;font-weight:500;letter-spacing:.05em}\n'
    + 'main{padding:clamp(36px,6vh,72px) clamp(20px,3.4vw,64px) clamp(64px,10vh,120px)}\n'
    + '.wrap{max-width:1100px;margin:0 auto}\n'
    + 'h1{margin:18px 0 0;font-family:\'Cormorant Garamond\',serif;font-weight:500;font-size:clamp(40px,6vw,84px);line-height:1;letter-spacing:-.012em}\n'
    + '.tag{font-family:\'Cormorant Garamond\',serif;font-style:italic;font-weight:600;color:#B08D4F;font-size:15px}\n'
    + '.lede{font-family:\'Cormorant Garamond\',serif;font-weight:500;font-size:clamp(22px,2vw,32px);line-height:1.35;margin:28px 0 0}\n'
    + '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 28px;margin-top:28px}\n'
    + '.stat{padding-top:14px;border-top:1px solid rgba(7,26,43,.3)}\n'
    + '.k{display:block;font-size:9.5px;letter-spacing:.2em;color:rgba(7,26,43,.55);font-weight:500}\n'
    + '.v{display:block;margin-top:8px;font-family:\'Cormorant Garamond\',serif;font-weight:500;font-size:20px;line-height:1.35}\n'
    + 'ul.plain{list-style:none;padding:0;margin:12px 0 0}ul.plain li{padding:11px 0;border-bottom:1px solid rgba(7,26,43,.12);font-size:14px}\n'
    + '.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 18px;background:#071A2B;color:#F3EFE7;font-size:11px;letter-spacing:.16em;font-weight:500}\n'
    + '.btn.alt{background:transparent;color:#071A2B;border:1px solid rgba(7,26,43,.4)}\n'
    + 'footer{background:#071A2B;color:#F3EFE7;padding:48px clamp(20px,3.4vw,64px) 28px}\n'
    + 'footer a{color:rgba(243,239,231,.78)}\n'
    + '.hero{position:relative;min-height:52vh;display:flex;align-items:flex-end;background:#071A2B;color:#F3EFE7;overflow:hidden}\n'
    + '.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.9}\n'
    + '.hero .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,26,43,.55),rgba(7,26,43,.15) 40%,rgba(7,26,43,.9))}\n'
    + '.hero .inner{position:relative;padding:120px clamp(20px,3.4vw,64px) 48px;max-width:1100px}\n'
    + '@media(max-width:800px){header nav{display:none}.grid{grid-template-columns:1fr}}\n'
    + '</style>\n</head>\n<body>\n'
    + '<header><a href="/"><img src="/brand/logo/rfr-gold.png" alt="RFR Real Estate" style="height:44px;display:block"></a>'
    + '<nav><a href="/buy-sell-lease#buy">Buy</a><a href="/buy-sell-lease#sell">Sell</a><a href="/buy-sell-lease#lease">Lease</a><a href="/listings/">Listings</a><a href="/about">About</a></nav>'
    + '<a href="https://wa.me/971585015885" style="font-size:11px;letter-spacing:.14em">WHATSAPP</a></header>\n'
    + body
    + '<footer><div class="wrap" style="max-width:1100px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:28px">'
    + '<div><img src="/brand/logo/rfr-gold.png" alt="RFR" style="height:48px"><p style="font-family:\'Cormorant Garamond\',serif;font-style:italic;color:#D2B77D;font-size:22px">Wherever you call home.</p></div>'
    + '<div><div style="font-size:10px;letter-spacing:.22em;color:rgba(243,239,231,.45);margin-bottom:12px">NAVIGATE</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px"><a href="/">Home</a><a href="/listings/">Listings</a><a href="/off-plan/">Off-plan</a><a href="/areas/">Areas</a><a href="/services">Services</a><a href="/about">About</a><a href="/market">Market note</a></div></div>'
    + '<div><div style="font-size:10px;letter-spacing:.22em;color:rgba(243,239,231,.45);margin-bottom:12px">CONTACT</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px"><a href="tel:+971585015885">+971 58 501 5885</a><a href="mailto:info@rfrrealestate.com">info@rfrrealestate.com</a><span>Ras Al Khaimah, United Arab Emirates</span><span style="color:rgba(243,239,231,.5)">Mon–Fri 9–6 · Sat 10–4</span></div></div>'
    + '</div><p style="max-width:1100px;margin:28px auto 0;padding-top:16px;border-top:1px solid rgba(210,183,125,.2);font-size:12px;color:rgba(243,239,231,.45)">© 2026 RFR Real Estate &amp; Advisory FZ-LLC · Licensed in Ras Al Khaimah</p></footer>\n'
    + '</body>\n</html>\n';
}

function writeDetailPages(R) {
  const urls = [];
  for (const a of R.AREAS) {
    const pathUrl = '/areas/' + a.slug;
    const title = clip(a.name + ' Property | RFR', 60);
    const description = clip(a.tag.replace(/\.$/, '') + ' in Ras Al Khaimah. ' + a.intro, 155);
    const crumbs = [{ name: 'Home', path: '/' }, { name: 'Areas', path: '/areas/' }, { name: a.name, path: pathUrl }];
    const body = '<section class="hero"><img src="' + esc(a.img) + '" alt="' + esc(a.name) + '"><div class="shade"></div><div class="inner">'
      + '<a href="/areas/" style="letter-spacing:.16em;font-size:12px">← ALL AREAS</a>'
      + '<h1>' + esc(a.name) + '</h1><p class="tag" style="color:#D2B77D;font-size:clamp(18px,2vw,28px)">' + esc(a.tag) + '</p></div></section>'
      + '<main><div class="wrap"><p class="lede">' + esc(a.intro) + '</p>'
      + '<div class="grid"><div class="stat"><span class="k">TO BUY</span><span class="v">' + esc(a.buy) + '</span></div>'
      + '<div class="stat"><span class="k">TO RENT</span><span class="v">' + esc(a.rent) + '</span></div>'
      + '<div class="stat"><span class="k">GROSS YIELD</span><span class="v">' + esc(a.yieldRange) + '</span></div></div>'
      + '<h2 class="tag" style="margin-top:48px">( 01 ) WHO LIVES HERE</h2><p style="max-width:62ch;line-height:1.7">' + esc(a.who) + '</p>'
      + '<h2 class="tag" style="margin-top:36px">( 02 ) ON THE DOORSTEP</h2><ul class="plain">' + a.amen.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>'
      + '<blockquote style="margin:36px 0 0;padding-top:18px;border-top:1px solid rgba(7,26,43,.3);font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:26px;line-height:1.4">' + esc(a.note) + '<span style="display:block;margin-top:10px;font-family:Satoshi,sans-serif;font-style:normal;font-size:10px;letter-spacing:.2em;color:rgba(7,26,43,.55)">RFR ADVISORY</span></blockquote>'
      + '<p style="margin-top:28px;display:flex;flex-wrap:wrap;gap:10px"><a class="btn" href="/listings/#q?area=' + a.slug + '">LISTINGS IN ' + esc(a.short) + '</a><a class="btn alt" href="/off-plan/">OFF-PLAN LAUNCHES</a><a class="btn alt" href="' + esc(R.wa('Hello RFR — I am looking at ' + a.name + '.')) + '">ASK US</a></p>'
      + '<p style="margin-top:18px;font-size:12px;color:rgba(7,26,43,.55)">Ranges are indicative, based on RFR listings and public launch data. Exact figures for any unit on request.</p>'
      + '</div></main>';
    const extra = [{
      '@type': 'Place',
      name: a.name,
      description: a.intro,
      url: ORIGIN + pathUrl,
      image: abs(a.img),
      containedInPlace: { '@type': 'AdministrativeArea', name: 'Ras Al Khaimah' },
      geo: { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng }
    }];
    fs.mkdirSync(path.join(ROOT, 'areas'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'areas', a.slug + '.html'), shell({ title, description, path: pathUrl, crumbs, image: abs(a.img), body, extraLd: extra }));
    urls.push({ loc: pathUrl, title, description });
  }

  for (const l of R.LISTINGS) {
    const area = R.AREAS.find((a) => a.slug === l.area);
    const pathUrl = '/listings/' + l.slug;
    const title = clip(l.title + ' | RFR', 60);
    const where = area ? area.name : 'Ras Al Khaimah';
    const description = clip(l.desc + ' ' + where + ', Ras Al Khaimah.', 155);
    const crumbs = [{ name: 'Home', path: '/' }, { name: 'Listings', path: '/listings/' }, { name: l.title, path: pathUrl }];
    const price = money(l.price) + (l.cat === 'rent' && l.price != null ? ' per year' : '');
    const purpose = l.offplan ? 'Off-plan' : l.cat === 'rent' ? 'For rent' : 'For sale';
    const rows = [
      ['Status', l.status],
      ['Type', l.type],
      ['Area', where],
      ['Bedrooms', l.beds ? String(l.beds) : (l.type === 'Residential plot' ? '—' : 'Studio')],
      ['Bathrooms', l.baths ? String(l.baths) : '—'],
      ['Size', l.sqft ? Number(l.sqft).toLocaleString('en-US') + ' sq ft' : '—'],
      ['Furnishing', l.furnishing],
      ['View', l.view]
    ];
    if (l.developer) rows.push(['Developer', l.developer], ['Handover', l.handover], ['Payment plan', l.plan]);
    const imgs = [l.img].concat(l.extra || []).filter(Boolean);
    const body = '<main><div class="wrap"><a href="/listings/" style="letter-spacing:.16em;font-size:12px"><span class="tag">←</span> ALL LISTINGS</a>'
      + '<p class="tag" style="margin-top:22px">' + esc(purpose.toUpperCase()) + ' — ' + esc((area ? area.short : 'RAS AL KHAIMAH')) + '</p>'
      + '<h1>' + esc(l.title) + '</h1>'
      + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:clamp(28px,3vw,44px);margin:12px 0 0">' + esc(price) + '</p>'
      + '<img src="' + esc(l.img) + '" alt="' + esc(l.title) + '" style="display:block;width:100%;aspect-ratio:16/10;object-fit:cover;margin-top:28px;background:#071A2B">'
      + (imgs.length > 1 ? '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">' + imgs.slice(1, 5).map((src) => '<img src="' + esc(src) + '" alt="' + esc(l.title) + '" style="width:100%;aspect-ratio:4/3;object-fit:cover">').join('') + '</div>' : '')
      + '<p class="lede">' + esc(l.desc) + '</p>'
      + '<h2 class="tag" style="margin-top:36px">( 01 ) SPECIFICATION</h2>'
      + '<dl class="grid" style="grid-template-columns:1fr 1fr">' + rows.map(([k, v]) => '<div class="stat"><dt class="k">' + esc(k.toUpperCase()) + '</dt><dd class="v" style="margin:8px 0 0">' + esc(v || '—') + '</dd></div>').join('') + '</dl>'
      + '<p style="margin-top:28px;font-size:14px;line-height:1.6">' + esc(where) + ', Ras Al Khaimah. Exact address on viewing.</p>'
      + '<p style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="' + esc(R.wa('Hello RFR — I would like to know more about ' + l.title + ' (' + l.slug + ').')) + '">WHATSAPP</a><a class="btn alt" href="tel:+971585015885">CALL</a>'
      + (area ? '<a class="btn alt" href="/areas/' + area.slug + '">' + esc(area.short) + '</a>' : '') + '</p>'
      + '</div></main>';
    const offer = l.price == null ? null : {
      '@type': 'Offer',
      price: String(l.price),
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
      url: ORIGIN + pathUrl
    };
    const extra = [{
      '@type': 'RealEstateListing',
      name: l.title,
      description: l.desc,
      url: ORIGIN + pathUrl,
      image: imgs.map(abs),
      address: { '@type': 'PostalAddress', addressLocality: where, addressRegion: 'Ras Al Khaimah', addressCountry: 'AE' }
    }];
    if (offer) extra[0].offers = offer;
    fs.mkdirSync(path.join(ROOT, 'listings'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'listings', l.slug + '.html'), shell({ title, description, path: pathUrl, crumbs, image: abs(l.img), body, extraLd: extra }));
    urls.push({ loc: pathUrl, title, description });
  }

  for (const p of R.PROJECTS) {
    const pathUrl = '/off-plan/' + p.slug;
    const title = clip(p.name + ' | RFR', 60);
    const description = clip(p.note + ' Off-plan on Al Marjan Island, from ' + money(p.from) + '. Handover ' + p.handover + '.', 155);
    const crumbs = [{ name: 'Home', path: '/' }, { name: 'Off-plan', path: '/off-plan/' }, { name: p.name, path: pathUrl }];
    const body = '<main><div class="wrap"><a href="/off-plan/" style="letter-spacing:.16em;font-size:12px">← ALL LAUNCHES</a>'
      + '<p class="tag" style="margin-top:22px">OFF-PLAN — AL MARJAN ISLAND</p>'
      + '<h1>' + esc(p.name) + '</h1>'
      + '<p style="margin-top:10px;letter-spacing:.16em;font-size:12px">' + esc(p.dev.toUpperCase()) + '</p>'
      + '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" style="display:block;width:100%;aspect-ratio:16/10;object-fit:cover;margin-top:28px;background:#071A2B">'
      + '<p class="lede">' + esc(p.note) + '</p>'
      + '<div class="grid"><div class="stat"><span class="k">FROM</span><span class="v">' + esc(money(p.from)) + '</span></div>'
      + '<div class="stat"><span class="k">HANDOVER</span><span class="v">' + esc(p.handover) + '</span></div>'
      + '<div class="stat"><span class="k">PAYMENT PLAN</span><span class="v">' + esc(p.plan) + '</span></div>'
      + '<div class="stat"><span class="k">UNIT MIX</span><span class="v">' + esc(p.mix) + '</span></div>'
      + '<div class="stat"><span class="k">DEVELOPER</span><span class="v">' + esc(p.dev) + '</span></div>'
      + '<div class="stat"><span class="k">AREA</span><span class="v">' + esc(p.area) + '</span></div></div>'
      + '<p style="margin-top:28px;font-size:14px;line-height:1.7;max-width:62ch">Starting prices. Floor, view and the payment plan change the figure. Ask RFR what is still available before you reserve.</p>'
      + '<p style="margin-top:22px"><a class="btn" href="' + esc(R.wa('Hello RFR — please send the brochure and availability for ' + p.name + ' (' + p.dev + ').')) + '">REQUEST THE BROCHURE</a></p>'
      + '</div></main>';
    const extra = [{
      '@type': 'RealEstateListing',
      name: p.name,
      description: p.note,
      url: ORIGIN + pathUrl,
      image: abs(p.img),
      address: { '@type': 'PostalAddress', addressLocality: 'Al Marjan Island', addressRegion: 'Ras Al Khaimah', addressCountry: 'AE' },
      offers: { '@type': 'Offer', price: String(p.from), priceCurrency: 'AED', url: ORIGIN + pathUrl }
    }];
    fs.mkdirSync(path.join(ROOT, 'off-plan'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'off-plan', p.slug + '.html'), shell({ title, description, path: pathUrl, crumbs, image: abs(p.img), body, extraLd: extra }));
    urls.push({ loc: pathUrl, title, description });
  }
  return urls;
}

function abs(src) {
  if (!src) return ORIGIN + '/brand/photos/hero-clean.jpg';
  if (src.startsWith('http')) return src;
  return ORIGIN + (src.startsWith('/') ? src : '/' + src);
}

function writeFeeds(R, detailUrls) {
  const staticPages = Object.values(PAGE_META)
    .filter((p) => p.path !== '/' || true)
    .filter((p, i, arr) => arr.findIndex((x) => x.path === p.path) === i);
  const urls = staticPages.map((p) => p.path).concat(detailUrls.map((d) => d.loc));
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => '  <url><loc>' + ORIGIN + u + '</loc></url>').join('\n')
    + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), body);

  fs.writeFileSync(path.join(ROOT, 'robots.txt'), [
    '# RFR Real Estate — crawling is allowed, including AI answer engines.',
    'User-agent: *',
    'Allow: /',
    '',
    '# Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    '',
    'Sitemap: ' + ORIGIN + '/sitemap.xml',
    ''
  ].join('\n'));

  const lines = [];
  lines.push('# RFR Real Estate');
  lines.push('');
  lines.push('> RFR Real Estate & Advisory FZ-LLC is a brokerage and advisory firm that works only in Ras Al Khaimah, UAE. The practice concentrates on Al Marjan Island, Mina Al Arab, Al Hamra Village and Downtown RAK. Clients buy, sell, lease and manage homes, including off-plan launches on Al Marjan Island.');
  lines.push('');
  lines.push('The firm is licensed in Ras Al Khaimah. It does not publish a street address. Contact is by phone, WhatsApp or email.');
  lines.push('');
  lines.push('- Phone: +971 58 501 5885');
  lines.push('- WhatsApp: https://wa.me/971585015885');
  lines.push('- Email: info@rfrrealestate.com');
  lines.push('- Hours: Monday–Friday 9:00–18:00, Saturday 10:00–16:00 (Gulf Standard Time)');
  lines.push('- Areas: Al Marjan Island, Mina Al Arab, Al Hamra Village, Downtown RAK');
  lines.push('- Services: sales, leasing, property management, investment consultation, off-plan launches');
  lines.push('');
  lines.push('## Pages');
  lines.push('');
  for (const p of staticPages) lines.push('- [' + p.title + '](' + ORIGIN + p.path + '): ' + p.description);
  lines.push('');
  lines.push('## Areas');
  lines.push('');
  for (const a of R.AREAS) lines.push('- [' + a.name + '](' + ORIGIN + '/areas/' + a.slug + '): ' + a.tag + ' ' + a.intro);
  lines.push('');
  lines.push('## Listings');
  lines.push('');
  for (const l of R.LISTINGS) {
    const area = R.AREAS.find((a) => a.slug === l.area);
    lines.push('- [' + l.title + '](' + ORIGIN + '/listings/' + l.slug + '): ' + (l.offplan ? 'Off-plan' : l.cat) + ' in ' + (area ? area.name : 'Ras Al Khaimah') + '. ' + l.desc + ' ' + money(l.price) + (l.cat === 'rent' && l.price != null ? ' per year.' : '.'));
  }
  lines.push('');
  lines.push('## Off-plan launches');
  lines.push('');
  for (const p of R.PROJECTS) lines.push('- [' + p.name + '](' + ORIGIN + '/off-plan/' + p.slug + '): ' + p.dev + ', ' + p.area + ', from ' + money(p.from) + ', handover ' + p.handover + ', plan ' + p.plan + '. ' + p.note);
  lines.push('');
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), lines.join('\n'));
}

function writeRedirects(R) {
  const lines = [
    '# Permanent redirects to canonical https://www.rfrrealestate.com URLs.',
    '# Cloudflare static-asset hosting reads this file. Domain and scheme',
    '# redirects (apex, http) are not supported here — see the pull request.',
    '/index.html / 301',
    '/rfr-about.dc /about 301',
    '/rfr-about.dc.html /about 301',
    '/about.html /about 301',
    '/rfr-areas.dc /areas/ 301',
    '/rfr-areas.dc.html /areas/ 301',
    '/areas /areas/ 301',
    '/rfr-listings.dc /listings/ 301',
    '/rfr-listings.dc.html /listings/ 301',
    '/listings /listings/ 301',
    '/rfr-buy-sell-lease.dc /buy-sell-lease 301',
    '/rfr-buy-sell-lease.dc.html /buy-sell-lease 301',
    '/buy-sell-lease.html /buy-sell-lease 301',
    '/rfr-market.dc /market 301',
    '/rfr-market.dc.html /market 301',
    '/market.html /market 301',
    '/rfr-offplan.dc /off-plan/ 301',
    '/rfr-offplan.dc.html /off-plan/ 301',
    '/off-plan /off-plan/ 301',
    '/offplan /off-plan/ 301',
    '/rfr-services.dc /services 301',
    '/rfr-services.dc.html /services 301',
    '/services.html /services 301',
    '/rfr-island-3d /island 301',
    '/rfr-island-3d.html /island 301',
    '/island.html /island 301',
    '/RFR Website v9.dc / 301',
    '/RFR%20Website%20v9.dc / 301',
    '/RFR Website v9.dc.html / 301',
    '/RFR%20Website%20v9.dc.html / 301',
    '# Legacy Wix empty pages. Wayback only retained robots.txt for this host;',
    '# /blank is the Wix placeholder the audit found. blank-1..3 are the usual Wix copies.',
    '/blank / 301',
    '/blank-1 / 301',
    '/blank-2 / 301',
    '/blank-3 / 301'
  ];
  for (const a of R.AREAS) lines.push('/areas/' + a.slug + '.html /areas/' + a.slug + ' 301');
  for (const l of R.LISTINGS) lines.push('/listings/' + l.slug + '.html /listings/' + l.slug + ' 301');
  for (const p of R.PROJECTS) lines.push('/off-plan/' + p.slug + '.html /off-plan/' + p.slug + ' 301');
  fs.writeFileSync(path.join(ROOT, '_redirects'), lines.join('\n') + '\n');
}

function linkProjects(html, R) {
  for (const p of R.PROJECTS) {
    const needle = '>' + p.name + '</span>';
    const repl = '><a href="/off-plan/' + p.slug + '" data-h="1" style="color:inherit">' + p.name + '</a></span>';
    if (!html.includes(needle)) console.warn('project name not found for link', p.name);
    html = html.split(needle).join(repl);
  }
  return html;
}

async function main() {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (home.includes('rel="canonical"')) {
    console.error('SEO tags are already present. This script is not safe to run twice.');
    process.exit(1);
  }
  const img = await selfHostImages();
  const R = loadRfr();
  if (!R.AREAS.length || !R.LISTINGS.length) throw new Error('empty data');

  const templates = {};
  for (const name of fs.readdirSync(ROOT)) {
    if (!name.endsWith('.html')) continue;
    let html = fs.readFileSync(path.join(ROOT, name), 'utf8');
    html = rewriteLinks(html);
    if (name === 'rfr-areas.dc.html') {
      const block = findTag(html, '<sc-if value="{{cur}}"');
      if (!block) throw new Error('area detail template missing');
      html = html.slice(0, block.start) + html.slice(block.end);
      html = html.replace(/<head>/i, '<head>\n' + hashRedirect('area'));
    }
    if (name === 'rfr-listings.dc.html') {
      const detail = findTag(html, '<sc-if value="{{cur}}"');
      if (!detail) throw new Error('listing detail template missing');
      html = html.slice(0, detail.start) + html.slice(detail.end);
      const grid = findTag(html, '<sc-for list="{{list}}" as="it" hint-placeholder-count="6">');
      const map = findTag(html, '<sc-for list="{{list}}" as="it" hint-placeholder-count="4">');
      if (!grid || !map) throw new Error('listing loops missing');
      templates.listingGrid = grid.html;
      templates.listingMap = map.html;
      const cards = '<div id="seo-grid-slot" class="seo-static">\n' + listingCards(R) + '\n</div>';
      html = html.slice(0, grid.start) + cards + html.slice(grid.end);
      const map2 = findTag(html, '<sc-for list="{{list}}" as="it" hint-placeholder-count="4">');
      html = html.slice(0, map2.start) + '<div id="seo-map-slot"></div>' + html.slice(map2.end);
      html = html.replace('href="{{briefWa}}"', 'href="https://wa.me/971585015885?text=Hello%20RFR%20%E2%80%94%20please%20send%20a%20private%20shortlist."');
      const boot = '<script src="/seo/dc-templates.js"></script>\n'
        + '<script>document.documentElement.classList.add("js")</script>\n'
        + '<style>.js .seo-static{display:none!important} sc-if,sc-for{display:block}</style>\n'
        + hashRedirect('listing');
      html = html.replace(/<head>/i, '<head>\n' + boot);
      html = html.replace('</x-dc>', '<script>(function(){var g=document.getElementById("seo-grid-slot"),m=document.getElementById("seo-map-slot");if(g&&window.RFR_TPL)g.insertAdjacentHTML("afterend",window.RFR_TPL.listingGrid);if(m&&window.RFR_TPL)m.insertAdjacentHTML("afterend",window.RFR_TPL.listingMap);})();</script>\n</x-dc>');
    }
    if (name === 'rfr-offplan.dc.html') html = linkProjects(html, R);
    const meta = PAGE_META[name];
    if (!meta) throw new Error('no meta for ' + name);
    html = injectHead(html, meta);
    html = rootRelative(html);
    fs.writeFileSync(path.join(ROOT, name), html);
  }

  fs.mkdirSync(path.join(ROOT, 'seo'), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, 'seo/dc-templates.js'),
    'window.RFR_TPL=' + JSON.stringify(templates) + ';\n'
  );

  const copies = [
    ['rfr-about.dc.html', 'about.html'],
    ['rfr-buy-sell-lease.dc.html', 'buy-sell-lease.html'],
    ['rfr-market.dc.html', 'market.html'],
    ['rfr-services.dc.html', 'services.html'],
    ['rfr-island-3d.html', 'island.html'],
    ['rfr-areas.dc.html', 'areas/index.html'],
    ['rfr-listings.dc.html', 'listings/index.html'],
    ['rfr-offplan.dc.html', 'off-plan/index.html']
  ];
  for (const [from, to] of copies) {
    const dest = path.join(ROOT, to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, from), dest);
  }

  const detailUrls = writeDetailPages(R);
  writeFeeds(R, detailUrls);
  writeRedirects(R);

  const report = { images: Object.keys(img.map).length, imageFailures: img.failures, bytes: img.bytes };
  fs.writeFileSync(path.join(ROOT, 'seo/build-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
