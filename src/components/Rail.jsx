// src/components/Rail.jsx
import React from 'react';
import { S, md, save, rms } from '../game/state.js';
import { notifyUI } from '../game/engine.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function Rail() {
  if (!S) return null;
  const now = Date.now();

  const handleSelect = (id) => {
    S.sel = id;
    audio.playClick();
    notifyUI();
  };

  const handleRest = (e, ev) => {
    ev.stopPropagation();
    if (!e || e.job || e.rest || e.en >= 100) return;
    const n = Date.now();
    e.rest = { start: n, end: n + (100 - e.en) * rms(), from: e.en };
    audio.playRest();
    save();
    notifyUI();
  };

  const handleOvertime = (e, ev) => {
    ev.stopPropagation();
    e.ot = e.ot ? 0 : 1;
    audio.playClick();
    save();
    notifyUI();
  };


  return (
    <div id="rail" className="glass">
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--mu)',
        paddingBottom: '6px',
        marginBottom: '6px',
        borderBottom: '1px solid var(--ln)'
      }}>
        Status Tim
      </div>
      <div className="rh">
        <span style={{ fontSize: '10px', color: 'var(--mu)' }}>Tim</span>
        <span title="Tenaga / Energi" style={{ display: 'inline-flex', justifyContent: 'center' }}>
          <Icon name="zap" size={12} style={{ color: 'var(--gd)' }} />
        </span>
        <span title="Tugas / Progres Kontrak" style={{ display: 'inline-flex', justifyContent: 'center' }}>
          <Icon name="clipboard" size={12} style={{ color: 'var(--ac)' }} />
        </span>
        <span style={{ fontSize: '10px', color: 'var(--mu)' }}>Aksi</span>
      </div>
      <div id="emps">
        {S.emp.map((e, i) => {
          const isBusy = !!(e.job || e.rest);
          let p = 0;
          let en = e.en;
          let statusText = 'Menganggur';

          if (e.job) {
            p = (now - e.job.start) / (e.job.end - e.job.start);
            statusText = 'Bekerja · ' + e.job.n + ' (' + Math.max(0, Math.ceil((e.job.end - now) / 1e3)) + ' dtk)';
          } else if (e.rest) {
            p = (now - e.rest.start) / (e.rest.end - e.rest.start);
            en = e.rest.from + (100 - e.rest.from) * Math.max(0, Math.min(1, p));
            statusText = S.f2 ? 'Istirahat di lantai 2' : 'Istirahat di sofa';
          }

          const moodVal = md(e);
          const moodEmoji = moodVal >= 70 ? '😊' : moodVal >= 40 ? '😐' : '😞';
          const isSelected = e.id === S.sel;
          const colHex = '#' + ('000000' + e.col.toString(16)).slice(-6);
          const taskHeightPercent = isBusy ? Math.max(0, Math.min(1, p)) * 100 : 0;
          const energyHeightPercent = en;

          return (
            <div
              key={e.id}
              className={`er${isSelected ? ' on' : ''}`}
              data-e={e.id}
              title={e.nm}
              onClick={() => handleSelect(e.id)}
            >
              <div className="av" style={{ background: colHex }}>
                {e.nm.charAt(0).toUpperCase()}
                <span id={`m${i}`}>{moodEmoji}</span>
              </div>
              <div className="vb" aria-label="Energi">
                <i id={`b${i}`} style={{ height: `${energyHeightPercent}%` }}></i>
              </div>
              <div className="vb t" aria-label="Tugas">
                <i id={`p${i}`} style={{ height: `${taskHeightPercent}%` }}></i>
              </div>
              <div className="bt">
                <button
                  type="button"
                  id={`r${i}`}
                  data-r={e.id}
                  aria-label="Istirahat"
                  title="Istirahat"
                  disabled={isBusy || e.en >= 100}
                  onClick={(ev) => handleRest(e, ev)}
                >
                  <Icon name="moon" size={13} />
                </button>
                <button
                  type="button"
                  className={`ot${e.ot ? ' on' : ''}`}
                  data-ot={e.id}
                  aria-label="Lembur"
                  title="Lembur"
                  onClick={(ev) => handleOvertime(e, ev)}
                >
                  <Icon name="flame" size={13} />
                </button>
              </div>
              <small id={`s${i}`} hidden>{statusText}</small>
              <span id={`n${i}`} hidden>{Math.round(en)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
