/* RFR shared data + helpers (global). Loaded from <helmet> on every page. */
(function () {
  const W = 'https://static.wixstatic.com/media/';
  const AM = 'https://al-marjanisland.com/wp-content/uploads/';
  const wix = (id, name, w, h) => W + id + '/v1/fill/w_' + w + ',h_' + h + ',al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/' + name;
  const IMG = {
    living: wix('e0d1cd_44d4c7a2994b4e65ac70275785b4a91c~mv2.jpg', '1758366660-image2-plain.jpg', 1400, 1050),
    bedroom: wix('11062b_efd1208e66d941c8b0059ee7fb6fa839~mv2.jpg', 'Modern%20Bedroom%20Design.jpg', 1400, 1050),
    space: wix('11062b_0ddd359e3ec74e4ea8619f53b42eebda~mv2.jpg', 'Modern%20Living%20Space.jpg', 1400, 1050),
    room: wix('11062b_ee9203816e6d46f78d20eb83d1b183ed~mv2.png', 'Modern%20Living%20Room.png', 1400, 1050),
    villa: wix('e0d1cd_5ad9ffa7786c4fb4a7e86ef529d13d27~mv2.jpg', '1763543380-img-3559-plain.jpg', 1400, 1050),
    plot: wix('nsplsh_4fe1f4de2f494096bafde724d1474e71~mv2.jpg', 'Image%20by%20Usman%20Mehmood.jpg', 1400, 1050),
    wynn: wix('e0d1cd_4bff9bed686c49bbadc1b9a08d89751e~mv2.jpg', 'wynn%20image.jpg', 1920, 1200),
    address: AM + '2024/10/Address-Residences.jpg', nobu: AM + '2025/04/Nobu.jpeg', jw: AM + '2024/10/JW-Marriott-Residences-Al-Marjan-Island.jpg',
    nikki: AM + '2024/03/Nikki-Beach-Residences.jpeg', w: AM + '2026/08/W-Hotel-Residences.jpeg', costa: AM + '2025/02/Costa-Mare-Ellington-1024x601.jpg',
    manta: AM + '2024/10/Manta-Bay.jpg', sora: AM + '2025/04/Sora-beach.jpg', masa: AM + '2024/03/Masa-Residences-1024x1024.jpeg'
  };

  const AREAS = [
    { slug: 'al-marjan-island', name: 'Al Marjan Island', short: 'AL MARJAN ISLAND', lat: 25.684, lng: 55.729, img: IMG.wynn,
      tag: 'Four coral-shaped islands. One resort address.',
      intro: 'A man-made archipelago off the Al Hamra coast, Al Marjan Island is where the Emirate\u2019s branded-residence pipeline is concentrated \u2014 Address, Nobu, JW Marriott, Nikki Beach and W \u2014 with the Wynn integrated resort due to open in 2027.',
      buy: 'From ~AED 920K (studio) \u00b7 AED 1.7\u20133.5M for 1\u20132 bed branded', rent: '1-bed ~AED 65\u201390K / yr \u00b7 2-bed ~AED 75\u2013130K / yr', yieldRange: '6\u20138% gross (indicative)',
      who: 'Overseas investors, holiday-let owners, resort professionals and second-home buyers from Dubai.',
      amen: ['Wynn Al Marjan Island (2027)', 'Public and resort beaches', 'Al Hamra Mall \u2014 12 min', 'Al Hamra Marina \u2014 12 min', 'RAK Airport \u2014 35 min', 'Dubai (DXB) \u2014 55 min'],
      note: 'Supply is finite by design: the islands are fully master-planned, so the current launch wave is most of what will ever exist here.' },
    { slug: 'mina-al-arab', name: 'Mina Al Arab', short: 'MINA AL ARAB', lat: 25.745, lng: 55.826, img: IMG.villa,
      tag: 'Lagoons, mangroves and the quiet side of the coast.',
      intro: 'A low-rise waterfront community built around lagoons and protected mangroves, anchored by the Anantara and InterContinental resorts. Villas, townhouses and lagoon-front apartments in an established, family-led neighbourhood.',
      buy: 'Apartments from ~AED 800K \u00b7 Villas AED 2.5\u20136M', rent: '3-bed villa ~AED 85\u2013140K / yr \u00b7 2-bed apt ~AED 60\u201395K / yr', yieldRange: '5.5\u20137% gross (indicative)',
      who: 'Families relocating to RAK, long-term residents, and buyers who want water without the resort crowds.',
      amen: ['Anantara Mina Al Arab', 'InterContinental Mina Al Arab', 'Mangrove beach and boardwalks', 'RAK Academy \u2014 10 min', 'RAK city centre \u2014 15 min', 'RAK Airport \u2014 30 min'],
      note: 'The Ritz-Carlton Residences and Porto Playa are the next phase \u2014 the first branded product on this side of the coast.' },
    { slug: 'al-hamra-village', name: 'Al Hamra Village', short: 'AL HAMRA VILLAGE', lat: 25.691, lng: 55.787, img: IMG.space,
      tag: 'Golf, marina and the deepest rental market in RAK.',
      intro: 'The Emirate\u2019s original master community: an 18-hole championship golf course, a marina and yacht club, the Waldorf Astoria, a mall and a decade of tenants. Falcon Island \u2014 its private villa enclave \u2014 sits within it.',
      buy: 'Apartments from ~AED 500K \u00b7 Townhouses and villas AED 1.5\u20135M', rent: '1-bed ~AED 45\u201365K / yr \u00b7 3-bed villa ~AED 110\u2013160K / yr', yieldRange: '7\u20138.5% gross (indicative)',
      who: 'Families, golfers, Al Hamra and Wynn workforce, and investors who want tenants in place from day one.',
      amen: ['Al Hamra Golf Club', 'Al Hamra Marina & Yacht Club', 'Al Hamra Mall', 'Waldorf Astoria RAK', 'Falcon Island', 'Dubai (DXB) \u2014 50 min'],
      note: 'Closest established community to Al Marjan Island \u2014 the natural rental home for the resort workforce arriving in 2027.' },
    { slug: 'downtown-rak', name: 'Downtown RAK', short: 'DOWNTOWN RAK', lat: 25.789, lng: 55.945, img: IMG.room,
      tag: 'The working city: corniche, hospitals, offices.',
      intro: 'Al Nakheel, Julphar and the corniche \u2014 where the Emirate actually works. Towers and mid-rise apartments with the highest yields and the shortest commutes to RAKEZ, the hospitals and government.',
      buy: 'Apartments from ~AED 400K', rent: '2-bed ~AED 50\u201395K / yr', yieldRange: '7\u20139% gross (indicative)',
      who: 'Professionals, RAKEZ business owners, medical and education staff.',
      amen: ['RAK Hospital', 'Corniche Al Qawasim', 'Manar Mall', 'Julphar Towers', 'RAKEZ \u2014 10 min', 'RAK Airport \u2014 20 min'],
      note: 'Less glamour, more cash flow. Where we send clients who care about net yield over sea view.' }
  ];

  const L = [
    { slug: 'duplex-marjan', cat: 'rent', title: 'Luxury 2-bed duplex, furnished', price: 75960, area: 'al-marjan-island', beds: 2, baths: 3, sqft: 1860, type: 'Duplex apartment', status: 'Available', lat: 25.686, lng: 55.732, img: IMG.living, extra: [IMG.bedroom, IMG.space],
      desc: 'A furnished two-bedroom duplex on Al Marjan Island \u2014 double-height living, resort amenities and strong rental potential on the Emirate\u2019s most-watched address.', furnishing: 'Furnished', view: 'Sea and marina' },
    { slug: 'villa-juwais', cat: 'rent', title: '3-bed villa, ready to move into', price: 84850, area: 'mina-al-arab', beds: 3, baths: 4, sqft: 2410, type: 'Villa', status: 'New', lat: 25.752, lng: 55.858, img: IMG.villa, extra: [IMG.room, IMG.bedroom],
      desc: 'A three-bedroom family villa in Al Juwais, ready to move into \u2014 quiet, established streets on the Mina Al Arab side of the city.', furnishing: 'Unfurnished', view: 'Garden and community' },
    { slug: 'onebed-hamra', cat: 'rent', title: 'One-bedroom, utilities included', price: 85250, area: 'al-marjan-island', beds: 1, baths: 1, sqft: 780, type: 'Apartment', status: 'Available', lat: 25.681, lng: 55.726, img: IMG.room, extra: [IMG.space, IMG.bedroom],
      desc: 'A one-bedroom residence on Al Marjan Island with utilities included \u2014 turnkey resort living for a tenant who wants one bill.', furnishing: 'Furnished', view: 'Lagoon' },
    { slug: 'duplex-julphar', cat: 'rent', title: 'Luxury 2-bed duplex, furnished', price: 93580, area: 'downtown-rak', beds: 2, baths: 3, sqft: 1720, type: 'Duplex apartment', status: 'Under offer', lat: 25.791, lng: 55.946, img: IMG.bedroom, extra: [IMG.living, IMG.room],
      desc: 'A furnished two-bedroom duplex at Julphar Residence \u2014 city-side living with quick access to the corniche and the working heart of RAK.', furnishing: 'Furnished', view: 'City and creek' },
    { slug: 'onebed-falcon', cat: 'rent', title: 'Fully furnished 1-bed apartment', price: 65500, area: 'al-hamra-village', beds: 1, baths: 1, sqft: 820, type: 'Apartment', status: 'Available', lat: 25.699, lng: 55.781, img: IMG.space, extra: [IMG.room, IMG.living],
      desc: 'A fully furnished one-bedroom apartment on Falcon Island \u2014 turnkey and tenant-ready, in Al Hamra\u2019s island enclave.', furnishing: 'Furnished', view: 'Marina' },
    { slug: 'plot-mina', cat: 'buy', title: 'Residential plot close to the pool \u2014 last options', price: null, area: 'mina-al-arab', beds: 0, baths: 0, sqft: 6540, type: 'Residential plot', status: 'Last units', lat: 25.742, lng: 55.822, img: IMG.plot, extra: [IMG.villa, IMG.space],
      desc: 'A rare residential plot close to the community pool in Mina Al Arab \u2014 among the last options in this phase of the community.', furnishing: '\u2014', view: 'Community' },
    { slug: 'address-2bed', cat: 'buy', offplan: true, title: '2-bed at Address Residences', price: 2400000, area: 'al-marjan-island', beds: 2, baths: 3, sqft: 1290, type: 'Branded apartment', status: 'Launch', lat: 25.688, lng: 55.735, img: IMG.address, extra: [IMG.living, IMG.bedroom], developer: 'Emaar', handover: 'Q1 2028', plan: '80 / 20',
      desc: 'Emaar\u2019s first branded residences in Ras Al Khaimah, beachfront on Al Marjan Island \u2014 hotel services, Address management and a 2028 handover.', furnishing: 'Fitted kitchen', view: 'Sea' },
    { slug: 'nikki-1bed', cat: 'buy', offplan: true, title: '1-bed at Nikki Beach Residences', price: 1750000, area: 'al-marjan-island', beds: 1, baths: 2, sqft: 880, type: 'Branded apartment', status: 'Launch', lat: 25.683, lng: 55.724, img: IMG.nikki, extra: [IMG.space, IMG.room], developer: 'Aldar', handover: 'Q4 2028', plan: '60 / 40',
      desc: 'Aldar\u2019s Nikki Beach Residences \u2014 beach-club living with lagoon and sea frontage, a 60/40 plan and Q4 2028 handover.', furnishing: 'Fitted kitchen', view: 'Sea and lagoon' },
    { slug: 'costa-2bed', cat: 'buy', offplan: true, title: '2-bed at Costa Mare', price: 2100000, area: 'al-marjan-island', beds: 2, baths: 2, sqft: 1180, type: 'Apartment', status: 'Launch', lat: 25.680, lng: 55.731, img: IMG.costa, extra: [IMG.living, IMG.space], developer: 'Ellington', handover: 'Q3 2028', plan: '70 / 30',
      desc: 'Ellington\u2019s design-led Costa Mare \u2014 four towers on the island\u2019s southern beach, Ellington finishes and a 70/30 payment plan.', furnishing: 'Fitted kitchen', view: 'Sea' },
    { slug: 'manta-studio', cat: 'buy', offplan: true, title: 'Studio at Manta Bay', price: 1200000, area: 'al-marjan-island', beds: 0, baths: 1, sqft: 480, type: 'Apartment', status: 'Handover Q4 2026', lat: 25.677, lng: 55.728, img: IMG.manta, extra: [IMG.room, IMG.bedroom], developer: 'Major Developers', handover: 'Q4 2026', plan: '50 / 50',
      desc: 'Manta Bay \u2014 a beachfront studio on Al Marjan Island handing over before the Wynn opening, the shortest route to a rented unit on the island.', furnishing: 'Furnished', view: 'Sea' },
    { slug: 'masa-1bed', cat: 'buy', offplan: true, title: '1-bed at Masa Residence', price: 920000, area: 'al-marjan-island', beds: 1, baths: 1, sqft: 760, type: 'Apartment', status: 'Handover Q4 2026', lat: 25.686, lng: 55.738, img: IMG.masa, extra: [IMG.space, IMG.living], developer: 'Durar Group', handover: 'Q4 2026', plan: '60 / 40',
      desc: 'The entry price to Al Marjan Island \u2014 a one-bedroom at Masa Residence, handing over Q4 2026 with a 60/40 plan.', furnishing: 'Fitted kitchen', view: 'Island' }
  ];

  const PROJECTS = [
    { slug: 'address', name: 'Address Residences', dev: 'Emaar', area: 'Al Marjan Island', from: 2400000, handover: 'Q1 2028', plan: '80 / 20', mix: '1\u20134 bed, penthouses', img: IMG.address, note: 'Emaar\u2019s first RAK branded residences. Hotel-serviced, beachfront.' },
    { slug: 'nobu', name: 'Nobu Residences', dev: 'H&H Development', area: 'Al Marjan Island', from: 2100000, handover: 'Q1 2028', plan: '60 / 40', mix: '1\u20133 bed, duplexes', img: IMG.nobu, note: 'Nobu hotel, restaurant and residences on one plot. Owner privileges across Nobu worldwide.' },
    { slug: 'jw', name: 'JW Marriott Residences', dev: 'WOW Resorts', area: 'Al Marjan Island', from: 2950000, handover: 'Q4 2027', plan: '60 / 40', mix: '1\u20134 bed, sky villas', img: IMG.jw, note: 'Curved twin towers with Marriott management \u2014 rental pool option for absentee owners.' },
    { slug: 'nikki', name: 'Nikki Beach Residences', dev: 'Aldar', area: 'Al Marjan Island', from: 1750000, handover: 'Q4 2028', plan: '60 / 40', mix: 'Studios\u20133 bed', img: IMG.nikki, note: 'Beach-club brand with Aldar\u2019s balance sheet behind it.' },
    { slug: 'w', name: 'W Hotel & Residences', dev: 'Dalands', area: 'Al Marjan Island', from: 4060000, handover: 'Dec 2027', plan: '50 / 50', mix: '1\u20134 bed', img: IMG.w, note: 'Marriott\u2019s W brand \u2014 the highest entry price on the island and the most hotel-led product.' },
    { slug: 'costa', name: 'Costa Mare', dev: 'Ellington', area: 'Al Marjan Island', from: 2100000, handover: 'Q3 2028', plan: '70 / 30', mix: 'Studios\u20133 bed', img: IMG.costa, note: 'Design-led Dubai developer, four towers on the southern beach.' },
    { slug: 'manta', name: 'Manta Bay', dev: 'Major Developers', area: 'Al Marjan Island', from: 1200000, handover: 'Q4 2026', plan: '50 / 50', mix: 'Studios\u20132 bed', img: IMG.manta, note: 'Earliest handover in the current wave \u2014 rented before Wynn opens.' },
    { slug: 'sora', name: 'Sora Beach Residences', dev: 'AARK', area: 'Al Marjan Island', from: 2800000, handover: 'Q4 2026', plan: '60 / 40', mix: '1\u20133 bed, penthouses', img: IMG.sora, note: 'Low-density beachfront with larger floor plates.' },
    { slug: 'masa', name: 'Masa Residence', dev: 'Durar Group', area: 'Al Marjan Island', from: 920000, handover: 'Q4 2026', plan: '60 / 40', mix: 'Studios\u20132 bed', img: IMG.masa, note: 'The entry ticket to the island.' }
  ];

  const FX = { AED: { r: 1, s: 'AED' }, USD: { r: 0.2723, s: 'US$' }, EUR: { r: 0.25, s: '\u20ac' }, GBP: { r: 0.215, s: '\u00a3' } };
  const curGet = () => { try { return localStorage.getItem('rfr-cur') || 'AED'; } catch (e) { return 'AED'; } };
  const curSet = (c) => { try { localStorage.setItem('rfr-cur', c); } catch (e) {} window.dispatchEvent(new CustomEvent('rfr-cur', { detail: c })); };
  const fmt = (aed, cur, opts) => {
    if (aed === null || aed === undefined) return 'Price on request';
    const c = FX[cur || curGet()] || FX.AED;
    const v = aed * c.r;
    const round = v >= 100000 ? 1000 : v >= 10000 ? 100 : 10;
    const n = Math.round(v / round) * round;
    const txt = (opts && opts.compact && n >= 1000000) ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2).replace(/\.?0+$/, '') + 'M' : n.toLocaleString('en-US');
    return c.s + ' ' + txt;
  };
  const slGet = () => { try { return JSON.parse(localStorage.getItem('rfr-shortlist') || '[]'); } catch (e) { return []; } };
  const slSet = (arr) => { try { localStorage.setItem('rfr-shortlist', JSON.stringify(arr)); } catch (e) {} window.dispatchEvent(new CustomEvent('rfr-shortlist', { detail: arr })); };
  const slToggle = (slug) => { const a = slGet(); const i = a.indexOf(slug); if (i >= 0) a.splice(i, 1); else a.push(slug); slSet(a); return a; };

  // wires the header currency select, shortlist badge and any [data-aed] price on the page
  const bindPage = () => {
    const sel = document.getElementById('cur-sel');
    if (sel) { sel.value = curGet(); sel.onchange = () => curSet(sel.value); }
    const paint = () => {
      const c = curGet();
      document.querySelectorAll('[data-aed]').forEach((el) => { const v = el.getAttribute('data-aed'); el.textContent = fmt(v === '' ? null : Number(v), c, { compact: el.hasAttribute('data-compact') }) + (el.getAttribute('data-suffix') || ''); });
      document.querySelectorAll('#sl-count').forEach((el) => { const n = slGet().length; el.textContent = n ? String(n) : ''; el.style.display = n ? 'inline-flex' : 'none'; });
      if (sel && sel.value !== c) sel.value = c;
    };
    paint();
    window.addEventListener('rfr-cur', paint);
    window.addEventListener('rfr-shortlist', paint);
    window.addEventListener('storage', paint);
    return paint;
  };

  const areaOf = (slug) => AREAS.find((a) => a.slug === slug);
  const wa = (text) => 'https://wa.me/971585015885?text=' + encodeURIComponent(text);

  window.RFR = { IMG, AREAS, LISTINGS: L, PROJECTS, FX, fmt, curGet, curSet, slGet, slSet, slToggle, bindPage, areaOf, wa };
})();
