/* Playable story encounters. Existing art, real terrain, committed warnings. */
(() => {
  'use strict';
  class Journey {
    constructor(s, n, api) {
      this.s = s; this.n = n; this.api = api; this.live = true; this.closed = false;
      this.objects = []; this.marks = []; this.hazards = []; this.targets = []; this.bridges = []; this.log = []; this.once = new Set();
      this.next = 0; this.phase = 'approach';
      s.events.once('shutdown', () => this.destroy());
      if (n === 1) this.makeReeds();
      if (n === 4) this.makeGarden();
      if (n === 6) this.makeDrums();
      if (n === 7) this.makeMountain();
    }
    own(o) { this.objects.push(o); return o; }
    later(ms, fn) { this.s.time.delayedCall(ms, () => { if (this.live && !this.closed && !this.s.done) fn(); }); }
    note(id, fa, title, text) {
      if (this.once.has(id)) return; this.once.add(id); this.log.push({ id, at: this.s.time.now, x: this.s.player.x });
      this.api.banner(fa, title); this.api.hint(text);
    }
    actor(tex, x, y, size, depth = 4) {
      const a = this.own(this.s.add.sprite(x, y, tex, 0).setOrigin(0.5, 0.97).setDepth(depth));
      a.setDisplaySize(size, size); if (this.s.anims.exists(tex)) a.play(tex); return a;
    }
    floor(x) { return (this.s.groundAt(x) ?? 14) * 16; }
    rest(x, margin = 48) { return this.s.altars.some(a => Math.abs(a.x - x) < margin); }
    mark(x, y, width, color = 0xffa75a) {
      const a = this.own(this.s.add.ellipse(x, y - 2, width, 8, color, 0.48).setStrokeStyle(1, color).setDepth(12));
      this.s.tweens.add({ targets: a, alpha: 0.15, yoyo: true, repeat: 3, duration: 110 });
      this.marks.push(a); this.later(1800, () => a.destroy()); return a;
    }
    zone(x, y, width, height, ms, source = 'journey') {
      this.hazards.push({ r: new Phaser.Geom.Rectangle(x, y, width, height), until: this.s.time.now + ms, source });
    }
    fireAt(x, delay = 900) {
      if (this.rest(x)) return;
      const y = this.floor(x), mark = this.mark(x, y, 36);
      this.later(delay, () => {
        mark.destroy(); const f = this.own(this.s.fx('fire', x, y + 2, { depth: 7 }).setScale(1.15));
        this.s.light(f, 0.75, 0.08);
        this.zone(x - 15, y - 32, 30, 32, 650, 'attack');
        this.later(650, () => f.destroy());
      });
    }
    target(o, bounds, hit) { const t = { o, bounds, hit, swing: null }; this.targets.push(t); return t; }
    strikeTargets() {
      const s = this.s;
      if (!(s.atk > 3 && s.atk < 12) || !s.hitDone) return;
      const box = s.strikeBox(s.heavy ? 22 : 0);
      for (const t of this.targets) if (t.o.active && t.swing !== s.hitDone && Phaser.Geom.Intersects.RectangleToRectangle(box, t.bounds())) {
        t.swing = s.hitDone; t.hit(s.heavy === 'heavy' ? 3 : s.heavy || s.counterStrike ? 2 : 1);
      }
    }
    tick(time, delta) {
      const s = this.s; if (!this.live) return;
      if (s.bossOn || s.done) {
        if (this.n === 4 && s.unmasked && !this.withering) this.wither();
        this.stop(); return;
      }
      if (s.frozen || this.closed) return;
      const dt = Math.min(delta, 50) / 1000;
      if (time >= (this.gcAt || 0)) { this.objects = this.objects.filter(o => o.active); this.marks = this.marks.filter(o => o.active); this.gcAt = time + 5000; }
      this['stage' + this.n](time, dt);
      this.strikeTargets();
      this.hazards = this.hazards.filter(h => {
        if (time >= h.until) return false;
        if (Phaser.Geom.Intersects.RectangleToRectangle(s.player.body, h.r)) s.hurt(h.r.centerX, false, h.source);
        return true;
      });
    }
    // Khan I: the lion is never seen until its den, only its eyes in the far reeds, always a little ahead, gone when
    // Rostam comes near. The marsh ledges are reed rafts that sink under his weight and float up again.
    makeReeds() {
      this.perches = [14, 36, 46, 71, 78].filter(c => c * 16 > this.s.start.x + 160);
      this.rafts = [[61, 63, 11], [66, 68, 10]].map(([a, b, r]) => ({ a, b, r, state: 'afloat', until: 0 }));
    }
    eyes(c) {
      const x = c * 16 + 8, y = 177, e = this.own(this.s.add.container(x, y).setDepth(0.6).setAlpha(0));
      for (const dx of [-3, 3]) e.add([this.s.add.image(dx, 0, 'glow').setTint(0xffb43c).setScale(0.07).setBlendMode(Phaser.BlendModes.ADD), this.s.add.rectangle(dx, 0, 2, 1, 0xfff0b0)]);
      this.s.tweens.add({ targets: e, alpha: 1, duration: 600 });
      e.c = c; e.blink = this.s.time.now + 1500 + Math.random() * 2000; return e;
    }
    stage1(time) {
      const s = this.s, p = s.player;
      // the watcher in the reeds
      const watching = !s.siege;
      if (!this.watcher && watching && this.perches.length && this.perches[0] * 16 - p.x < 300 && this.perches[0] * 16 - p.x > 150) this.watcher = this.eyes(this.perches[0]);
      const w = this.watcher;
      if (w?.active) {
        if (time > w.blink) { w.blink = time + 2200 + Math.random() * 2600; s.tweens.add({ targets: w, scaleY: 0.1, yoyo: true, duration: 90 }); }
        if (!watching || w.c * 16 - p.x < 110) {
          this.watcher = null; this.perches.shift();
          s.tweens.add({ targets: w, alpha: 0, duration: 220, onComplete: () => w.destroy() });
          for (const dx of [-10, 6]) s.fx('dust', w.x + dx, 224, { depth: 1, flip: dx < 0 });
        }
      } else if (w) this.watcher = null;
      // the reed rafts
      for (const r of this.rafts) {
        const on = p.body.blocked.down && Math.abs(p.body.bottom - r.r * 16) < 4 && p.body.right > r.a * 16 && p.body.left < (r.b + 1) * 16;
        if (r.state === 'afloat' && on) { r.state = 'sinking'; r.until = time + 700; this.raft(r, 0x5f7f46); s.fx('splash', (r.a + r.b + 1) * 8, r.r * 16 + 10, { depth: 7 }); }
        else if (r.state === 'sinking') {
          const k = (r.until - time) / 700; this.raft(r, null, 0.45 + 0.55 * Math.max(0, k) * (Math.floor(time / 70) % 2 ? 1 : 0.7));
          if (time >= r.until) { for (let c = r.a; c <= r.b; c++) s.layer.removeTileAt(c, r.r); r.state = 'sunk'; r.until = time + 2400; s.fx('splash', (r.a + r.b + 1) * 8, r.r * 16 + 8, { depth: 7 }); }
        } else if (r.state === 'sunk' && time >= r.until) {
          const cells = new Phaser.Geom.Rectangle(r.a * 16, r.r * 16, (r.b - r.a + 1) * 16, 16);
          if (Phaser.Geom.Intersects.RectangleToRectangle(p.body, cells)) { r.until = time + 200; continue; }
          for (let c = r.a; c <= r.b; c++) { const t = s.layer.putTileAt(2, c, r.r); t.setCollision(false, false, true, false); }
          r.state = 'afloat'; this.raft(r, 0xffffff, 1); s.fx('splash', (r.a + r.b + 1) * 8, r.r * 16 + 8, { depth: 7 });
        }
      }
    }
    raft(r, tint, alpha) { for (let c = r.a; c <= r.b; c++) { const t = this.s.layer.getTileAt(c, r.r); if (!t) continue; if (tint != null) t.tint = tint; if (alpha != null) t.alpha = alpha; } }
    // Khan II: half way between the wells an oasis shimmers ahead, water and palms in the heat. It is a mirage: it
    // dissolves as Rostam runs to it, and the sand where it stood bursts with scorpions.
    mirage(time) {
      const s = this.s, p = s.player;
      if (this.mirageState === undefined) this.mirageState = s.start.x < 72 * 16 ? 'waiting' : 'gone';
      if (this.mirageState === 'waiting' && p.x >= 72 * 16) {
        this.mirageState = 'shimmer';
        const far = this.mirageFar = this.own(s.add.image(0, 0, 'k2-oasis').setOrigin(0).setScrollFactor(0).setAlpha(0));
        if (s.oasis) s.children.moveTo(far, s.children.getIndex(s.oasis) + 1);   // in the far distance, behind the dunes and the road
        const pool = this.miragePool = this.own(s.add.image(83 * 16, 224 + 3, 'pool').setOrigin(0.5, 1).setDepth(3).setAlpha(0));
        s.tweens.add({ targets: far, alpha: 0.6, duration: 1400 }); s.tweens.add({ targets: pool, alpha: 0.85, duration: 1400 });
        this.api.toast('Water! An oasis shimmers ahead.');
      }
      if (this.mirageState === 'shimmer') {
        const w = Math.sin(time * 0.012) * 0.08; this.mirageFar.setScale(1 + w * 0.05, 1); this.miragePool.setScale(1 + w, 1 - w * 0.5);
        if (p.x >= 79 * 16) {
          this.mirageState = 'gone';
          for (const o of [this.mirageFar, this.miragePool]) s.tweens.add({ targets: o, alpha: 0, duration: 450, ease: 'Stepped', easeParams: [5], onComplete: () => o.destroy() });
          this.note('mirage', 'سراب', 'A mirage', '<b>The oasis was a lie of the heat.</b> Mounds in the sand hide scorpions: they rise when you come near. Strike as they surface.');
          s.foes.getChildren().filter(f => f.buried && f.x > 79 * 16 && f.x < 87 * 16).forEach((f, i) => this.api.unearth?.(s, f, 22 + i * 14));
          s.cam.shake(250, 0.005);
        }
      }
    }
    stage2(time, dt) {
      const s = this.s, p = s.player;
      this.mirage(time);
      if (p.x < 70 * 16 || p.x > 104 * 16 || s.prayed) { this.surge?.o.destroy(); this.surge = null; return; }
      this.note('sand-shelters', 'بادِ بیابان', 'The desert is on the move', '<b>Moving sand drains your water.</b> Jump the low surge, or take shelter on the high rocks.');
      if (!this.surge && time >= this.next) {
        this.next = time + 5200; const x = 71 * 16, y = 224, m = this.mark(x + 50, y, 110, 0xf4d185);
        this.surge = { x, age: -0.8, hit: false, o: this.own(s.add.rectangle(x, y - 11, 32, 22, 0xe8b35d, 0.65).setDepth(7).setVisible(false)) };
        this.later(800, () => m.destroy());
      }
      const v = this.surge; if (!v) return; v.age += dt;
      if (v.age < 0) return;
      v.x += 155 * dt; v.o.setX(v.x).setVisible(true).setAlpha(0.5 + Math.sin(time * 0.03) * 0.15);
      if (!v.hit && !this.rest(p.x) && Phaser.Geom.Intersects.RectangleToRectangle(p.body, new Phaser.Geom.Rectangle(v.x - 16, 202, 32, 22))) {
        v.hit = true; s.water = Math.max(0, s.water - 8); s.renderWater(); s.fx('dust', p.x, p.body.bottom, { depth: 8 });
      }
      if (v.x > 99 * 16) { v.o.destroy(); this.surge = null; }
    }
    // Khan III: the night ride. Past the first fire the dragon comes down behind Rakhsh and its flame runs along the
    // ground after him, across the broken marsh, until the sacred fire ahead holds it back. It keeps a little behind
    // a rider who keeps moving; a stumble lets it close. A burn throws it back a moment, so one mistake is not two.
    ride(time, dt) {
      const s = this.s, p = s.player;
      if (this.rideState === undefined) this.rideState = s.start.x < 46 * 16 ? 'waiting' : 'done';
      if (this.rideState === 'waiting' && p.x >= 46 * 16) {
        this.rideState = 'chase'; this.fireX = p.x - 170; this.api.sfx('roar'); s.cam.shake(600, 0.01);
        this.note('night-ride', 'اژدها', 'Ride, Rakhsh!', "<b>The dragon's fire runs behind you.</b> Keep riding: only the sacred fire ahead will stop it.");
        const col = this.flames = [];
        for (let i = 0; i < 7; i++) { const f = this.own(s.fx('fire', 0, 0, { depth: 7 }).setScale(1.5 - i * 0.12)); f.anims.setProgress(Math.random()); col.push(f); }
        for (let i = 0; i < 4; i++) { const f = this.own(s.fx('fire', 0, 0, { depth: 6.9 }).setScale(1.1 - i * 0.1).setAlpha(0.8)); f.anims.setProgress(Math.random()); col.push(f); }
        this.fireGlow = this.own(s.add.image(0, 0, 'glow').setScale(2.4, 3.4).setTint(0xff7a2a).setBlendMode(Phaser.BlendModes.ADD).setDepth(6.8).setAlpha(0.8));
        s.light(this.fireGlow, 2.6, 0.12);
        this.wyrm = this.actor('dragon-move', p.x - 260, 70, 165, 11.1).setTint(0x51416b).setAlpha(0.75);
      }
      if (this.rideState !== 'chase') return;
      if (p.x >= 84 * 16 || s.done) {
        this.rideState = 'done'; this.api.toast("The sacred fire holds the dragon's flame back. Rakhsh slows, trembling.");
        for (const f of [...this.flames, this.fireGlow]) s.tweens.add({ targets: f, alpha: 0, duration: 700, onComplete: () => f.destroy() });
        s.tweens.add({ targets: this.wyrm, x: this.wyrm.x - 300, y: 30, alpha: 0, duration: 1800, onComplete: () => this.wyrm.destroy() });
        return;
      }
      this.fireX = Math.max(this.fireX + (s.frozen ? 0 : 150 * dt), p.x - 210);   // nearly Rakhsh's pace: a pause is felt
      const fx = this.fireX, floor = (s.groundAt(fx) ?? 14) * 16;
      this.flames.forEach((f, i) => { const back = i >= 7, k = back ? i - 7 : i; f.setPosition(fx - (back ? 14 : 0) + Math.sin(time * 0.02 + i) * 2, floor - k * (back ? 15 : 17)); });
      this.fireGlow.setPosition(fx - 4, floor - 50);
      this.wyrm.setPosition(fx + 30, 62 + Math.sin(time * 0.003) * 8);
      if (time > (this.emberAt || 0)) { this.emberAt = time + 140; s.fx('dust', fx + 8, floor, { depth: 7 }).setTint(0xff9a4a).setScale(0.7); }
      if (p.body.left < fx + 12 && !s.frozen) { s.hurt(fx, false, 'terrain'); this.fireX -= 130; }
    }
    stage3(time, dt) {
      const p = this.s.player;
      this.ride(time, dt);
      for (const [at, positions] of [[12, []], [34, [36, 39]], [66, [70, 73]], [98, [100, 103]]]) {
        if (p.x < at * 16 || p.x > (at + 10) * 16 || this.once.has('dragon-' + at)) continue;
        if (at === 66 && this.rideState !== 'waiting') { this.once.add('dragon-66'); continue; }   // the ride replaces this pass
        this.note('dragon-' + at, 'اژدها', 'A shadow crosses the moon', '<b>Rakhsh senses the dragon.</b> The red marks show where its breath will fall. Ride through the openings or wait for the fire to fade.');
        const shadow = this.actor('dragon-move', p.x + 310, 125, 165, 11.1).setTint(0x51416b).setAlpha(0.8);
        this.s.tweens.add({ targets: shadow, x: p.x - 320, y: 75, duration: 2400, onComplete: () => shadow.destroy() });
        positions.forEach((c, i) => this.fireAt((c + 0.5) * 16, 1000 + i * 350));
        this.s.sparkle(p.x, p.body.bottom, 0xffdc8a);
      }
    }
    makeGarden() {
      for (const [a, b] of [[35,39],[67,72],[87,90]]) this.bridges.push({ a, b, row: 14, state: 'gone', next: 0, tiles: [] });
    }
    bridge(b, on) {
      const layer = this.s.layer;
      if (!layer?.scene) return;
      if (on) {
        for (let c = b.a; c <= b.b; c++) { const t = layer.putTileAt(2, c, b.row); t.setCollision(false, false, true, false); t.tint = 0x79d29a; t.alpha = 0.9; }
      } else for (let c = b.a; c <= b.b; c++) layer.removeTileAt(c, b.row);
    }
    stage4(time) {
      const p = this.s.player;
      if (p.x >= 25 * 16) this.note('living-garden', 'باغِ افسون', 'The garden changes its mind', '<b>Green bridges bloom over the thorns.</b> Violet means they are about to vanish. Take the shortcut quickly, or use the permanent high ledges.');
      for (const b of this.bridges) {
        if (Math.abs(p.x - (b.a + b.b) * 8) > 26 * 16) continue;
        if (b.state === 'gone' && time >= b.next) { this.bridge(b, true); b.state = 'bloom'; b.next = time + 4200; }
        else if (b.state === 'bloom' && time >= b.next) {
          b.state = 'fading'; b.next = time + 950;
          for (let c = b.a; c <= b.b; c++) { const t = this.s.layer.getTileAt(c, b.row); if (t) t.tint = 0xc278ce; }
          this.mark((b.a + b.b + 1) * 8, 224, (b.b - b.a + 1) * 16, 0xc278ce);
        } else if (b.state === 'fading' && time >= b.next) { this.bridge(b, false); b.state = 'gone'; b.next = time + 2600; }
      }
    }
    wither() {
      this.withering = true;
      for (const o of this.s.children.list) if (o.texture?.key === 'k4-far') this.s.tweens.add({ targets: o, alpha: 0.45, duration: 1600 });
      this.s.mist?.setTint(0x704070);
      this.api.toast('The garden withers. Its living bridges were part of the spell.');
    }
    mount(on) {
      const s = this.s, p = s.player, body = p.body, foot = body.bottom, vx = body.velocity.x, vy = body.velocity.y;
      p.x = body.x - p.scaleX * (body.offset.x - p.displayOriginX); p.y = body.y - p.scaleY * (body.offset.y - p.displayOriginY);
      s.mounted = on; s.dodgeT = 0; s.dodgeBuf = 0; s.atk = 0; s.pose = null; s.chargeT = 0; s.chargeFull = false; s.chargeGlow?.destroy(); s.chargeGlow = null;
      p.setTexture(on ? 'ride-gallop' : 'rostam-idle', 0); s.fit(p, on ? 'rider' : 'rostam');
      body.updateFromGameObject(); p.y += foot - body.bottom; body.updateFromGameObject();
      body.prev.copy(body.position); body.prevFrame.copy(body.position); body.autoFrame.copy(body.position);
      p.setVelocity(vx, vy); p.play(on ? 'ride-gallop' : 'rostam-idle');
      this.mountedByJourney = on;
    }
    // Khan V: the border watch. Between the first fires, archers on the far hills loose volleys at Rostam: marks on
    // the ground first, where he is heading, then the arrows fall there. Keep moving, or step back out of the marks.
    volley(time) {
      const s = this.s, p = s.player;
      if (p.x < 10 * 16 || p.x > 46 * 16 || s.frozen || time < (this.volleyAt || 0)) return;
      this.volleyAt = time + 3300;
      this.note('border-watch', 'مرزبانان', 'The border watch', '<b>Arrows from the hills!</b> They fall where the marks glow, ahead of you. Stop short, or dash through before they land.');
      const lead = Phaser.Math.Clamp(p.body.velocity.x * 0.95, -115, 115);   // where he will be when they land
      for (let i = 0; i < 3; i++) {
        const x = p.x + lead + (i - 1) * 30; if (this.rest(x, 40)) continue;
        const y = this.floor(x), m = this.mark(x, y, 22, 0xe8d8a0);
        this.later(900 + i * 70, () => {
          m.destroy(); this.api.sfx('swing');
          for (let j = 0; j < 3; j++) {
            const a = this.own(s.add.image(x + (j - 1) * 6, y - 150 - j * 14, 'arrow').setOrigin(0.5, 1).setDepth(8).setAngle(8).setScale(1.5));
            s.tweens.add({ targets: a, y: y + 2, duration: 210 + j * 25, ease: 'Quad.easeIn', onComplete: () => { s.fx('dust', a.x, y, { depth: 7 }).setScale(0.4); this.later(900, () => a.destroy()); } });
          }
          this.later(190, () => this.zone(x - 11, y - 34, 22, 34, 130, 'attack'));
        });
      }
    }
    stage5(time, dt) {
      const s = this.s, p = s.player;
      this.volley(time);
      if (this.phase === 'approach' && p.x >= 50 * 16 && p.x < 106 * 16 && s.atk <= 0 && !s.heavyGo && !(s.dodgeT > 0)) {
        this.phase = 'pursuit'; this.next = time + 1000; this.mount(true);
        this.scout = this.actor('olad-walk', p.x + 155, this.floor(p.x + 155), 112, 5).setFlipX(false);
        this.target(this.scout, () => new Phaser.Geom.Rectangle(this.scout.x - 18, this.scout.y - 75, 36, 75), () => {
          this.next = s.time.now + 1500; this.scout.x += 35; s.fx('impact', this.scout.x - 20, this.scout.y - 35, { depth: 8 }); s.gainFarr(3);
        });
        this.note('olad-pursuit', 'اولاد', 'The warden retreats', '<b>Rakhsh carries you after Olad!</b> Ride over the rocks and strike from the saddle. Knock a flying knife back, or jump its committed path.');
      }
      if (this.phase !== 'pursuit') { if (this.mountedByJourney && p.body.blocked.down && s.atk <= 0) this.mount(false); return; }
      const o = this.scout;
      o.x += Math.min(100 * dt, Math.max(0, p.x + 120 - o.x)); o.y = this.floor(o.x); o.setFlipX(p.x < o.x);
      if (time >= this.next && p.x < 103 * 16 && !this.rest(p.x)) {
        this.next = time + 2400; const target = { x: p.body.center.x, y: p.body.center.y }, x = o.x - 20, y = o.y - 54;
        const warning = this.own(s.add.line(0, 0, x, y, target.x, target.y, 0xffd28a, 0.65).setOrigin(0).setDepth(12)); warning.journeyWarning = true;
        this.later(750, () => {
          warning.destroy(); if (!o.active || this.phase !== 'pursuit') return;
          const a = Math.atan2(target.y - y, target.x - x), sh = s.shoot(x, y, Math.cos(a) * 180, Math.sin(a) * 180, 'knife', { life: 2000 });
          sh.curse = true; sh.journey = true; sh.journeyTarget = o; sh.setRotation(a);
        });
      }
      for (const sh of s.shots.getChildren()) if (sh.active && sh.back && sh.journeyTarget === o && Phaser.Geom.Intersects.RectangleToRectangle(sh.getBounds(), new Phaser.Geom.Rectangle(o.x - 20, o.y - 75, 40, 75))) {
        sh.destroy(); o.x += 45; this.next = time + 1800; s.gainFarr(8); s.combatWord('Turned back');
      }
      if (p.x >= 106 * 16) {
        this.phase = 'escaped'; this.next = Infinity; for (const warning of this.objects) if (warning.active && warning.journeyWarning) warning.destroy(); if (p.body.blocked.down && s.atk <= 0) this.mount(false);
        for (const sh of s.shots.getChildren()) if (sh.journey) sh.destroy();
        s.tweens.add({ targets: o, x: o.x + 200, alpha: 0, duration: 750, onComplete: () => o.destroy() });
        this.note('olad-stand', 'اولاد', 'The warden makes his stand', '<b>Light the last fire.</b> Olad has nowhere left to retreat.');
      }
    }
    makeDrums() {
      this.drums = [69,75].map(c => {
        const g = this.own(this.s.add.container((c + 0.5) * 16, 144).setDepth(5));
        g.add([this.s.add.rectangle(0, -13, 22, 25, 0x783c32).setStrokeStyle(2, 0xd7ae62), this.s.add.ellipse(0, -25, 23, 8, 0xf0d5a0).setStrokeStyle(1, 0x8a552e), this.s.add.rectangle(0, -10, 4, 23, 0xe7c279)]);
        this.s.light(g, 0.65, 0.06);
        const d = { g, hp: 2 };
        this.target(g, () => new Phaser.Geom.Rectangle(g.x - 14, g.y - 32, 28, 32), amount => {
          d.hp -= amount; this.s.fx('impact', g.x, g.y - 15, { depth: 8 });
          if (d.hp <= 0) { g.destroy(); this.s.gainFarr(8); this.s.combatWord('War drum silenced'); }
        }); return d;
      });
    }
    stage6(time) {
      const s = this.s; if (!s.horde || s.hordeDone) { this.hazards = []; for (const o of this.objects) if (o.active && o.journeyLane) o.destroy(); return; }
      this.note('war-drums', 'کوسِ جنگ', 'Silence the war drums', '<b>Six waves.</b> Break the two drums on the high platform to stop their fire lanes. Red ground means jump or change sides.');
      if (s.horde.wave < 2 || !this.drums.some(d => d.g.active) || time < this.next) return;
      this.next = time + Math.max(2600, 4200 - s.horde.wave * 180);
      const choices = this.drums.filter(d => d.g.active), d = choices[this.lane = ((this.lane ?? -1) + 1) % choices.length];
      const left = d === this.drums[0], a = left ? 60 : 77, b = left ? 68 : 84, x = (a + b + 1) * 8;
      const mark = this.mark(x, 224, (b - a + 1) * 16, 0xff7050); mark.journeyLane = true;
      this.later(1000, () => {
        mark.destroy(); if (!d.g.active || !s.horde || s.hordeDone) return;
        const flames = [];
        for (let c = a; c <= b; c += 2) { const f = this.own(s.fx('fire', (c + 0.5) * 16, 225, { depth: 7 })); f.journeyLane = true; flames.push(f); }
        this.zone(a * 16, 204, (b - a + 1) * 16, 20, 650);
        this.later(650, () => flames.forEach(f => f.destroy()));
      });
    }
    makeMountain() {
      this.crumble = [];
      for (const [c, r] of [[100,10],[101,10],[103,9],[104,9],[134,11],[135,11]]) {
        const tile = this.s.layer.getTileAt(c, r); if (tile) this.crumble.push({ c, r, index: tile.index, state: 'solid', until: 0 });
      }
      const x = 141.5 * 16;
      if (this.s.start.x < x) {
        this.seal = this.own(this.s.add.rectangle(x, 224, 15, 224, 0x9ddfff, 0.58).setOrigin(0.5, 1).setStrokeStyle(2, 0xd8f3ff).setDepth(12));
        this.s.physics.add.existing(this.seal, true); this.s.physics.add.collider(this.s.player, this.seal);
        this.seal.setAlpha(0);
        this.sealArt = this.own(this.s.add.container(x, 0).setDepth(12));
        for (const [dx, width, alpha] of [[-9,18,0.65],[7,19,0.7],[0,17,0.9]]) this.sealArt.add(this.s.add.image(dx, 0, 'icicle').setOrigin(0.5, 0).setDisplaySize(width, 224).setTint(0xbceaff).setAlpha(alpha));
        this.sealRunes = [122,140,158].map(y => this.s.add.rectangle(0, y, 7, 7, 0xffe3a0).setRotation(Math.PI / 4).setStrokeStyle(1, 0xfff6d7));
        this.sealArt.add(this.sealRunes); this.sealHp = 3;
        this.target(this.seal, () => new Phaser.Geom.Rectangle(x - 12, 0, 24, 224), damage => {
          this.sealHp -= damage; this.s.fx('impact', x, this.s.player.body.center.y, { depth: 9 }); this.s.cam.shake(100, 0.006);
          if (this.sealHp <= 0) { this.seal.destroy(); this.s.tweens.add({ targets: this.sealArt, y: 20, alpha: 0, duration: 450, onComplete: () => this.sealArt.destroy() }); this.s.sparkle(x, 160, 0xb9ecff); this.s.gainFarr(10); this.phase = 'seal-broken'; this.api.toast('The ice seal shatters. The White Div waits beyond the last fire.'); }
          else this.sealRunes.forEach((r, i) => r.setVisible(i < this.sealHp));
        });
      }
    }
    iceAt(c) {
      const x = (c + 0.5) * 16; if (this.rest(x)) return;
      const y = this.floor(x), m = this.mark(x, y, 25, 0xb9eaff);
      const beam = this.own(this.s.add.rectangle(x, y - 80, 13, 160, 0xb9eaff, 0.18).setDepth(12));
      this.later(1050, () => {
        m.destroy(); beam.destroy(); const ice = this.own(this.s.add.image(x, y - 150, 'icicle').setOrigin(0.5, 1).setDepth(12));
        this.s.tweens.add({ targets: ice, y: y + 3, duration: 220, onComplete: () => {
          if (!this.live || this.closed) { ice.destroy(); return; }
          this.zone(x - 11, y - 55, 22, 55, 200); this.s.fx('impact', x, y, { depth: 9 }); ice.destroy();
        } });
      });
    }
    stage7(time) {
      const s = this.s, p = s.player;
      if (p.x >= 89 * 16 && s.start.x < 99 * 16) this.note('crumbling-mountain', 'هفت کوه', 'The mountain gives way', '<b>Ice ledges crack beneath your feet.</b> Jump again before they fall. They reform if you need another attempt.');
      for (const b of this.crumble) {
        const t = s.layer.getTileAt(b.c, b.r);
        if (b.state === 'solid' && p.body.blocked.down && Math.abs(p.body.bottom - b.r * 16) < 4 && p.body.right > b.c * 16 && p.body.left < (b.c + 1) * 16) {
          b.state = 'cracking'; b.until = time + 900; if (t) t.tint = 0xe4b7eb;
        } else if (b.state === 'cracking' && time >= b.until) { s.layer.removeTileAt(b.c, b.r); b.state = 'gone'; b.until = time + 2800; s.fx('dust', (b.c + 0.5) * 16, b.r * 16, { depth: 8 }); }
        else if (b.state === 'gone' && time >= b.until) {
          // Never reform a solid tile through the player's body.
          const cell = new Phaser.Geom.Rectangle(b.c * 16, b.r * 16, 16, 16);
          if (Phaser.Geom.Intersects.RectangleToRectangle(p.body, cell)) { b.until = time + 200; continue; }
          const tile = s.layer.putTileAt(b.index, b.c, b.r); tile.setCollision(false, false, true, false); b.state = 'solid';
        }
      }
      if (p.x >= 120 * 16 && p.x < 139 * 16) {
        this.note('cave-ice', 'غارِ دیو', 'The cave awakens', '<b>Pale beams mark falling ice.</b> Keep clear of the marked column. Ahead, strike the ice seal: three blows, or one charged heavy blow.');
        for (const c of [122,130,138]) if (p.x >= (c - 4) * 16 && p.x <= (c + 1) * 16 && !this.once.has('ice-' + c)) { this.once.add('ice-' + c); this.iceAt(c); }
      }
    }
    getTip() {
      const x = this.s.player.x / 16;
      if (this.n === 1) return this.s.siege ? 'When a jackal drops its head it is about to lunge. Dodge or jump it, then strike while it pants.' : x >= 58 && x < 70 ? 'The reed rafts sink a moment after you land. Keep moving, or take the high road over the reeds.' : null;
      if (this.n === 2 && x >= 72 && x < 90) return 'Sand mounds hide buried scorpions. They rise when you come near: step back, then strike as they surface.';
      if (this.n === 2 && x >= 70 && x < 104) return 'A sand surge drains water on the low road. Jump over it or shelter on the raised rocks.';
      if (this.n === 3 && this.rideState === 'chase') return "The dragon's fire follows you across the marsh. Keep riding and make clean jumps: the sacred fire ahead stops it.";
      if (this.n === 3 && x >= 34) return 'The dragon marks the ground before its breath lands. Move through an opening or wait for the fire to fade.';
      if (this.n === 4 && x >= 25) return 'Violet bridges will vanish. Jump before they fade, or take the permanent high ledges.';
      if (this.n === 5 && x >= 10 && x < 47) return 'The border watch aims where you are heading. Stop short of the glowing marks, or dash through before the arrows land.';
      if (this.n === 5 && this.phase === 'pursuit') return 'Strike flying knives back at Olad from the saddle. He commits to the line he marked.';
      if (this.n === 6 && this.s.horde) return 'Break the two war drums on the high platform to silence their fire lanes.';
      if (this.n === 7) return x < 120 ? 'Cracking ledges fall after their warning and reform shortly. Keep your second jump for the crossing.' : 'Keep out of the pale ice columns. Break the cave seal with three strikes or one charged heavy blow.';
      return null;
    }
    stop() {
      if (this.closed) return; this.closed = true; this.hazards = [];
      if (this.mountedByJourney && this.s.player?.active) this.mount(false);
      for (const b of this.bridges) this.bridge(b, false);
      for (const r of this.rafts || []) if (r.state !== 'afloat' && this.s.layer?.scene) { for (let c = r.a; c <= r.b; c++) { const t = this.s.layer.putTileAt(2, c, r.r); t.setCollision(false, false, true, false); } }
      for (const o of this.objects) if (o.active) o.destroy();
      for (const sh of (this.s.shots?.children?.entries || []).slice()) if (sh.journey) sh.destroy();
    }
    destroy() { this.stop(); this.live = false; }
  }
  window.ShahnamehJourney = { create: (s, n, api) => new Journey(s, n, api) };
})();
