import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  if (!id) return redirect('/admin/review/listings', 302);

  const form   = await request.formData();
  const reason = form.get('reason')?.toString().trim() ?? '';

  const admin = createSupabaseAdminClient();
  await admin
    .from('listings')
    .update({ status: 'rejected', rejection_reason: reason || null })
    .eq('id', id);

  return redirect(`/admin/listings/${id}`, 302);
};
