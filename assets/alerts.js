/* Live global alerts from three free, keyless feeds: USGS significant earthquakes, UN GDACS alerts of every hazard type, and NASA EONET open events.
   Moves by transform inside a clipped track, so there is no scrollbar. If the feeds fail the strip never appears. */
(function(){
  var mount=document.getElementById('alerts-mount');if(!mount)return;
  mount.innerHTML='<section class="alerts" id="alerts" aria-label="Live global disaster alerts" hidden><div class="al-label"><span class="al-dot" aria-hidden="true"></span><span class="al-live">LIVE</span><span class="al-name">Global alerts</span></div><div class="al-track"><div class="al-run" id="alRun"></div></div><div class="al-ctl"><button class="al-btn" id="alPause" type="button" aria-label="Pause alerts" title="Pause"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></button><a class="al-link" href="/earthquake-dashboard/" title="Open the Earthquake Rapid Response dashboard"><span>Rapid Response</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></section>';
  var box=document.getElementById('alerts'),run=document.getElementById('alRun'),btn=document.getElementById('alPause');
  if(!box||!run||!window.fetch||!window.URL)return;
  var track=run.parentNode,reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS={'Earthquake':'#d9534f','Tropical Cyclone':'#5b7fd6','Severe Storm':'#5b7fd6','Flood':'#1976d2','Volcano':'#ef6c00','Wildfire':'#e65100','Drought':'#b08900','Landslide':'#8d6e63','Sea and Lake Ice':'#4aa3c8','Snow':'#6aa5c8','Dust and Haze':'#a1887f','Temperature Extreme':'#c62828','Water Color':'#26a69a','Manmade':'#7e57c2'};
  var CAP={'Earthquake':4,'Tropical Cyclone':3,'Severe Storm':2,'Flood':3,'Volcano':3,'Wildfire':3,'Drought':1};
  var EONET_CAT={'Severe Storms':'Severe Storm','Volcanoes':'Volcano','Wildfires':'Wildfire','Floods':'Flood','Landslides':'Landslide','Drought':'Drought','Temperature Extremes':'Temperature Extreme','Earthquakes':'Earthquake','Snow':'Snow','Sea and Lake Ice':'Sea and Lake Ice','Dust and Haze':'Dust and Haze','Water Color':'Water Color','Manmade':'Manmade'};
  var GD_CAT={TC:'Tropical Cyclone',FL:'Flood',VO:'Volcano',DR:'Drought',WF:'Wildfire'};
  var KEY='alerts-v2',TTL=10*60*1000,DAY=864e5;
  function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function safe(u){try{var x=new URL(u);return(x.protocol==='https:'||x.protocol==='http:')?x.href:''}catch(e){return ''}}
  function get(url){var c=new AbortController(),t=setTimeout(function(){c.abort()},8000);
    return fetch(url,{signal:c.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.text()}).then(function(t){return t&&t.trim()?JSON.parse(t):null}).catch(function(){clearTimeout(t);return null})}
  function iso(d){return new Date(d).toISOString().slice(0,10)}
  function lvlOf(x){x=(x||'').toLowerCase();return x==='red'?3:x==='orange'?2:x==='yellow'?1:0}
  function clean(name,re,country){var t=(name||'').replace(re,'').replace(/\s+/g,' ').replace(/^[\s:–—-]+/,'').trim();
    if(country&&t&&country.length<34&&t.toLowerCase().indexOf(country.toLowerCase())<0&&country.toLowerCase().indexOf(t.toLowerCase())<0)t+=' ('+country+')';
    return t||country||name}
  function build(r){
    var now=Date.now(),pool=[],gdTC=[];
    // USGS: significant earthquakes of the past week
    ((r[0]&&r[0].features)||[]).forEach(function(f){var p=f.properties||{},u=safe(p.url),t=(p.title||p.place||'').trim();
      if(u&&t)pool.push({cat:'Earthquake',txt:t,url:u,lvl:lvlOf(p.alert)>=2?lvlOf(p.alert):0,t:p.time||0,m:p.mag||0})});
    // GDACS: serious alerts of any type, plus recent green cyclones / floods / volcanoes
    [r[1],r[2]].forEach(function(d){((d&&d.features)||[]).forEach(function(f){var p=f.properties||{},cat=GD_CAT[p.eventtype];if(!cat||String(p.iscurrent)==='false')return;
      var t=Date.parse(p.fromdate+'Z')||0;if(cat==='Drought'&&now-t>60*DAY)return;if(cat==='Wildfire'&&lvlOf(p.alertlevel)<2)return;
      var u=safe((p.url&&p.url.report)||'');var re=/^(tropical cyclone|flood|eruption|volcano|drought|(wild|forest)\s?fire)\s*(in|:)?\s*/i;
      var txt=clean(p.name,re,(p.country||'').trim());if(!u||!txt)return;
      if(cat==='Tropical Cyclone')gdTC.push((p.name||'').toLowerCase());
      pool.push({cat:cat,txt:txt,url:u,lvl:lvlOf(p.alertlevel),t:t,m:0})})});
    // NASA EONET: open natural events (storms, volcanoes, floods, wildfires ...)
    ((r[3]&&r[3].events)||[]).forEach(function(e){var raw=(e.categories&&e.categories[0]&&e.categories[0].title)||'Event',cat=EONET_CAT[raw]||raw;
      var u=safe(e.link||(e.sources&&e.sources[0]&&e.sources[0].url)),t=(e.title||'').trim();if(!u||!t||cat==='Earthquake')return;
      if(/prescribed/i.test(t))return;                                           // controlled burns are not alerts
      var last=(e.geometry&&e.geometry.length&&e.geometry[e.geometry.length-1].date)||'';
      if(cat==='Severe Storm'){var nm=t.split(/\s+/).pop().toLowerCase();if(nm.length>3&&gdTC.some(function(g){return g.indexOf(nm)>=0}))return}   // already covered by GDACS, which carries the alert level
      var re=new RegExp('^'+cat.replace(/ /g,'\\s*')+'s?\\s*','i');
      pool.push({cat:cat,txt:t.replace(re,'')||t,url:u,lvl:0,t:Date.parse(last)||0,m:0})});
    // group by hazard, best first (severity, then magnitude, then recency), capped per hazard
    var groups={};pool.forEach(function(i){(groups[i.cat]=groups[i.cat]||[]).push(i)});
    var cats=Object.keys(groups);cats.forEach(function(c){groups[c].sort(function(a,b){return b.lvl-a.lvl||b.m-a.m||b.t-a.t});groups[c]=groups[c].slice(0,CAP[c]||2)});
    cats.sort(function(a,b){return groups[b][0].lvl-groups[a][0].lvl||groups[b].length-groups[a].length});
    // round-robin across hazards so the ticker always mixes types
    var out=[],more=true,i=0;while(more&&out.length<22){more=false;cats.forEach(function(c){if(groups[c][i]){out.push(groups[c][i]);more=true}});i++}
    return out;
  }
  function load(){
    try{var c=JSON.parse(sessionStorage.getItem(KEY)||'null');if(c&&Date.now()-c.t<TTL&&c.items.length)return Promise.resolve(c.items)}catch(e){}
    var to=iso(Date.now()+DAY),G='https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?';
    return Promise.all([
      get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'),
      get(G+'eventlist=TC;FL;VO;DR;WF&alertlevel=Orange;Red&fromdate='+iso(Date.now()-21*DAY)+'&todate='+to),
      get(G+'eventlist=TC;FL;VO&alertlevel=Green&fromdate='+iso(Date.now()-7*DAY)+'&todate='+to),
      get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=30')
    ]).then(function(r){var out=build(r);try{if(out.length)sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),items:out}))}catch(e){}return out});
  }
  function item(i){var lv=i.lvl>=3?'<span class="al-lvl red">RED</span>':i.lvl===2?'<span class="al-lvl orange">ORANGE</span>':'';
    return '<a class="al-item" href="'+esc(i.url)+'" target="_blank" rel="noopener" style="--ac:'+(COLORS[i.cat]||'#6b7385')+'"><span class="al-cat">'+esc(i.cat)+'</span>'+lv+'<span class="al-txt">'+esc(i.txt)+'</span></a>'}
  function start(items){
    if(!items||!items.length)return;                         // nothing to show: the strip stays hidden
    var unit=items.map(item).join(''),group=unit;
    box.hidden=false;run.innerHTML=group;
    var need=track.clientWidth||600,guard=0;
    while(run.scrollWidth<need*1.3&&guard++<6){group+=unit;run.innerHTML=group}   // make one pass at least as wide as the track
    run.innerHTML=group+group;
    requestAnimationFrame(function(){box.classList.add('is-in')});
    if(reduce){track.style.overflowX='auto';run.style.position='static';btn.hidden=true;return}   // reduced motion: no animation, scroll by hand
    var half=run.scrollWidth/2,off=0,last=0,paused=false,hover=false;
    function icon(){btn.setAttribute('aria-label',paused?'Play alerts':'Pause alerts');btn.title=paused?'Play':'Pause';
      btn.innerHTML=paused?'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'}
    btn.addEventListener('click',function(){paused=!paused;icon()});
    track.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hover=true});
    track.addEventListener('pointerleave',function(){hover=false});
    track.addEventListener('focusin',function(){hover=true});track.addEventListener('focusout',function(){hover=false});
    window.addEventListener('resize',function(){half=run.scrollWidth/2});
    (function tick(ts){var dt=last?Math.min(ts-last,100)/1000:0;last=ts;
      if(!paused&&!hover&&half>0){off=(off+32*dt)%half;run.style.transform='translate3d('+(-off).toFixed(2)+'px,0,0)'}
      requestAnimationFrame(tick)})(0);
  }
  function go(){load().then(start)}
  if('requestIdleCallback' in window)requestIdleCallback(go,{timeout:2500});else setTimeout(go,300);
})();
