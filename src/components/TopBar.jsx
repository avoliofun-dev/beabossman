import React, { useState } from 'react';
import { S, rp, rate, PC } from '../game/state.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function TopBar({ onOpenAuth }) {
  if (!S) return null;
  const [muted, setMuted] = useState(audio.isMuted());
  const founder = S.emp[0];
  const founderCol = founder ? '#' + ('000000' + founder.col.toString(16)).slice(-6) : '#2563eb';
  const unlockedPc = Object.keys(S.pc || {}).length;

  const handleToggleSound = () => {
    const next = audio.toggleMute();
    setMuted(next);
  };

  return (
    <div id="top" className="glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: founderCol,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: 'var(--sh-sm)',
            border: '2px solid rgba(255,255,255,0.4)',
            flexShrink: 0
          }}
          title={`Pendiri: ${founder ? founder.nm : 'Kamu'}`}
        >
          {founder ? founder.nm.charAt(0).toUpperCase() : 'K'}
        </div>
        <div>
          <b id="co">{S.co}</b>
          <small id="sub">
            {S.done} kontrak · {rp(rate())}/jam{S.debt > 0 ? ' · tunggakan ' + rp(S.debt) : ''} · 🏆 {unlockedPc}/{PC.length}
          </small>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          className="snd-btn"
          onClick={onOpenAuth}
          title="Akun &amp; Cloud Sync Supabase"
          aria-label="Akun &amp; Cloud Sync Supabase"
        >
          ☁️
        </button>
        <button
          type="button"
          className="snd-btn"
          onClick={handleToggleSound}
          title={muted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          aria-label={muted ? 'Aktifkan Suara' : 'Bisukan Suara'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <div style={{ textAlign: 'right' }}>
          <b id="cash">{rp(S.cash)}</b>
          <small id="rep">{'Reputasi ' + S.rep}</small>
        </div>
      </div>
    </div>
  );
}


