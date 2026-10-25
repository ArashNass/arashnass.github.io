const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8');let made=0,recovered=0;
const A={tracks:{},cur:null,ctx:{createGain(){return {gain:{value:1},connect(){return this}}},createMediaElementSource(){return {connect(){return this}}}},bus:{}};
function Audio(url){made++;this.src=url;this.handlers={};this.addEventListener=(key,fn)=>this.handlers[key]=fn;}
const ctx={A,Audio,V:1,TRACK_FILE:{menu:'menu-santur.mp3'},pickTrack(){recovered++}};vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf('function track(name)'),src.indexOf('// Until recordings arrive')),ctx);
for(let n=1;n<=7;n++){const name=`k${n}-boss`,t=ctx.track(name);assert.equal(t.el.src,`assets/music/${name}.mp3?v=1`);assert(t.el.loop);assert.equal(ctx.track(name),t)}
assert.equal(made,7);const t=ctx.track('k7-boss');A.cur='k7-boss';t.el.handlers.error();assert(t.bad);assert.equal(A.cur,null);assert.equal(recovered,1);assert.equal(ctx.track('road').el.src,'assets/music/road.m4a?v=1');
console.log('Seven distinct looping MP3 themes, cached audio elements, legacy road paths and load-error fallback passed without playback.');
