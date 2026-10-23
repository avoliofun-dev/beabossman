import React, { useState, useEffect } from 'react';
import { S, rp, rate, PC } from '../game/state.js';
import { audio } from '../game/audio.js';
import { getCurrentUser } from '../lib/supabase.js';
import Icon from './Icon.jsx';

export default function TopBar({ onOpenAuth }) {
  if (!S) return null;
  const [muted, setMuted] = useState(audio.isMuted());
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(u => setUser(u));
  }, []);

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
        {!user && (
          <button
            type="button"
            onClick={onOpenAuth}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--r-full)',
              background: 'var(--wn-subtle)',
              color: 'var(--wn)',
              border: '1px solid var(--wn)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Klik untuk Masuk dan Simpan ke Cloud Supabase"
          >
            <span>☁️</span>
            <span>Simpan ke Cloud</span>
          </button>
        )}
        <button
          type="button"
          className="snd-btn"
          onClick={onOpenAuth}
          title={user ? `Cloud Sync Aktif (${user.email})` : 'Mode Tamu (Belum Login ke Supabase)'}
          aria-label="Akun & Cloud Sync Supabase"
          style={{ position: 'relative' }}
        >
          ☁️
          {user && (
            <span
              style={{
                position: 'absolute',
                bottom: '3px',
                right: '3px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--gd, #10b981)',
                border: '1.5px solid #fff'
              }}
              title="Cloud Sync Aktif"
            />
          )}
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


