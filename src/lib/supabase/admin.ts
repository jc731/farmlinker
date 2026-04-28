import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasses RLS. Server-side only.
export function createSupabaseAdminClient() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
