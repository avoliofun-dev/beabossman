// src/components/NotificationsWindow.jsx
import React from 'react';
import { S } from '../game/state.js';
import Icon from './Icon.jsx';

export default function NotificationsWindow({ onClose }) {
  if (!S) return null;
  return (
    <div id="w-lg" className="win glass">
      <div className="wh">
        <b>
          <Icon name="bell" size={18} />
          <span>Riwayat Notifikasi</span>
        </b>
        <button type="button" data-x onClick={onClose} aria-label="Tutup jendela">
          <Icon name="close" size={16} />
        </button>
      </div>

      {S.log.length === 0 ? (
        <div className="empty-state">
          <Icon name="bell" size={28} />
          <p>Belum ada notifikasi studio.</p>
        </div>
      ) : (
        <ul id="lg" style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
          {S.log.map((l, i) => (
            <li
              key={i}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--ln)',
                fontSize: '13px',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <span style={{ color: 'var(--ac)', marginTop: '2px' }}>
                <Icon name="info" size={14} />
              </span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
