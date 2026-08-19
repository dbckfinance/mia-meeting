/**
 * Supabase auth for Reikn (Tauri).
 * Session persisted via @tauri-apps/plugin-store when available, else localStorage.
 */

import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import { MIA_SUPABASE_ANON_KEY, MIA_SUPABASE_URL } from './miaConfig';

const STORE_KEY = 'mia_auth_session';
const LS_KEY = 'mia-meeting-supabase-session';

let client: SupabaseClient | null = null;

async function loadStoredSession(): Promise<Session | null> {
  try {
    const { load } = await import('@tauri-apps/plugin-store');
    const store = await load('mia-auth.json', { autoSave: true });
    const raw = await store.get<string>(STORE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    /* browser / store unavailable */
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    /* ignore */
  }
  return null;
}

async function persistSession(session: Session | null) {
  const payload = session ? JSON.stringify(session) : null;
  try {
    const { load } = await import('@tauri-apps/plugin-store');
    const store = await load('mia-auth.json', { autoSave: true });
    if (payload) await store.set(STORE_KEY, payload);
    else await store.delete(STORE_KEY);
    await store.save();
  } catch {
    /* ignore */
  }
  try {
    if (payload) localStorage.setItem(LS_KEY, payload);
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

export function getMiaSupabase(): SupabaseClient {
  if (!client) {
    if (!MIA_SUPABASE_ANON_KEY) {
      console.warn('[miaAuth] NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY is not set');
    }
    client = createClient(MIA_SUPABASE_URL, MIA_SUPABASE_ANON_KEY || 'missing', {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export async function restoreMiaSession(): Promise<Session | null> {
  const supabase = getMiaSupabase();
  const stored = await loadStoredSession();
  if (!stored?.access_token) return null;
  const { data, error } = await supabase.auth.setSession({
    access_token: stored.access_token,
    refresh_token: stored.refresh_token,
  });
  if (error || !data.session) {
    await persistSession(null);
    return null;
  }
  await persistSession(data.session);
  return data.session;
}

export async function signInMia(email: string, password: string): Promise<{ user: User; session: Session }> {
  const supabase = getMiaSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.session || !data.user) {
    throw new Error(error?.message || 'Connexion impossible');
  }
  await persistSession(data.session);
  return { user: data.user, session: data.session };
}

export async function signOutMia(): Promise<void> {
  const supabase = getMiaSupabase();
  await supabase.auth.signOut();
  await persistSession(null);
}

export async function getMiaAccessToken(): Promise<string | null> {
  const supabase = getMiaSupabase();
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    await persistSession(data.session);
    return data.session.access_token;
  }
  const restored = await restoreMiaSession();
  return restored?.access_token || null;
}

export async function getMiaUser(): Promise<User | null> {
  const supabase = getMiaSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

// Keep store in sync on auth changes
export function subscribeMiaAuth(onChange: (session: Session | null) => void) {
  const supabase = getMiaSupabase();
  const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
    await persistSession(session);
    onChange(session);
  });
  return () => sub.subscription.unsubscribe();
}
