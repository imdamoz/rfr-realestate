/* RFR v9: sky intro (clouds part onto the beach video), palm fronds spilling across sections, ERA-style section reveals. */
(function () {
  if (window.__rfrEra) return; window.__rfrEra = true;
  const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const cl = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const rng = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const toURL = (c) => new Promise((res) => { try { c.toBlob((b) => res(b ? URL.createObjectURL(b) : c.toDataURL()), 'image/png'); } catch (e) { res(null); } });

  // palm crown: curved fronds with drooping leaflets, drawn once to a bitmap
  const CROWN = [[-28, 0.5, 0.06], [-4, 0.62, 0.12], [18, 0.66, 0.2], [40, 0.6, 0.26], [62, 0.52, 0.3], [86, 0.44, 0.3], [112, 0.34, 0.26], [-52, 0.36, 0.02]];
  const palm = (seed, color) => {
    const W = 1000, H = 820, r = rng(seed * 4099 + 7), c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.fillStyle = color; x.strokeStyle = color; x.lineCap = 'round';
    const X = W * 0.1, Y = H * 0.12;
    CROWN.forEach((f) => {
      const a = (f[0] + (r() - 0.5) * 8) * Math.PI / 180, L = f[1] * W * (0.92 + r() * 0.16), curl = f[2];
      const dx = Math.cos(a), dy = Math.sin(a);
      const p1x = X + dx * L * 0.55, p1y = Y + dy * L * 0.55 - L * 0.06, p2x = X + dx * L, p2y = Y + dy * L + L * curl;
      const pt = (t) => [(1 - t) * (1 - t) * X + 2 * (1 - t) * t * p1x + t * t * p2x, (1 - t) * (1 - t) * Y + 2 * (1 - t) * t * p1y + t * t * p2y];
      const tg = (t) => { const vx = 2 * (1 - t) * (p1x - X) + 2 * t * (p2x - p1x), vy = 2 * (1 - t) * (p1y - Y) + 2 * t * (p2y - p1y), m = Math.hypot(vx, vy) || 1; return [vx / m, vy / m]; };
      x.lineWidth = Math.max(2, L * 0.011);
      x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(p1x, p1y, p2x, p2y); x.stroke();
      for (let i = 3; i < 36; i++) {
        const t = i / 36, P = pt(t), T = tg(t);
        const len = L * 0.34 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + t * 0.95)), 0.6) * (1 - 0.45 * t) * (0.85 + r() * 0.3);
        for (let s = -1; s <= 1; s += 2) {
          const g = s * (1.0 - 0.3 * t) + (r() - 0.5) * 0.16;
          const lx = T[0] * Math.cos(g) - T[1] * Math.sin(g), ly = T[0] * Math.sin(g) + T[1] * Math.cos(g);
          const ex = P[0] + lx * len, ey = P[1] + ly * len + len * (0.32 + r() * 0.22);
          const cx = P[0] + lx * len * 0.55, cy = P[1] + ly * len * 0.55 + len * 0.04;
          const w = Math.max(1.4, L * 0.012 * (1 - 0.55 * t));
          let nx = -(ey - P[1]), ny = ex - P[0]; const nm = Math.hypot(nx, ny) || 1; nx = nx / nm * w; ny = ny / nm * w;
          x.beginPath(); x.moveTo(P[0], P[1]); x.quadraticCurveTo(cx + nx, cy + ny, ex, ey); x.quadraticCurveTo(cx - nx, cy - ny, P[0], P[1]); x.fill();
        }
      }
    });
    return toURL(c);
  };

  const SKY = [ // smoke along the bottom, two clouds veiling the headline edges (second one flipped both ways)
    { src: 'brand/sky/smoke.webp', front: 1, x: -0.12, y: 0.42, w: 1.8, fx: 1, fy: 1, z: 1, dir: 0, fade: 1 },
    { src: 'brand/sky/smoke.webp', front: 1, x: 0.18, y: 0.47, w: 1.7, fx: -1, fy: 1, z: 0.9, dir: 0, fade: 1 },
    { src: 'brand/sky/cloud.webp', front: 1, x: -0.34, y: 0.04, w: 0.56, fx: 1, fy: 1, z: 0.8, dir: -1 },
    { src: 'brand/sky/cloud.webp', front: 1, x: 0.36, y: -0.1, w: 0.56, fx: -1, fy: -1, z: 0.85, dir: 1 },
    { src: 'brand/sky/cloud.webp', front: 0, x: -0.18, y: -0.3, w: 0.42, fx: -1, fy: 1, z: 0.35, dir: -1, op: 0.5 },
    { src: 'brand/sky/cloud.webp', front: 0, x: 0.3, y: -0.36, w: 0.36, fx: 1, fy: -1, z: 0.3, dir: 1, op: 0.42 },
    { src: 'brand/sky/smoke.webp', front: 0, x: 0.05, y: -0.08, w: 1.1, fx: -1, fy: -1, z: 0.25, dir: 0, op: 0.22, fade: 1 }
  ];
  const PALMS = [
    { host: '#hero-palms', kind: 'hero', pos: 'left:-5vw;top:-8vh', w: 'max(380px,46vw)', color: '#0A1712', seed: 2 },
    { host: 'section[data-screen-label="Proof"]', kind: 'shade', pos: 'left:-8vw;top:-4vh', w: 'max(440px,46vw)', color: '#1E2A22', op: 0.15, amp: 2.4, spd: 0.5, seed: 9 },
    { host: '#listings', kind: 'shade', flip: true, pos: 'right:-8vw;top:-6vh', w: 'max(520px,60vw)', color: '#1E2A22', op: 0.16, amp: 2.4, spd: 0.5, seed: 12 },
    { host: '#calc', kind: 'shade', pos: 'left:-10vw;top:-4vh', w: 'max(480px,54vw)', color: '#1E2A22', op: 0.13, amp: 2.4, spd: 0.45, seed: 15 }
  ];
  const REVEAL = ['#why', '#personas'];

  let started = false;
  const start = () => {
    const $ = (id) => document.getElementById(id);
    const hero = $('hero'), sky = $('sky');
    if (!hero || !sky || !$('hero-palms')) return false;
    if (started) return true; started = true; window.__rfrSky = true;
    const bg = $('sky-bg'), txt = $('sky-text'), cue = $('sky-cue'), back = $('sky-back'), front = $('sky-front');
    const copy = $('hero-copy'), tri = $('hero-tri'), img = $('hero-img');

    const clouds = SKY.map((c) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:absolute;left:50%;top:50%;will-change:transform,opacity;pointer-events:none';
      const im = document.createElement('img'); im.alt = ''; im.decoding = 'async';
      im.style.cssText = 'display:block;width:100%;height:auto;opacity:0;transition:opacity 1.6s ease';
      if (c.fade) { const m = 'linear-gradient(90deg,transparent 0,#000 18%,#000 82%,transparent 100%)'; im.style.webkitMaskImage = m; im.style.maskImage = m; }
      im.onload = () => { im.style.opacity = '1'; };
      im.src = c.src;
      wrap.appendChild(im); (c.front ? front : back).appendChild(wrap);
      return Object.assign({ wrap, ph: c.x * 9 + c.y * 5 }, c);
    });

    const palms = [];
    PALMS.forEach((o) => {
      const host = document.querySelector(o.host); if (!host) return;
      let parent = host;
      if (o.kind === 'shade') {
        parent = document.createElement('div'); parent.setAttribute('aria-hidden', 'true');
        const fade = 'linear-gradient(180deg,transparent 0,#000 22%,#000 78%,transparent 100%)';
        parent.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;mix-blend-mode:multiply;-webkit-mask-image:' + fade + ';mask-image:' + fade;
        host.appendChild(parent);
      }
      const wrap = document.createElement('div'); wrap.setAttribute('aria-hidden', 'true');
      wrap.style.cssText = 'position:absolute;pointer-events:none;will-change:transform;' + o.pos + ';width:' + o.w + ';z-index:3;transform-origin:' + (o.flip ? '90% 12%' : '10% 12%');
      const im = document.createElement('img'); im.alt = '';
      im.style.cssText = 'display:block;width:100%;height:auto;opacity:0;transition:opacity 1.4s ease;' + (o.flip ? 'transform:scaleX(-1);' : '') + (o.kind === 'shade' ? 'filter:blur(5px);' : '');
      im.onload = () => { im.style.opacity = String(o.op || 1); };
      wrap.appendChild(im); parent.appendChild(wrap);
      palm(o.seed, o.color).then((u) => { if (u) im.src = u; });
      palms.push(Object.assign({ wrap, el: host }, o));
    });

    const reveals = REVEAL.map((s) => document.querySelector(s)).filter(Boolean);

    let mx = 0, my = 0;
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    let lastW = 0, lastH = 0, lastHero = 0;
    const measure = () => {
      lastW = innerWidth; lastH = innerHeight; lastHero = hero.offsetHeight;
      window.__rfrSkyEnd = Math.max(1, hero.offsetHeight - innerHeight * 0.28);
      const S = Math.max(innerWidth, innerHeight * 1.1);
      clouds.forEach((c) => { c.wrap.style.width = Math.round(c.w * S) + 'px'; });
    };
    measure(); addEventListener('resize', measure);

    const loop = (now) => {
      requestAnimationFrame(loop);
      if (innerWidth !== lastW || innerHeight !== lastH || hero.offsetHeight !== lastHero || !lastW) measure();
      const vw = innerWidth, vh = innerHeight, t = now / 1000;
      const r = hero.getBoundingClientRect();
      const p = cl(-r.top / Math.max(1, hero.offsetHeight - vh));
      if (r.bottom > 0) {
        clouds.forEach((c) => {
          const s = 1 + Math.pow(p, 1.4) * c.z * 1.8;
          const dx = RM ? 0 : Math.sin(t * 0.09 + c.ph) * 0.012 * vw;
          const X = c.x * vw + c.dir * p * c.z * 0.55 * vw + dx - mx * 12 * c.z;
          const Y = c.y * vh - p * c.z * (c.dir ? 0.3 : 0.75) * vh - my * 6 * c.z;
          c.wrap.style.transform = 'translate(-50%,-50%) translate3d(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px,0) scale(' + (s * c.fx).toFixed(3) + ',' + (s * c.fy).toFixed(3) + ')';
          c.wrap.style.opacity = String((c.op || 1) * (c.front ? 1 - sm(0.5, 0.85, p) : 1 - sm(0.3, 0.66, p)));
        });
        if (bg) { bg.style.opacity = String(1 - sm(0.3, 0.66, p)); const bi = bg.firstElementChild; if (bi) bi.style.transform = 'scale(' + (3.2 + p * 0.5).toFixed(3) + ')'; }
        if (txt) { txt.style.opacity = String(1 - sm(0.1, 0.4, p)); const ct = document.getElementById('sky-cta'); if (ct) { ct.style.opacity = String(1 - sm(0.1, 0.4, p)); ct.style.transform = 'translate3d(0,' + (-p * 10).toFixed(2) + 'vh,0)'; if (ct.firstElementChild) ct.firstElementChild.style.pointerEvents = p < 0.25 ? 'auto' : 'none'; } txt.style.transform = 'translate3d(0,' + (-p * 8).toFixed(2) + 'vh,0) scale(' + (1 + p * 0.2).toFixed(3) + ')'; }
        if (cue) cue.style.opacity = String(1 - sm(0, 0.05, p));
        sky.style.visibility = p > 0.995 ? 'hidden' : 'visible';
        const k = sm(0.6, 0.9, p);
        [copy, tri].forEach((el, i) => { if (!el) return; el.style.opacity = String(k); el.style.pointerEvents = k > 0.5 ? 'auto' : 'none'; el.style.transform = 'translate3d(0,' + ((1 - k) * (i ? 100 : 6)).toFixed(1) + (i ? '%' : 'vh') + ',0)'; });
        if (img) img.style.transform = 'scale(' + (1.24 - 0.18 * sm(0.25, 1, p)).toFixed(4) + ')';
      }
      palms.forEach((o, i) => {
        const b = o.el.getBoundingClientRect(); if (b.bottom < -300 || b.top > vh + 300) return;
        const A = o.amp || 1.6, w = o.spd || 0.8;
        const sway = RM ? 0 : A * Math.sin(t * w + i * 1.9) + A * 0.45 * Math.sin(t * w * 2.3 + i);
        let tx = 0, ty = 0;
        if (o.kind === 'hero') { const k = ease(sm(0.48, 0.92, p)); tx = (1 - k) * (o.flip ? 32 : -32); ty = (1 - k) * -38; }
        else if (o.kind === 'spill') ty = 40 + ((b.bottom - vh) / vh) * 8;
        else ty = (b.top / vh) * -4;
        o.wrap.style.transform = 'translate(' + tx.toFixed(2) + '%,' + ty.toFixed(2) + '%) rotate(' + ((o.flip ? -1 : 1) * sway).toFixed(2) + 'deg)';
      });
      reveals.forEach((el) => {
        const b = el.getBoundingClientRect(); if (b.top > vh || b.bottom < 0) return;
        const q = ease(cl((vh - b.top) / (vh * 0.9))), i = (1 - q) * 8;
        el.style.clipPath = q >= 1 ? 'none' : 'inset(' + (i * 0.6).toFixed(2) + '% ' + i.toFixed(2) + '% round ' + (i * 3).toFixed(1) + 'px)';
      });
    };
    requestAnimationFrame(loop);
    return true;
  };
  const tick = () => { if (!start()) setTimeout(tick, 150); };
  tick();
})();
