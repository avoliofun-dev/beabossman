// src/game/engine.js
import {
  S, setS, save, load, fresh, KEY, HR, rate, rms, ec, du, lv, md, gs,
  cands, mk, mkE, jb, pyd, dmk, pk, cl, rp, x2, av, th, TR, EV, PC,
  evN, evAt, evk, setEvk, trainCost
} from './state.js';
import { updateThemeColors, removeWorkerMesh } from './scene3d.js';
import { audio } from './audio.js';


let uiListeners = [];
export function subscribeUI(fn) {
  uiListeners.push(fn);
  return () => {
    uiListeners = uiListeners.filter(l => l !== fn);
  };
}

export function notifyUI() {
  uiListeners.forEach(fn => fn());
}

let toastListeners = [];
export function subscribeToast(fn) {
  toastListeners.push(fn);
  return () => {
    toastListeners = toastListeners.filter(l => l !== fn);
  };
}

let popListeners = [];
export function subscribePop(fn) {
  popListeners.push(fn);
  return () => {
    popListeners = popListeners.filter(l => l !== fn);
  };
}

export function pop(t) {
  popListeners.forEach(fn => fn(t));
}

export function toast(m) {
  toastListeners.forEach(fn => fn(m));
}

export function log(m) {
  if (!S) return;
  S.log.unshift(m);
  if (S.log.length > 12) S.log.pop();
  toast(m);
}

export function bgp(e, j, q) {
  var n = Date.now(), g = S.bg, p = g.parts[j.bp];
  if (p) { p.st = 2; p.q = q; }
  e.xp[j.b] = (e.xp[j.b] | 0) + 1;
  if (j.ot) e.oc = (e.oc | 0) + 1;
  log(e.nm + ' menyelesaikan bagian ' + j.b + ' dari “' + g.n + '” (kualitas ' + Math.round(q * 100) + '%).');
  if (g.parts.every(function (x) { return x.st === 2; })) {
    var aq = g.parts.reduce(function (a, x) { return a + x.q; }, 0) / g.parts.length,
      pay = Math.round(g.pay * aq * (n > g.dl ? 0.8 : 1) / 1e3) * 1e3,
      d = pyd(pay),
      dm = dmk();
    S.done++;
    dm.done++;
    dm.earn += pay;
    if (aq >= 1) dm.good++;
    if (aq >= 0.8) S.rep += g.parts.reduce(function (a, x) { return a + x.d; }, 0);
    S.bgn = (S.bgn | 0) + 1;
    log('🏗️ Proyek besar “' + g.n + '” selesai, kualitas ' + Math.round(aq * 100) + '%, +' + rp(pay) + (n > g.dl ? ' (telat −20%)' : '') + (d ? ' (bayar tunggakan ' + rp(d) + ')' : ''));
    pop('+' + rp(pay));
    audio.playLevelUp();
    S.bg = null;
    S.bgAt = n + 15e4;
  }
}

export function fin(e, j) {
  var n = Date.now(),
    q = cl(0.75 + (lv(e, j.b) - j.d) * 0.12 + Math.random() * 0.25 + (md(e) - 60) / 500 + (TR[e.tp] ? TR[e.tp].q : 0) - (j.ot ? 0.05 + Math.random() * 0.15 : 0), 0.5, 1.3);
  if (j.bg && S.bg) {
    bgp(e, j, q);
    return;
  }
  var pay = Math.round(j.pay * q / 1e3) * 1e3,
    late = j.dl && n > j.dl,
    d = 0;
  if (late) pay = Math.round(pay * 0.8 / 1e3) * 1e3;
  if (S.debt > 0) {
    d = Math.min(S.debt, Math.round(pay / 2));
    S.debt -= d;
  }
  S.cash += pay - d;
  S.done++;
  var dm = dmk();
  dm.done++;
  dm.earn += pay;
  if (q >= 1) dm.good++;
  if (j.ot) e.oc = (e.oc | 0) + 1;
  var oldL = lv(e, j.b);
  e.xp[j.b] = (e.xp[j.b] | 0) + 1;
  var newL = lv(e, j.b);
  if (q >= 0.8) S.rep += j.d;
  log(e.nm + ': “' + j.n + '” selesai, kualitas ' + Math.round(q * 100) + '% (' + (q >= 1.05 ? 'memuaskan' : q >= 0.8 ? 'baik' : 'kurang') + '), +' + rp(pay) + (d ? ' (bayar tunggakan ' + rp(d) + ')' : ''));
  if (late) log('⏰ Melewati tenggat: bayaran dipotong 20%.');
  if (j.rt && S.rt) {
    S.rt.on = 0;
    if (q >= 0.9) {
      S.rt.mult = Math.min(1.6, S.rt.mult + 0.05);
      S.rt.at = n + 18e4;
      log('🤝 ' + S.rt.nm + ' puas. Kontrak berikutnya akan lebih besar.');
    } else {
      S.rep = Math.max(0, S.rep - 2);
      log('😕 ' + S.rt.nm + ' kecewa dan berhenti jadi klien tetap. Reputasi −2.');
      S.rt = null;
    }
  } else if (!j.rt && !S.rt && q >= 1.05 && S.rep >= 10 && Math.random() < 0.3) {
    S.rt = { nm: pk(th().cl), b: j.b, d: j.d, mult: 1.25, at: n + 6e4, on: 0 };
    S.rtq = 1;
    log('🤝 ' + S.rt.nm + ' ingin jadi klien tetap! Kontrak khusus segera muncul.');
  }
  if (e.tr > 0 && --e.tr === 0) log('Masa percobaan ' + e.nm + ' selesai: ' + e.b + ' Lv' + lv(e, e.b) + '.');
  pop('+' + rp(pay));
  if (newL > oldL) {
    log('🎉 ' + e.nm + ' naik ke Lv' + newL + ' di bidang ' + j.b + '!');
    setTimeout(() => pop('🎉 Lv Up! ' + e.nm + ' ' + j.b + ' Lv' + newL), 300);
    audio.playLevelUp();
  } else {
    audio.playCoin();
  }
}

