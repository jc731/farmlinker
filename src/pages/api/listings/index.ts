import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { data, error } = await supabase
    .from('listings')
    .insert({ ...body, owner_profile_id: user.id })
    .select('id')
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ id: data.id }, 201);
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
