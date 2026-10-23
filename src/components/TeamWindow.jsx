import React, { useState } from 'react';
import {
  S, ROOM, FA, DEC, TR, rp, rate, fcn, lt, md, cands, mkE, save, BID, lv, trainCost
} from '../game/state.js';
import { log, notifyUI, trainWorker } from '../game/engine.js';
import Icon from './Icon.jsx';


export default function TeamWindow({ onClose }) {
  const [fireConfirmId, setFireConfirmId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  if (!S) return null;
  const nx = ROOM[S.rooms - 1];
  const full = S.emp.length >= S.rooms;

  const handleTrain = (workerId, field) => {
    trainWorker(workerId, field);
  };


  const handleOpenRoom = () => {
    const cs = ROOM[S.rooms - 1];
    if (S.rooms < (S.f2 ? 8 : 6) && S.rep >= 20 && S.cash >= cs) {
      S.cash -= cs;
      S.rooms++;
      log('Ruangan ' + S.rooms + ' dibuka. Sewa naik.');
      save();
      notifyUI();
    }
  };

  const handleBuildF2 = () => {
    if (!S.f2 && S.rep >= 60 && S.cash >= 3e6) {
      S.cash -= 3e6;
      S.f2 = 1;
      S.fa = S.fa || {};
      log('Lantai 2 dibangun! Pekerja kini istirahat di atas.');
      save();
      notifyUI();
    }
  };

  const handleBuyFacility = (fk) => {
    const fo = FA.find(x => x[0] === fk);
    S.fa = S.fa || {};
    if (fo && !S.fa[fk] && S.cash >= fo[2]) {
      S.cash -= fo[2];
      S.fa[fk] = 1;
      log(fo[1] + ' terpasang.');
      save();
      notifyUI();
    }
  };

  const handleBuyDecoration = (dk) => {
    const dd = DEC.find(x => x[0] === dk);
    S.dc = S.dc || {};
    if (dd && !S.dc[dk] && S.cash >= dd[2]) {
      S.cash -= dd[2];
      S.dc[dk] = 1;
      log(dd[1] + ' terpasang. Mood +' + dd[3] + '.');
      save();
      notifyUI();
    }
  };

  const handleToggleAuto = (id) => {
    const a = S.emp.find(x => x.id === id);
    if (a) {
      a.auto = a.auto ? 0 : 1;
      if (a.aq == null) {
        a.aq = 5;
        a.at = Date.now();
      }
      save();
      notifyUI();
    }
  };

  const handleFire = (id) => {
    if (fireConfirmId !== id) {
      setFireConfirmId(id);
      return;
    }
    const f = S.emp.find(x => x.id === id);
    S.emp = S.emp.filter(x => x.id !== id);
    if (S.sel === id) S.sel = S.emp[0].id;
    if (f) log(f.nm + ' diberhentikan.');
    setFireConfirmId(null);
    save();
    notifyUI();
  };

  const handleFindCandidates = () => {
    if (S.cash >= 2e4) {
      S.cash -= 2e4;
      S.cand = cands();
      save();
      notifyUI();
    }
  };

  const handleHire = (idx) => {
    const c = S.cand[idx];
    if (!c || S.emp.length >= S.rooms) return;
    const h = mkE(c.nm, c.b, c.sk, c.sd, c.sal, 2);
    const u = S.emp.map(x => x.slot);
    h.tp = c.tp;
    h.slot = [0, 1, 2, 3, 4, 5, 6, 7].find(k => u.indexOf(k) < 0);
    S.emp.push(h);
    S.cand.splice(idx, 1);
    log(c.nm + ' bergabung (' + c.b + '). Masa percobaan 2 kontrak.');
    save();
    notifyUI();
  };

  return (
    <div id="w-tm" className="win glass">
      <div className="wh">
        <b>
          <Icon name="users" size={18} />
          <span>Tim &amp; Ruangan Kantor</span>
        </b>
        <button type="button" data-x onClick={onClose} aria-label="Tutup jendela">
          <Icon name="close" size={16} />
        </button>
      </div>

      <div id="tmc">
        <div className="card" style={{ background: 'rgba(255,255,255,0.03)', marginTop: 0 }}>
          <small>
            Biaya <strong>{rp(rate())}/jam</strong> (gaji + sewa). Ruangan baru dapat dibuka di reputasi 20. Pekerja otomatis memiliki jatah 5 kontrak (pulih 1 per 6 menit). Mood mempengaruhi kualitas hasil kerja.
          </small>
        </div>

        <h3>Ekspansi Ruangan</h3>
        {S.rooms < (S.f2 ? 8 : 6) ? (
          <button
            type="button"
            className="p"
            data-room="1"
            disabled={S.cash < nx || S.rep < 20}
            onClick={handleOpenRoom}
          >
            <Icon name="plus" size={15} /> {'Buka Ruangan ' + (S.rooms + 1) + ' · ' + rp(nx)}
          </button>
        ) : (
          <small>{S.f2 ? 'Semua ruangan telah terbuka (Maksimal 8).' : 'Bangun lantai 2 untuk membuka ruangan 7–8.'}</small>
        )}

        <h3>Fasilitas &amp; Lantai 2</h3>
        {!S.f2 ? (
          <div className="card">
            <button
              type="button"
              className="p"
              data-f2="1"
              disabled={S.rep < 60 || S.cash < 3e6}
              onClick={handleBuildF2}
            >
              {'Bangun Lantai 2 · ' + rp(3e6)}
            </button>
            <small style={{ display: 'block', marginTop: '6px' }}>
              {S.rep < 60 ? 'Syarat: Reputasi 60 (Sekarang: ' + S.rep + '/60)' : 'Fasilitas: Tangga, ruang istirahat, dan 2 slot ruangan baru.'}
            </small>
          </div>
        ) : (
          <div>
            <small style={{ display: 'block', marginBottom: '8px' }}>
              {'Pemulihan energi ×' + (1 + 0.25 * fcn()).toFixed(2) + ' · ' + fcn() + '/3 fasilitas aktif · sewa lantai 2 ' + rp(1e4 + 4e3 * fcn()) + '/jam'}
            </small>
            {FA.map(f => {
              const on = S.fa && S.fa[f[0]];
              return (
                <div key={f[0]} className="card ct">
                  <div>
                    <b>{f[1]}</b>
                    <br />
                    <small>{'Pemulihan +25% · sewa +' + rp(4e3) + '/jam'}</small>
                  </div>
                  {on ? (
                    <span className="bd g">
                      <Icon name="check" size={12} /> Terpasang
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-fa={f[0]}
                      disabled={S.cash < f[2]}
                      onClick={() => handleBuyFacility(f[0])}
                    >
                      {rp(f[2])}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h3>Dekorasi Kantor</h3>
        {DEC.map(d => {
          const on = S.dc && S.dc[d[0]];
          return (
            <div key={d[0]} className="card ct">
              <div>
                <b>{d[1]}</b>
                <br />
                <small>{'Mood seluruh pekerja +' + d[3]}</small>
              </div>
              {on ? (
                <span className="bd g">
                  <Icon name="check" size={12} /> Terpasang
                </span>
              ) : (
                <button
                  type="button"
                  data-dc={d[0]}
                  disabled={S.cash < d[2]}
                  onClick={() => handleBuyDecoration(d[0])}
                >
                  {rp(d[2])}
                </button>
              )}
            </div>
          );
        })}

        <h3>Anggota Tim &amp; Pelatihan ({S.emp.length}/{S.rooms})</h3>
        {S.emp.map(e => {
          const isSelected = selectedWorkerId === e.id;
          return (
            <div key={e.id} className="card" style={{ padding: '12px' }}>
              <div className="ct">
                <div>
                  <b>{e.nm}</b>
                  <br />
                  <small>
                    {e.b + ' Lv' + lt(e, e.b) + ' · ' + (e.sal ? rp(e.sal) + '/jam' : 'Pendiri') + (e.tr > 0 ? ' · Masa Percobaan ' + e.tr : '') + (TR[e.tp] ? ' · Sifat: ' + TR[e.tp].n : '') + ' · Mood: ' + md(e) + (e.oc ? ' · Lembur ×' + e.oc : '') + (e.ot ? ' · 🔥' : '')}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => setSelectedWorkerId(isSelected ? null : e.id)}
                    title="Buka / tutup opsi pelatihan skill"
                  >
                    {isSelected ? 'Tutup Kursus' : '📚 Kursus Skill'}
                  </button>
                  {e.sal ? (
                    <>
                      <button
                        type="button"
                        data-a={e.id}
                        onClick={() => handleToggleAuto(e.id)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        {'Auto: ' + (e.auto ? 'Aktif' : 'Mati')}
                      </button>
                      <button
                        type="button"
                        className={fireConfirmId === e.id ? 'danger' : ''}
                        data-f={e.id}
                        onClick={() => handleFire(e.id)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        {fireConfirmId === e.id ? 'Yakin?' : 'Pecat'}
                      </button>
                    </>
                  ) : (
                    <span className="bd n">Pendiri</span>
                  )}
                </div>
              </div>

              {/* Training Drawer */}
              {isSelected && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--ln)' }}>
                  <small style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Pilih Kursus Pelatihan untuk <strong>{e.nm}</strong> (+3 XP per sesi):
                  </small>
                  <div className="train-grid">
                    {BID.map(b => {
                      const curLv = lv(e, b);
                      const cost = trainCost(e, b);
                      const canTrain = !e.job && !e.rest && S.cash >= cost;
                      return (
                        <div key={b} className="train-pill">
                          <span>{b} · Lv {curLv}</span>
                          <small>XP: {e.xp[b] || 0}</small>
                          <button
                            type="button"
                            className="p"
                            disabled={!canTrain}
                            style={{ minHeight: '26px', fontSize: '10.5px', padding: '3px 6px', marginTop: '3px' }}
                            onClick={() => handleTrain(e.id, b)}
                          >
                            Ikuti · {rp(cost)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}


        <h3>Lowongan Rekrutmen</h3>
        {S.rep < 20 ? (
          <div className="card">
            <small>{'Butuh reputasi 20 (Sekarang: ' + S.rep + '/20) untuk membuka fitur rekrutmen.'}</small>
          </div>
        ) : (
          <div>
            {S.cand.map((c, i) => (
              <div key={i} className="card ct">
                <div>
                  <b>{c.nm}</b>
                  <br />
                  <small>
                    {c.b + ' Lv' + Math.max(1, c.sk - 1) + '–' + (c.sk + 1) + ' · Sampingan: ' + c.sd + ' · ' + rp(c.sal) + '/jam · Percobaan: 2 kontrak'}
                    {TR[c.tp] && (
                      <span style={{ display: 'block', color: 'var(--mu)', marginTop: '2px' }}>
                        {'Sifat ' + TR[c.tp].n + ': ' + TR[c.tp].d}
                      </span>
                    )}
                  </small>
                </div>
                <button
                  className="p"
                  type="button"
                  data-h={i}
                  disabled={full}
                  onClick={() => handleHire(i)}
                >
                  Rekrut
                </button>
              </div>
            ))}
            <p style={{ marginTop: '10px' }}>
              <button
                type="button"
                data-find="1"
                disabled={S.cash < 2e4}
                onClick={handleFindCandidates}
              >
                Cari Kandidat Baru · Rp 20.000
              </button>
            </p>
            {full && <small style={{ color: 'var(--wn)' }}>Buka ruangan baru terlebih dahulu untuk merekrut karyawan lagi.</small>}
          </div>
        )}
      </div>
    </div>
  );
}
