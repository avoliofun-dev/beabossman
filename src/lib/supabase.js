// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'ktycoon_supabase_config';

export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) return parsed;
    }
  } catch (e) {}

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('placeholder')) {
    return { url: envUrl, key: envKey };
  }

  return { url: '', key: '' };
}

let clientInstance = null;

export function initSupabase() {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      clientInstance = createClient(url, key);
      return clientInstance;
    } catch (e) {
      console.warn('Gagal inisialisasi Supabase:', e);
      clientInstance = null;
    }
  }
  return null;
}

export function getSupabase() {
  if (!clientInstance) {
    initSupabase();
  }
  return clientInstance;
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

export function saveSupabaseConfig(url, key) {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  if (cleanUrl && cleanKey) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: cleanUrl, key: cleanKey }));
  } else {
    localStorage.removeItem(CONFIG_KEY);
  }
  clientInstance = null;
  return initSupabase();
}

export async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data: { session } } = await client.auth.getSession();
    return session?.user || null;
  } catch (e) {
    return null;
  }
}

export async function signIn(email, password) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const client = getSupabase();
  if (client) {
    await client.auth.signOut();
  }
}

/**
 * Menyimpan seluruh game state ke Supabase metadata pengguna dan mendaftarkan studio ke tabel companies.
 */
export async function saveGameStateToCloud(state) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase belum terhubung.');
  const user = await getCurrentUser();
  if (!user) throw new Error('Silakan masuk (login) terlebih dahulu.');

  const nowIso = new Date().toISOString();

  // 1. Simpan state JSON ke metadata akun pengguna
  const { data: updateData, error: updateError } = await client.auth.updateUser({
    data: {
      game_state: state,
      last_saved: nowIso
    }
  });

  if (updateError) throw updateError;

  // 2. Hubungkan juga ke tabel companies Supabase jika tersedia
  try {
    if (state.co) {
      await client.rpc('start_game', {
        p_name: state.co,
        p_theme: state.th || 'agensi'
      });
    }
  } catch (rpcErr) {
    // RPC optional / non-blocking jika skema berbeda
    console.debug('Cloud sync RPC info:', rpcErr);
  }

  return { success: true, timestamp: nowIso, user: updateData.user };
}

/**
 * Mengambil game state yang tersimpan di cloud Supabase
 */
export async function loadGameStateFromCloud() {
  const client = getSupabase();
  if (!client) throw new Error('Supabase belum terhubung.');
  const user = await getCurrentUser();
  if (!user) return null;

  const metadata = user.user_metadata || {};
  return {
    state: metadata.game_state || null,
    lastSaved: metadata.last_saved || null,
    user
  };
}

let autoSaveTimer = null;
/**
 * Menyimpan secara otomatis ke cloud di latar belakang dengan debounce
 */
export function triggerAutoCloudSave(state, debounceMs = 12000) {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    try {
      const client = getSupabase();
      if (!client) return;
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user || !state) return;
      await saveGameStateToCloud(state);
      console.log('Cloud auto-save: Progres berhasil tersimpan di Supabase.');
    } catch (e) {
      console.warn('Auto cloud save skipped:', e?.message);
    }
  }, debounceMs);
}
