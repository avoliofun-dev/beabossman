// src/components/Tutorial.jsx
import React, { useEffect } from 'react';
import { S, save } from '../game/state.js';
import { notifyUI } from '../game/engine.js';
import Icon from './Icon.jsx';

export default function Tutorial({ openWin }) {
  if (!S) return null;
  let t = S.tut;
  const m = [
    'Ketuk menu Tugas di bawah untuk melihat pilihan pekerjaan kontrak.',
    'Pilih satu kontrak yang pas, lalu ketuk Ambil.',
    'Pekerjamu sedang mengerjakan tugas di mejanya. Tunggu hingga selesai untuk menerima pembayaran kas.',
    'Kontrak pertama berhasil diselesaikan! Kumpulkan reputasi 20 untuk membuka lowongan rekrutmen tim.'
  ];

  useEffect(() => {
    if (typeof t === 'number' && t < 4) {
      let nextT = t;
      if (t === 0 && openWin === 'ct') nextT = 1;
      if (t === 1 && S.emp[0] && S.emp[0].job) nextT = 2;
      if (t === 2 && S.done > 0) {
        nextT = 3;
        setTimeout(() => {
          if (S && S.tut === 3) {
            S.tut = 4;
            save();
            notifyUI();
          }
        }, 7000);
      }
      if (nextT !== S.tut) {
        S.tut = nextT;
        save();
        notifyUI();
      }
    }
    document.body.classList.toggle('tt', typeof t === 'number' && t < 4);
  }, [t, openWin]);

  if (typeof t !== 'number' || t >= 4) return null;

  return (
    <div id="tut" className="glass">
      <span style={{ color: 'var(--ac)' }}>
        <Icon name="info" size={18} />
      </span>
      <div>
        <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ac)' }}>
          Panduan Langkah {t + 1}/4
        </strong>
        <span>{m[t]}</span>
      </div>
    </div>
  );
}
