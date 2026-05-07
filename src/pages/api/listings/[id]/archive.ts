import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const { id } = params;
  const { supabase, profile } = locals;
  if (!id || !profile) return redirect('/app/listings', 302);

  await supabase
    .from('listings')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('owner_profile_id', profile.id);

  return redirect(`/app/listings/${id}`, 302);
};
