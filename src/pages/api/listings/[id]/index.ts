import type { APIRoute } from 'astro';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { user, supabase } = locals;
  const { id } = params;
  if (!user || !id) return json({ error: 'Unauthorized' }, 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  // RLS enforces: owner can only update their own draft/rejected listings
  const { error } = await supabase
    .from('listings')
    .update(body)
    .eq('id', id)
    .eq('owner_profile_id', user.id);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { user, supabase } = locals;
  const { id } = params;
  if (!user || !id) return json({ error: 'Unauthorized' }, 401);

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('owner_profile_id', user.id)
    .eq('status', 'draft'); // only delete drafts

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
