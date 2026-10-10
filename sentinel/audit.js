/* SENTINEL contrast audit. Paste into the browser console (or load as a script) while the theme is on.
 * Reports text below WCAG AA (4.5:1, or 3:1 for large text) and any light surfaces left over, then prints a table.
 * Run it again after selecting a different event / opening popovers / changing filters: dynamic content matters.
 */
(function () {
  var freeze = document.createElement('style');           // transitions can be mid-flight; read settled values
  freeze.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
  document.head.appendChild(freeze);

  function parse(c) { var m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; var p = m[1].split(',').map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
  function lin(v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }
  function lum(c) { return .2126 * lin(c.r) + .7152 * lin(c.g) + .0722 * lin(c.b); }
  function over(b, f) { return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 }; }
  function effBg(el) {
    var chain = [], e = el, bg = { r: 1, g: 4, b: 10, a: 1 };
    while (e && e.nodeType === 1) { chain.push(e); e = e.parentElement; }
    chain.reverse().forEach(function (n) {
      var cs = getComputedStyle(n), c = parse(cs.backgroundColor);
      if (c && c.a > 0) bg = over(bg, c);
      if (cs.backgroundImage && /gradient/.test(cs.backgroundImage)) {   // approximate a gradient by the average of its colour stops
        var cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean);
        if (cols.length) {
          var avg = { r: 0, g: 0, b: 0, a: Math.min(1, Math.max.apply(null, cols.map(function (x) { return x.a; }))) };
          cols.forEach(function (x) { avg.r += x.r / cols.length; avg.g += x.g / cols.length; avg.b += x.b / cols.length; });
          bg = over(bg, avg);
        }
      }
    });
    return bg;
  }
  function name(el) { return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''); }

  var low = [], light = [], seen = {};
  document.querySelectorAll('body *').forEach(function (el) {
    if (/^(SCRIPT|STYLE|CANVAS|svg|path)$/.test(el.tagName)) return;
    if (el.closest('.leaflet-container') && !el.closest('.leaflet-popup')) return;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
    var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    var bgc = parse(cs.backgroundColor);
    if (bgc && bgc.a >= .5 && r.width * r.height > 600 && lum(bgc) > .3) light.push(name(el) + ' ' + cs.backgroundColor);
    var own = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim().length > 1; });
    if (!own.length) return;
    var fg = parse(cs.color); if (!fg) return;
    var bg = effBg(el), f = over(bg, fg), a = lum(f), b = lum(bg);
    var ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    var size = parseFloat(cs.fontSize), large = size >= 24 || (parseInt(cs.fontWeight, 10) >= 700 && size >= 18.66);
    if (ratio < (large ? 3 : 4.5)) {
      var key = name(el) + '|' + cs.color; if (seen[key]) return; seen[key] = 1;
      low.push({ element: name(el), text: own[0].textContent.trim().slice(0, 28), ratio: +ratio.toFixed(2), color: cs.color, size: size });
    }
  });
  freeze.remove();
  console.log('SENTINEL audit: ' + low.length + ' low-contrast text item(s), ' + light.length + ' light surface(s)');
  if (low.length) console.table(low);
  if (light.length) console.log('light surfaces (neon badges / progress fills are expected):', light);
  return { lowContrast: low, lightSurfaces: light };
})();
