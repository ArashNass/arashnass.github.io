const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{EventEmitter}=require('node:events');
const src=fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8');
const method=src.slice(src.indexOf('  slay(f) {'),src.indexOf('  // break a sprite'));
function fixture(has=true){
 let now=0,shatters=0;const tasks=[],ctx={sfx(){}};vm.createContext(ctx);const scene=vm.runInContext('({'+method+'})',ctx);
 Object.assign(scene,{tweens:{killTweensOf(){}},cam:{shake(){}},anims:{exists:()=>has,get:()=>({duration:600})},time:{delayedCall(ms,fn){const t={at:now+ms,fn,removed:false,remove(){this.removed=true}};tasks.push(t);return t}},shatter(){shatters++},fx(){}});
 const f=new EventEmitter();Object.assign(f,{kind:'jackal',active:true,body:{enable:true,center:{y:10}},anims:{timeScale:2},setVelocity(){},setAngle(){},setTintFill(){},clearTint(){},play(k){this.played=k},destroy(){this.active=false}});
 const advance=ms=>{const end=now+ms;while(true){const t=tasks.filter(t=>!t.removed&&t.at<=end).sort((a,b)=>a.at-b.at)[0];if(!t)break;now=t.at;t.removed=true;t.fn()}now=end};return {scene,f,advance,count:()=>shatters};
}
{const x=fixture();x.scene.slay(x.f);assert(!x.f.body.enable);x.advance(90);assert.equal(x.f.played,'jackal-die');assert.equal(x.count(),0);x.f.emit('animationcomplete-jackal-die');assert.equal(x.count(),1);x.advance(1000);assert.equal(x.count(),1)}
{const x=fixture(false);x.scene.slay(x.f);x.advance(90);assert.equal(x.count(),1)}
{const x=fixture();x.scene.slay(x.f);x.scene.slay(x.f);x.advance(1000);assert.equal(x.count(),1)}
{const x=fixture();x.scene.slay(x.f);x.f.destroy();x.advance(1000);assert.equal(x.count(),0)}
console.log('Death animation waits for completion, disables collisions immediately, and safely handles missing/interrupted/duplicate deaths.');
