/* Keep a failed engine, game script or essential terrain load recoverable without clearing saves. */
(() => {
  'use strict';
  window.showGameLoadError = () => {
    const panel = document.getElementById('boot-error');
    if (!panel.classList.contains('hidden')) return;
    panel.classList.remove('hidden'); document.getElementById('boot-retry').focus();
    document.dispatchEvent(new Event('game-load-error'));
  };
  document.getElementById('boot-retry').onclick = () => location.reload();
  addEventListener('error', event => {
    if (event.target?.dataset?.gameScript || (event instanceof ErrorEvent && /(?:^|\/)game\.js(?:\?|$)/.test(event.filename || ''))) window.showGameLoadError();
  }, true);
})();
