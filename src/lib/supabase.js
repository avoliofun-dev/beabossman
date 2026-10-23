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