let evCount = 0;
let nextEvAt = Date.now() + 6e4 + Math.random() * 3e4;

export function evs(isIntroVisible) {
  var n = Date.now();
  if (S.ev || evCount >= 2 || n < nextEvAt || S.done < 2 || (typeof S.tut === 'number' && S.tut < 4) || isIntroVisible) return;
  var hs = S.emp.filter(function (x) { return x.sal; }),
    lo = hs.filter(function (x) { return md(x) < 50; }),
    pl = S.emp.filter(function (x) { return !x.rest; }),
    ks = ['rev', 'bonus', 'sakit', 'tech'];
  if (hs.length) ks.push('komp');
  if (lo.length) ks.push('komp', 'komp', 'komp');
  var t = pk(ks),
    e = t === 'komp' ? pk(lo.length ? lo : hs) : pk(pl.length ? pl : S.emp);
  S.ev = { t: t, id: e.id, x: t === 'bonus' ? Math.round((8e4 + S.rep * 2e3) / 1e4) * 1e4 : 0 };
  evCount++;
  nextEvAt = n + (120 + Math.random() * 60) * 1e3;
  save();
  log('Ada kejadian baru di studio!');
  audio.playAlert();
}

export function tick(isIntroVisible = false) {
  if (!S) return;
  var n = Date.now(), ch = 0;
  S.emp.forEach(function (e) {
    if (e.job && n >= e.job.end) {
      var j = e.job;
      e.job = null;
      fin(e, j);
      ch = 1;
    }
    if (e.rest && n >= e.rest.end) {
      e.en = 100;
      e.rest = null;
      e.oc = 0;
      log(e.nm + ' sudah segar kembali.');
      ch = 1;
    }
    if (e.aq == null) {
      e.aq = 5;
      e.at = n;
      e.auto = 0;
    }
    if (e.aq >= 5) e.at = n;
    else if (n - e.at >= 36e4) {
      var k = Math.min(5 - e.aq, Math.floor((n - e.at) / 36e4));
      e.aq += k;
      e.at += k * 36e4;
      ch = 1;
    }
    if (e.auto && e.sal && !e.job && !e.rest) {
      var bi = -1, bv = -1e9;
      S.ct.forEach(function (c, i) {
        if (e.en < ec(e, c)) return;
        var g = lv(e, c.b) - c.d,
          v = e.tr > 0 ? -c.d : c.pay * cl(0.75 + g * 0.12, 0.5, 1.3) / c.dur;
        if (e.tr <= 0 && g < -1) return;
        if (v > bv) { bv = v; bi = i; }
      });
      if (bi >= 0 && e.aq > 0) {
        var c = S.ct[bi];
        e.en -= ec(e, c);
        e.job = jb(e, c, n);
        S.ct[bi] = mk();
        e.aq--;
        ch = 1;
      } else if (e.en < 70) {
        e.rest = { start: n, end: n + (100 - e.en) * rms(), from: e.en };
        ch = 1;
      }
    }
  });

  S.ct.forEach(function (c, i) {
    if ((c.x && n > c.x) || (c.dl && n > c.dl)) {
      S.ct[i] = mk();
      ch = 1;
    }
  });

  if (S.rt) {
    if (S.rt.on && !S.ct.some(function (c) { return c.rt; }) && !S.emp.some(function (x) { return x.job && x.job.rt; })) S.rt.on = 0;
    if (!S.rt.on && n >= S.rt.at) {
      var r = S.rt;
      S.ct[S.ct.length - 1] = {
        rt: 1, k: 0, x: 0, dl: 0, b: r.b, n: 'Klien tetap: ' + r.nm,
        d: r.d, dur: 25 + r.d * 8, pay: Math.round((5e4 + r.d * 25e3) * r.mult / 5e3) * 5e3, en: 8 + r.d * 4
      };
      r.on = 1;
      ch = 1;
      log('🤝 Klien tetap ' + r.nm + ' mengirim kontrak.');
    }
  }

  if (S.bg) {
    S.bg.parts.forEach(function (p, i) {
      if (p.st === 1 && !S.emp.some(function (x) { return x.job && x.job.bg && x.job.bp === i; })) p.st = 0;
    });
    if (n > S.bg.dl && !S.bg.parts.some(function (p) { return p.st === 1; })) {
      log('Proyek besar “' + S.bg.n + '” hangus karena lewat tenggat.');
      S.bg = null;
      S.bgAt = n + 12e4;
      ch = 1;
    }
  } else if (S.rep >= 15 && S.emp.length >= 2 && n >= (S.bgAt | 0)) {
    var f = av().slice(),
      b1 = f.splice(Math.floor(Math.random() * f.length), 1)[0],
      b2 = pk(f),
      dd = cl(1 + Math.floor(S.rep / 20), 2, 5),
      ps = [b1, b2].map(function (b) { return { b: b, d: dd, dur: 20 + dd * 9, en: 8 + dd * 4, st: 0, q: 0 }; });
    S.bg = {
      n: pk(th().cl) + ' · ' + pk(['Kampanye peluncuran', 'Paket rebranding', 'Konten musiman', 'Relaunch toko']),
      pay: Math.round(2 * (5e4 + dd * 25e3) * 1.6 / 5e3) * 5e3,
      dl: n + 9e5,
      parts: ps
    };
    ch = 1;
    log('🏗️ Proyek besar baru tersedia di papan kontrak.');
  }

  S.pc = S.pc || {};
  PC.forEach(function (x) {
    if (!S.pc[x[0]] && x[2](S)) {
      S.pc[x[0]] = 1;
      S.cash += 1e5;
      log('🏆 Pencapaian: ' + x[1] + ' · +Rp 100.000');
      pop('🏆 ' + x[1] + ' (+Rp 100.000)');
      audio.playLevelUp();
      ch = 1;
    }
  });

  var el = Math.min(n - S.pt, 8 * HR);
  S.pt = n;
  S.ac += rate() * el / HR;
  if (S.ac >= 500) {
    var a = Math.floor(S.ac / 500) * 500;
    S.ac -= a;
    S.cash -= a;
    if (S.cash < 0) {
      S.debt = Math.min(S.debt - S.cash, rate() * 8);
      S.cash = 0;
    }
    ch = 1;
  }

  evs(isIntroVisible);
  if (ch) {
    save();
  }
  notifyUI();
}

