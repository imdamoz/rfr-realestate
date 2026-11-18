/* Static runner for exported design-component pages whose <x-dc> markup has no
 * template bindings (homepage). The browser has already parsed the final DOM,
 * so instead of loading React from unpkg and re-rendering an identical copy
 * (support.js), this runs the page's logic class against the static DOM and
 * turns style-* pseudo attributes into rules, exactly as support.js does.
 * Mirrors support.js: StreamableLogic (src/logic.ts), evalDcLogic and
 * createPseudoSheet/importantify (src/pseudo.ts). */
(() => {
  if (window.__dcStatic) return;
  window.__dcStatic = true;

  // --- style-hover="..." etc. -> .scpN:hover { ... !important } -------------
  const importantify = (css) => {
    css = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const decls = [];
    let start = 0, depth = 0, quote = '';
    for (let i = 0; i < css.length; i++) {
      const c = css[i];
      if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '(') depth++;
      else if (c === ')') depth = Math.max(0, depth - 1);
      else if (c === ';' && depth === 0) { decls.push(css.slice(start, i)); start = i + 1; }
    }
    decls.push(css.slice(start));
    return decls.map((d) => d.trim()).filter(Boolean)
      .map((d) => (/!\s*important$/i.test(d) ? d : d + ' !important')).join(';');
  };
  let sheetEl = null, n = 0;
  const cache = new Map();
  const pseudoClass = (pseudo, css) => {
    const k = pseudo + '|' + css;
    if (cache.has(k)) return cache.get(k);
    if (!sheetEl) { sheetEl = document.createElement('style'); document.head.appendChild(sheetEl); }
    const cls = 'scp' + (n++).toString(36);
    const isEl = pseudo === 'before' || pseudo === 'after';
    try {
      sheetEl.sheet.insertRule((isEl ? '.' + cls + '::' + pseudo : '.' + cls + ':' + pseudo) + '{' + (isEl ? css : importantify(css)) + '}', sheetEl.sheet.cssRules.length);
    } catch (e) { console.warn('[dc-static] bad style-' + pseudo, e); }
    cache.set(k, cls);
    return cls;
  };
  const applyPseudo = (root) => {
    const all = root.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      for (const a of el.attributes) {
        if (a.name.startsWith('style-')) el.classList.add(pseudoClass(a.name.slice(6), a.value));
      }
    }
  };

  // --- logic class -------------------------------------------------------------
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(update, cb) {
      const patch = typeof update === 'function' ? update(this.state) : update;
      this.state = Object.assign({}, this.state, patch);
      if (cb) cb();
    }
    forceUpdate() {}
    componentDidMount() {}
    componentDidUpdate() {}
    componentWillUnmount() {}
    renderVals() { return {}; }
  }

  const boot = () => {
    const dc = document.querySelector('x-dc');
    if (dc) applyPseudo(dc);
    const scriptEl = document.querySelector('script[data-dc-script]');
    if (!scriptEl) return;
    const props = {};
    try {
      const meta = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
      for (const k in meta) if (k[0] !== '$' && meta[k] && meta[k].default !== undefined) props[k] = meta[k].default;
    } catch (e) {}
    let Cls;
    try {
      // eslint-disable-next-line no-new-func
      Cls = new Function('DCLogic', 'StreamableLogic', 'React',
        scriptEl.textContent + '\n;return (typeof Component!=="undefined"&&Component)||undefined;')(DCLogic, DCLogic, window.React);
    } catch (e) { console.error('[dc-static] logic eval failed', e); return; }
    if (typeof Cls !== 'function') return;
    try { const inst = new Cls(props); window.__dcLogic = inst; inst.componentDidMount(); }
    catch (e) { console.error('[dc-static] componentDidMount failed', e); }
  };
  // Boot on DOMContentLoaded: it fires after every deferred script, including
  // rfr-data.js (window.RFR, used by componentDidMount). readyState is already
  // "interactive" while deferred scripts run, so it cannot be used to skip the wait.
  // Perf (LCP): the static first frame (sky + headline) is painted before this runs. Wiring the page (style-* rules over every element)
  // forces a full-page style + layout, so wait for the paint-timing entry (rAF where unsupported);
  // the timeout covers background tabs, which never paint.
  const afterFirstPaint = (fn) => {
    let done = false; const go = () => { if (!done) { done = true; fn(); } };
    try {
      if (performance.getEntriesByType('paint').length) setTimeout(go, 0);
      else if ((PerformanceObserver.supportedEntryTypes || []).indexOf('paint') >= 0) {
        const po = new PerformanceObserver(() => { po.disconnect(); setTimeout(go, 0); });
        po.observe({ type: 'paint', buffered: true });
      } else requestAnimationFrame(() => setTimeout(go, 0));
    } catch (e) { requestAnimationFrame(() => setTimeout(go, 0)); }
    setTimeout(go, 1500);
  };
  let booted = false, queued = false;
  const once = () => { if (queued) return; queued = true; afterFirstPaint(() => { if (!booted) { booted = true; boot(); } }); };
  if (document.readyState === 'complete') once();
  else { document.addEventListener('DOMContentLoaded', once); window.addEventListener('load', once); }
})();
