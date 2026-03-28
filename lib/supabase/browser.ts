"use client";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  return createClient(supabaseUrl, supabasePublishableKey);
}
