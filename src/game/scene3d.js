// src/game/scene3d.js
import * as THREE from 'three';
import { S, th, cl } from './state.js';

export let R = null;
export let sc = null;
export let cam = null;
export let DK = [];
export let WK = {};
export let TM = {};
export let DG = {};
export let lth = null;
export const SL = [
  [0, 0],
  [-2.3, 0],
  [2.3, 0],
  [-2.3, 2.2],
  [0, 2.2],
  [2.3, 2.2],
  [-1.5, -3.3],
  [0.7, -3.3]
];
export const FY = 2.8;
export let G2 = null;
export let FG = {};
export let az = 0.785;
export let elv = 0.62;
export let hh = 5;
export let W = 1;
export let H = 1;
export let tgt = null;
export let zm = 1;

let animFrameId = null;
let last = performance.now();
let rt = 0;
let containerElem = null;
let resizeObserver = null;

export function setZm(val) {
  zm = cl(val, 0.4, 4);
}
export function getZm() {
  return zm;
}
export function rotateCam(delta) {
  az += delta;
}


export function B(w, h, d, c, x, y, z, p) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: c }));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  (p || sc).add(m);
  return m;
}

export function build(off) {
  containerElem = off;
  try {
    R = new THREE.WebGLRenderer({ antialias: true });
  } catch (e) {
    off.textContent = 'Browser tidak mendukung WebGL.';
    return false;
  }
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  R.shadowMap.enabled = true;
  off.innerHTML = '';
  off.appendChild(R.domElement);

  sc = new THREE.Scene();
  sc.background = new THREE.Color(0xcfe0ee);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x8a94a6, 0.95));

  var sun = new THREE.DirectionalLight(0xffffff, 0.65);
  sun.position.set(6, 12, 8);
  sun.castShadow = true;
  var c = sun.shadow.camera;
  c.left = -8; c.right = 8; c.top = 8; c.bottom = -8;
  sc.add(sun);

  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
  tgt = new THREE.Vector3(0.8, 1, -0.3);

  TM.fl = B(9, 0.2, 8, 0xe9edf3, 0, -0.1, 0);
  TM.w1 = B(9, 3, 0.2, 0xf8f9fc, 0, 1.5, -4);
  TM.w2 = B(0.2, 3, 8, 0xf8f9fc, -4.5, 1.5, 0);
  TM.rg = B(4, 0.03, 3.4, 0x8f6be0, 0, 0.02, 0.6);

  DG = {};
  [
    ['plant', function (g) {
      B(0.5, 0.4, 0.5, 0xb7694f, 3.95, 0.2, 0.9, g);
      B(0.7, 0.8, 0.7, 0x4fa86b, 3.95, 0.8, 0.9, g);
      B(0.4, 0.5, 0.4, 0x3b8f58, 3.95, 1.35, 0.9, g);
    }],
    ['poster', function (g) {
      B(1.5, 1.05, 0.06, 0xffffff, -1.3, 1.85, -3.85, g);
      B(1.3, 0.85, 0.04, 0xe5566b, -1.3, 1.85, -3.81, g);
      B(0.5, 0.5, 0.03, 0xf6c453, -1.5, 1.9, -3.78, g);
    }],
    ['kopi', function (g) {
      B(0.9, 0.8, 0.6, 0xd9b98a, 3.95, 0.4, -0.9, g);
      B(0.5, 0.5, 0.4, 0x2c3340, 3.95, 1.05, -0.9, g);
      B(0.15, 0.2, 0.15, 0xffffff, 3.7, 0.9, -0.65, g);
    }],
    ['lampu', function (g) {
      B(0.12, 1.7, 0.12, 0x6b5a45, -3.95, 0.85, -2.4, g);
      B(0.55, 0.4, 0.55, 0xf6e3a1, -3.95, 1.85, -2.4, g);
    }]
  ].forEach(function (f) {
    var g = new THREE.Group();
    g.visible = false;
    sc.add(g);
    DG[f[0]] = g;
    f[1](g);
  });

  DK = [];
  SL.forEach(function (s, i) {
    var g = new THREE.Group();
    g.position.set(s[0], i > 5 ? FY : 0, s[1]);
    g.scale.x = 0.85;
    g.visible = i < 1;
    sc.add(g);
    DK.push(g);

    B(2.4, 0.12, 1.2, 0xd9b98a, 0, 0.96, 1.1, g);
    [[-1.1, 0.6], [1.1, 0.6], [-1.1, 1.6], [1.1, 1.6]].forEach(function (o) {
      B(0.1, 0.9, 0.1, 0x6b5a45, o[0], 0.45, o[1], g);
    });
    B(1, 0.65, 0.06, 0x1c2430, 0, 1.5, 1.5, g);
    g.screen = B(0.9, 0.55, 0.02, 0x1a2634, 0, 1.5, 1.46, g);
    B(0.8, 0.1, 0.8, 0x2c3340, 0, 0.45, -0.05, g);
    B(0.8, 0.8, 0.1, 0x2c3340, 0, 0.9, -0.4, g);
  });

  B(2.2, 0.5, 1, 0x20b2a6, 3, 0.25, -2.4);
  B(2.2, 0.8, 0.3, 0x178f85, 3, 0.8, -2.9);
  B(0.3, 0.4, 0.3, 0xb7694f, -3.8, 0.2, -3.4);
  B(0.8, 0.8, 0.8, 0x4fa86b, -3.8, 0.8, -3.4);

  G2 = new THREE.Group();
  G2.visible = false;
  sc.add(G2);
  B(9, 0.2, 3.4, 0xe9edf3, 0, FY - 0.1, -2.3, G2);

  for (var q = 0; q < 10; q++) {
    var hq = (FY / 10) * (q + 1);
    B(0.8, hq, 0.25, 0xcfd6e2, -4.1, hq / 2, 1.9 - 0.25 * (q + 0.5), G2);
  }

  FG = {};
  [
    ['sofa', function (g) {
      B(1.8, 0.5, 0.9, 0x20b2a6, 3.4, FY + 0.25, -3.4, g);
      B(1.8, 0.8, 0.25, 0x178f85, 3.4, FY + 0.6, -3.85, g);
    }],
    ['pantry', function (g) {
      B(1.8, 0.9, 0.6, 0xd9b98a, 3.4, FY + 0.45, -2.5, g);
      B(0.3, 0.3, 0.3, 0x2c3340, 3, FY + 1.05, -2.5, g);
    }],
    ['main', function (g) {
      B(1.4, 0.15, 0.9, 0x4fa86b, 3.4, FY + 0.75, -1.6, g);
      B(0.1, 0.7, 0.1, 0x6b5a45, 2.8, FY + 0.35, -1.6, g);
      B(0.1, 0.7, 0.1, 0x6b5a45, 4, FY + 0.35, -1.6, g);
    }]
  ].forEach(function (f) {
    var g = new THREE.Group();
    g.visible = false;
    G2.add(g);
    FG[f[0]] = g;
    f[1](g);
  });

  setupEvents(off);
  rs();
  last = performance.now();
  requestAnimationFrame(frame);
  return true;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function makeBubbleSprite() {
  var cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 64;
  var tx = new THREE.CanvasTexture(cv);
  var mat = new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false });
  var sp = new THREE.Sprite(mat);
  sp.scale.set(1.3, 0.65, 1);
  sp.position.set(0, 2.7, 0);
  return { sp: sp, cv: cv, ctx: cv.getContext('2d'), tx: tx, lastTxt: '', lastBg: '' };
}