export function initGame() {
  var s = load();
  if (s) {
    setS(s);
    var d = S.done, c = S.cash;
    tick();
    if (S.done > d) {
      log('Selama kamu pergi: ' + (S.done - d) + ' kontrak selesai, ' + (S.cash >= c ? '+' : '−') + rp(Math.abs(S.cash - c)));
    }
    notifyUI();
    return true; // ada save data
  }
  return false; // butuh intro
}

export function startGame(name) {
  fresh(name.trim() || 'Studio Baru');
  save();
  audio.playLevelUp();
  notifyUI();
}

export function trainWorker(workerId, field) {
  if (!S) return false;
  const e = S.emp.find(x => x.id === workerId);
  if (!e || e.job || e.rest) return false;
  const cost = trainCost(e, field);
  if (S.cash < cost) return false;

  S.cash -= cost;
  const oldLevel = lv(e, field);
  e.xp[field] = (e.xp[field] | 0) + 3;
  e.en = Math.max(10, e.en - 15);
  const newLevel = lv(e, field);

  log(`📚 ${e.nm} menyelesaikan kursus pelatihan ${field} (+3 XP).`);
  pop(`📚 +3 XP ${field}`);
  if (newLevel > oldLevel) {
    log(`🎉 ${e.nm} naik ke Lv${newLevel} di bidang ${field}!`);
    setTimeout(() => pop(`🎉 Lv Up! ${e.nm} Lv${newLevel}`), 300);
    audio.playLevelUp();
  } else {
    audio.playCoin();
  }
  save();
  notifyUI();
  return true;
}

export function payDebt(amount) {
  if (!S || S.debt <= 0) return 0;
  const p = Math.min(S.debt, Math.min(S.cash, amount));
  if (p > 0) {
    S.debt -= p;
    S.cash -= p;
    log('Membayar cicilan tunggakan ' + rp(p) + '. Sisa tunggakan: ' + rp(S.debt));
    audio.playCoin();
    save();
    notifyUI();
  }
  return p;
}

export function exportSaveData() {
  return localStorage.getItem(KEY) || JSON.stringify(S);
}

export function importSaveData(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.co && Array.isArray(parsed.emp)) {
      setS(parsed);
      save();
      notifyUI();
      log('Progres studio berhasil dipulihkan!');
      audio.playLevelUp();
      return true;
    }
  } catch (e) {}
  return false;
}

