function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

export function getSupabaseEnv() {
  return {
    supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  };
}
