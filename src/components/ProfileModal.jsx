// src/components/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import {
  S, setS, save, rp, TH, SHC, HRC, hx, pcol, setPcol, phair, setPhair
} from '../game/state.js';
import {
  getCurrentUser, loadGameStateFromCloud, saveGameStateToCloud, signOutUser, getSupabase
} from '../lib/supabase.js';
import { log, notifyUI } from '../game/engine.js';
import { updateThemeColors } from '../game/scene3d.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function ProfileModal({ onClose, onOpenAuth }) {
  const [tab, setTab] = useState('member'); // 'member' | 'studio' | 'cloud'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Profile Form States
  const founder = S?.emp ? S.emp[0] : null;
  const [memberName, setMemberName] = useState(founder ? founder.nm : 'Pendiri');
  const [studioName, setStudioName] = useState(S ? S.co : 'Studio Baru');
  const [bio, setBio] = useState(S?.bio || 'Membangun studio kreatif digital terdepan.');
  const [selectedTh, setSelectedTh] = useState(S?.th || 'agensi');
  const [selectedCol, setSelectedCol] = useState(founder?.col || pcol);
  const [selectedHair, setSelectedHair] = useState(founder?.hr || phair);
  const [cloudLastSaved, setCloudLastSaved] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const cloud = await loadGameStateFromCloud();
        if (cloud?.lastSaved) {
          setCloudLastSaved(cloud.lastSaved);
        }
        const meta = u.user_metadata || {};
        if (meta.member_name) setMemberName(meta.member_name);
        if (meta.bio) setBio(meta.bio);
      }
    } catch (e) {
      console.warn('Error loading user profile:', e);
    }
  };

  const showMsg = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4500);
  };

  const handleSelectCol = (c) => {
    audio.playClick();
    setSelectedCol(c);
    setPcol(c);
    if (founder) {
      founder.col = c;
    }
  };

  const handleSelectHair = (c) => {
    audio.playClick();
    setSelectedHair(c);
    setPhair(c);
    if (founder) {
      founder.hr = c;
    }
  };

  const handleSelectTheme = (k) => {
    audio.playClick();
    setSelectedTh(k);
    if (S) {
      S.th = k;
      updateThemeColors(k);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!S) return;
    setLoading(true);

    try {
      // 1. Update Game State Lokal
      const cleanCo = studioName.trim() || 'Studio Baru';
      const cleanMember = memberName.trim() || 'Pendiri';
      S.co = cleanCo;
      S.bio = bio.trim();
      S.th = selectedTh;
      if (founder) {
        founder.nm = cleanMember;
        founder.col = selectedCol;
        founder.hr = selectedHair;
      }
      save();
      updateThemeColors(selectedTh);

      // 2. Simpan ke Supabase Cloud jika terhubung
      if (user) {
        const client = getSupabase();
        if (client) {
          await client.auth.updateUser({
            data: {
              member_name: cleanMember,
              studio_name: cleanCo,
              bio: S.bio,
              avatar_color: selectedCol,
              hair_color: selectedHair,
              game_state: S,
              last_saved: new Date().toISOString()
            }
          });

          // Pastikan juga nama company di-update
          await saveGameStateToCloud(S);
          setCloudLastSaved(new Date().toISOString());
        }
      }

      audio.playLevelUp();
      log(`Profil berhasil diperbarui: ${cleanMember} · ${cleanCo}`);
      showMsg('Profil member dan studio berhasil disimpan!', 'success');
      notifyUI();
    } catch (err) {
      showMsg(err.message || 'Gagal menyimpan profil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    audio.playClick();
    log('Keluar dari akun Supabase.');
    showMsg('Anda telah keluar dari akun cloud.', 'info');
    notifyUI();
  };

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

  const avatarBg = hx(selectedCol);
  const hairBg = hx(selectedHair);

  return (
    <div id="w-prof" className="win glass">
      <div className="wh">
        <b>
          <Icon name="user" size={18} />
          <span>Profil &amp; Identitas Studio</span>
        </b>
        <button type="button" data-x onClick={onClose} aria-label="Tutup jendela profil">
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* Header Kartu Profil Ringkas */}
      <div
        className="card ct"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(16, 185, 129, 0.08))',
          borderColor: 'var(--ac)',
          marginTop: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar Visualizer */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: avatarBg,
              border: `3px solid ${hairBg}`,
              boxShadow: 'var(--sh-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {memberName.charAt(0).toUpperCase()}
          </div>
          <div>
            <b style={{ fontSize: '15px' }}>{memberName}</b>
            <div style={{ fontSize: '12px', color: 'var(--mu)', marginTop: '1px' }}>
              CEO &amp; Pendiri · <strong>{studioName}</strong>
            </div>
            <div style={{ fontSize: '11px', color: user ? 'var(--gd)' : 'var(--wn)', marginTop: '2px', fontWeight: 600 }}>
              {user ? `☁️ Member Supabase (${user.email})` : '⚠️ Mode Tamu (Lokal)'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="tab-bar" style={{ marginTop: '10px' }}>
        <button
          type="button"
          className={`tab-btn${tab === 'member' ? ' active' : ''}`}
          onClick={() => { setTab('member'); audio.playClick(); }}
        >
          👤 Member CEO
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'studio' ? ' active' : ''}`}
          onClick={() => { setTab('studio'); audio.playClick(); }}
        >
          🏢 Studio &amp; Tema
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'cloud' ? ' active' : ''}`}
          onClick={() => { setTab('cloud'); audio.playClick(); }}
        >
          ☁️ Cloud Supabase
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

      {/* TAB 1: MEMBER CEO */}
      {tab === 'member' && (
        <form onSubmit={handleSaveProfile} style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Nama Lengkap / Panggilan
          </label>
          <input
            type="text"
            maxLength={24}
            value={memberName}
            placeholder="mis. Narendra"
            required
            onChange={e => setMemberName(e.target.value)}
          />

          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', margin: '10px 0 4px' }}>
            Peran &amp; Jabatan
          </label>
          <input
            type="text"
            value="Founder &amp; Chief Executive Officer"
            disabled
            style={{ opacity: 0.75, cursor: 'not-allowed' }}
          />

          <p style={{ margin: '12px 0 6px', fontWeight: 600, fontSize: '12px' }}>
            Kustomisasi Karakter Pendiri 3D:
          </p>

          <small style={{ display: 'block', marginBottom: '4px', color: 'var(--mu)' }}>Warna Baju Kerja</small>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {SHC.map((c) => (
              <button
                key={c}
                type="button"
                className={`sw${c === selectedCol ? ' sel' : ''}`}
                style={{
                  background: hx(c),
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: c === selectedCol ? '2px solid var(--ink)' : '1px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectCol(c)}
              />
            ))}
          </div>

          <small style={{ display: 'block', marginBottom: '4px', color: 'var(--mu)' }}>Warna Rambut</small>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {HRC.map((c) => (
              <button
                key={c}
                type="button"
                className={`sw${c === selectedHair ? ' sel' : ''}`}
                style={{
                  background: hx(c),
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: c === selectedHair ? '2px solid var(--ink)' : '1px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectHair(c)}
              />
            ))}
          </div>

          <button
            type="submit"
            className="p"
            style={{ width: '100%', minHeight: '42px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Perubahan Profil'}
          </button>
        </form>
      )}

      {/* TAB 2: STUDIO & TEMA */}
      {tab === 'studio' && (
        <form onSubmit={handleSaveProfile} style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Nama Studio Bisnis
          </label>
          <input
            type="text"
            maxLength={24}
            value={studioName}
            placeholder="mis. Studio Laras"
            required
            onChange={e => setStudioName(e.target.value)}
          />

          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', margin: '10px 0 4px' }}>
            Slogan / Motto Studio
          </label>
          <input
            type="text"
            maxLength={60}
            value={bio}
            placeholder="Slogan atau deskripsi singkat studio Anda"
            onChange={e => setBio(e.target.value)}
          />

          <p style={{ margin: '12px 0 6px', fontWeight: 600, fontSize: '12px' }}>
            Pilih Tema &amp; Suasana Kantor 3D:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {Object.keys(TH).map((k) => (
              <button
                key={k}
                type="button"
                className={`thb${k === selectedTh ? ' sel' : ''}`}
                style={{ textAlign: 'left', padding: '10px 12px', cursor: 'pointer' }}
                onClick={() => handleSelectTheme(k)}
              >
                <b>{TH[k].n}</b>
                <br />
                <small style={{ color: 'var(--mu)' }}>{TH[k].d}</small>
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="p"
            style={{ width: '100%', minHeight: '42px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : '💾 Terapkan & Simpan Profil Studio'}
          </button>
        </form>
      )}

      {/* TAB 3: CLOUD SUPABASE */}
      {tab === 'cloud' && (
        <div style={{ marginTop: '8px' }}>
          {user ? (
            <div>
              <div className="card ct" style={{ background: 'var(--gd-subtle)', borderColor: 'var(--gd)' }}>
                <div>
                  <b style={{ color: 'var(--gd)' }}>✅ Akun Member Terverifikasi</b>
                  <div style={{ fontSize: '12px', color: 'var(--ink)' }}>{user.email}</div>
                  <div style={{ fontSize: '11px', color: 'var(--mu)', marginTop: '2px' }}>
                    User ID: <code>{user.id.slice(0, 8)}...{user.id.slice(-4)}</code>
                  </div>
                </div>
                <span className="bd g">Terhubung</span>
              </div>

              <div className="card" style={{ marginTop: '10px' }}>
                <b style={{ fontSize: '13px' }}>Sinkronisasi Database Supabase</b>
                <div style={{ fontSize: '12px', color: 'var(--mu)', marginTop: '6px', lineHeight: 1.6 }}>
                  <div>🏢 Studio Terdaftar: <strong>{S?.co || studioName}</strong></div>
                  <div>💰 Saldo Kas: <strong>{rp(S?.cash || 0)}</strong> · Reputasi: <strong>{S?.rep || 0}</strong></div>
                  <div>🕒 Terakhir Disimpan: <strong>{formatTime(cloudLastSaved)}</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="p"
                    style={{ flex: 1, minHeight: '38px' }}
                    disabled={loading}
                    onClick={handleSaveProfile}
                  >
                    {loading ? 'Menyinkronkan...' : '☁️ Sync ke Cloud Sekarang'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  className="danger"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                  onClick={handleLogout}
                >
                  Keluar dari Akun (Logout)
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ background: 'var(--wn-subtle)', borderColor: 'var(--wn)' }}>
              <b style={{ color: 'var(--wn)' }}>⚠️ Belum Terhubung ke Supabase</b>
              <p style={{ margin: '6px 0 12px', fontSize: '12px', color: 'var(--ink)', lineHeight: 1.5 }}>
                Studio Anda saat ini masih berada dalam Mode Tamu. Sambungkan akun sekarang agar progres tersimpan aman di database Supabase dan dapat dimainkan dari perangkat lain.
              </p>
              <button
                type="button"
                className="p"
                style={{ width: '100%', minHeight: '40px' }}
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
              >
                ☁️ Masuk / Daftar Akun Member Supabase
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
