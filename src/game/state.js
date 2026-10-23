// src/game/state.js
// Logika game, konstanta, dan state S
import { triggerAutoCloudSave } from '../lib/supabase.js';

export const KEY = 'ktycoon_mvp2';
export const BID = ['Konten', 'Desain', 'Video', 'Sosmed', 'Data'];
export const HR = 36e5;
export const ROOM = [4e5, 8e5, 15e5, 2e6, 25e5, 3e6, 35e5];
export const FA = [
  ['sofa', 'Sofa lounge', 5e5],
  ['pantry', 'Pantry', 8e5],
  ['main', 'Ruang main', 12e5]
];

export function rp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function cl(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

export function pk(a) {
  return a[Math.floor(Math.random() * a.length)];
}

export const NM = {
  Konten: ['Caption produk baru', 'Artikel blog tips', 'Naskah video 30 detik', 'Newsletter mingguan'],
  Desain: ['Banner promo', 'Poster diskon', 'Feed Instagram', 'Logo kecil'],
  Video: ['Edit video unboxing', 'Subtitle webinar', 'Reels 9:16', 'Highlight podcast'],
  Sosmed: ['Jadwal posting mingguan', 'Balas komentar pelanggan', 'Kampanye hashtag', 'Laporan engagement'],
  Data: ['Rekap penjualan', 'Bersihkan data pelanggan', 'Dashboard sederhana', 'Analisis survei']
};

export const TR = {
  teliti: { n: 'Teliti', du: 1.15, q: 0.08, en: 1, d: 'kualitas naik, lebih lambat' },
  cepat: { n: 'Cepat tapi ceroboh', du: 0.85, q: -0.06, en: 1, d: 'lebih cepat, kualitas turun' },
  tangguh: { n: 'Tangguh', du: 1, q: 0, en: 0.8, d: 'hemat energi 20%' },
  ramah: { n: 'Ramah', du: 1, q: 0.03, en: 1, mo: 6, d: 'mood +6, kualitas sedikit naik' }
};

export const CL = ['Toko Kopi Senja', 'Butik Nusa', 'Klinik Sehat', 'Kedai Rasa', 'Studio Foto Lintang'];

export function av() {
  return BID.slice(0, S && S.rep >= 25 ? 5 : 3);
}

export const TH = {
  agensi: {
    n: 'Agensi Kreatif',
    d: 'Studio kreatif yang ceria (tema awal)',
    sky: 0xcfe0ee,
    fl: 0xe9edf3,
    wl: 0xf8f9fc,
    rg: 0x8f6be0,
    nm: NM,
    cl: CL
  },
  startup: {
    n: 'Startup Web Developer',
    d: 'Kantor tim produk digital: dokumentasi, UI, dan demo',
    sky: 0xd6e2f7,
    fl: 0xdde4ee,
    wl: 0xeef3fa,
    rg: 0x2c56e8,
    cl: ['Nusa Cloud', 'Kodeku', 'Pixel Labs', 'Warung Digital', 'Bitwise'],
    nm: {
      Konten: ['Dokumentasi API', 'Artikel teknis', 'Copy landing page', 'Changelog rilis'],
      Desain: ['Wireframe aplikasi', 'UI kit komponen', 'Ikon fitur', 'Mockup dashboard'],
      Video: ['Demo produk', 'Tutorial setup', 'Screencast fitur', 'Trailer rilis'],
      Sosmed: ['Thread peluncuran', 'Balas komunitas', 'Kampanye Product Hunt', 'Jadwal postingan dev'],
      Data: ['Laporan bug', 'Analisis retensi', 'Dashboard metrik', 'Rekap uji A/B']
    }
  },
  narayan: {
    n: 'Dunia Narayan',
    d: 'Tema bernuansa cerita; daftar nama masih awal dan bisa kamu isi dengan lore sendiri',
    sky: 0xead7b4,
    fl: 0xe8dcc8,
    wl: 0xf4ebda,
    rg: 0xb5483a,
    cl: ['Penjaga Gerbang Timur', 'Kedai Lentera', 'Perpustakaan Narayan', 'Serikat Pedagang Kain', 'Balai Pengembara'],
    nm: {
      Konten: ['Surat undangan festival', 'Kisah pendek penjaga gerbang', 'Pengumuman pasar malam', 'Catatan perjalanan'],
      Desain: ['Panji perayaan', 'Peta wilayah', 'Segel surat', 'Papan nama kedai'],
      Video: ['Rekaman upacara', 'Cuplikan pasar malam', 'Film pendek lentera', 'Dokumentasi festival'],
      Sosmed: ['Kabar dari balai', 'Jadwal pertunjukan', 'Ajakan kerja bakti', 'Cerita pengembara'],
      Data: ['Catatan dagang', 'Sensus desa', 'Daftar persediaan', 'Rekap kunjungan']
    }
  }
};

export function th() {
  return TH[S && S.th] || TH.agensi;
}

export const DEC = [
  ['plant', 'Tanaman hias', 2e5, 2],
  ['poster', 'Poster dinding', 15e4, 2],
  ['kopi', 'Mesin kopi', 4e5, 3],
  ['lampu', 'Lampu lantai', 3e5, 2]
];

export function dcm() {
  var s = 0;
  DEC.forEach(function (d) {
    if (S && S.dc && S.dc[d[0]]) s += d[3];
  });
  return s;
}

export const SHC = [0x5b7cff, 0xe5566b, 0x20b2a6, 0xe0a030, 0x8f6be0, 0x4fa86b];
export const HRC = [0x2b2118, 0x6b3e1f, 0xc9a45a, 0x111111];

export function hx(c) {
  return '#' + ('000000' + c.toString(16)).slice(-6);
}

export const FN = ['Rina', 'Bima', 'Sari', 'Dimas', 'Laras', 'Arya', 'Wulan', 'Raka', 'Tari', 'Gilang'];
export const LN = ['Pratama', 'Wijaya', 'Santoso', 'Lestari', 'Kusuma', 'Saputra'];
export const COL = [0xe5566b, 0x20b2a6, 0xe0a030, 0x8f6be0, 0x4fa86b, 0x3aa0d8];

export let S = null;
export let armed = false;
export function setArmed(val) { armed = val; }
export let fireId = null;
export function setFireId(val) { fireId = val; }

export let pth = 'agensi';
export function setPth(val) { pth = val; }
export let pcol = 0x5b7cff;
export function setPcol(val) { pcol = val; }
export let phair = 0x2b2118;
export function setPhair(val) { phair = val; }

export function setS(newS) {
  S = newS;
}

export function mkE(nm, b, sk, sd, sal, tr) {
  var x = {};
  BID.forEach(function (k) { x[k] = 0; });
  x[b] = (sk - 1) * 3;
  x[sd] = Math.floor(Math.random() * 3);
  return {
    id: Date.now() + Math.floor(Math.random() * 999),
    nm: nm,
    b: b,
    xp: x,
    en: 100,
    job: null,
    rest: null,
    sal: sal,
    tr: tr,
    col: pk(COL),
    hr: pk(HRC),
    auto: 0,
    aq: 5,
    at: Date.now()
  };
}

export function mkC() {
  var b = pk(av()), r = Math.random(), sk = r < 0.5 ? 1 : r < 0.85 ? 2 : 3;
  return {
    nm: pk(FN) + ' ' + pk(LN),
    b: b,
    sk: sk,
    sd: pk(av().filter(function (x) { return x !== b; })),
    sal: 12e3 + sk * 6e3,
    tp: pk(Object.keys(TR))
  };
}

export function cands() {
  return [mkC(), mkC(), mkC()];
}

export function fresh(n) {
  var f = mkE('Kamu', 'Konten', 1, 'Desain', 0, 0);
  f.xp = { Konten: 0, Desain: 0, Video: 0 };
  f.slot = 0;
  f.col = pcol;
  f.hr = phair;
  S = {
    th: pth,
    co: n,
    cash: 3e5,
    rep: 0,
    done: 0,
    rooms: 1,
    emp: [f],
    sel: f.id,
    cand: cands(),
    ct: [],
    log: [],
    pt: Date.now(),
    ac: 0,
    debt: 0,
    tut: 0
  };
  while (S.ct.length < 3) S.ct.push(mk());
  return S;
}

export function mig(o) {
  var f = mkE('Kamu', 'Konten', 1, 'Desain', 0, 0);
  f.xp = o.xp;
  f.en = o.en;
  f.job = o.job;
  f.rest = o.rest;
  f.slot = 0;
  f.col = 0x5b7cff;
  return {
    co: o.co,
    cash: o.cash,
    rep: o.rep,
    done: o.done,
    rooms: 1,
    emp: [f],
    sel: f.id,
    cand: cands(),
    ct: o.ct,
    log: o.log,
    pt: Date.now(),
    ac: 0,
    debt: 0
  };
}

export function load() {
  try {
    var r = localStorage.getItem(KEY);
    if (r) return JSON.parse(r);
    r = localStorage.getItem('ktycoon_mvp1');
    return r ? mig(JSON.parse(r)) : null;
  } catch (e) {
    return null;
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
    if (S) triggerAutoCloudSave(S);
  } catch (e) {}
}

export var evN = 0;
export var evAt = Date.now() + 6e4 + Math.random() * 3e4;
export var evk = null;
export function setEvk(val) { evk = val; }

export function x2(x) {
  return Math.round(x * 1.6 / 1e4) * 1e4;
}

export const EV = {
  rev: {
    t: '📝 Klien minta revisi',
    d: function (e) { return 'Klien meminta ' + e.nm + ' merevisi hasil kerjanya.'; },
    c: [
      [function () { return 'Kerjakan · ⚡−15, reputasi +2'; }, function (e) { e.en = Math.max(0, e.en - 15); S.rep += 2; return e.nm + ' mengerjakan revisi. Reputasi +2.'; }],
      [function () { return 'Tolak halus · reputasi −1'; }, function () { S.rep = Math.max(0, S.rep - 1); return 'Revisi ditolak. Reputasi −1.'; }]
    ]
  },
  bonus: {
    t: '⚡ Bonus kilat',
    d: function (e, x) { return 'Klien butuh hasil cepat dari ' + e.nm + ', bayaran ' + rp(x) + '.'; },
    c: [
      [function (e, x) { return 'Ambil · ⚡−20, +' + rp(x); }, function (e, x) { e.en = Math.max(0, e.en - 20); S.cash += x; return 'Bonus kilat diambil, +' + rp(x) + '.'; }],
      [function (e, x) { return 'Ambil + lembur · ⚡−30, +' + rp(x2(x)) + ', mood turun'; }, function (e, x) { e.en = Math.max(0, e.en - 30); e.oc = (e.oc | 0) + 1; S.cash += x2(x); return 'Bonus kilat dengan lembur, +' + rp(x2(x)) + '.'; }],
      [function () { return 'Lewati · tanpa efek'; }, function () { return 'Bonus kilat dilewati.'; }]
    ]
  },
  sakit: {
    t: '🤒 Pekerja sakit',
    d: function (e) { return e.nm + ' mengeluh tidak enak badan.'; },
    c: [
      [function () { return 'Bayar dokter · −Rp 150.000, tanpa efek lain'; }, function (e) { return e.nm + ' pulih berkat dokter.'; }, 15e4],
      [function () { return 'Biarkan istirahat · ⚡ turun jadi maks 25'; }, function (e) { e.en = Math.min(e.en, 25); e.oc = 0; return e.nm + ' kelelahan, energi turun.'; }]
    ]
  },
  tech: {
    t: '🔧 Gangguan teknis',
    d: function () { return 'Jaringan studio terganggu.'; },
    c: [
      [function () { return 'Panggil teknisi · −Rp 200.000'; }, function () { return 'Teknisi memperbaiki jaringan.'; }, 2e5],
      [function () { return 'Tunggu sendiri · kontrak berjalan +20 dtk, semua ⚡−5'; }, function () { S.emp.forEach(function (x) { if (x.job) x.job.end += 2e4; x.en = Math.max(0, x.en - 5); }); return 'Jaringan pulih sendiri, kontrak tertunda 20 dtk.'; }]
    ]
  },
  komp: {
    t: '💼 Tawaran kompetitor',
    d: function (e) { return 'Kompetitor menawar ' + e.nm + ' (mood ' + md(e) + ').' + (md(e) < 50 ? ' Mood rendah membuatnya tergoda.' : ''); },
    c: [
      [function () { return 'Naikkan gaji · +Rp 3.000/jam selamanya'; }, function (e) { e.sal += 3e3; return e.nm + ' bertahan dengan gaji baru.'; }],
      [function () { return 'Bonus tahan · −Rp 300.000 sekali bayar'; }, function (e) { e.oc = 0; return e.nm + ' bertahan berkat bonus.'; }, 3e5],
      [function () { return 'Biarkan pergi · pekerja keluar'; }, function (e) { S.emp = S.emp.filter(function (x) { return x.id !== e.id; }); if (S.sel === e.id) S.sel = S.emp[0].id; return e.nm + ' pindah ke kompetitor.'; }]
    ]
  }
};

export const DM = [
  ['Selesaikan 3 kontrak', 'done', 3, 5e4],
  ['Raih pendapatan Rp 200.000', 'earn', 2e5, 8e4],
  ['1 kontrak berkualitas ≥100%', 'good', 1, 6e4]
];

export const PC = [
  ['dek', 'Semua dekorasi', function (s) { return !!(s.dc && s.dc.plant && s.dc.poster && s.dc.kopi && s.dc.lampu); }],
  ['bg', 'Proyek besar selesai', function (s) { return (s.bgn | 0) >= 1; }],
  ['rt', 'Klien tetap pertama', function (s) { return !!s.rtq; }],
  ['k10', 'Kontrak ke-10', function (s) { return s.done >= 10; }],
  ['k50', '50 kontrak', function (s) { return s.done >= 50; }],
  ['tim', 'Tim 4 orang', function (s) { return s.emp.length >= 4; }],
  ['lt2', 'Lantai 2 dibangun', function (s) { return !!s.f2; }],
  ['fas', 'Semua fasilitas', function (s) { return !!(s.fa && s.fa.sofa && s.fa.pantry && s.fa.main); }],
  ['rep50', 'Reputasi 50', function (s) { return s.rep >= 50; }]
];

export function dmk() {
  var t = new Date(), d = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
  if (!S.dm || S.dm.d !== d) S.dm = { d: d, done: 0, earn: 0, good: 0, cl: [0, 0, 0] };
  return S.dm;
}

export function lv(e, b) {
  return 1 + Math.floor((e.xp[b] | 0) / 3);
}

export function lt(e, b) {
  var l = lv(e, b);
  return e.tr > 0 ? Math.max(1, l - 1) + '–' + (l + 1) : l;
}

export function ec(e, c) {
  return Math.ceil(c.en * (e.ot ? 1.5 : 1) * (TR[e.tp] ? TR[e.tp].en : 1));
}

export function du(e, c) {
  return (e.ot ? c.dur / 1.3 : c.dur) * (TR[e.tp] ? TR[e.tp].du : 1);
}

export function md(e) {
  var n = Date.now(), x = e.en;
  if (e.rest) x = e.rest.from + (100 - e.rest.from) * cl((n - e.rest.start) / (e.rest.end - e.rest.start), 0, 1);
  return Math.round(cl(30 + x * 0.4 + fcn() * 10 - cl(S.debt / Math.max(1, rate()) * 5, 0, 30) - 6 * (e.oc | 0) + (TR[e.tp] ? TR[e.tp].mo | 0 : 0) + dcm(), 0, 100));
}

export function fcn() {
  return S.fa ? (S.fa.sofa | 0) + (S.fa.pantry | 0) + (S.fa.main | 0) : 0;
}

export function rms() {
  return S.f2 ? 400 / (1 + 0.25 * fcn()) : 400;
}

export function gs() {
  return S.emp.filter(function (e) { return e.id === S.sel; })[0] || S.emp[0];
}

export function rate() {
  return S.emp.reduce(function (a, e) { return a + e.sal; }, 0) + 6e3 * S.rooms + (S.f2 ? 1e4 : 0) + 4e3 * fcn();
}

export function mk() {
  var b = pk(av()), mx = cl(1 + Math.floor(S ? S.rep / 15 : 0), 1, 5), d = 1 + Math.floor(Math.random() * mx);
  var kl = Math.random() < 0.18;
  return {
    k: kl ? 1 : 0,
    x: kl ? Date.now() + 9e4 : 0,
    dl: kl ? 0 : Date.now() + (145 + d * 8 + Math.floor(Math.random() * 180)) * 1e3,
    b: b,
    n: (kl ? 'Kilat: ' : '') + pk(th().nm[b]),
    d: d,
    dur: Math.round((15 + d * 8 + Math.floor(Math.random() * 10)) * (kl ? 0.7 : 1)),
    pay: Math.round((5e4 + d * 25e3) * (0.85 + Math.random() * 0.3) * (kl ? 1.6 : 1) / 5e3) * 5e3,
    en: 8 + d * 4
  };
}

export function jb(e, c, n) {
  return { b: c.b, n: c.n, d: c.d, pay: c.pay, ot: e.ot | 0, start: n, end: n + du(e, c) * 1e3, dl: c.dl || 0, rt: c.rt || 0 };
}

export function pyd(pay) {
  var d = 0;
  if (S.debt > 0) {
    d = Math.min(S.debt, Math.round(pay / 2));
    S.debt -= d;
  }
  S.cash += pay - d;
  return d;
}

export function trainCost(e, b) {
  var currentL = lv(e, b);
  return Math.round((5e4 + currentL * 35e3) / 5e3) * 5e3;
}

