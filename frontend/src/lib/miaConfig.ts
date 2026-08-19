/** Reikn cloud configuration for sync + auth */

export const MIA_API_URL = (
  process.env.NEXT_PUBLIC_MIA_API_URL || 'https://www.m-ia.app'
).replace(/\/$/, '');

export const MIA_SUPABASE_URL =
  process.env.NEXT_PUBLIC_MIA_SUPABASE_URL ||
  'https://idlhouaracvkzqtklzbp.supabase.co';

export const MIA_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_MIA_SUPABASE_ANON_KEY || '';
