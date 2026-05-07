type SupabaseClientLike = unknown;

function hasPublicEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function hasServiceEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function loadSupabaseJs() {
  try {
    return (await import("@supabase/supabase-js")) as unknown as {
      createClient: (url: string, key: string, opts?: unknown) => SupabaseClientLike;
    };
  } catch {
    return null;
  }
}

export async function getBrowserSupabaseClient(): Promise<SupabaseClientLike | null> {
  if (!hasPublicEnv()) return null;
  const mod = await loadSupabaseJs();
  if (!mod) return null;
  return mod.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function getServiceSupabaseClient(): Promise<SupabaseClientLike | null> {
  if (!hasServiceEnv()) return null;
  const mod = await loadSupabaseJs();
  if (!mod) return null;
  return mod.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

