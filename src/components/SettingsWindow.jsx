// src/components/SettingsWindow.jsx
import React, { useState } from 'react';
import {
  S, SHC, HRC, hx, th, save, armed, setArmed, KEY, PC, rp, rate, fcn, md
} from '../game/state.js';
import {
  setZm, getZm, vw, toggleShadow, isShadowEnabled, removeWorkerMesh
} from '../game/scene3d.js';
import { notifyUI, exportSaveData, importSaveData, payDebt } from '../game/engine.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function SettingsWindow({ onClose, toggleUI, toggleFS }) {
  const [tab, setTab] = useState('display'); // 'display' | 'finance' | 'profile' | 'data' | 'about'
  const [, setRerender] = useState(0);
  const [muted, setMuted] = useState(audio.isMuted());
  const [importText, setImportText] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  if (!S) return null;
  const f = S.emp[0];
  const founderCol = f ? '#' + ('000000' + f.col.toString(16)).slice(-6) : '#2563eb';
  const unlockedPc = Object.keys(S.pc || {}).length;

  const handleZoom = (dir) => {
    const cur = getZm();
    setZm(cur * (dir > 0 ? 1.2 : 1 / 1.2));
  };

  const handleColorChange = (c, isShirt) => {
    if (isShirt) f.col = c;
    else f.hr = c;
    removeWorkerMesh(f);
    save();
    notifyUI();
  };

  const handleToggleSound = () => {
    const next = audio.toggleMute();
    setMuted(next);
  };

  const handleExportCopy = () => {
    const data = exportSaveData();
    navigator.clipboard.writeText(data).then(() => {
      setCopyStatus('✅ Kode simpanan tersalin ke clipboard!');
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };

  const handleExportDownload = () => {
    const data = exportSaveData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kantor_tycoon_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = importSaveData(importText.trim());
    if (ok) {
      setCopyStatus('✅ Data berhasil dipulihkan!');
      setImportText('');
      setTimeout(() => setCopyStatus(''), 3000);
    } else {
      setCopyStatus('❌ Format kode data simpanan tidak valid.');
    }
  };

  const handlePayDebtPart = () => {
    payDebt(5e4);
  };

  const handlePayDebtAll = () => {
    payDebt(S.debt);
  };

  const handleReset = (e) => {
    if (!armed) {
      setArmed(true);
      e.currentTarget.textContent = 'Yakin? Ketuk lagi untuk reset';
      return;
    }
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem('ktycoon_mvp1');
    } catch (err) {}
    window.location.reload();
  };

  const handleToggleShadow = (e) => {
    toggleShadow(e.currentTarget);
    setRerender(v => v + 1);
  };

  // Financial statistics calculations
  const teamSalaries = S.emp.reduce((a, e) => a + (e.sal || 0), 0);
  const roomRent = 6e3 * S.rooms;
  const f2Rent = S.f2 ? 1e4 + 4e3 * fcn() : 0;
  const totalExpensesPerHour = rate();
  const avgMood = Math.round(S.emp.reduce((a, e) => a + md(e), 0) / Math.max(1, S.emp.length));

  return (
    <div id="w-st" className="win glass">
      <div className="wh">
        <b>
          <Icon name="settings" size={18} />
          <span>Pengaturan &amp; Menu</span>
        </b>
        <button type="button" data-x onClick={onClose} aria-label="Tutup jendela">
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn${tab === 'display' ? ' active' : ''}`}
          onClick={() => setTab('display')}
        >
          Tampilan
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'finance' ? ' active' : ''}`}
          onClick={() => setTab('finance')}
        >
          Keuangan
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'profile' ? ' active' : ''}`}
          onClick={() => setTab('profile')}
        >
          Profil
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'data' ? ' active' : ''}`}
          onClick={() => setTab('data')}
        >
          Data
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'about' ? ' active' : ''}`}
          onClick={() => setTab('about')}
        >
          Tentang
        </button>
      </div>

      {/* TAB: TAMPILAN */}
      {tab === 'display' && (
        <div>
          <h3>Audio &amp; Efek Suara</h3>
          <div className="card ct" style={{ marginTop: 0 }}>
            <div>
              <b>Efek Suara Retro (SFX)</b>
              <br />
              <small>Denting koin, fanfar naik level, dan notifikasi tugas</small>
            </div>
            <button type="button" onClick={handleToggleSound}>
              {muted ? '🔇 Terbisukan' : '🔊 Aktif'}
            </button>
          </div>

          <h3>Kontrol Layar</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" data-z="1" onClick={() => handleZoom(1)}>
              <Icon name="plus" size={15} /> Perbesar
            </button>
            <button type="button" data-z="-1" onClick={() => handleZoom(-1)}>
              <Icon name="minus" size={15} /> Perkecil
            </button>
            <button type="button" data-ui="1" onClick={toggleUI}>
              <Icon name="eyeOff" size={15} /> Sembunyikan UI
            </button>
            <button type="button" data-fs="1" onClick={toggleFS}>
              <Icon name="maximize" size={15} /> Layar Penuh
            </button>
          </div>

          <h3>Sudut Pandang Kamera</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button type="button" data-v="iso" onClick={() => vw('iso')}>
              <Icon name="camera" size={14} /> Isometrik
            </button>
            <button type="button" data-v="atas" onClick={() => vw('atas')}>
              Atas
            </button>
            <button type="button" data-v="depan" onClick={() => vw('depan')}>
              Depan
            </button>
            <button type="button" data-v="samping" onClick={() => vw('samping')}>
              Samping
            </button>
            <button type="button" data-v="lt2" onClick={() => vw('lt2')}>
              Lantai 2
            </button>
          </div>

          <div className="card" style={{ marginTop: '14px', background: 'rgba(255,255,255,0.03)' }}>
            <small style={{ display: 'block' }}>
              <strong>Navigasi 3D:</strong> 1 jari / klik kiri untuk memutar · 2 jari / klik kanan / Shift untuk menggeser (pan) · cubit / scroll untuk zoom · klik dua kali untuk reset.
            </small>
          </div>

          <h3>Pencahayaan</h3>
          <p>
            <button id="sh" type="button" onClick={handleToggleShadow}>
              {'Bayangan 3D: ' + (isShadowEnabled() ? 'Nyala' : 'Mati')}
            </button>
          </p>
        </div>
      )}

      {/* TAB: KEUANGAN / FINANSIAL */}
      {tab === 'finance' && (
        <div>
          <h3>Ringkasan Keuangan Studio</h3>
          <div className="fin-grid">
            <div className="fin-card">
              <small>Kas Tersedia</small>
              <b style={{ color: 'var(--gd)' }}>{rp(S.cash)}</b>
            </div>
            <div className="fin-card">
              <small>Total Kontrak Selesai</small>
              <b>{S.done} kontrak</b>
            </div>
            <div className="fin-card">
              <small>Biaya Tim / Jam</small>
              <b style={{ color: 'var(--wn)' }}>{rp(teamSalaries)}/jam</b>
            </div>
            <div className="fin-card">
              <small>Sewa Kantor / Jam</small>
              <b style={{ color: 'var(--wn)' }}>{rp(roomRent + f2Rent)}/jam</b>
            </div>
          </div>

          <h3>Arus Kas Jam-ke-Jam</h3>
          <div className="card">
            <div className="ct" style={{ marginBottom: '6px' }}>
              <small>Pengeluaran Operasional Total:</small>
              <strong>{rp(totalExpensesPerHour)}/jam</strong>
            </div>
            <div className="ct" style={{ marginBottom: '6px' }}>
              <small>Kondisi Mood Rata-rata Tim:</small>
              <span className={`bd ${avgMood >= 65 ? 'g' : avgMood >= 45 ? 'w' : 'd'}`}>
                {avgMood}%
              </span>
            </div>
            <div className="ct">
              <small>Reputasi Pasar:</small>
              <strong>{S.rep} Poin</strong>
            </div>
          </div>

          <h3>Status Tunggakan / Pinjaman</h3>
          {S.debt > 0 ? (
            <div className="card" style={{ borderColor: 'var(--wn)', background: 'var(--wn-subtle)' }}>
              <b>Tunggakan Aktif: {rp(S.debt)}</b>
              <p style={{ margin: '6px 0 10px' }}>
                <small>Setiap kontrak yang selesai akan otomatis dipotong 50% untuk mencicil hutang hingga lunas.</small>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={S.cash < 5e4}
                  onClick={handlePayDebtPart}
                >
                  Cicil Rp 50.000
                </button>
                <button
                  type="button"
                  className="p"
                  disabled={S.cash < S.debt}
                  onClick={handlePayDebtAll}
                >
                  Lunasi Sekaligus
                </button>
              </div>
            </div>
          ) : (
            <div className="card ct">
              <div>
                <b>Bebas Hutang</b>
                <br />
                <small>Studio Anda tidak memiliki tunggakan biaya sewa atau pinjaman.</small>
              </div>
              <span className="bd g">
                <Icon name="check" size={12} /> Sehat
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB: PROFIL */}
      {tab === 'profile' && (
        <div>
          <div className="profile-card">
            <div className="profile-avatar" style={{ background: founderCol }}>
              {f ? f.nm.charAt(0).toUpperCase() : 'K'}
            </div>
            <div>
              <b style={{ fontSize: '16px' }}>{S.co}</b>
              <small style={{ display: 'block', marginTop: '2px' }}>
                Pendiri: {f ? f.nm : 'Kamu'} · Tema: {th().n}
              </small>
              <small style={{ display: 'block', color: 'var(--gd)' }}>
                {unlockedPc} dari {PC.length} Pencapaian Terbuka
              </small>
            </div>
          </div>

          <h3>Penampilan Karakter Pendiri</h3>
          <div id="swp" className="card">
            <small style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Warna Baju</small>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {SHC.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`sw${c === f.col ? ' sel' : ''}`}
                  data-sc={c}
                  aria-label={'Warna baju ' + hx(c)}
                  style={{ background: hx(c) }}
                  onClick={() => handleColorChange(c, true)}
                ></button>
              ))}
            </div>

            <small style={{ display: 'block', margin: '10px 0 6px', fontWeight: 600 }}>Warna Rambut</small>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {HRC.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`sw${c === (f.hr || 0x2b2118) ? ' sel' : ''}`}
                  data-sh={c}
                  aria-label={'Warna rambut ' + hx(c)}
                  style={{ background: hx(c) }}
                  onClick={() => handleColorChange(c, false)}
                ></button>
              ))}
            </div>
          </div>

          <p>
            <small>Tema studio saat ini: <strong id="thn">{th().n}</strong> (ditentukan saat membuat studio).</small>
          </p>
        </div>
      )}

      {/* TAB: DATA & BACKUP */}
      {tab === 'data' && (
        <div>
          <h3>Cadangkan &amp; Pulihkan Progres</h3>
          <div className="card">
            <b>Cadangkan Progres (Backup)</b>
            <p>
              <small>Simpan data game Anda dalam bentuk kode atau unduh file untuk dipindahkan ke perangkat lain.</small>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button type="button" onClick={handleExportCopy}>
                📋 Salin Kode Data
              </button>
              <button type="button" onClick={handleExportDownload}>
                💾 Unduh File Simpanan
              </button>
            </div>
          </div>

          <div className="card">
            <b>Pulihkan Data (Restore)</b>
            <p>
              <small>Tempelkan kode data cadangan Anda di bawah ini untuk memulihkan progres:</small>
            </p>
            <textarea
              style={{
                width: '100%',
                height: '60px',
                padding: '8px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                border: '1px solid var(--ln)',
                fontSize: '11px',
                fontFamily: 'monospace',
                resize: 'none',
                boxSizing: 'border-box'
              }}
              placeholder='Tempelkan kode JSON simpanan di sini...'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <button
              type="button"
              className="p"
              style={{ marginTop: '8px' }}
              disabled={!importText.trim()}
              onClick={handleImportSubmit}
            >
              Pulihkan Data Sekarang
            </button>
            {copyStatus && (
              <small style={{ display: 'block', marginTop: '6px', fontWeight: 600 }}>
                {copyStatus}
              </small>
            )}
          </div>

          <h3>Zona Bahaya</h3>
          <div className="card" style={{ borderColor: 'var(--dg)', background: 'var(--dg-subtle)' }}>
            <b style={{ color: 'var(--dg)' }}>Reset Progres</b>
            <p>
              <small>Menghapus seluruh save data studio dan memulai kembali dari awal.</small>
            </p>
            <button id="rst" type="button" className="danger" onClick={handleReset}>
              <Icon name="trash" size={15} /> Ulang dari Awal
            </button>
          </div>
        </div>
      )}

      {/* TAB: TENTANG */}
      {tab === 'about' && (
        <div>
          <h3>Tentang Game</h3>
          <div className="card">
            <b>Kantor Virtual Tycoon</b>
            <p>
              <small>
                Game simulasi manajemen agensi dan kantor virtual 3D isometrik berbasis web. Dikembangkan menggunakan React, Vite, Three.js, dan Web Audio API synth.
              </small>
            </p>
            <small style={{ display: 'block', marginTop: '6px' }}>
              Versi: <strong>Fase 7 (Pelatihan Skill, Keuangan &amp; Web Audio Synth)</strong>
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
