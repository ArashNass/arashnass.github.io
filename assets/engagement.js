/* Shared, input-free engagement measurement. Never sends user values, filenames or contact details. */
(() => {
  'use strict';
  if (window.PlatformMetrics) return;
  const production = ['arashnassirpour.com', 'www.arashnassirpour.com'].includes(location.hostname);
  const optedOut = navigator.doNotTrack === '1' || navigator.globalPrivacyControl;
  const testing = /(?:debug|selftest|platform-audit)/.test(location.hash + location.search);
  const canonical = document.querySelector('link[rel="canonical"]')?.href || location.origin + location.pathname;
  const tool = new URL(canonical).pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9/_-]/gi, '_') || 'home';
  const names = new Set(['tool_engaged', 'tool_action', 'calculation_complete', 'export_ready', 'contact_click', 'related_tool_click', 'web_vital']);
  let engaged = false, pending = false, timer;
  const recent = new Map();
  function emit(name, params = {}) {
    if (!production || optedOut || testing || !names.has(name) || typeof window.gtag !== 'function') return;
    const data = { tool_name: tool, page_location: canonical };
    for (const key of ['action_name', 'format', 'method', 'metric_name', 'metric_rating']) {
      if (typeof params[key] === 'string' && /^[a-z0-9_/-]{1,64}$/i.test(params[key])) data[key] = params[key];
    }
    if (name === 'web_vital' && Number.isFinite(params.metric_value)) data.metric_value = params.metric_value;
    const signature = name + ':' + (data.action_name || data.format || data.method || '');
    if (name !== 'web_vital' && Date.now() - (recent.get(signature) || 0) < 800) return;
    recent.set(signature, Date.now());
    try { window.gtag('event', name, data); } catch (_) { /* Measurement cannot interrupt the tool. */ }
  }
  function engage() { if (!engaged) { engaged = true; emit('tool_engaged'); } }
  function complete(action = 'calculate') {
    // Auto-rendered initial defaults do not count as a completed user calculation.
    if (!pending) return;
    clearTimeout(timer); timer = setTimeout(() => { pending = false; emit('calculation_complete', { action_name: action }); }, 600);
  }
  window.PlatformMetrics = Object.freeze({ emit, complete });
  document.addEventListener('click', e => {
    if (!e.isTrusted) return;
    const target = e.target instanceof Element ? e.target : null;
    const action = target?.closest('[data-track-action]');
    if (action && !action.disabled) { engage(); if (/^(calculate_requested|simulation_requested|load_example|play_model)$/.test(action.dataset.trackAction)) pending = true; emit('tool_action', { action_name: action.dataset.trackAction }); }
    if (!action && target?.closest('button[data-preset],button[role=tab],button[data-mode]')) { engage(); pending = true; emit('tool_action', { action_name: 'change_view_or_example' }); }
    const link = target?.closest('a[href]');
    if (link && /^(mailto:|tel:)/i.test(link.getAttribute('href'))) emit('contact_click', { method: /^mailto:/i.test(link.getAttribute('href')) ? 'email' : 'phone' });
  }, true);
  document.addEventListener('input', e => {
    if (!e.isTrusted || tool === 'fun/shahnameh') return;
    if (e.target.matches('input:not([type="search"]),select,textarea') && !e.target.closest('header,.site-hd')) { engage(); pending = true; }
  }, true);
  document.addEventListener('change', e => {
    if (!e.isTrusted || tool === 'fun/shahnameh') return;
    if (e.target.matches('input,select,textarea') && !e.target.closest('header,.site-hd')) { engage(); pending = true; }
  }, true);
})();
