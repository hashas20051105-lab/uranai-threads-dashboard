import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(value: string | undefined) {
  if (!value) return undefined;
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export function createBrowserSupabaseClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const isBrowserSupabaseConfigured = Boolean(
  normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
