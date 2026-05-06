import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const { supabase, profile } = locals;
  if (!profile) return redirect('/auth/sign-in', 302);

  const form = await request.formData();

  const get  = (key: string) => form.get(key)?.toString().trim() || null;
  const getArr = (key: string): string[] =>
    form.getAll(key).map(v => v.toString().trim()).filter(Boolean);

  // ── Base profile ────────────────────────────────────────────────────────────
  await supabase.from('profiles').update({
    first_name: get('first_name') ?? '',
    last_name:  get('last_name')  ?? '',
    phone:      get('phone'),
    address:    get('address'),
    city:       get('city'),
    state:      get('state') ?? 'IL',
    zip:        get('zip'),
  }).eq('id', profile.id);

  // ── Farmer profile ──────────────────────────────────────────────────────────
  if (profile.roles.includes('farmer')) {
    await supabase.from('farmer_profiles').upsert({
      profile_id:             profile.id,
      farming_status:         get('farming_status'),
      farming_plans_and_goals:get('farming_plans_and_goals'),
      farmable_acreage_range: get('farmable_acreage_range'),
      business_plan_status:   get('business_plan_status'),
      business_plan_summary:  get('business_plan_summary'),
      referral_source:        get('referral_source'),
      counties:               getArr('counties'),
      tenure_options_desired: getArr('tenure_options_desired'),
      crops:                  getArr('crops'),
      livestock:              getArr('livestock'),
      farming_methods:        getArr('farming_methods'),
      infrastructure_needed:  getArr('infrastructure_needed'),
      experience_education:   getArr('experience_education'),
    });
  }

  // ── Landowner profile + demographics ────────────────────────────────────────
  if (profile.roles.includes('landowner')) {
    await supabase.from('landowner_profiles').upsert({
      profile_id:      profile.id,
      referral_source: get('referral_source'),
    });

    await supabase.from('landowner_demographics').upsert({
      profile_id:       profile.id,
      gender:           get('lo_gender'),
      age_range:        get('lo_age_range'),
      veteran_status:   get('lo_veteran_status'),
      ethnicity:        get('lo_ethnicity'),
      race:             getArr('lo_race'),
      disability_status:get('lo_disability_status'),
    });
  }

  return redirect('/app/profile?saved=1', 302);
};
