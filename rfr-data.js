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
      tag: 'Four coral-shaped islands and the new resorts.',
      intro: 'A group of man-made islands off the Al Hamra coast. Most of RAK\u2019s branded residences are being built here, including Address, Nobu, JW Marriott, Nikki Beach and W, and the Wynn resort is due to open in 2027.',
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
      note: 'The Ritz-Carlton Residences and Porto Playa are the next phase: the first branded product on this side of the coast.' },
    { slug: 'al-hamra-village', name: 'Al Hamra Village', short: 'AL HAMRA VILLAGE', lat: 25.691, lng: 55.787, img: IMG.space,
      tag: 'Golf, marina and the deepest rental market in RAK.',
      intro: 'The Emirate\u2019s original master community: an 18-hole championship golf course, a marina and yacht club, the Waldorf Astoria, a mall and a decade of tenants. Falcon Island, its private villa enclave, sits within it.',
      buy: 'Apartments from ~AED 500K \u00b7 Townhouses and villas AED 1.5\u20135M', rent: '1-bed ~AED 45\u201365K / yr \u00b7 3-bed villa ~AED 110\u2013160K / yr', yieldRange: '7\u20138.5% gross (indicative)',
      who: 'Families, golfers, Al Hamra and Wynn workforce, and investors who want tenants in place from day one.',
      amen: ['Al Hamra Golf Club', 'Al Hamra Marina & Yacht Club', 'Al Hamra Mall', 'Waldorf Astoria RAK', 'Falcon Island', 'Dubai (DXB) \u2014 50 min'],
      note: 'Closest established community to Al Marjan Island, so it\u2019s where the resort staff arriving in 2027 will rent.' },
    { slug: 'downtown-rak', name: 'Downtown RAK', short: 'DOWNTOWN RAK', lat: 25.789, lng: 55.945, img: IMG.room,
      tag: 'The working city: corniche, hospitals, offices.',
      intro: 'Al Nakheel, Julphar and the corniche, where the Emirate actually works. Towers and mid-rise apartments with the highest yields and the shortest commutes to RAKEZ, the hospitals and government.',
      buy: 'Apartments from ~AED 400K', rent: '2-bed ~AED 50\u201395K / yr', yieldRange: '7\u20139% gross (indicative)',
      who: 'Professionals, RAKEZ business owners, medical and education staff.',
      amen: ['RAK Hospital', 'Corniche Al Qawasim', 'Manar Mall', 'Julphar Towers', 'RAKEZ \u2014 10 min', 'RAK Airport \u2014 20 min'],
      note: 'Less glamour, more cash flow. Where we send clients who care about net yield over sea view.' }
  ];

  const L = [
    { slug: 'duplex-marjan', cat: 'rent', title: 'Furnished 2-bed duplex', price: 75960, area: 'al-marjan-island', beds: 2, baths: 3, sqft: 1860, type: 'Duplex apartment', status: 'Available', lat: 25.686, lng: 55.732, img: IMG.living, extra: [wix('e0d1cd_4484a53585a444e0808d44244cd472f9~mv2.jpg', 'e0d1cd_4484a53585a444e0808d44244cd472f9~mv2.jpg', 1200, 800), wix('e0d1cd_5ace0960ff5e42a5839ee96c8209de1f~mv2.jpg', 'e0d1cd_5ace0960ff5e42a5839ee96c8209de1f~mv2.jpg', 1200, 800), wix('e0d1cd_23fb715ad24d4cd1acacda12d23171b6~mv2.jpg', 'e0d1cd_23fb715ad24d4cd1acacda12d23171b6~mv2.jpg', 1200, 800), wix('e0d1cd_52ca45a4466e4c4881cd5203cbcd7002~mv2.jpg', 'e0d1cd_52ca45a4466e4c4881cd5203cbcd7002~mv2.jpg', 1200, 800)],
      desc: 'A furnished two-bedroom duplex on Al Marjan Island, with a double-height living room and resort amenities.', furnishing: 'Furnished', view: 'Sea and marina' },
    { slug: 'villa-juwais', cat: 'rent', title: '3-bed villa, ready to move into', price: 84850, area: 'mina-al-arab', beds: 3, baths: 4, sqft: 2410, type: 'Villa', status: 'New', lat: 25.752, lng: 55.858, img: IMG.villa, extra: [wix('e0d1cd_e463018c9f524ce0a9fab9a518fec5c4~mv2.jpg', 'e0d1cd_e463018c9f524ce0a9fab9a518fec5c4~mv2.jpg', 1200, 800), wix('e0d1cd_91972f9c1bc841cd82b4ca87dff16a6f~mv2.jpg', 'e0d1cd_91972f9c1bc841cd82b4ca87dff16a6f~mv2.jpg', 1200, 800), wix('e0d1cd_6dd49399c4f54a22bf4ede2f46e96bfd~mv2.jpg', 'e0d1cd_6dd49399c4f54a22bf4ede2f46e96bfd~mv2.jpg', 1200, 800), wix('e0d1cd_9388fe4fb8944483a187fa5509a632d4~mv2.jpg', 'e0d1cd_9388fe4fb8944483a187fa5509a632d4~mv2.jpg', 1200, 800)],
      desc: 'A three-bedroom family villa in Al Juwais, on quiet, established streets on the Mina Al Arab side of the city.', furnishing: 'Unfurnished', view: 'Garden and community' },
    { slug: 'onebed-hamra', cat: 'rent', title: '1-bed, utilities included', price: 85250, area: 'al-marjan-island', beds: 1, baths: 1, sqft: 780, type: 'Apartment', status: 'Available', lat: 25.681, lng: 55.726, img: IMG.room, extra: [wix('e0d1cd_c1ffe3e6763d42b1b2e0d56040322439~mv2.jpg', 'e0d1cd_c1ffe3e6763d42b1b2e0d56040322439~mv2.jpg', 1200, 800), wix('e0d1cd_94294864c04d4eb1943f597443891ecc~mv2.jpg', 'e0d1cd_94294864c04d4eb1943f597443891ecc~mv2.jpg', 1200, 800), wix('e0d1cd_ab7dd6ba1ec141c3a6b5f7dc34527529~mv2.jpg', 'e0d1cd_ab7dd6ba1ec141c3a6b5f7dc34527529~mv2.jpg', 1200, 800), wix('e0d1cd_bb81d86f97ab495193c432131bc7fd02~mv2.jpg', 'e0d1cd_bb81d86f97ab495193c432131bc7fd02~mv2.jpg', 1200, 800)],
      desc: 'A one-bedroom on Al Marjan Island with utilities included in the rent, so there\u2019s only one bill to pay.', furnishing: 'Furnished', view: 'Lagoon' },
    { slug: 'duplex-julphar', cat: 'rent', title: 'Furnished 2-bed duplex', price: 93580, area: 'downtown-rak', beds: 2, baths: 3, sqft: 1720, type: 'Duplex apartment', status: 'Under offer', lat: 25.791, lng: 55.946, img: IMG.bedroom, extra: [IMG.living, IMG.room],
      desc: 'A furnished two-bedroom duplex at Julphar Residence, close to the corniche and the city centre.', furnishing: 'Furnished', view: 'City and creek' },
    { slug: 'onebed-falcon', cat: 'rent', title: 'Furnished 1-bed apartment', price: 65500, area: 'al-hamra-village', beds: 1, baths: 1, sqft: 820, type: 'Apartment', status: 'Available', lat: 25.699, lng: 55.781, img: IMG.space, extra: [wix('11062b_f2b967d92a3643b68bb61c6d5ac6d111~mv2.jpg', '11062b_f2b967d92a3643b68bb61c6d5ac6d111~mv2.jpg', 1200, 800), wix('11062b_b54653b844b143308c6f147e322e3cd1~mv2_d_5123_3780_s_4_2.jpg', '11062b_b54653b844b143308c6f147e322e3cd1~mv2_d_5123_3780_s_4_2.jpg', 1200, 800), wix('11062b_99e34c7611664de7b96ab038079ef56d~mv2.jpg', '11062b_99e34c7611664de7b96ab038079ef56d~mv2.jpg', 1200, 800), wix('11062b_3e7f7bf526db4a8885b8aa2f870faee9~mv2.jpg', '11062b_3e7f7bf526db4a8885b8aa2f870faee9~mv2.jpg', 1200, 800)],
      desc: 'A fully furnished one-bedroom apartment on Falcon Island, in Al Hamra Village, ready to move into.', furnishing: 'Furnished', view: 'Marina' },
    { slug: 'plot-mina', cat: 'buy', title: 'Residential plot near the community pool', price: null, area: 'mina-al-arab', beds: 0, baths: 0, sqft: 6540, type: 'Residential plot', status: 'Last units', lat: 25.742, lng: 55.822, img: IMG.plot, extra: [IMG.villa, IMG.space],
      desc: 'A residential plot near the community pool in Mina Al Arab, one of the last left in this phase.', furnishing: '\u2014', view: 'Community' },
    { slug: 'address-2bed', cat: 'buy', offplan: true, title: '2-bed at Address Residences', price: 2400000, area: 'al-marjan-island', beds: 2, baths: 3, sqft: 1290, type: 'Branded apartment', status: 'Launch', lat: 25.688, lng: 55.735, img: IMG.address, extra: [IMG.living, IMG.bedroom], developer: 'Emaar', handover: 'Q1 2028', plan: '80 / 20',
      desc: 'Emaar\u2019s first branded residences in Ras Al Khaimah, on the beach at Al Marjan Island. Hotel services, Address management and a 2028 handover.', furnishing: 'Fitted kitchen', view: 'Sea' },
    { slug: 'nikki-1bed', cat: 'buy', offplan: true, title: '1-bed at Nikki Beach Residences', price: 1750000, area: 'al-marjan-island', beds: 1, baths: 2, sqft: 880, type: 'Branded apartment', status: 'Launch', lat: 25.683, lng: 55.724, img: IMG.nikki, extra: [IMG.space, IMG.room], developer: 'Aldar', handover: 'Q4 2028', plan: '60 / 40',
      desc: 'Aldar\u2019s Nikki Beach Residences, facing both the lagoon and the sea, with a 60/40 plan and Q4 2028 handover.', furnishing: 'Fitted kitchen', view: 'Sea and lagoon' },
    { slug: 'costa-2bed', cat: 'buy', offplan: true, title: '2-bed at Costa Mare', price: 2100000, area: 'al-marjan-island', beds: 2, baths: 2, sqft: 1180, type: 'Apartment', status: 'Launch', lat: 25.680, lng: 55.731, img: IMG.costa, extra: [IMG.living, IMG.space], developer: 'Ellington', handover: 'Q3 2028', plan: '70 / 30',
      desc: 'Four Ellington towers on the island\u2019s southern beach, with Ellington finishes and a 70/30 payment plan.', furnishing: 'Fitted kitchen', view: 'Sea' },
    { slug: 'manta-studio', cat: 'buy', offplan: true, title: 'Studio at Manta Bay', price: 1200000, area: 'al-marjan-island', beds: 0, baths: 1, sqft: 480, type: 'Apartment', status: 'Handover Q4 2026', lat: 25.677, lng: 55.728, img: IMG.manta, extra: [IMG.room, IMG.bedroom], developer: 'Major Developers', handover: 'Q4 2026', plan: '50 / 50',
      desc: 'A beachfront studio at Manta Bay on Al Marjan Island. It hands over before Wynn opens, so you can let it sooner than most units on the island.', furnishing: 'Furnished', view: 'Sea' },
    { slug: 'masa-1bed', cat: 'buy', offplan: true, title: '1-bed at Masa Residence', price: 920000, area: 'al-marjan-island', beds: 1, baths: 1, sqft: 760, type: 'Apartment', status: 'Handover Q4 2026', lat: 25.686, lng: 55.738, img: IMG.masa, extra: [IMG.space, IMG.living], developer: 'Durar Group', handover: 'Q4 2026', plan: '60 / 40',
      desc: 'A one-bedroom at Masa Residence, one of the lowest prices on Al Marjan Island. Handover Q4 2026, with a 60/40 plan.', furnishing: 'Fitted kitchen', view: 'Island' }
  ];

  const PROJECTS = [
    { slug: 'address', name: 'Address Residences', dev: 'Emaar', area: 'Al Marjan Island', from: 2400000, handover: 'Q1 2028', plan: '80 / 20', mix: '1\u20134 bed, penthouses', img: IMG.address, note: 'Emaar\u2019s first RAK branded residences. Hotel-serviced, beachfront.' },
    { slug: 'nobu', name: 'Nobu Residences', dev: 'H&H Development', area: 'Al Marjan Island', from: 2100000, handover: 'Q1 2028', plan: '60 / 40', mix: '1\u20133 bed, duplexes', img: IMG.nobu, note: 'Nobu hotel, restaurant and residences on one plot. Owner privileges across Nobu worldwide.' },
    { slug: 'jw', name: 'JW Marriott Residences', dev: 'WOW Resorts', area: 'Al Marjan Island', from: 2950000, handover: 'Q4 2027', plan: '60 / 40', mix: '1\u20134 bed, sky villas', img: IMG.jw, note: 'Curved twin towers with Marriott management, plus a rental pool for owners who live abroad.' },
    { slug: 'nikki', name: 'Nikki Beach Residences', dev: 'Aldar', area: 'Al Marjan Island', from: 1750000, handover: 'Q4 2028', plan: '60 / 40', mix: 'Studios\u20133 bed', img: IMG.nikki, note: 'Beach-club brand with Aldar\u2019s balance sheet behind it.' },
    { slug: 'w', name: 'W Hotel & Residences', dev: 'Dalands', area: 'Al Marjan Island', from: 4060000, handover: 'Dec 2027', plan: '50 / 50', mix: '1\u20134 bed', img: IMG.w, note: 'Marriott\u2019s W brand. The highest entry price on the island, and the most hotel-led.' },
    { slug: 'costa', name: 'Costa Mare', dev: 'Ellington', area: 'Al Marjan Island', from: 2100000, handover: 'Q3 2028', plan: '70 / 30', mix: 'Studios\u20133 bed', img: IMG.costa, note: 'Design-led Dubai developer, four towers on the southern beach.' },
    { slug: 'manta', name: 'Manta Bay', dev: 'Major Developers', area: 'Al Marjan Island', from: 1200000, handover: 'Q4 2026', plan: '50 / 50', mix: 'Studios\u20132 bed', img: IMG.manta, note: 'Earliest handover in this wave, so you can let it before Wynn opens.' },
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


  // header mega menus: hover on desktop, tap on touch, Esc to close
  const bindMega = () => {
    const hdr = document.querySelector('header');
    if (!hdr || hdr.getAttribute('data-mega-bound')) return;
    hdr.setAttribute('data-mega-bound', '1');
    const triggers = Array.from(document.querySelectorAll('[data-mega]'));
    const panels = {};
    document.querySelectorAll('[data-mega-panel]').forEach((p) => { panels[p.getAttribute('data-mega-panel')] = p; });
    const scrim = document.getElementById('mega-scrim');
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let open = null, t = null;
    const show = (k) => {
      clearTimeout(t);
      Object.keys(panels).forEach((n) => {
        const p = panels[n], on = n === k;
        p.style.transitionDelay = on ? '0s' : '0s, 0s, .32s';
        p.style.opacity = on ? '1' : '0'; p.style.visibility = on ? 'visible' : 'hidden'; p.style.transform = on ? 'translateY(0)' : 'translateY(-6px)';
      });
      triggers.forEach((tr) => {
        const on = tr.getAttribute('data-mega') === k;
        tr.setAttribute('aria-expanded', on ? 'true' : 'false');
        const ch = tr.querySelector('[data-chev]'); if (ch) ch.style.transform = on ? 'rotate(180deg)' : 'none';
      });
      if (scrim) { scrim.style.transitionDelay = k ? '0s' : '0s, .25s'; scrim.style.opacity = k ? '1' : '0'; scrim.style.visibility = k ? 'visible' : 'hidden'; }
      open = k;
    };
    const hideSoon = () => { clearTimeout(t); t = setTimeout(() => show(null), 220); };
    triggers.forEach((tr) => {
      const k = tr.getAttribute('data-mega');
      if (hover) {
        tr.addEventListener('mouseenter', () => { clearTimeout(t); t = setTimeout(() => show(k), 70); });
        tr.addEventListener('mouseleave', hideSoon);
      }
      tr.addEventListener('click', (e) => { if (!hover && open !== k) { e.preventDefault(); show(k); } });
      tr.addEventListener('focus', () => { try { if (tr.matches(':focus-visible')) show(k); } catch (err) {} });
      tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); show(k); const a = panels[k] && panels[k].querySelector('a'); if (a) a.focus(); } });
    });
    Object.keys(panels).forEach((n) => {
      const p = panels[n];
      p.addEventListener('mouseenter', () => clearTimeout(t));
      p.addEventListener('mouseleave', hideSoon);
      p.addEventListener('focusout', (e) => { const to = e.relatedTarget; if (!to || (!p.contains(to) && !(to.getAttribute && to.getAttribute('data-mega')))) hideSoon(); });
    });
    hdr.querySelectorAll('nav a:not([data-mega])').forEach((a) => a.addEventListener('mouseenter', () => { if (open) show(null); }));
    if (scrim) scrim.addEventListener('click', () => show(null));
    const mb = document.getElementById('menu-btn'); if (mb) mb.addEventListener('click', () => show(null));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const tr = triggers.find((x) => x.getAttribute('data-mega') === open); show(null); if (tr) tr.focus(); } });
    document.addEventListener('click', (e) => { if (open && !hover && !e.target.closest('[data-mega],[data-mega-panel]')) show(null); });
  };

  // custom currency dropdown in the header
  const bindCur = () => {
    const btn = document.getElementById('cur-btn'), menu = document.getElementById('cur-menu');
    if (!btn || !menu || btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', '1');
    let isOpen = false;
    const opts = () => Array.from(menu.querySelectorAll('[data-cur-opt]'));
    const set = (on) => {
      isOpen = on;
      menu.style.transitionDelay = on ? '0s' : '0s, 0s, .25s';
      menu.style.opacity = on ? '1' : '0'; menu.style.visibility = on ? 'visible' : 'hidden'; menu.style.transform = on ? 'translateY(0)' : 'translateY(-4px)';
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); set(!isOpen); if (isOpen && e.detail === 0) { const a = menu.querySelector('[aria-selected="true"]') || opts()[0]; if (a) a.focus(); } });
    opts().forEach((o) => o.addEventListener('click', (e) => { e.stopPropagation(); curSet(o.getAttribute('data-cur-opt')); set(false); btn.focus(); }));
    menu.addEventListener('keydown', (e) => { const l = opts(), i = l.indexOf(document.activeElement); if (e.key === 'ArrowDown') { e.preventDefault(); (l[i + 1] || l[0]).focus(); } else if (e.key === 'ArrowUp') { e.preventDefault(); (l[i - 1] || l[l.length - 1]).focus(); } });
    document.addEventListener('click', (e) => { if (isOpen && !menu.contains(e.target) && !btn.contains(e.target)) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) { set(false); btn.focus(); } });
  };
  // wires the header currency select, shortlist badge and any [data-aed] price on the page
  const bindPage = () => {
    bindMega();
    bindCur();
    const sel = document.getElementById('cur-sel');
    if (sel) { sel.value = curGet(); sel.onchange = () => curSet(sel.value); }
    const paint = () => {
      const c = curGet();
      document.querySelectorAll('[data-aed]').forEach((el) => { const v = el.getAttribute('data-aed'); el.textContent = fmt(v === '' ? null : Number(v), c, { compact: el.hasAttribute('data-compact') }) + (el.getAttribute('data-suffix') || ''); });
      document.querySelectorAll('#sl-count').forEach((el) => { const n = slGet().length; el.textContent = n ? String(n) : ''; el.style.display = n ? 'inline-flex' : 'none'; });
      document.querySelectorAll('#cur-code').forEach((el) => { el.textContent = c; });
      document.querySelectorAll('[data-cur-opt]').forEach((o) => { const on = o.getAttribute('data-cur-opt') === c; o.setAttribute('aria-selected', on ? 'true' : 'false'); const dot = o.querySelector('[data-cur-dot]'); if (dot) dot.style.opacity = on ? '1' : '0'; });
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

/* Richard — AI chat assistant (all pages) */
(() => {
  if (window.__rfrChat) return; window.__rfrChat = true;
  const WA = 'https://wa.me/971585015885';
  const star = (a, b) => 'M0 ' + -a + ' Q0 0 ' + b + ' 0 Q0 0 0 ' + a + ' Q0 0 ' + -b + ' 0 Q0 0 0 ' + -a + 'Z';
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtText = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n+/g, '<br><br>');
  const css = [
    '@keyframes rfrBreath{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.16) rotate(10deg)}}',
    '@keyframes rfrRing{0%{transform:scale(.72);opacity:.6}100%{transform:scale(1.95);opacity:0}}',
    '@keyframes rfrIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '@keyframes rfrDot{0%,80%,100%{opacity:.2}40%{opacity:1}}',
    '#rfr-chat-btn{position:fixed;right:24px;bottom:24px;z-index:140;width:60px;height:60px;padding:0;border-radius:50%;border:1px solid rgba(210,183,125,.6);background:#071A2B;display:grid;place-items:center;cursor:pointer;box-shadow:0 12px 32px rgba(4,17,29,.38);transition:transform .3s ease}',
    '#rfr-chat-btn:hover{transform:scale(1.06)}',
    '#rfr-chat-btn i{position:absolute;inset:-1px;border-radius:50%;border:1px solid #D2B77D;animation:rfrRing 2.8s cubic-bezier(.2,.6,.3,1) infinite;pointer-events:none}',
    '#rfr-chat-btn i+i{animation-delay:1.4s}',
    '#rfr-chat-btn svg{width:30px;height:30px;overflow:visible;animation:rfrBreath 2.8s ease-in-out infinite}',
    '#rfr-chat-btn.on i{display:none}',
    '#rfr-chat-tip{position:fixed;right:98px;bottom:36px;z-index:140;max-width:250px;padding:11px 15px;background:#F3EFE7;color:#071A2B;border:1px solid rgba(7,26,43,.1);box-shadow:0 10px 28px rgba(4,17,29,.2);font:500 13px/1.45 Satoshi,"Helvetica Neue",sans-serif;cursor:pointer;animation:rfrIn .5s ease both}',
    '#rfr-chat{position:fixed;right:24px;bottom:100px;z-index:141;width:min(390px,calc(100vw - 32px));height:min(600px,calc(100svh - 128px));display:flex;flex-direction:column;background:#F3EFE7;color:#071A2B;border:1px solid rgba(210,183,125,.4);box-shadow:0 28px 70px rgba(4,17,29,.4);font-family:Satoshi,"Helvetica Neue",sans-serif;animation:rfrIn .35s cubic-bezier(.22,1,.36,1) both}',
    '#rfr-chat a{color:#8A6A33;text-decoration:underline}',
    '#rfr-chat .hd{display:flex;align-items:center;gap:12px;padding:16px 18px;background:#071A2B;color:#F3EFE7}',
    '#rfr-chat .hd a,#rfr-chat .hd button{flex:none;white-space:nowrap;color:#F3EFE7;text-decoration:none;background:none;border:0;cursor:pointer;font:500 10px/1 Satoshi,sans-serif;letter-spacing:.2em}',
    '#rfr-chat .ms{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}',
    '#rfr-chat .b{max-width:86%;padding:11px 14px;font-size:14px;line-height:1.55;text-wrap:pretty}',
    '#rfr-chat .b.bot{align-self:flex-start;background:#FFFDF8;border:1px solid rgba(7,26,43,.08)}',
    '#rfr-chat .b.me{align-self:flex-end;background:#071A2B;color:#F3EFE7}',
    '#rfr-chat .ch{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 12px}',
    'a.m-only[href^="https://wa.me"]{display:none!important}',
    '#rfr-chat .ch button{font:500 12px/1.35 Satoshi,sans-serif;text-align:left;padding:8px 12px;background:transparent;color:#071A2B;border:1px solid rgba(7,26,43,.22);cursor:pointer}',
    '#rfr-chat .ch button:hover{border-color:#B08D4F;color:#8A6A33}',
    '#rfr-chat form{display:flex;border-top:1px solid rgba(7,26,43,.12);background:#FFFDF8}',
    '#rfr-chat input{flex:1;min-width:0;border:0;background:transparent;padding:16px 18px;font:15px Satoshi,sans-serif;color:#071A2B;outline:none}',
    '#rfr-chat form button{border:0;background:#D2B77D;color:#071A2B;padding:0 20px;font:500 11px/1 Satoshi,sans-serif;letter-spacing:.18em;cursor:pointer}',
    '#rfr-chat form button:disabled{opacity:.45;cursor:default}',
    '#rfr-chat .dots span{display:inline-block;width:5px;height:5px;margin-right:4px;border-radius:50%;background:#B08D4F;animation:rfrDot 1.2s infinite}',
    '#rfr-chat .dots span:nth-child(2){animation-delay:.15s}#rfr-chat .dots span:nth-child(3){animation-delay:.3s}',
    '@media (max-width:600px){#rfr-chat{right:0;left:0;bottom:0;width:100%;height:100svh;border:0}#rfr-chat-btn{right:16px;bottom:16px;width:56px;height:56px}#rfr-chat-tip{display:none}}',
    '@media (prefers-reduced-motion:reduce){#rfr-chat-btn svg,#rfr-chat-btn i{animation:none}#rfr-chat-btn i{display:none}}'
  ].join('');
  const facts = () => {
    const R = window.RFR || {};
    const aName = (s) => { const a = (R.AREAS || []).find((x) => x.slug === s); return a ? a.name : s; };
    const areas = (R.AREAS || []).map((a) => a.name + ': ' + (a.tag || '')).join('\n');
    const listings = (R.LISTINGS || []).map((l) => l.title + ' | ' + (l.cat === 'rent' ? 'to rent' : l.cat) + ' | ' + aName(l.area) + ' | ' + (l.beds ? l.beds + ' bed | ' : '') + 'AED ' + Number(l.price).toLocaleString('en-US') + (l.cat === 'rent' ? ' per year' : '')).join('\n');
    const projects = (R.PROJECTS || []).map((p) => p.name + ' (' + p.dev + ', ' + p.area + ') from AED ' + Number(p.from).toLocaleString('en-US') + ', handover ' + p.handover + ', payment plan ' + p.plan + ', ' + (p.mix || '')).join('\n');
    return 'You are Richard, the AI assistant on the website of RFR Real Estate & Advisory, a brokerage in Ras Al Khaimah (RAK), UAE. You speak for the company ("we", "our team"). Tone: warm, direct, plain English, no hype, never pushy. Keep every reply under 70 words, in one to three short paragraphs, with no headings or bullet lists unless the visitor asks for a list. Use only the facts below. If you are not sure, say so and offer to connect them with the team. Do not invent prices, availability, fees or visa rules. Where it helps, end with one clear next step: a free 20-minute call, WhatsApp on +971 58 501 5885, or a free property review for owners.\n\nKnown facts: Property in RAK has no income or capital gains tax. A UAE Golden Visa is possible with property worth AED 2M or more. Services: buying and selling, renting for landlords and tenants, off-plan advice, property management, investment consultation, and a free property performance review for owners (sale value, achievable rent, sell/hold/re-let advice). Contact: WhatsApp or phone +971 58 501 5885, info@rfrrealestate.com. Hours: Monday to Friday 9 to 6, Saturday 10 to 4.\n\nAreas:\n' + areas + '\n\nCurrent listings:\n' + listings + '\n\nOff-plan projects (starting prices):\n' + projects;
  };
  const KEY = 'rfrChatLog';
  let log = []; try { log = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) {}
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(log.slice(-30))); } catch (e) {} };
  const HELLO = 'Hi, I’m Richard. Ask me about buying, renting or investing in Ras Al Khaimah and I’ll point you to the right home or project.';
  const CHIPS = ['How does the Golden Visa work?', 'Which off-plan launches are worth it?', 'Show me homes to rent', 'What is my property worth?'];
  let btn, panel, ms, input, send, busy = false;
  const mount = () => {
    if (document.getElementById('rfr-chat-btn')) return;
    const st = document.createElement('style'); st.id = 'rfr-chat-css'; st.textContent = css; document.head.appendChild(st);
    btn = document.createElement('button');
    btn.id = 'rfr-chat-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Chat with Richard'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i></i><i></i><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="' + star(11, 6.2) + '" fill="#D2B77D"></path></svg>';
    btn.addEventListener('click', () => (panel ? close() : open()));
    document.body.appendChild(btn);
    try {
      if (!sessionStorage.getItem('rfrChatTip')) {
        setTimeout(() => {
          if (panel || document.getElementById('rfr-chat-tip')) return;
          sessionStorage.setItem('rfrChatTip', '1');
          const tip = document.createElement('div'); tip.id = 'rfr-chat-tip'; tip.textContent = 'Hi, I’m Richard. Questions about RAK property? Ask me.';
          tip.addEventListener('click', () => { tip.remove(); open(); });
          document.body.appendChild(tip);
          setTimeout(() => tip.remove(), 9000);
        }, 6000);
      }
    } catch (e) {}
  };
  const bubble = (who, html) => { const b = document.createElement('div'); b.className = 'b ' + who; b.innerHTML = html; ms.appendChild(b); ms.scrollTop = ms.scrollHeight; return b; };
  const transcript = () => log.map((m) => (m.role === 'user' ? 'Me: ' : 'Richard: ') + m.content).join('\n').slice(-1500);
  const open = () => {
    const tip = document.getElementById('rfr-chat-tip'); if (tip) tip.remove();
    panel = document.createElement('div'); panel.id = 'rfr-chat'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat with Richard');
    panel.innerHTML = '<div class="hd"><svg viewBox="-12 -12 24 24" width="26" height="26" aria-hidden="true"><path d="' + star(11, 6.2) + '" fill="#D2B77D"></path></svg><div style="flex:1;min-width:0"><div style="font-family:\'The Seasons\',\'Cormorant Garamond\',serif;font-size:21px;font-weight:500;line-height:1">Richard</div><div style="margin-top:5px;font-size:10px;letter-spacing:.2em;white-space:nowrap;color:rgba(243,239,231,.62)">AI ASSISTANT</div></div><a class="wa" href="' + WA + '" target="_blank" rel="noopener">WHATSAPP ↗</a><button type="button" class="x" aria-label="Close chat" style="font-size:20px;letter-spacing:0;padding:0 0 0 6px">×</button></div><div class="ms" aria-live="polite"></div><div class="ch"></div><form><input type="text" placeholder="Ask about homes, prices, visas…" aria-label="Your message" maxlength="500"><button type="submit">SEND</button></form>';
    document.body.appendChild(panel);
    ms = panel.querySelector('.ms'); input = panel.querySelector('input'); send = panel.querySelector('form button');
    panel.querySelector('.x').addEventListener('click', close);
    const wa = panel.querySelector('.wa'); wa.addEventListener('click', () => { wa.href = log.length ? (window.RFR && window.RFR.wa ? window.RFR.wa('Hello RFR, continuing from the website chat:\n' + transcript()) : WA) : WA; });
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    panel.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
    bubble('bot', esc(HELLO));
    log.forEach((m) => bubble(m.role === 'user' ? 'me' : 'bot', m.role === 'user' ? esc(m.content) : fmtText(m.content)));
    const ch = panel.querySelector('.ch');
    if (!log.length) CHIPS.forEach((c) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', () => ask(c)); ch.appendChild(b); });
    btn.classList.add('on'); btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => input.focus(), 50);
  };
  const close = () => { if (panel) panel.remove(); panel = null; btn.classList.remove('on'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); };
  const ask = async (text) => {
    text = String(text || '').trim(); if (!text || busy) return;
    busy = true; send.disabled = true; input.value = '';
    const ch = panel.querySelector('.ch'); if (ch) ch.innerHTML = '';
    bubble('me', esc(text));
    log.push({ role: 'user', content: text }); save();
    const dots = bubble('bot', '<span class="dots" aria-label="Richard is typing"><span></span><span></span><span></span></span>');
    let reply;
    try {
      if (!window.claude || !window.claude.complete) throw new Error('offline');
      reply = await window.claude.complete({ system: facts(), messages: log.slice(-12), max_tokens: 400 });
      reply = String(reply || '').trim(); if (!reply) throw new Error('empty');
    } catch (e) {
      reply = 'I can’t answer that here right now. Our team replies on WhatsApp within the day: ' + WA;
    }
    log.push({ role: 'assistant', content: reply }); save();
    if (panel) { dots.innerHTML = fmtText(reply); ms.scrollTop = ms.scrollHeight; send.disabled = false; input.focus(); }
    busy = false;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.addEventListener('load', mount);
})();
