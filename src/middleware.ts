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

  const isAppRoute = pathname.startsWith('/app');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // Redirect already-authenticated users away from auth pages
  if (isAuthRoute && user) {
    return redirect('/app');
  }

  // Require authentication for /app and /admin
  if ((isAppRoute || isAdminRoute) && !user) {
    return redirect('/auth/sign-in');
  }

  // Fetch profile for protected routes
  if ((isAppRoute || isAdminRoute) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, roles, status, first_name, last_name')
      .eq('id', user.id)
      .single();

    // Suspended users are signed out immediately
    if (profile?.status === 'suspended') {
      await supabase.auth.signOut();
      return redirect('/auth/sign-in?error=suspended');
    }

    locals.profile = profile;

    // Admin routes require the admin role
    if (isAdminRoute && !profile?.roles.includes('admin')) {
      return redirect('/app');
    }
  }

  return next();
});
