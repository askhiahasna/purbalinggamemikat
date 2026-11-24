import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client SERVICE ROLE — hanya untuk server. Jangan pernah diimpor dari komponen client.

let client: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset.");
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";
