const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8');
function run(wakeArt){
  let now=0, started=0, painting=0;const queue=[], events=[];
  const sprite=(x=0,y=0)=>({x,y,active:true,anims:{stop(){}},setOrigin(){return this},setScale(){return this},setFlipX(v){this.flipX=v;return this},setDepth(){return this},setFrame(){return this},play(k){events.push([now,k]);return this},destroy(){this.active=false},once(_,cb){queue.push([now+1000,cb]);return this},setVisible(){return this},setVelocity(){return this}});
  const player=sprite(0,180);player.body={bottom:223,reset(x,y){player.x=x;player.y=y;this.bottom=y+43}};
  const guard=sprite(95*16,226), sleeper=sprite(90.5*16,225);
  const scene={anims:{exists:()=>true},guard,sleeper,player,done:false,snore:{remove(){}},face:-1,inv:0,lionAt:{x:112*16},textures:{get:()=>({get:()=>({height:279})})},add:{sprite},time:{delayedCall(ms,fn){queue.push([now+ms,fn])}},tweens:{add(t){queue.push([now+t.duration,()=>{if(t.x!=null)t.targets.x=t.x;t.onComplete?.()}])}},cam:{shake(){},fadeOut(){events.push([now,'fadeOut'])},fadeIn(){events.push([now,'fadeIn'])}},fx(){},hitStop(){},startBoss(){started++;assert.equal(this.player.flipX,false);assert.equal(this.player.body.bottom,223);assert.equal(this.face,1);assert.equal(this.inv,60)}};
  const keys={attack:true,right:true},pressed={jump:true};
  const ctx={TS:16,SIZE:{lion:100},wakeArt,keys,pressed,sfx(){},banner(){},document:{body:{classList:{remove(){}}}},$:()=>({classList:{remove(){}}}),game:{scene:{resume(){}}},playing:false,cinema(name,cb){assert.equal(name,'wake1');painting++;cb()}};
  vm.createContext(ctx);
  const method=source.slice(source.indexOf('  prologueFight()'),source.indexOf('  // Keep frame-authored',source.indexOf('  prologueFight()'))).trim();
  vm.runInContext('({'+method+'})',ctx).prologueFight.call(scene);
  while(queue.length){queue.sort((a,b)=>a[0]-b[0]);const task=queue.shift();now=task[0];task[1]()}
  assert.equal(started,1);assert.equal(painting,wakeArt?1:0);assert.equal(keys.attack,false);assert.equal(keys.right,false);assert.equal(pressed.jump,false);
  const rise=events.find(([t,k])=>k==='rostam-rise');const idle=events.find(([t,k])=>k==='rostam-idle');assert(rise[0]<idle[0]);
  assert(events.find(([t,k])=>k==='fadeOut')[0]<events.find(([t,k])=>k==='fadeIn')[0]);
  assert.equal(guard.active,false);assert.equal(sleeper.active,false);
}
run(true);run(false);console.log('Lion waking timeline, optional painting, grounded handoff, input reset and fade passed.');
