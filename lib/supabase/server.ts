import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

export function createServerSupabaseClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminSupabaseClient() {
  const { supabaseUrl, supabaseSecretKey } = getSupabaseEnv();

  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
