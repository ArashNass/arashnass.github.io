/*! SENTINEL - mission-control theme for arashnassirpour.com (shared by the live pages).
 *  Loaded on demand by a tiny inline loader; nothing here runs unless the theme is
 *  unlocked (Konami code, typing "sentinel", tapping the page title 7 times, or ?theme=sentinel).
 */
(function () {
  'use strict';
  if (window.Sentinel) return;

  var doc = document, root = doc.documentElement;
  var KEY = 'sx-theme', UNLOCK = 'sx-unlocked';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var path = location.pathname;
  var page = /earthquake-dashboard/.test(path) ? 'quake' : /world-faults\/stats/.test(path) ? 'stats' : /world-faults/.test(path) ? 'faults' : 'generic';
  var LABEL = { quake: 'SEISMIC WATCH', faults: 'GLOBAL FAULT SURVEY', stats: 'SEISMIC STATISTICS', generic: 'MISSION CONTROL' };

  var active = false, hud = null, chip = null, toastEl = null, bootEl = null, bootTimers = [];
  var clockTimer = 0, t0 = Date.now(), themeObserver = null, changedFaultsTheme = false, fontsLoaded = false;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function h(tag, attrs, html) {
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function track(name) { try { if (window.gtag) window.gtag('event', name, { page: page }); } catch (e) { /* ignore */ } }

  function loadFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    var l = h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap', id: 'sx-fonts' });
    doc.head.appendChild(l);
  }

  /* ---------- small UI pieces ---------- */
  var RING = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
    '<circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 5" opacity=".6"/>' +
    '<circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M24 9v6M24 33v6M9 24h6M33 24h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="24" cy="24" r="5" fill="currentColor"/></svg>';

  function toast(msg) {
    if (!toastEl) {
      toastEl = h('div', { id: 'sx-toast', role: 'status', 'aria-live': 'polite' });
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.remove('sx-show');
    void toastEl.offsetWidth;
    toastEl.classList.add('sx-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl && toastEl.classList.remove('sx-show'); }, 2600);
  }

  function countText() {
    var n;
    if (page === 'quake') { n = doc.querySelectorAll('.ev-item').length; return n ? n + ' CONTACTS TRACKED' : ''; }
    if (page === 'faults') { n = doc.querySelectorAll('.fault-row').length; return n ? n + ' FAULTS CATALOGUED' : ''; }
    return '';
  }

  function buildHud() {
    var c = countText();
    var el = h('div', { id: 'sx-hud', role: 'group', 'aria-label': 'SENTINEL mission control status' },
      '<div class="sx-hud-l"><span class="sx-hud-logo">' + RING + '</span>' +
      '<span class="sx-hud-name">SENTINEL</span><span class="sx-hud-sub">// MISSION CONTROL</span></div>' +
      '<div class="sx-hud-c"><span class="sx-live"><i></i>LIVE</span><b>' + LABEL[page] + '</b>' +
      (c ? '<span class="sx-hud-count">' + c + '</span>' : '') + '</div>' +
      '<div class="sx-hud-r">' +
      '<span class="sx-stat"><em>UTC</em><b id="sx-utc">--:--:--</b></span>' +
      '<span class="sx-stat sx-met"><em>MET</em><b id="sx-met">T+00:00:00</b></span>' +
      '<span class="sx-stat sx-linkstat"><em>LINK</em><b id="sx-link" class="sx-ok">NOMINAL</b></span>' +
      '<button type="button" id="sx-exit" class="sx-btn" aria-label="Exit SENTINEL theme" title="Exit SENTINEL (Esc)">EXIT</button>' +
      '</div>');
    el.querySelector('#sx-exit').addEventListener('click', function () { disengage(true); });
    return el;
  }

  function placeHud() {
    var anchor = doc.querySelector('header.site-hd');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(hud, anchor.nextSibling);
    else doc.body.insertBefore(hud, doc.body.firstChild);
  }

  function tick() {
    var d = new Date(), s = Math.floor((Date.now() - t0) / 1000);
    var u = doc.getElementById('sx-utc'), m = doc.getElementById('sx-met'), l = doc.getElementById('sx-link');
    if (u) u.textContent = pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
    if (m) m.textContent = 'T+' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    if (l) {
      var on = navigator.onLine !== false;
      l.textContent = on ? 'NOMINAL' : 'OFFLINE';
      l.className = on ? 'sx-ok' : 'sx-bad';
    }
  }

  function buildChip() {
    if (chip) return;
    chip = h('button', { type: 'button', id: 'sx-chip', 'aria-pressed': 'false', 'aria-label': 'Enable SENTINEL mission-control theme', title: 'SENTINEL mission-control theme' },
      '<span class="sx-chip-ic">' + RING + '</span><span>SENTINEL</span>');
    chip.addEventListener('click', function () { engage(true); });
    if (page === 'quake') chip.style.bottom = '54px';   /* the dashboard footer sits inside the fixed-height layout */
    doc.body.appendChild(chip);
  }
  function removeChip() { if (chip && chip.parentNode) chip.parentNode.removeChild(chip); chip = null; }

  /* ---------- boot sequence ---------- */
  var BOOT_LINES = {
    quake: [['uplink  USGS NEIC feed', 'OK'], ['ShakeMap ground-motion array', 'OK'], ['global disaster alert mesh', 'OK'], ['aftershock forecast engine', 'STANDBY'], ['threat model  SEISMIC', 'ARMED']],
    faults: [['tectonic atlas  22 faults', 'OK'], ['USGS significant events  30d', 'OK'], ['orbital globe renderer', 'OK'], ['plate-boundary overlay', 'OK'], ['threat model  SEISMIC', 'ARMED']],
    stats: [['catalogue query  USGS FDSN', 'OK'], ['statistics engine', 'OK'], ['chart renderer', 'OK'], ['threat model  SEISMIC', 'ARMED']],
    generic: [['core systems', 'OK'], ['telemetry link', 'OK'], ['threat model  SEISMIC', 'ARMED']]
  };

  function runBoot(done) {
    var lines = BOOT_LINES[page] || BOOT_LINES.generic;
    bootEl = h('div', { id: 'sx-boot', role: 'presentation', 'aria-hidden': 'true' },
      '<div class="sx-boot-core">' +
      '<div class="sx-reactor">' + RING + '<span class="sx-r2"></span><span class="sx-r3"></span></div>' +
      '<div class="sx-boot-title">SENTINEL</div>' +
      '<div class="sx-boot-sub">MISSION CONTROL // SEISMIC INTELLIGENCE GRID</div>' +
      '<div class="sx-boot-log" id="sx-boot-log"></div>' +
      '<div class="sx-boot-bar"><i id="sx-boot-fill"></i></div>' +
      '<div class="sx-boot-skip">PRESS ANY KEY OR TAP TO SKIP</div></div>');
    doc.body.appendChild(bootEl);
    var log = bootEl.querySelector('#sx-boot-log'), fill = bootEl.querySelector('#sx-boot-fill');
    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      bootTimers.forEach(clearTimeout); bootTimers = [];
      doc.removeEventListener('keydown', skip, true);
      bootEl.classList.add('sx-boot-out');
      setTimeout(function () { if (bootEl && bootEl.parentNode) bootEl.parentNode.removeChild(bootEl); bootEl = null; }, 520);
      done && done();
    }
    var born = Date.now();
    function skip(e) { if (Date.now() - born < 700 || (e && e.repeat)) return; finish(); }   /* ignore the key that unlocked it and key-repeat */
    doc.addEventListener('keydown', skip, true);
    bootEl.addEventListener('click', skip);
    var step = 330, i = 0;
    lines.forEach(function (ln, idx) {
      bootTimers.push(setTimeout(function () {
        var row = h('div', { class: 'sx-bl' }, '<span>&gt; ' + ln[0] + '</span><b class="' + (ln[1] === 'OK' ? 'sx-ok' : 'sx-warn') + '">[ ' + ln[1] + ' ]</b>');
        log.appendChild(row);
        fill.style.width = Math.round((idx + 1) / (lines.length + 1) * 100) + '%';
      }, 420 + idx * step));
    });
    bootTimers.push(setTimeout(function () {
      var row = h('div', { class: 'sx-bl sx-final' }, '<span>&gt; ALL SYSTEMS NOMINAL. WELCOME, COMMANDER.</span>');
      log.appendChild(row); fill.style.width = '100%';
    }, 420 + lines.length * step));
    bootTimers.push(setTimeout(finish, 420 + lines.length * step + 700));
  }

  /* ---------- world-faults: keep the page's own theme system on "dark" ---------- */
  function ensureDark() {
    if (page !== 'faults') return;
    var btn = doc.getElementById('themeToggle');
    if (btn && root.dataset.theme && root.dataset.theme !== 'dark') { changedFaultsTheme = true; btn.click(); }
  }
  function watchTheme() {
    if (page !== 'faults' || !window.MutationObserver) return;
    themeObserver = new MutationObserver(function () { if (active && root.dataset.theme !== 'dark') ensureDark(); });
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }
  function restoreFaultsTheme() {
    if (themeObserver) { themeObserver.disconnect(); themeObserver = null; }
    if (page === 'faults' && changedFaultsTheme) {
      var btn = doc.getElementById('themeToggle');
      if (btn && root.dataset.theme === 'dark') btn.click();
    }
    changedFaultsTheme = false;
  }


  /* ---------- stats page: recolour the Chart.js charts while the theme is on ---------- */
  var chartPlugin = null, chartOrig = null, chartTouched = typeof WeakMap === 'function' ? new WeakMap() : null;
  var SX_BARS = ['#7dd3fc', '#38d5ff', '#ffb224', '#ff7a3d', '#ff4d6d', '#ff2d55'];
  function chartList() { return window.Chart && window.Chart.instances ? Object.keys(window.Chart.instances).map(function (k) { return window.Chart.instances[k]; }) : []; }
  function chartRecolor(c) {
    var ds = c.data && c.data.datasets && c.data.datasets[0];
    if (!ds || !chartTouched) return;
    if (!chartTouched.has(ds)) chartTouched.set(ds, { bg: ds.backgroundColor, bd: ds.borderColor, bw: ds.borderWidth });
    var multi = Array.isArray(ds.backgroundColor);
    ds.backgroundColor = multi ? SX_BARS.slice(0, (ds.data || []).length) : 'rgba(56,213,255,.78)';
    ds.borderColor = multi ? ds.backgroundColor : '#8af2ff';
    ds.borderWidth = 1;
  }
  function chartRestore(c) {
    var ds = c.data && c.data.datasets && c.data.datasets[0], o = ds && chartTouched && chartTouched.get(ds);
    if (o) { ds.backgroundColor = o.bg; ds.borderColor = o.bd; ds.borderWidth = o.bw; chartTouched.delete(ds); }
  }
  function chartsOn() {
    var C = window.Chart;
    if (page !== 'stats' || !C || !C.register || chartPlugin) return;
    chartOrig = { color: C.defaults.color, border: C.defaults.borderColor, family: C.defaults.font && C.defaults.font.family };
    C.defaults.color = '#9fc3e3'; C.defaults.borderColor = 'rgba(56,213,255,.16)';
    if (C.defaults.font) C.defaults.font.family = "'Rajdhani','Segoe UI',system-ui,sans-serif";
    chartPlugin = { id: 'sentinel', beforeUpdate: function (c) { if (active) chartRecolor(c); } };
    C.register(chartPlugin);
    chartList().forEach(function (c) { c.update('none'); });
  }
  function chartsOff() {
    var C = window.Chart;
    if (!chartPlugin || !C) return;
    C.unregister(chartPlugin); chartPlugin = null;
    C.defaults.color = chartOrig.color; C.defaults.borderColor = chartOrig.border;
    if (C.defaults.font && chartOrig.family) C.defaults.font.family = chartOrig.family;
    chartList().forEach(function (c) { chartRestore(c); c.update('none'); });
  }

  /* ---------- engage / disengage ---------- */
  function apply(withBoot) {
    loadFonts();
    var pre = doc.getElementById('sx-pre'); if (pre) pre.parentNode.removeChild(pre);
    root.classList.add('sx');
    root.setAttribute('data-sx-page', page);
    if (!hud) { hud = buildHud(); placeHud(); }
    if (!reduce) hud.classList.add('sx-hud-in');
    active = true;   /* must be set before the hooks below, which read it */
    watchTheme(); ensureDark(); chartsOn();
    tick(); clearInterval(clockTimer); clockTimer = setInterval(tick, 1000);
    removeChip();
    try { window.dispatchEvent(new Event('resize')); } catch (e) { /* ignore */ }
  }

  function engage(withBoot, quiet) {
    if (active) return;
    set(KEY, 'sentinel'); set(UNLOCK, '1');
    track('sentinel_engage');
    var showBoot = withBoot && !reduce;
    if (showBoot) { runBoot(null); }
    apply(withBoot);
    if (!showBoot && !quiet) toast('SENTINEL ENGAGED');
  }

  function disengage(announce) {
    if (!active) return;
    active = false;
    set(KEY, 'off');
    clearInterval(clockTimer);
    if (bootEl && bootEl.parentNode) bootEl.parentNode.removeChild(bootEl); bootEl = null;
    bootTimers.forEach(clearTimeout); bootTimers = [];
    root.classList.remove('sx'); root.removeAttribute('data-sx-page');
    if (hud && hud.parentNode) hud.parentNode.removeChild(hud); hud = null;
    restoreFaultsTheme(); chartsOff();
    buildChip();
    if (announce) toast('SENTINEL STANDBY');
    try { window.dispatchEvent(new Event('resize')); } catch (e) { /* ignore */ }
  }

  function toggle() { active ? disengage(true) : engage(true); }

  /* ---------- keyboard: Esc leaves the theme ---------- */
  doc.addEventListener('keydown', function (e) {
    if (!active || e.key !== 'Escape' || bootEl) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || doc.fullscreenElement) return;
    disengage(true);
  });

  /* ---------- start-up (called by the loader) ---------- */
  function start(mode) {
    // mode: 'resume' (theme was on), 'unlocked' (show the chip), 'engage' (egg just triggered)
    var go = function () {
      if (mode === 'engage') engage(true);
      else if (mode === 'resume') { engage(false, true); }
      else if (mode === 'unlocked') buildChip();
    };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', go); else go();
  }

  window.Sentinel = { engage: engage, disengage: disengage, toggle: toggle, start: start, active: function () { return active; }, page: page };
})();
