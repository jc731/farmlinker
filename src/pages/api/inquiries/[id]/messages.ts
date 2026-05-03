import type { APIRoute } from 'astro';

// POST — add a message to an existing open inquiry
export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const { supabase, profile } = locals;
  if (!profile) return redirect('/auth/sign-in', 302);

  const { id } = params;
  if (!id) return new Response('Missing id', { status: 400 });

  const form = await request.formData();
  const body = form.get('body')?.toString().trim();
  if (!body) return redirect(`/app/inquiries/${id}`, 302);

  const { error } = await supabase.from('inquiry_messages').insert({
    inquiry_id:        id,
    sender_profile_id: profile.id,
    body,
  });

  if (error) return new Response('Failed to send message', { status: 500 });

  return redirect(`/app/inquiries/${id}`, 302);
};
