/* Touch controls for phones and tablets.
   Added by the channel after the video so the games can be played on a phone. Neither model wrote this file.
   It does not change either game's code: it turns touches into the same keyboard and mouse events
   the games already listen for. With a mouse and keyboard nothing here switches on.
   Usage: <script src="../touch.js" data-inv="inventory-element-id"></script> before the game's scripts. */
(function () {
  'use strict';
  const script = document.currentScript;
  const INV_ID = (script && script.dataset.inv) || 'inv';
  const FIT = (script && script.dataset.fit) || ''; // menus to shrink so they fit a phone screen

  // ---------- touch mode ----------
  const mq = q => window.matchMedia && window.matchMedia(q).matches;
  let touchMode = mq('(pointer: coarse)') && !mq('(any-pointer: fine)');
  let fakeLock = null; // element the game asked to lock while in touch mode

  // Phone-sized page, no pinch zoom, and room for safe-area insets (desktop browsers ignore this tag).
  let vp = document.querySelector('meta[name=viewport]');
  if (!vp) { vp = document.createElement('meta'); vp.name = 'viewport'; document.head.appendChild(vp); }
  vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';

  // ---------- pointer lock shim (only fakes it in touch mode) ----------
  const protoReq = Element.prototype.requestPointerLock;
  const protoExit = Document.prototype.exitPointerLock;
  const plDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'pointerLockElement');
  const fireChange = () => document.dispatchEvent(new Event('pointerlockchange'));

  Element.prototype.requestPointerLock = function () {
    if (!touchMode) {
      if (protoReq) return protoReq.apply(this, arguments);
      return Promise.reject(new Error('Pointer lock unsupported'));
    }
    if (fakeLock !== this) { fakeLock = this; goFullscreen(); setTimeout(fireChange, 0); }
    return Promise.resolve();
  };
  Document.prototype.exitPointerLock = function () {
    if (fakeLock) { fakeLock = null; releaseAll(); setTimeout(fireChange, 0); return; }
    if (protoExit) return protoExit.apply(this, arguments);
  };
  Object.defineProperty(document, 'pointerLockElement', {
    configurable: true,
    get() { if (fakeLock) return fakeLock; return plDesc && plDesc.get ? plDesc.get.call(document) : null; }
  });

  function goFullscreen() {
    const de = document.documentElement;
    try {
      if (!document.fullscreenElement && de.requestFullscreen) {
        const p = de.requestFullscreen({ navigationUI: 'hide' });
        if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
      }
    } catch (e) {}
  }

  // A real mouse switches touch mode off; a real touch switches it on.
  window.addEventListener('pointerdown', e => {
    if (!e.isTrusted) return;
    if (e.pointerType === 'touch' || e.pointerType === 'pen') setTouch(true);
    else if (e.pointerType === 'mouse') setTouch(false);
  }, true);
  window.addEventListener('touchstart', e => { if (e.isTrusted) setTouch(true); }, { capture: true, passive: true });

  function setTouch(on) {
    if (touchMode === on) return;
    touchMode = on;
    document.documentElement.classList.toggle('tc-touch', on);
    if (!on && fakeLock) { fakeLock = null; releaseAll(); fireChange(); }
  }

  // ---------- synthetic input ----------
  const held = new Set();
  function key(code, down) {
    if (down) { if (held.has(code)) return; held.add(code); } else { if (!held.has(code)) return; held.delete(code); }
    const k = code.startsWith('Key') ? code.slice(3).toLowerCase() : code.startsWith('Digit') ? code.slice(5) : code === 'Space' ? ' ' : code;
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: k, bubbles: true, cancelable: true }));
  }
  function tapKey(code) { key(code, true); setTimeout(() => key(code, false), 60); }
  const mouseHeld = new Set();
  function mouse(button, down) {
    const target = fakeLock || document.querySelector('canvas');
    if (!target) return;
    if (down) mouseHeld.add(button); else if (!mouseHeld.delete(button)) return;
    const r = target.getBoundingClientRect();
    target.dispatchEvent(new MouseEvent(down ? 'mousedown' : 'mouseup', {
      button, buttons: down ? (button === 2 ? 2 : 1) : 0, bubbles: true, cancelable: true,
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2
    }));
  }
  function look(dx, dy) {
    const ev = new MouseEvent('mousemove', { bubbles: true, cancelable: true, movementX: dx, movementY: dy });
    // Some browsers ignore movementX in the constructor; set it on the event itself.
    try { Object.defineProperty(ev, 'movementX', { value: dx }); Object.defineProperty(ev, 'movementY', { value: dy }); } catch (e) {}
    document.dispatchEvent(ev);
  }
  function releaseAll() {
    for (const c of [...held]) key(c, false);
    for (const b of [...mouseHeld]) mouse(b, false);
    touches.clear();
    if (stickEl) stickEl.style.display = 'none';
    sneakOn = false;
    if (btn.sneak) btn.sneak.classList.remove('on');
  }

  // ---------- UI ----------
  const css = `
  #tc-layer{position:fixed;inset:0;z-index:2147483000;display:none;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  #tc-layer .tc-b{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:50%;
    background:rgba(20,20,24,.38);border:2px solid rgba(255,255,255,.45);color:#fff;font:700 13px/1 system-ui,sans-serif;
    text-shadow:0 1px 2px #000;box-sizing:border-box}
  #tc-layer .tc-b.on,#tc-layer .tc-b.down{background:rgba(255,255,255,.35)}
  #tc-stick{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;
    border:2px solid rgba(255,255,255,.4);background:rgba(20,20,24,.25);display:none;pointer-events:none}
  #tc-knob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(255,255,255,.55)}
  #tc-close{position:fixed;z-index:2147483001;display:none;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));
    padding:10px 18px;border-radius:999px;background:rgba(20,20,24,.75);border:2px solid rgba(255,255,255,.6);color:#fff;font:700 15px system-ui,sans-serif}
  #tc-tip{position:absolute;left:50%;top:18%;transform:translateX(-50%);padding:8px 14px;border-radius:10px;background:rgba(0,0,0,.6);
    color:#fff;font:600 13px/1.4 system-ui,sans-serif;text-align:center;pointer-events:none;transition:opacity .6s;max-width:80vw}
  html.tc-touch,html.tc-touch body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overscroll-behavior:none}`;
  const R = 'env(safe-area-inset-right)', B = 'env(safe-area-inset-bottom)', T = 'env(safe-area-inset-top)';
  const BUTTONS = [
    // id, label, size, right, bottom|top
    ['jump', 'Jump', 78, `calc(22px + ${R})`, { bottom: `calc(26px + ${B})` }],
    ['use', 'Use', 60, `calc(106px + ${R})`, { bottom: `calc(112px + ${B})` }],
    ['sneak', 'Sneak', 56, `calc(24px + ${R})`, { bottom: `calc(128px + ${B})` }],
    ['inv', 'Bag', 48, `calc(74px + ${R})`, { top: `calc(12px + ${T})` }],
    ['pause', '||', 48, `calc(16px + ${R})`, { top: `calc(12px + ${T})` }],
  ];
  let layer, stickEl, knobEl, closeEl, tipEl, sneakOn = false;
  const btn = {};

  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    layer = document.createElement('div'); layer.id = 'tc-layer';
    stickEl = document.createElement('div'); stickEl.id = 'tc-stick';
    knobEl = document.createElement('div'); knobEl.id = 'tc-knob'; stickEl.appendChild(knobEl);
    layer.appendChild(stickEl);
    for (const [id, label, size, right, pos] of BUTTONS) {
      const b = document.createElement('div'); b.className = 'tc-b'; b.dataset.tc = id; b.textContent = label;
      Object.assign(b.style, { width: size + 'px', height: size + 'px', right }, pos);
      layer.appendChild(b); btn[id] = b;
    }
    tipEl = document.createElement('div'); tipEl.id = 'tc-tip';
    tipEl.innerHTML = 'Left side: move &middot; Right side: drag to look<br>Tap to place &middot; Hold to break &middot; Tap the hotbar to pick';
    layer.appendChild(tipEl);
    document.body.appendChild(layer);
    closeEl = document.createElement('div'); closeEl.id = 'tc-close'; closeEl.textContent = 'Close';
    document.body.appendChild(closeEl);
    closeEl.addEventListener('touchstart', e => { e.preventDefault(); closeInventory(); }, { passive: false });
    closeEl.addEventListener('click', closeInventory);

    layer.addEventListener('touchstart', onStart, { passive: false });
    layer.addEventListener('touchmove', onMove, { passive: false });
    layer.addEventListener('touchend', onEnd, { passive: false });
    layer.addEventListener('touchcancel', onEnd, { passive: false });
    layer.addEventListener('contextmenu', e => e.preventDefault());
    setInterval(tick, 100);
  }

  function closeInventory() {
    tapKey('KeyE');
    setTimeout(() => {
      const c = document.querySelector('canvas');
      if (!fakeLock && c && !invOpen()) c.requestPointerLock();
    }, 150);
  }

  function invOpen() {
    const el = document.getElementById(INV_ID);
    if (!el) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }

  // Shrink the games' menus (built for a desktop window) so they fit a phone screen. Touch mode only.
  const zoomed = new Set();
  function fitMenus() {
    if (!FIT) return;
    if (!touchMode) { for (const k of zoomed) k.style.zoom = ''; zoomed.clear(); return; }
    for (const el of document.querySelectorAll(FIT)) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const kids = [...el.children].filter(k => { const s = getComputedStyle(k); return s.display !== 'none' && s.position !== 'fixed' && s.position !== 'absolute'; });
      if (!kids.length) continue;
      const cur = parseFloat(kids[0].style.zoom) || 1;
      let top = Infinity, bottom = -Infinity, width = 0;
      for (const k of kids) { const r = k.getBoundingClientRect(); top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom); width = Math.max(width, r.width); }
      const natH = (bottom - top) / cur, natW = width / cur;
      if (!natH || !natW) continue;
      const s = Math.min(1, (window.innerHeight - 16) / natH, (window.innerWidth - 16) / natW);
      if (Math.abs(s - cur) > 0.01) for (const k of kids) { k.style.zoom = s === 1 ? '' : s.toFixed(3); zoomed.add(k); }
    }
  }
  setInterval(fitMenus, 250);

  let tipShown = false;
  function tick() {
    const playing = touchMode && !!fakeLock;
    layer.style.display = playing ? 'block' : 'none';
    closeEl.style.display = touchMode && !fakeLock && invOpen() ? 'block' : 'none';
    if (playing && !tipShown) { tipShown = true; setTimeout(() => { tipEl.style.opacity = 0; }, 6000); }
  }

  // ---------- touch handling ----------
  const touches = new Map(); // id -> state
  const STICK_R = 60, LOOK_GAIN = 2.4, HOLD_MS = 320, TAP_MOVE = 12;

  function hotbarSlotAt(x, y) {
    const hb = document.getElementById('hotbar');
    if (!hb) return -1;
    // The games' HUD ignores pointer hits, so test the slot boxes directly.
    const kids = hb.children;
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect();
      if (r.width && x >= r.left && x <= r.right && y >= r.top - 6 && y <= r.bottom + 6) return i;
    }
    return -1;
  }

  function onStart(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const id = t.target && t.target.dataset ? t.target.dataset.tc : null;
      if (id) { buttonDown(id, t); continue; }
      const slot = hotbarSlotAt(t.clientX, t.clientY);
      if (slot >= 0 && slot < 9) { tapKey('Digit' + (slot + 1)); touches.set(t.identifier, { kind: 'none' }); continue; }
      if (t.clientX < window.innerWidth * 0.4) {
        touches.set(t.identifier, { kind: 'stick', x0: t.clientX, y0: t.clientY });
        stickEl.style.left = t.clientX + 'px'; stickEl.style.top = t.clientY + 'px'; stickEl.style.display = 'block';
        knobEl.style.transform = '';
      } else {
        const s = { kind: 'look', x: t.clientX, y: t.clientY, x0: t.clientX, y0: t.clientY, moved: false, breaking: false };
        s.timer = setTimeout(() => { if (!s.moved) { s.breaking = true; mouse(0, true); } }, HOLD_MS);
        touches.set(t.identifier, s);
      }
    }
  }

  function onMove(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const s = touches.get(t.identifier); if (!s) continue;
      if (s.kind === 'stick') {
        let dx = t.clientX - s.x0, dy = t.clientY - s.y0;
        const d = Math.hypot(dx, dy);
        if (d > STICK_R) { dx *= STICK_R / d; dy *= STICK_R / d; }
        knobEl.style.transform = `translate(${dx}px,${dy}px)`;
        const nx = dx / STICK_R, ny = dy / STICK_R;
        key('KeyW', ny < -0.35); key('KeyS', ny > 0.35); key('KeyA', nx < -0.35); key('KeyD', nx > 0.35);
        key('ControlLeft', ny < -0.92); // push all the way forward to sprint
      } else if (s.kind === 'look') {
        const dx = t.clientX - s.x, dy = t.clientY - s.y;
        s.x = t.clientX; s.y = t.clientY;
        if (!s.moved && Math.hypot(t.clientX - s.x0, t.clientY - s.y0) > TAP_MOVE) s.moved = true;
        if (s.moved || s.breaking) look(dx * LOOK_GAIN, dy * LOOK_GAIN);
      }
    }
  }

  function onEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const id = t.target && t.target.dataset ? t.target.dataset.tc : null;
      const s = touches.get(t.identifier);
      touches.delete(t.identifier);
      if (s && s.kind === 'button') { buttonUp(s.id); continue; }
      if (!s) { if (id) buttonUp(id); continue; }
      if (s.kind === 'stick') {
        stickEl.style.display = 'none';
        for (const k of ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ControlLeft']) key(k, false);
      } else if (s.kind === 'look') {
        clearTimeout(s.timer);
        if (s.breaking) mouse(0, false);
        else if (!s.moved) { mouse(2, true); setTimeout(() => mouse(2, false), 90); } // quick tap = place / use
      }
    }
  }

  function buttonDown(id, t) {
    touches.set(t.identifier, { kind: 'button', id });
    const b = btn[id]; if (b) b.classList.add('down');
    if (id === 'jump') key('Space', true);
    else if (id === 'use') mouse(2, true);
    else if (id === 'sneak') { sneakOn = !sneakOn; b.classList.toggle('on', sneakOn); key('ShiftLeft', sneakOn); }
    else if (id === 'inv') tapKey('KeyE');
    else if (id === 'pause') document.exitPointerLock();
  }
  function buttonUp(id) {
    const b = btn[id]; if (b) b.classList.remove('down');
    if (id === 'jump') key('Space', false);
    else if (id === 'use') mouse(2, false);
  }

  if (touchMode) document.documentElement.classList.add('tc-touch');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
