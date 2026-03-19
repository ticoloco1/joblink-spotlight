import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Next.js: process.env.NEXT_PUBLIC_* | Vite: import.meta.env.VITE_*
function getSupabaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) return (import.meta as any).env.VITE_SUPABASE_URL;
  return '';
}
function getSupabaseAnonKey(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const im = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  if (im?.VITE_SUPABASE_PUBLISHABLE_KEY) return im.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (im?.VITE_SUPABASE_ANON_KEY) return im.VITE_SUPABASE_ANON_KEY;
  return '';
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();

export const isSupabaseConfigured =
  typeof SUPABASE_URL === 'string' &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  SUPABASE_ANON_KEY.length > 0;

// Importantly: during `next build` Next may execute server code without env vars
// (e.g. Vercel build before configuring Environment Variables). We must not crash
// at module import time; consumers should guard using `isSupabaseConfigured`.
export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : ({} as any);