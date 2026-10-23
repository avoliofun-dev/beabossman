// src/components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import {
  isSupabaseConfigured, getSupabaseConfig, saveSupabaseConfig,
  getCurrentUser, signIn, signUp, signOutUser
} from '../lib/supabase.js';
import { log, notifyUI } from '../game/engine.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'config'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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
    const u = await getCurrentUser();
    setUser(u);
  };

  const showMsg = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      audio.playLevelUp();
      log('Berhasil masuk dengan akun cloud!');
      await checkUser();
      showMsg('Berhasil masuk! Progres kini tersinkronisasi.', 'success');
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
      await checkUser();
      showMsg('Akun dibuat! Silakan cek email jika butuh verifikasi.', 'success');
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
    audio.playClick();
    log('Keluar dari akun cloud.');
    showMsg('Anda telah keluar dari akun cloud.', 'info');
    notifyUI();
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    audio.playClick();
    showMsg('Kredensial Supabase berhasil disimpan!', 'success');
    notifyUI();
  };

  const configured = isSupabaseConfigured();

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

      {user ? (
        <div style={{ padding: '8px 0' }}>
          <div className="card ct" style={{ background: 'var(--gd-subtle)', borderColor: 'var(--gd)' }}>
            <div>
              <b style={{ color: 'var(--gd)' }}>☁️ Terhubung ke Cloud</b>
              <br />
              <small>{user.email}</small>
            </div>
            <span className="bd g">Aktif</span>
          </div>

          <div className="card" style={{ marginTop: '12px' }}>
            <b>Status Sinkronisasi</b>
            <p>
              <small>
                Progres studio Anda kini tersimpan aman di server database Supabase. Anda dapat melanjutkan permainan ini dari browser atau perangkat lain.
              </small>
            </p>
            <button
              type="button"
              className="danger"
              style={{ marginTop: '8px' }}
              onClick={handleLogout}
            >
              Keluar (Logout)
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
