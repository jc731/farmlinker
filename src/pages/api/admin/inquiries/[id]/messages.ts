import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

// POST — admin sends a message in any inquiry thread
export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const { profile } = locals;
  if (!profile?.roles.includes('admin')) return redirect('/app', 302);

  const { id } = params;
  if (!id) return new Response('Missing id', { status: 400 });

  const form = await request.formData();
  const body = form.get('body')?.toString().trim();
  if (!body) return redirect(`/admin/inquiries/${id}`, 302);

  const admin = createSupabaseAdminClient();
  await admin.from('inquiry_messages').insert({
    inquiry_id:        id,
    sender_profile_id: profile.id,
    body,
  });

  return redirect(`/admin/inquiries/${id}`, 302);
};
