import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up', '/auth/reset-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, locals, redirect, url } = context;
  const pathname = url.pathname;

  const supabase = createSupabaseServerClient(request, cookies);
  locals.supabase = supabase;

  const { data: { user } } = await supabase.auth.getUser();
  locals.user = user;
  locals.profile = null;

  const isAppRoute      = pathname.startsWith('/app');
  const isAdminRoute    = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAuthRoute     = AUTH_ROUTES.some(r => pathname.startsWith(r));
  const isOnboarding    = pathname.startsWith('/app/onboarding');
  const isListingsArea  = pathname.startsWith('/app/listings');

  if (isAuthRoute && user) {
    return redirect('/app');
  }

  if ((isAppRoute || isAdminRoute) && !user) {
    return redirect('/auth/sign-in');
  }

  if ((isAppRoute || isAdminRoute) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, roles, status, first_name, last_name, farmer_profiles(profile_id), landowner_profiles(profile_id)')
      .eq('id', user.id)
      .single();

    if (profile?.status === 'suspended') {
      await supabase.auth.signOut();
      return redirect('/auth/sign-in?error=suspended');
    }

    locals.profile = profile;

    if (isAdminRoute && !profile?.roles.includes('admin')) {
      return redirect('/app');
    }

    // Redirect to onboarding if profile is incomplete or the role extension row
    // hasn't been created yet. Admins are exempt — they have no onboarding.
    if (isAppRoute && !isOnboarding && profile && !profile.roles.includes('admin')) {
      const needsFarmer    = profile.roles.includes('farmer')    && profile.farmer_profiles.length    === 0;
      const needsLandowner = profile.roles.includes('landowner') && profile.landowner_profiles.length === 0;
      const isIncomplete   = profile.status === 'incomplete';
      const isLandowner    = profile.roles.includes('landowner');

      if (needsFarmer || (isIncomplete && profile.roles.includes('farmer'))) return redirect('/app/onboarding/farmer');
      if (needsLandowner) return redirect('/app/onboarding/landowner');
      // Landowner completed their profile form but hasn't submitted a listing yet.
      // Allow /app/listings/* so they can reach a draft listing and submit it.
      if (!isListingsArea && isIncomplete && isLandowner) return redirect('/app/listings/new?onboarding=1');
    }
  }

  return next();
});
