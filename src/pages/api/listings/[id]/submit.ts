import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const { user, supabase } = locals;
  const { id } = params;
  if (!user || !id) return redirect('/app', 302);

  // RLS allows update only while status is draft or rejected;
  // the additional eq('status', 'draft') prevents re-submitting rejected listings without editing
  await supabase
    .from('listings')
    .update({ status: 'pending', rejection_reason: null })
    .eq('id', id)
    .eq('owner_profile_id', user.id)
    .eq('status', 'draft');

  return redirect(`/app/listings/${id}`, 302);
};
