// src/components/IntroScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  TH, SHC, HRC, hx, pth, setPth, pcol, setPcol, phair, setPhair,
  S, setS, save, rp
} from '../game/state.js';
import { startGame, log, notifyUI } from '../game/engine.js';
import {
  getCurrentUser, signIn, signUp, loadGameStateFromCloud, saveGameStateToCloud
} from '../lib/supabase.js';
import { updateThemeColors } from '../game/scene3d.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function IntroScreen({ onStart }) {
  const [name, setName] = useState('');
  const [selectedTh, setSelectedTh] = useState(pth);
  const [selectedCol, setSelectedCol] = useState(pcol);
  const [selectedHair, setSelectedHair] = useState(phair);

  // Auth & Cloud States
  const [user, setUser] = useState(null);
  const [cloudStudio, setCloudStudio] = useState(null);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    checkCloudSession();
  }, []);

  const checkCloudSession = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const cloudData = await loadGameStateFromCloud();
        if (cloudData?.state) {
          setCloudStudio(cloudData.state);
        }
      }
    } catch (e) {
      console.warn('Error checking cloud session:', e);
    }
  };

  const showMsg = (text, type = 'info') => {
    setAuthMsg({ text, type });
    setTimeout(() => setAuthMsg({ text: '', type: '' }), 6000);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (authMode === 'login') {
        await signIn(email, password);
        audio.playLevelUp();
        const u = await getCurrentUser();
        setUser(u);
        const cloudData = await loadGameStateFromCloud();
        if (cloudData?.state) {
          setCloudStudio(cloudData.state);
          showMsg(`Berhasil masuk! Ditemukan studio cloud "${cloudData.state.co}".`, 'success');
        } else {
          showMsg('Berhasil masuk! Silakan buat nama studio Anda di bawah untuk disimpan ke cloud.', 'success');
        }
      } else {
        await signUp(email, password);
        audio.playLevelUp();
        const u = await getCurrentUser();
        setUser(u);
        showMsg('Akun Supabase berhasil dibuat! Studio Anda akan langsung otomatis tersimpan di cloud.', 'success');
      }
      notifyUI();
    } catch (err) {
      showMsg(err.message || 'Gagal autentikasi ke Supabase.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCloudStudio = () => {
    if (!cloudStudio) return;
    setS(cloudStudio);
    save();
    if (cloudStudio.th) updateThemeColors(cloudStudio.th);
    audio.playLevelUp();
    log(`Studio "${cloudStudio.co}" berhasil dimuat dari Cloud Supabase!`);
    notifyUI();
    onStart();
  };

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

  const handleGo = async () => {
    audio.playLevelUp();
    const studioName = name.trim() || (user ? 'Studio ' + user.email.split('@')[0] : 'Studio Baru');
    startGame(studioName);

    // Jika sudah login, langsung amankan ke cloud Supabase
    if (user && S) {
      try {
        await saveGameStateToCloud(S);
        log('🏢 Studio baru berhasil dibuat dan disimpan di Cloud Supabase!');
      } catch (e) {
        console.warn('Gagal initial cloud save:', e);
      }
    } else {
      log('🏢 Studio dimulai dalam Mode Tamu (Lokal). Sambungkan akun kapan saja lewat tombol ☁️.');
    }

    onStart();
  };

  return (
    <div id="intro">
      <h1>Kantor Virtual Tycoon</h1>
      <p style={{ margin: '4px 0 16px' }}>
        Mulai dari satu meja kerja. Selesaikan tugas, kembangkan tim, dan bangun studio impianmu.
      </p>

      {/* Cloud Session Banner (Jika sudah login) */}
      {user ? (
        <div className="card" style={{ background: 'var(--gd-subtle)', borderColor: 'var(--gd)', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b style={{ color: 'var(--gd)' }}>☁️ Terhubung ke Supabase</b>
              <div style={{ fontSize: '12px', color: 'var(--ink)' }}>{user.email}</div>
            </div>
            <span className="bd g">Akun Cloud Aktif</span>
          </div>

          {cloudStudio ? (
            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--sf)', borderRadius: 'var(--r-md)', border: '1px solid var(--ln)' }}>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>🏢 Studio Tersimpan di Cloud:</div>
              <div style={{ fontSize: '12px', color: 'var(--mu)', margin: '4px 0 10px' }}>
                Nama: <strong>{cloudStudio.co}</strong> · Kas: <strong>{rp(cloudStudio.cash || 0)}</strong> · Reputasi: <strong>{cloudStudio.rep || 0}</strong>
              </div>
              <button
                type="button"
                className="p"
                style={{ width: '100%', minHeight: '40px' }}
                onClick={handleLoadCloudStudio}
              >
                ▶️ Lanjutkan Studio Cloud Ini
              </button>
            </div>
          ) : (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--mu)' }}>
              Studio yang Anda buat di bawah ini akan langsung otomatis tersimpan ke server database Supabase.
            </p>
          )}
        </div>
      ) : (
        /* Opsi Login / Register / Mode Tamu (Jika belum login) */
        <div className="card" style={{ marginBottom: '14px', background: 'var(--sf)' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button
              type="button"
              className={`tab-btn${authMode === 'register' ? ' active' : ''}`}
              style={{ flex: 1, fontSize: '12px', padding: '6px 8px' }}
              onClick={() => { setAuthMode('register'); audio.playClick(); }}
            >
              ☁️ Buat Akun Cloud
            </button>
            <button
              type="button"
              className={`tab-btn${authMode === 'login' ? ' active' : ''}`}
              style={{ flex: 1, fontSize: '12px', padding: '6px 8px' }}
              onClick={() => { setAuthMode('login'); audio.playClick(); }}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              className={`tab-btn${authMode === 'guest' ? ' active' : ''}`}
              style={{ flex: 1, fontSize: '12px', padding: '6px 8px' }}
              onClick={() => { setAuthMode('guest'); audio.playClick(); }}
            >
              👤 Mode Tamu
            </button>
          </div>

          {authMsg.text && (
            <div
              className="card"
              style={{
                marginBottom: '10px',
                padding: '8px 10px',
                fontSize: '12px',
                borderColor: authMsg.type === 'error' ? 'var(--dg)' : authMsg.type === 'success' ? 'var(--gd)' : 'var(--ac)',
                color: authMsg.type === 'error' ? 'var(--dg)' : authMsg.type === 'success' ? 'var(--gd)' : 'var(--ink)'
              }}
            >
              {authMsg.text}
            </div>
          )}

          {authMode !== 'guest' ? (
            <form onSubmit={handleAuthSubmit}>
              <div style={{ fontSize: '12px', color: 'var(--mu)', marginBottom: '8px' }}>
                {authMode === 'register'
                  ? 'Daftar agar progres tersimpan aman di server Supabase & bisa dibuka di perangkat lain.'
                  : 'Masuk dengan akun yang sudah pernah dibuat untuk memulihkan studio Anda.'}
              </div>

              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                required
                style={{ marginBottom: '8px', fontSize: '13px' }}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Kata sandi (min. 6 karakter)"
                value={password}
                required
                minLength={6}
                style={{ marginBottom: '8px', fontSize: '13px' }}
                onChange={e => setPassword(e.target.value)}
              />

              <button
                type="submit"
                className="p"
                style={{ width: '100%', minHeight: '38px', fontSize: '13px' }}
                disabled={loading}
              >
                {loading ? 'Menghubungkan...' : authMode === 'register' ? '☁️ Hubungkan & Buat Akun' : 'Masuk ke Akun Cloud'}
              </button>
            </form>
          ) : (
            <div style={{ background: 'var(--wn-subtle)', border: '1px solid var(--wn)', borderRadius: 'var(--r-sm)', padding: '10px' }}>
              <b style={{ color: 'var(--wn)', fontSize: '12.5px' }}>⚠️ Anda Memilih Mode Tamu</b>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink)' }}>
                Progres studio hanya disimpan di memori browser perangkat ini dan <strong>tidak tersimpan di database Supabase</strong>. Anda dapat menghubungkan akun kapan saja lewat tombol awan (☁️).
              </p>
            </div>
          )}
        </div>
      )}

      {/* FORM PEMBUATAN STUDIO BARU */}
      <div className="card" style={{ background: 'var(--sf)' }}>
        <b style={{ fontSize: '14px', display: 'block', marginBottom: '10px' }}>
          {user ? '✨ Buat Studio untuk Akun Anda' : '🏢 Pengaturan Studio Baru'}
        </b>

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
        style={{ marginTop: '16px', minHeight: '46px', fontSize: '15px', fontWeight: 700 }}
        onClick={handleGo}
      >
        {user ? '☁️ Mulai Studio & Simpan ke Cloud' : 'Mulai Petualangan Studio (Mode Tamu)'}
      </button>

      <p style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--mu)' }}>
        {user ? (
          <span style={{ color: 'var(--gd)', fontWeight: 600 }}>
            ✅ Progres studio Anda akan tersimpan aman di server database Supabase.
          </span>
        ) : (
          <span>
            ℹ️ Ingin tersimpan di server Supabase? Gunakan tombol <strong>Buat Akun Cloud</strong> di atas atau tombol ☁️ saat bermain.
          </span>
        )}
      </p>
    </div>
  );
}
