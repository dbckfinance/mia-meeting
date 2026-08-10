'use client';

import React, { useEffect, useState } from 'react';
import {
  getMiaUser,
  restoreMiaSession,
  signInMia,
  signOutMia,
  subscribeMiaAuth,
} from '@/lib/miaAuth';
import { MIA_API_URL, MIA_SUPABASE_ANON_KEY } from '@/lib/miaConfig';
import type { User } from '@supabase/supabase-js';

export function MiaAccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await restoreMiaSession();
        const u = await getMiaUser();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const unsub = subscribeMiaAuth((session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!MIA_SUPABASE_ANON_KEY) {
        throw new Error('Clé Supabase manquante — configurez NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY');
      }
      const { user: u } = await signInMia(email, password);
      setUser(u);
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    try {
      await signOutMia();
      setUser(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Chargement du compte M&IA…</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Compte M&IA</h2>
        <p className="text-sm text-gray-500 mt-1">
          Connectez-vous pour envoyer les transcripts vers {MIA_API_URL} (résumés M&A + Supercomputer).
          La transcription reste locale tant que vous ne synchronisez pas.
        </p>
      </div>

      {!MIA_SUPABASE_ANON_KEY && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Définissez <code className="text-xs">NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY</code> dans{' '}
          <code className="text-xs">frontend/.env.local</code>.
        </div>
      )}

      {user ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <p className="text-sm text-gray-700">
            Connecté : <span className="font-medium">{user.email}</span>
          </p>
          <button
            type="button"
            onClick={onLogout}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <form onSubmit={onLogin} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Connexion…' : 'Se connecter à M&IA'}
          </button>
        </form>
      )}
    </div>
  );
}
