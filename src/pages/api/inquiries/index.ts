import type { APIRoute } from 'astro';

// POST — create a new inquiry + first message
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const { supabase, profile } = locals;
  if (!profile) return redirect('/auth/sign-in', 302);

  const form = await request.formData();
  const listingId = form.get('listing_id')?.toString().trim();
  const body      = form.get('body')?.toString().trim();

  if (!listingId || !body) return new Response('Missing fields', { status: 400 });

  // Fetch listing to get owner_profile_id
  const { data: listing } = await supabase
    .from('listings')
    .select('id, owner_profile_id')
    .eq('id', listingId)
    .eq('status', 'approved')
    .single();

  if (!listing) return new Response('Listing not found', { status: 404 });
  if (listing.owner_profile_id === profile.id) {
    return new Response('Cannot send inquiry to yourself', { status: 400 });
  }

  // Check for existing inquiry (unique constraint: listing + from_profile)
  const { data: existing } = await supabase
    .from('inquiries')
    .select('id')
    .eq('listing_id', listingId)
    .eq('from_profile_id', profile.id)
    .maybeSingle();

  let inquiryId: string;

  if (existing) {
    inquiryId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from('inquiries')
      .insert({
        listing_id:      listingId,
        from_profile_id: profile.id,
        to_profile_id:   listing.owner_profile_id,
      })
      .select('id')
      .single();

    if (error || !created) return new Response('Failed to create inquiry', { status: 500 });
    inquiryId = created.id;
  }

  // Insert the message
  await supabase.from('inquiry_messages').insert({
    inquiry_id:        inquiryId,
    sender_profile_id: profile.id,
    body,
  });

  return redirect(`/app/inquiries/${inquiryId}`, 302);
};
