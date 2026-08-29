import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client dengan service_role key — akses penuh, melewati Row Level Security.
 * JANGAN PERNAH diimpor di client component atau file yang berjalan di browser.
 * Hanya dipakai di API routes / server actions untuk operasi admin
 * seperti membuat user baru.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
