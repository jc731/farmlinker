import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  if (!id) return redirect('/admin/users', 302);

  const form     = await request.formData();
  const returnTo = form.get('return_to')?.toString() || `/admin/users/${id}`;

  const admin = createSupabaseAdminClient();
  await admin.from('profiles').update({ status: 'rejected' }).eq('id', id);

  return redirect(returnTo, 302);
};
