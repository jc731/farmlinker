import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const { id } = params;
  const { supabase, profile } = locals;
  if (!id || !profile) return redirect('/app/listings', 302);

  // Unarchive → back to draft so the owner can review and resubmit
  await supabase
    .from('listings')
    .update({ status: 'draft' })
    .eq('id', id)
    .eq('owner_profile_id', profile.id)
    .eq('status', 'archived');

  return redirect(`/app/listings/${id}`, 302);
};
