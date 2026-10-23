// src/components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import {
  isSupabaseConfigured, getSupabaseConfig, saveSupabaseConfig,
  getCurrentUser, signIn, signUp, signOutUser,
  saveGameStateToCloud, loadGameStateFromCloud
} from '../lib/supabase.js';
import { S, setS, save, rp } from '../game/state.js';
import { log, notifyUI } from '../game/engine.js';
import { updateThemeColors } from '../game/scene3d.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'config'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cloudInfo, setCloudInfo] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Supabase API Config states
  const cfg = getSupabaseConfig();
  const [url, setUrl] = useState(cfg.url);
  const [key, setKey] = useState(cfg.key);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const cloudData = await loadGameStateFromCloud();
        setCloudInfo(cloudData);
      } else {
        setCloudInfo(null);
      }
    } catch (e) {
      console.warn('Error checkUser:', e);
    }
  };

  const showMsg = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      audio.playLevelUp();
      log('Berhasil masuk dengan akun cloud!');
      const u = await getCurrentUser();
      setUser(u);
      const cloudData = await loadGameStateFromCloud();
      setCloudInfo(cloudData);

      if (cloudData?.state) {
        showMsg(`Berhasil masuk! Ditemukan data studio "${cloudData.state.co}" di cloud.`, 'info');
      } else if (S) {
        // Belum ada data di cloud, otomatis unggah data lokal saat ini
        await saveGameStateToCloud(S);
        showMsg('Berhasil masuk! Progres lokal Anda berhasil disimpan ke cloud.', 'success');
      }
      notifyUI();
    } catch (err) {
      showMsg(err.message || 'Gagal login. Periksa email dan kata sandi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signUp(email, password);
      audio.playLevelUp();
      log('Akun berhasil dibuat!');
      const u = await getCurrentUser();
      setUser(u);
      if (S) {
        await saveGameStateToCloud(S);
      }
      const cloudData = await loadGameStateFromCloud();
      setCloudInfo(cloudData);
      showMsg('Akun dibuat & progres langsung disinkronkan ke cloud!', 'success');
      notifyUI();
    } catch (err) {
      showMsg(err.message || 'Gagal mendaftar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setCloudInfo(null);
    audio.playClick();
    log('Keluar dari akun cloud.');
    showMsg('Anda telah keluar dari akun cloud.', 'info');
    notifyUI();
  };

  const handleManualSaveToCloud = async () => {
    if (!S) return;
    setLoading(true);
    try {
      const res = await saveGameStateToCloud(S);
      setCloudInfo(prev => ({
        ...prev,
        state: S,
        lastSaved: res.timestamp
      }));
      audio.playCoin();
      log('Progres studio berhasil diunggah ke cloud Supabase!');
      showMsg('Progres berhasil disimpan ke Cloud Supabase!', 'success');
    } catch (err) {
      showMsg(err.message || 'Gagal menyimpan ke cloud.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLoadFromCloud = async () => {
    setLoading(true);
    try {
      const cloudData = await loadGameStateFromCloud();
      if (!cloudData?.state) {
        showMsg('Belum ada data tersimpan di akun cloud ini.', 'error');
        return;
      }
      setS(cloudData.state);
      save(); // simpan juga ke local storage
      if (cloudData.state.th) {
        updateThemeColors(cloudData.state.th);
      }
      setCloudInfo(cloudData);
      audio.playLevelUp();
      log(`Progres studio "${cloudData.state.co}" berhasil dimuat dari cloud!`);
      showMsg('Progres studio berhasil dimuat dari cloud!', 'success');
      notifyUI();
    } catch (err) {
      showMsg(err.message || 'Gagal memuat dari cloud.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    audio.playClick();
    showMsg('Kredensial Supabase berhasil disimpan!', 'success');
    notifyUI();
  };

  const configured = isSupabaseConfigured();

  const formatTime = (iso) => {
    if (!iso) return 'Belum pernah';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ', ' +
             d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  };

  return (
    <div id="w-auth" className="win glass">
      <div className="wh">
        <b>
          <Icon name="users" size={18} />
          <span>Akun &amp; Cloud Sync Supabase</span>
        </b>
        <button type="button" data-x onClick={onClose} aria-label="Tutup jendela">
          <Icon name="close" size={16} />
        </button>
      </div>

      {msg.text && (
        <div
          className="card"
          style={{
            margin: '8px 0',
            padding: '8px 12px',
            fontSize: '12px',
            borderColor: msg.type === 'error' ? 'var(--dg)' : msg.type === 'success' ? 'var(--gd)' : 'var(--ac)',
            color: msg.type === 'error' ? 'var(--dg)' : msg.type === 'success' ? 'var(--gd)' : 'var(--ink)'
          }}
        >
          {msg.text}
        </div>
      )}

      {user ? (
        <div style={{ padding: '8px 0' }}>
          <div className="card ct" style={{ background: 'var(--gd-subtle)', borderColor: 'var(--gd)' }}>
            <div>
              <b style={{ color: 'var(--gd)' }}>☁️ Terhubung ke Cloud</b>
              <br />
              <small>{user.email}</small>
            </div>
            <span className="bd g">Aktif &amp; Auto-Sync</span>
          </div>

          <div className="card" style={{ marginTop: '12px' }}>
            <b style={{ fontSize: '13px' }}>Progres di Cloud</b>
            {cloudInfo?.state ? (
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--mu)', lineHeight: 1.5 }}>
                <div>🏢 Studio: <strong>{cloudInfo.state.co}</strong></div>
                <div>💰 Kas: <strong>{rp(cloudInfo.state.cash || 0)}</strong> · Reputasi: <strong>{cloudInfo.state.rep || 0}</strong></div>
                <div>🕒 Terakhir Disimpan: <strong>{formatTime(cloudInfo.lastSaved)}</strong></div>
              </div>
            ) : (
              <p style={{ margin: '6px 0', fontSize: '12px', color: 'var(--mu)' }}>
                Belum ada studio yang disimpan di cloud. Klik tombol simpan di bawah untuk mengunggah progres saat ini.
              </p>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="p"
                style={{ flex: '1 1 140px' }}
                disabled={loading || !S}
                onClick={handleManualSaveToCloud}
              >
                {loading ? 'Menyimpan...' : '☁️ Simpan ke Cloud'}
              </button>

              <button
                type="button"
                style={{ flex: '1 1 140px' }}
                disabled={loading || !cloudInfo?.state}
                onClick={handleManualLoadFromCloud}
              >
                📥 Muat dari Cloud
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: 'var(--mu)' }}>Mode Auto-Sync otomatis menyimpan setiap ada kemajuan.</small>
            <button
              type="button"
              className="danger"
              style={{ padding: '4px 10px', fontSize: '12px' }}
              onClick={handleLogout}
            >
              Keluar
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Segmented Control / Tabs */}
          <div className="tab-bar">
            <button
              type="button"
              className={`tab-btn${tab === 'login' ? ' active' : ''}`}
              onClick={() => setTab('login')}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`tab-btn${tab === 'register' ? ' active' : ''}`}
              onClick={() => setTab('register')}
            >
              Daftar
            </button>
            <button
              type="button"
              className={`tab-btn${tab === 'config' ? ' active' : ''}`}
              onClick={() => setTab('config')}
            >
              API Supabase
            </button>
          </div>

          {msg.text && (
            <div
              className="card"
              style={{
                marginBottom: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                borderColor: msg.type === 'error' ? 'var(--dg)' : msg.type === 'success' ? 'var(--gd)' : 'var(--ac)',
                color: msg.type === 'error' ? 'var(--dg)' : msg.type === 'success' ? 'var(--gd)' : 'var(--ink)'
              }}
            >
              {msg.text}
            </div>
          )}

          {!configured && tab !== 'config' && (
            <div className="card" style={{ borderColor: 'var(--wn)', background: 'var(--wn-subtle)', marginBottom: '12px' }}>
              <b style={{ color: 'var(--wn)' }}>⚠️ Supabase Belum Terhubung</b>
              <p style={{ margin: '4px 0 8px' }}>
                <small>
                  Masukkan Project URL &amp; Anon Key di tab <strong>API Supabase</strong> untuk mengaktifkan login dan penyimpanan cloud.
                </small>
              </p>
              <button type="button" onClick={() => setTab('config')}>
                Buka Pengaturan API
              </button>
            </div>
          )}

          {/* TAB MASUK */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
              />

              <label style={{ fontSize: '12px', fontWeight: 600 }}>Kata Sandi</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                required
                onChange={e => setPassword(e.target.value)}
              />

              <button
                type="submit"
                className="p"
                style={{ width: '100%', marginTop: '4px' }}
                disabled={loading || !configured}
              >
                {loading ? 'Memproses...' : 'Masuk ke Akun Cloud'}
              </button>
            </form>
          )}

          {/* TAB DAFTAR */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
              />

              <label style={{ fontSize: '12px', fontWeight: 600 }}>Kata Sandi (min. 6 karakter)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                required
                minLength={6}
                onChange={e => setPassword(e.target.value)}
              />

              <button
                type="submit"
                className="p"
                style={{ width: '100%', marginTop: '4px' }}
                disabled={loading || !configured}
              >
                {loading ? 'Membuat Akun...' : 'Daftar Akun Baru'}
              </button>
            </form>
          )}

          {/* TAB CONFIG */}
          {tab === 'config' && (
            <form onSubmit={handleSaveConfig}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--mu)' }}>
                Dapatkan kredensial dari dashboard Supabase Anda (<strong>Settings &gt; API</strong>). File skema SQL ada di <code>supabase_kantor_virtual_tycoon.sql</code>.
              </p>

              <label style={{ fontSize: '12px', fontWeight: 600 }}>Project URL</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />

              <label style={{ fontSize: '12px', fontWeight: 600 }}>Anon Public Key</label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={e => setKey(e.target.value)}
              />

              <button type="submit" className="p" style={{ width: '100%', marginTop: '4px' }}>
                Simpan Konfigurasi Supabase
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <small style={{ color: 'var(--mu)' }}>
              Tidak punya akun? Game tetap otomatis berjalan dalam <strong>Mode Tamu (Penyimpanan Lokal)</strong>.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
