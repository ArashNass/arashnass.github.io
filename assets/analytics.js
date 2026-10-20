/* Production-only analytics; calculator inputs are never included in events. */
(() => {
  'use strict';
  if (!['arashnassirpour.com', 'www.arashnassirpour.com'].includes(location.hostname) || navigator.doNotTrack === '1' || navigator.globalPrivacyControl || /(?:debug|selftest|platform-audit)/.test(location.hash + location.search)) return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-0WERZ6WKQY', { page_location: document.querySelector('link[rel="canonical"]')?.href || location.origin + location.pathname, page_title: document.title, allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement('script'); script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-0WERZ6WKQY'; document.head.appendChild(script);
})();
