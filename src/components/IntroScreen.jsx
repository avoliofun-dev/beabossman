// src/components/IntroScreen.jsx
import React, { useState } from 'react';
import {
  TH, SHC, HRC, hx, pth, setPth, pcol, setPcol, phair, setPhair
} from '../game/state.js';
import { startGame } from '../game/engine.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function IntroScreen({ onStart }) {
  const [name, setName] = useState('');
  const [selectedTh, setSelectedTh] = useState(pth);
  const [selectedCol, setSelectedCol] = useState(pcol);
  const [selectedHair, setSelectedHair] = useState(phair);

  const handleSelectTh = (k) => {
    audio.playClick();
    setSelectedTh(k);
    setPth(k);
  };

  const handleSelectCol = (c) => {
    audio.playClick();
    setSelectedCol(c);
    setPcol(c);
  };

  const handleSelectHair = (c) => {
    audio.playClick();
    setSelectedHair(c);
    setPhair(c);
  };

  const handleGo = () => {
    audio.playLevelUp();
    startGame(name);
    onStart();
  };


  return (
    <div id="intro">
      <h1>Kantor Virtual Tycoon</h1>
      <p style={{ margin: '4px 0 16px' }}>
        Mulai dari satu meja kerja. Ambil kontrak, selesaikan tugas, dan bangun studio impianmu.
      </p>

      <div className="card" style={{ background: 'var(--sf)' }}>
        <label htmlFor="nm" style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>
          Nama Studio
        </label>
        <input
          id="nm"
          maxLength={24}
          placeholder="mis. Studio Laras"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p style={{ margin: '12px 0 6px', fontWeight: 600 }}>Tema Kantor</p>
        <div id="ths">
          {Object.keys(TH).map((k) => (
            <button
              key={k}
              type="button"
              className={`thb${k === selectedTh ? ' sel' : ''}`}
              data-pth={k}
              onClick={() => handleSelectTh(k)}
            >
              <b>{TH[k].n}</b>
              <br />
              <small>{TH[k].d}</small>
            </button>
          ))}
        </div>

        <p style={{ margin: '14px 0 6px', fontWeight: 600 }}>
          Penampilan Karakter Pendiri <small>(Warna baju &amp; rambut)</small>
        </p>
        <div id="avs">
          <small style={{ display: 'block', marginBottom: '6px' }}>Warna Baju</small>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {SHC.map((c) => (
              <button
                key={c}
                type="button"
                className={`sw${c === selectedCol ? ' sel' : ''}`}
                data-sc={c}
                aria-label={'Warna baju ' + hx(c)}
                style={{ background: hx(c) }}
                onClick={() => handleSelectCol(c)}
              ></button>
            ))}
          </div>

          <small style={{ display: 'block', margin: '8px 0 6px' }}>Warna Rambut</small>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {HRC.map((c) => (
              <button
                key={c}
                type="button"
                className={`sw${c === selectedHair ? ' sel' : ''}`}
                data-sh={c}
                aria-label={'Warna rambut ' + hx(c)}
                style={{ background: hx(c) }}
                onClick={() => handleSelectHair(c)}
              ></button>
            ))}
          </div>
        </div>
      </div>

      <button
        className="p"
        id="go"
        type="button"
        style={{ marginTop: '16px', minHeight: '44px', fontSize: '15px' }}
        onClick={handleGo}
      >
        Mulai Petualangan Studio
      </button>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        <small>Versi uji (Fase 6): progres tersimpan di browser ini. Login akun menyusul.</small>
      </p>
    </div>
  );
}
