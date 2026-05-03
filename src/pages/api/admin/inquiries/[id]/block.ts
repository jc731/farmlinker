import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const { profile } = locals;
  if (!profile?.roles.includes('admin')) return redirect('/app', 302);

  const { id } = params;
  if (!id) return new Response('Missing id', { status: 400 });

  const admin = createSupabaseAdminClient();
  await admin.from('inquiries').update({ status: 'blocked' }).eq('id', id);

  return redirect(`/admin/inquiries/${id}`, 302);
};
