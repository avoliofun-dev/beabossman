// src/components/ContractsWindow.jsx
import React, { useState } from 'react';
import {
  S, gs, lv, du, ec, cl, lt, av, rp, TR, DM, PC, dmk, save, mk, jb
} from '../game/state.js';
import { log, notifyUI, pop } from '../game/engine.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function ContractsWindow({ onClose }) {
  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'missions' | 'big' | 'achievements'

  if (!S) return null;
  const se = gs();
  const tr = se.tr > 0;
  const now = Date.now();

  const handleSelectWorker = (id) => {
    S.sel = id;
    audio.playClick();
    notifyUI();
  };

  const handleTakeContract = (i) => {
    const e = gs();
    if (!e || e.job || e.rest) return;
    const c = S.ct[i];
    if (e.en < ec(e, c)) return;

    e.en -= ec(e, c);
    const n = Date.now();
    e.job = jb(e, c, n);
    S.ct[i] = mk();
    audio.playClick();
    save();
    notifyUI();
  };

  const handleTakeBigPart = (bi) => {
    const bg = S.bg;
    const be = gs();
    const bp = bg && bg.parts[bi];
    if (!bp || bp.st || be.job || be.rest || be.en < ec(be, bp)) return;

    const bn = Date.now();
    be.en -= ec(be, bp);
    be.job = {
      b: bp.b,
      n: bg.n,
      d: bp.d,
      pay: 0,
      ot: be.ot | 0,
      start: bn,
      end: bn + du(be, bp) * 1e3,
      bg: 1,
      bp: bi
    };
    bp.st = 1;
    audio.playClick();
    save();
    notifyUI();
  };

  const handleClaimMission = (idx) => {
    const mm = dmk();
    const dx = DM[idx];
    if (dx && !mm.cl[idx] && mm[dx[1]] >= dx[2]) {
      mm.cl[idx] = 1;
      S.cash += dx[3];
      log('Misi selesai: ' + dx[0] + ' · +' + rp(dx[3]));
      pop('+' + rp(dx[3]));
      audio.playLevelUp();
      save();
      notifyUI();
    }
  };

  const handleTakeLoan = () => {
    if (S.cash < 5e4 && S.debt < 3e5) {
      S.cash += 15e4;
      S.debt += 165e3;
      log('Pinjaman darurat Rp 150.000 cair. Tunggakan +Rp 165.000, dicicil 50% dari tiap bayaran.');
      pop('+Rp 150.000');
      audio.playCoin();
      save();
      notifyUI();
    }
  };


  const m = dmk();
  const g = S.bg;

  // Sorter for daily missions: claimable first, in progress second, completed last
  const sortedMissions = DM.map((x, i) => {
    const p = Math.min(m[x[1]], x[2]);
    const ok = m[x[1]] >= x[2];
    const isClaimed = !!m.cl[i];
    const priority = isClaimed ? 3 : ok ? 1 : 2;
    return { x, i, p, ok, isClaimed, priority };
  }).sort((a, b) => a.priority - b.priority);

  return (
    <div id="w-ct" className="win glass">
      <div className="wh">
        <b>
          <Icon name="clipboard" size={18} />
          <span>Pusat Tugas &amp; Kontrak</span>
        </b>
        <button type="button" data-x onClick={onClose} aria-label="Tutup jendela">
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn${activeTab === 'contracts' ? ' active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          Kontrak
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'missions' ? ' active' : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          Misi Harian
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'big' ? ' active' : ''}`}
          onClick={() => setActiveTab('big')}
        >
          Proyek {g ? '(!)' : ''}
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'achievements' ? ' active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Pencapaian
        </button>
      </div>

      {/* TAB 1: KONTRAK */}
      {activeTab === 'contracts' && (
        <div id="cts">
          <div style={{ marginBottom: '10px' }}>
            <small style={{ display: 'block', marginBottom: '4px' }}>Dikerjakan oleh pekerja aktif:</small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {S.emp.map(e => (
                <button
                  key={e.id}
                  type="button"
                  className={`chip${e.id === S.sel ? ' p' : ''}`}
                  data-e={e.id}
                  onClick={() => handleSelectWorker(e.id)}
                >
                  {e.nm + (e.job ? ' · sibuk' : e.rest ? ' · istirahat' : '')}
                </button>
              ))}
            </div>
          </div>

          {S.ct.length === 0 ? (
            <div className="empty-state">
              <Icon name="clipboard" size={28} />
              <p>Belum ada kontrak yang tersedia.</p>
            </div>
          ) : (
            S.ct.map((c, i) => {
              const grade = lv(se, c.b) - c.d;
              const a = cl(0.75 + grade * 0.12, 0.5, 1.3);
              const z = cl(0.75 + grade * 0.12 + 0.25, 0.5, 1.3);
              const tagText = tr ? '?' : grade > 0 ? 'Mudah' : grade === 0 ? 'Pas' : 'Berat';
              const tagColorClass = tr ? 'n' : grade > 0 ? 'g' : grade === 0 ? 'y' : 'r';

              const isBusy = !!(se.job || se.rest);
              const isLowEnergy = se.en < ec(se, c);
              const isBtnDisabled = isBusy || isLowEnergy;
              const btnLabel = se.rest ? 'Istirahat' : se.job ? 'Sibuk' : isLowEnergy ? 'Energi kurang' : 'Ambil';

              let kilatSec = c.x ? Math.max(0, Math.ceil((c.x - now) / 1e3)) : 0;
              let deadlineSec = c.dl ? Math.ceil((c.dl - now) / 1e3) : 0;
              let isLate = c.dl && deadlineSec < Math.round(du(se, c));
              let dlFormat = deadlineSec >= 60 ? Math.floor(deadlineSec / 60) + ' mnt ' + (deadlineSec % 60) + ' dtk' : Math.max(0, deadlineSec) + ' dtk';
              let dlText = (isLate ? 'Telat −20% · ' : 'Tenggat ') + dlFormat;

              return (
                <div key={i} className="card ct">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <b>{c.n}</b>
                      <span className={`bd ${tagColorClass}`}>{tagText}</span>
                      {c.x > 0 && (
                        <span className="bd y kx" data-x={c.x}>
                          <Icon name="zap" size={11} /> kilat {kilatSec}s
                        </span>
                      )}
                      {c.rt ? (
                        <span className="bd g">
                          <Icon name="handshake" size={11} /> Klien tetap
                        </span>
                      ) : null}
                    </div>
                    <small style={{ display: 'block', marginTop: '2px' }}>
                      {c.b} · {Math.round(du(se, c))} dtk · ⚡−{ec(se, c)}
                      {se.ot ? ' (Lembur)' : ''}
                    </small>
                    {c.dl > 0 && (
                      <span className={`bd kd ${isLate ? 'r' : 'n'}`} data-dl={c.dl} data-du={Math.round(du(se, c))} style={{ marginTop: '4px' }}>
                        <Icon name="clock" size={11} /> {dlText}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <b className="num" style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                      {tr ? rp(c.pay) : '≈ ' + rp(Math.round(c.pay * (a + z) / 2e3) * 1e3)}
                    </b>
                    <button
                      className="p"
                      type="button"
                      data-i={i}
                      disabled={isBtnDisabled}
                      onClick={() => handleTakeContract(i)}
                    >
                      {btnLabel}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {S.cash < 5e4 && (
            <div className="card" style={{ marginTop: '12px', borderLeft: '4px solid var(--wn)' }}>
              <div className="ct">
                <div>
                  <b>Pinjaman Darurat</b>
                  <br />
                  <small>+Rp 150.000 langsung cair (tunggakan +Rp 165.000, potong 50% tiap bayaran)</small>
                </div>
                <button
                  type="button"
                  data-loan="1"
                  disabled={S.debt >= 3e5}
                  onClick={handleTakeLoan}
                >
                  Ambil Pinjaman
                </button>
              </div>
            </div>
          )}

          <p id="sk" style={{ marginTop: '12px' }}>
            <small>
              {se.nm + ' · ' + (TR[se.tp] ? 'sifat ' + TR[se.tp].n + ' · ' : '') + av().map(b => b + ' Lv' + lt(se, b)).join(' · ')}
            </small>
          </p>
          <p id="goal">
            <small>
              {S.rep >= 20 ? 'Rekrutmen terbuka: buka panel Tim.' : 'Reputasi ' + S.rep + '/20 untuk membuka rekrutmen pekerja.'}
            </small>
          </p>
        </div>
      )}

      {/* TAB 2: MISI HARIAN */}
      {activeTab === 'missions' && (
        <div id="dm">
          <h3>🎯 Misi Harian Hari Ini</h3>
          {sortedMissions.map(({ x, i, p, ok, isClaimed }) => {
            const progressRatio = Math.min(1, p / x[2]);
            return (
              <div key={i} className="card">
                <div className="ct">
                  <div>
                    <b>{x[0]}</b>
                    <br />
                    <small>
                      Hadiah: <strong style={{ color: 'var(--gd)' }}>{rp(x[3])}</strong>
                    </small>
                  </div>
                  <div>
                    {isClaimed ? (
                      <span className="bd g" style={{ padding: '6px 10px' }}>
                        <Icon name="check" size={12} /> Selesai
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="p"
                        data-dm={i}
                        disabled={!ok}
                        onClick={() => handleClaimMission(i)}
                      >
                        Klaim Hadiah
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--mu)' }}>
                    <span>Progres</span>
                    <span className="num">
                      {x[1] === 'earn' ? rp(p) + ' / ' + rp(x[2]) : p + ' / ' + x[2]}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${progressRatio * 100}%` }}></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PROYEK BESAR */}
      {activeTab === 'big' && (
        <div>
          <h3>🏗️ Proyek Besar Studio</h3>
          {g ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <b style={{ fontSize: '15px' }}>{g.n}</b>
                  <br />
                  <small>Dua bidang dikerjakan pekerja berbeda · Total bayaran {rp(g.pay)}</small>
                </div>
                <span className="bd n kd" data-dl={g.dl} data-du="0" data-bg="1">
                  <Icon name="clock" size={11} />{' '}
                  {'tenggat ' + (Math.ceil((g.dl - now) / 1e3) >= 60
                    ? Math.floor(Math.ceil((g.dl - now) / 1e3) / 60) + ' mnt ' + (Math.ceil((g.dl - now) / 1e3) % 60) + ' dtk'
                    : Math.max(0, Math.ceil((g.dl - now) / 1e3)) + ' dtk')}
                </span>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {g.parts.map((p, i) => {
                  const isPartDisabled = !p || !!p.st || !!(se.job || se.rest) || se.en < ec(se, p);
                  return (
                    <div key={i} className="card ct" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div>
                        <b>{p.b} Lv{p.d}</b>
                        <br />
                        <small>
                          {p.dur} dtk · ⚡−{p.en} ·{' '}
                          <span className={p.st === 2 ? 'bd g' : p.st === 1 ? 'bd y' : 'bd n'}>
                            {p.st === 2 ? 'Selesai ✓' : p.st === 1 ? 'Sedang dikerjakan' : 'Terbuka'}
                          </span>
                        </small>
                      </div>
                      <button
                        type="button"
                        className="p"
                        data-bp={i}
                        disabled={isPartDisabled}
                        onClick={() => handleTakeBigPart(i)}
                      >
                        Ambil Bagian
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="building" size={32} />
              <p>Belum ada proyek besar saat ini.</p>
              <small>Proyek besar akan muncul otomatis jika reputasi ≥ 15 dan memiliki minimal 2 pekerja.</small>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PENCAPAIAN */}
      {activeTab === 'achievements' && (
        <div>
          <div className="ct">
            <h3>🏆 Pencapaian Studio</h3>
            <span className="bd g">
              {Object.keys(S.pc || {}).length} / {PC.length} Terbuka
            </span>
          </div>
          <div className="achievements-grid">
            {PC.map(x => {
              const isUnlocked = !!(S.pc && S.pc[x[0]]);
              return (
                <div
                  key={x[0]}
                  className={`achieve-badge ${isUnlocked ? 'unlocked' : 'locked'}`}
                  title={x[1]}
                >
                  <Icon name={isUnlocked ? 'trophy' : 'lock'} size={24} />
                  <span>{x[1]}</span>
                  <small style={{ fontSize: '10px' }}>{isUnlocked ? '+Rp 100.000' : 'Terkunci'}</small>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
