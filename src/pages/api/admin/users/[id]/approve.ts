import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const POST: APIRoute = async ({ params, redirect }) => {
  const { id } = params;
  if (!id) return redirect('/admin/users', 302);

  const admin = createSupabaseAdminClient();
  await admin.from('profiles').update({ status: 'approved' }).eq('id', id);

  return redirect(`/admin/users/${id}`, 302);
};
