/* Production-only GA4. Local previews and automated game tests never send analytics. */
(() => {
  'use strict';
  if (!['arashnassirpour.com', 'www.arashnassirpour.com'].includes(location.hostname) || location.hash.includes('debug') || location.hash.includes('selftest') || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const id = 'G-0WERZ6WKQY', url = 'https://arashnassirpour.com/fun/shahnameh/';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { page_location: url, page_title: document.title, allow_google_signals: false, allow_ad_personalization_signals: false });
  window.shahnamehTrack = (name, params = {}) => gtag('event', name, { ...params, game_name: 'Shahnameh', page_location: url });
  const script = document.createElement('script');
  script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(script);
})();
