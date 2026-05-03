import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const { supabase, profile } = locals;
  if (!profile) return redirect('/auth/sign-in', 302);

  const { id } = params;
  if (!id) return new Response('Missing id', { status: 400 });

  await supabase
    .from('inquiries')
    .update({ status: 'closed' })
    .eq('id', id);

  return redirect(`/app/inquiries/${id}`, 302);
};
