import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const POST: APIRoute = async ({ params, redirect }) => {
  const { id } = params;
  if (!id) return redirect('/admin/review/listings', 302);

  const admin = createSupabaseAdminClient();
  await admin
    .from('listings')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id);

  return redirect(`/admin/listings/${id}`, 302);
};
