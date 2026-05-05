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

  const isAppRoute    = pathname.startsWith('/app');
  const isAdminRoute  = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAuthRoute   = AUTH_ROUTES.some(r => pathname.startsWith(r));
  const isOnboarding  = pathname.startsWith('/app/onboarding');

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

      if (needsFarmer || (isIncomplete && profile.roles.includes('farmer')))    return redirect('/app/onboarding/farmer');
      if (needsLandowner || (isIncomplete && profile.roles.includes('landowner'))) return redirect('/app/onboarding/landowner');
    }
  }

  return next();
});