function drawBubble(bb, text, bg, fg) {
  if (bb.lastTxt === text && bb.lastBg === bg) return;
  bb.lastTxt = text;
  bb.lastBg = bg;
  var ctx = bb.ctx;
  ctx.clearRect(0, 0, 128, 64);
  if (!text) {
    bb.tx.needsUpdate = true;
    return;
  }
  ctx.fillStyle = bg || 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  roundRectPath(ctx, 8, 8, 112, 48, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = fg || '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);
  bb.tx.needsUpdate = true;
}

export function mkW(sh, hr) {
  var wk = new THREE.Group(), sk = 0xf1c27d, pn = 0x3b4a6b, o = { g: wk, k: 1 };
  var hg = new THREE.Group();
  hg.position.set(0, 1.93, 0);
  wk.add(hg);
  o.hd = hg;
  B(0.5, 0.5, 0.5, sk, 0, 0, 0, hg);
  B(0.54, 0.14, 0.54, hr || 0x2b2118, 0, 0.27, -0.02, hg);
  B(0.07, 0.09, 0.02, 0x111111, -0.11, 0.04, 0.255, hg);
  B(0.07, 0.09, 0.02, 0x111111, 0.11, 0.04, 0.255, hg);
  B(0.84, 0.84, 0.42, sh, 0, 1.26, 0, wk);

  function limb(x, y, c, h) {
    var g = new THREE.Group();
    g.position.set(x, y, 0);
    B(0.42, 0.84, 0.42, c, 0, -0.42, 0, g);
    if (h) B(0.43, 0.2, 0.43, sk, 0, -0.74, 0, g);
    wk.add(g);
    return g;
  }

  o.aL = limb(-0.63, 1.68, sh, 1);
  o.aR = limb(0.63, 1.68, sh, 1);
  o.lL = limb(-0.21, 0.84, pn);
  o.lR = limb(0.21, 0.84, pn);
  o.cup = B(0.15, 0.2, 0.15, 0xffffff, 0, -0.85, 0.14, o.aR);
  o.cup.visible = false;
  o.ph = B(0.16, 0.26, 0.04, 0x111111, 0, -0.85, 0.16, o.aL);
  o.ph.visible = false;
  o.bb = makeBubbleSprite();
  wk.add(o.bb.sp);
  wk.position.set(0, -0.34, 0);
  sc.add(wk);
  return o;
}

export function removeWorkerMesh(e) {
  var o = WK[e.id];
  if (o && sc) {
    sc.remove(o.g);
    delete WK[e.id];
  }
}

export function ath() {
  var t = th();
  TM.fl.material.color.setHex(t.fl);
  TM.w1.material.color.setHex(t.wl);
  TM.w2.material.color.setHex(t.wl);
  TM.rg.material.color.setHex(t.rg);
  sc.background.setHex(t.sky);
}

export function updateThemeColors() {
  ath();
}

export function rs() {
  if (!containerElem) return;
  var b = containerElem.getBoundingClientRect();
  W = Math.max(1, b.width);
  H = Math.max(1, b.height);
  if (R) R.setSize(W, H, false);
}

export function cu() {
  var a = W / H, d = 60, el = elv;
  hh = Math.max(5, 5.6 / a) / zm;
  cam.position.set(tgt.x + Math.sin(az) * Math.cos(el) * d, tgt.y + Math.sin(el) * d, tgt.z + Math.cos(az) * Math.cos(el) * d);
  cam.lookAt(tgt);
  cam.top = hh;
  cam.bottom = -hh;
  cam.left = -hh * a;
  cam.right = hh * a;
  cam.updateProjectionMatrix();
}

export const IA = [
  { d: 5, f: function (p) { return { ra: -1.85, hx: -0.12 - 0.2 * Math.max(0, Math.sin(p * 20)), cup: 1 }; } },
  { d: 4, f: function (p) { return { la: -3, ra: -3, hx: -0.35 }; } },
  { d: 5, f: function (p) { return { hy: Math.sin(p * Math.PI * 3) * 0.9 }; } },
  { d: 4, f: function (p) { return { ra: -2.7 + Math.sin(p * 40) * 0.12, hx: 0.1, hy: 0.2 }; } },
  { d: 3.5, f: function (p) { return { ra: -1.85, hx: -0.4 }; } },
  { d: 4, f: function (p) { return { ra: -2.9, rz: Math.sin(p * 60) * 0.5, hy: 0.3 }; } },
  { d: 5, f: function (p) { return { rl: Math.sin(p * 70) * 0.18, hx: Math.sin(p * 35) * 0.08 }; } },
  { d: 6, f: function (p) { return { la: -1.5, hx: 0.45, ph: 1 }; } },
  { d: 3, f: function (p) { return { hx: Math.sin(p * Math.PI * 6) * 0.25 }; } },
  { d: 5, f: function (p) { return { ra: -2, hx: 0.2, hy: -0.2 }; } }
];

export function idl(o, k) {
  var n = rt, ia = o.ia, la = Math.sin(n * 1.5 + k) * 0.04, ra = -la, hx = 0, hy = 0, rz = 0, rl = 0, cp = 0, ph = 0;
  if (!ia || n >= ia.t0 + ia.d) {
    if (ia && ia.a) ia = o.ia = { a: null, t0: n, d: 2 + Math.random() * 5 };
    else {
      var a = IA[Math.floor(Math.random() * IA.length)];
      ia = o.ia = { a: a, t0: n, d: a.d };
    }
  }
  if (ia.a) {
    var p = (n - ia.t0) / ia.d, e = Math.min(1, p * 5, (1 - p) * 5);
    e = e * e * (3 - 2 * e);
    var q = ia.a.f(p), m = function (b, t) { return t === undefined ? b : b + (t - b) * e; };
    la = m(la, q.la); ra = m(ra, q.ra); hx = (q.hx || 0) * e; hy = (q.hy || 0) * e; rz = (q.rz || 0) * e; rl = (q.rl || 0) * e; cp = q.cup && e > 0.3; ph = q.ph && e > 0.3;
  }
  o.aR.rotation.z = rz; o.lR.rotation.x = -1.57 + rl; o.hd.rotation.x = hx; o.hd.rotation.y = hy; o.cup.visible = !!cp; o.ph.visible = !!ph;
  return [la, ra];
}

export function frame(n) {
  animFrameId = requestAnimationFrame(frame);
  if (!R) return;
  var dt = Math.min(0.05, (n - last) / 1e3);
  last = n;
  rt += dt;

  DK.forEach(function (g, i) {
    g.visible = !S || i < S.rooms;
    if (g.screen) {
      var workerHere = S && S.emp.find(function (x) { return (x.slot || 0) === i && x.job && !x.rest; });
      if (workerHere && workerHere.job) {
        var screenColors = {
          Konten: 0x38bdf8,
          Desain: 0xa855f7,
          Video: 0xf43f5e,
          Sosmed: 0xf59e0b,
          Data: 0x10b981
        };
        g.screen.material.color.setHex(screenColors[workerHere.job.b] || 0x7ec8ff);
      } else {
        g.screen.material.color.setHex(0x1a2634);
      }
    }
  });
  if (S) {
    var tk = S.th || 'agensi';
    if (tk !== lth) { lth = tk; ath(); }
    Object.keys(DG).forEach(function (k) { DG[k].visible = !!(S.dc && S.dc[k]); });
  }
  if (S && G2) {
    G2.visible = !!S.f2;
    Object.keys(FG).forEach(function (k) { FG[k].visible = !!S.f2 && !!(S.fa && S.fa[k]); });
  }

  if (S) {
    S.emp.forEach(function (e, k) {
      var s = SL[e.slot || 0], o = WK[e.id];
      if (!o) {
        o = WK[e.id] = mkW(e.col, e.hr);
        o.fl = e.slot > 5 ? 1 : 0;
        o.off = -0.34;
        o.g.position.set(s[0], (o.fl ? FY : 0) - 0.34, s[1]);
      }
      o.k = 1;
      var wk = o.g, rest = e.rest, work = e.job,
        tf = rest ? (S.f2 ? 1 : 0) : (e.slot > 5 ? 1 : 0),
        tx = rest ? (S.f2 ? -2.9 + k * 0.7 : 2.3 + (k % 3) * 0.7) : s[0],
        tz = rest ? (S.f2 ? -0.9 : -2) : s[1];
      if ((o.fl | 0) !== tf) {
        var gu = tf > o.fl;
        if (!o.ss) {
          tx = -4.1; tz = gu ? 2.2 : -0.9;
          if (Math.hypot(tx - wk.position.x, tz - wk.position.z) < 0.12) o.ss = 1;
        } else {
          tx = -4.1; tz = gu ? -0.9 : 2.2;
          if (Math.hypot(tx - wk.position.x, tz - wk.position.z) < 0.12) { o.ss = 0; o.fl = tf; }
        }
      }
      var dx = tx - wk.position.x, dz = tz - wk.position.z, dd = Math.hypot(dx, dz), mv = dd > 0.06;
      if (mv) {
        var sp = Math.min(dd, 4 * dt);
        wk.position.x += dx / dd * sp;
        wk.position.z += dz / dd * sp;
        wk.rotation.y = Math.atan2(dx, dz);
      } else wk.rotation.y *= 0.9;
      o.off += ((mv ? 0 : -0.34) - o.off) * Math.min(1, dt * 8);
      wk.position.y = (o.ss ? cl(FY * (2 - wk.position.z) / 2.6, 0, FY) : (o.fl ? FY : 0)) + o.off;
      var w = Math.sin(rt * 10 + k), la = 0, ra = 0, tl = -1.57;
      o.aR.rotation.z = 0; o.hd.rotation.x = o.hd.rotation.y = 0; o.cup.visible = o.ph.visible = false;
      if (mv) {
        la = w * 0.7; ra = -w * 0.7; tl = -w * 0.7; o.lR.rotation.x = w * 0.7;
      } else {
        o.lR.rotation.x = -1.57;
        if (work) {
          la = -1.1 + Math.sin(rt * 14 + k) * 0.07; ra = -1.1 + Math.sin(rt * 14 + 2 + k) * 0.07;
        } else if (rest) {
          la = -0.5; ra = -0.9 + Math.sin(rt * 2 + k) * 0.3;
        } else {
          var iv = idl(o, k);
          la = iv[0]; ra = iv[1];
        }
      }
      o.lL.rotation.x = tl; o.aL.rotation.x = la; o.aR.rotation.x = ra;

      // update dynamic status bubble
      var bTxt = '', bBg = '';
      if (work) {
        var emjs = { Konten: '✍️', Desain: '🎨', Video: '🎬', Sosmed: '📱', Data: '📊' };
        bTxt = (emjs[work.b] || '💻') + (e.ot ? ' 🔥' : '');
        bBg = 'rgba(37, 99, 235, 0.9)';
      } else if (rest) {
        bTxt = '☕ Zzz';
        bBg = 'rgba(16, 185, 129, 0.9)';
      } else if (e.en < 25) {
        bTxt = '⚡ Lelah';
        bBg = 'rgba(220, 38, 38, 0.9)';
      } else if (e.id === S.sel) {
        bTxt = '⭐';
        bBg = 'rgba(217, 119, 6, 0.85)';
      }
      drawBubble(o.bb, bTxt, bBg);
      o.bb.sp.position.y = 2.7 + Math.sin(rt * 3 + k) * 0.06;
    });

    Object.keys(WK).forEach(function (id) {
      if (!WK[id].k) {
        sc.remove(WK[id].g);
        delete WK[id];
      } else WK[id].k = 0;
    });
  }
  cu();
  R.render(sc, cam);
}

export function pan(dx, dy) {
  var u = 2 * hh / H, sa = Math.sin(az), ca = Math.cos(az), sn = Math.max(0.3, Math.sin(elv));
  tgt.x = cl(tgt.x - ca * dx * u - sa * dy * u / sn, -9, 9);
  tgt.z = cl(tgt.z + sa * dx * u - ca * dy * u / sn, -9, 9);
}

export function vw(k) {
  var V = {
    iso: [0.785, 0.62, 1, 0.8, 1, -0.3],
    atas: [az, 1.5, 1.1, 0.8, 1, -0.6],
    depan: [0, 0.18, 1, 0.8, 1, -0.3],
    samping: [1.571, 0.18, 1, 0.8, 1, -0.3],
    lt2: [0.785, 0.62, 1.5, 0, 2.8, -2.3]
  }[k];
  if (!V) return;
  az = V[0];
  elv = V[1];
  zm = V[2];
  tgt.set(V[3], V[4], V[5]);
}

let cleanupFn = null;

function setupEvents(off) {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(rs);
    resizeObserver.observe(off);
  }
  window.addEventListener('resize', rs);

  var pt = {}, pd = 0, pcx = 0, pcy = 0, dom = R.domElement;

  function pin() {
    var k = Object.keys(pt);
    if (k.length < 2) return null;
    var a = pt[k[0]], b = pt[k[1]];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function onPointerDown(e) {
    pt[e.pointerId] = { x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey };
    try { dom.setPointerCapture(e.pointerId); } catch (z) {}
    var i = pin();
    if (i) { pd = i.d; pcx = i.x; pcy = i.y; }
  }

  function onPointerMove(e) {
    var p = pt[e.pointerId];
    if (!p) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    var i = pin();
    if (i) {
      zm = cl(zm * i.d / pd, 0.4, 4);
      pd = i.d;
      pan(i.x - pcx, i.y - pcy);
      pcx = i.x; pcy = i.y;
    } else if (p.b === 1 || p.b === 2 || p.sh) {
      pan(dx, dy);
    } else {
      az -= dx * 0.008;
      elv = cl(elv + dy * 0.006, 0.12, 1.5);
    }
  }

  function onPointerUp(e) {
    delete pt[e.pointerId];
    var i = pin();
    if (i) { pd = i.d; pcx = i.x; pcy = i.y; }
  }

  function onWheel(e) {
    e.preventDefault();
    zm = cl(zm * (e.deltaY < 0 ? 1.1 : 1 / 1.1), 0.4, 4);
  }

  function onContextMenu(e) {
    e.preventDefault();
  }

  function onDblClick() {
    vw('iso');
  }

  dom.addEventListener('pointerdown', onPointerDown);
  dom.addEventListener('pointermove', onPointerMove);
  dom.addEventListener('pointerup', onPointerUp);
  dom.addEventListener('pointercancel', onPointerUp);
  dom.addEventListener('wheel', onWheel, { passive: false });
  dom.addEventListener('contextmenu', onContextMenu);
  dom.addEventListener('dblclick', onDblClick);

  cleanupFn = () => {
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener('resize', rs);
    dom.removeEventListener('pointerdown', onPointerDown);
    dom.removeEventListener('pointermove', onPointerMove);
    dom.removeEventListener('pointerup', onPointerUp);
    dom.removeEventListener('pointercancel', onPointerUp);
    dom.removeEventListener('wheel', onWheel);
    dom.removeEventListener('contextmenu', onContextMenu);
    dom.removeEventListener('dblclick', onDblClick);
  };
}

export function toggleShadow(btn) {
  if (!R) return;
  R.shadowMap.enabled = !R.shadowMap.enabled;
  sc.traverse(function (o) {
    if (o.material) o.material.needsUpdate = true;
  });
  if (btn) btn.textContent = 'Bayangan 3D: ' + (R.shadowMap.enabled ? 'nyala' : 'mati');
}

export function isShadowEnabled() {
  return R ? R.shadowMap.enabled : true;
}

export function destroyScene() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (cleanupFn) cleanupFn();
  R = null;
  sc = null;
  cam = null;
  DK = [];
  WK = {};
  TM = {};
  DG = {};
  FG = {};
  G2 = null;
}
