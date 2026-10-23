// src/components/EventModal.jsx
import React from 'react';
import { S, EV, save, setEvk } from '../game/state.js';
import { log, notifyUI } from '../game/engine.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function EventModal() {
  if (!S || !S.ev) return null;
  const v = S.ev;
  const e = S.emp.find(x => x.id === v.id);
  if (!e) {
    S.ev = null;
    setEvk(null);
    save();
    return null;
  }
  const d = EV[v.t];
  if (!d) return null;

  const handleChoice = (i) => {
    const c = d.c[i];
    const cost = c[2] || 0;
    if (S.cash < cost) return;
    audio.playClick();
    S.cash -= cost;
    const msg = c[1](e, v.x);
    S.ev = null;
    setEvk(null);
    if (msg) log(msg);
    save();
    notifyUI();
  };


  return (
    <div id="ev" className="glass">
      <b>
        <Icon name="alertCircle" size={20} />
        <span>{d.t.replace(/^[^\w\s]+/, '').trim()}</span>
      </b>
      <p>{d.d(e, v.x)}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {d.c.map((c, i) => {
          const cost = c[2] || 0;
          const isDisabled = S.cash < cost;
          return (
            <button
              key={i}
              type="button"
              className={i === 0 ? 'p' : ''}
              data-ev={i}
              disabled={isDisabled}
              onClick={() => handleChoice(i)}
            >
              {c[0](e, v.x)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
