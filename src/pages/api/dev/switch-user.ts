import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Only active in development — this route does not exist in production builds.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!import.meta.env.DEV && !import.meta.env.PUBLIC_ENABLE_DEV_TOOLS) return new Response('Not found', { status: 404 });

  const form   = await request.formData();
  const email  = form.get('email')?.toString();
  const to     = form.get('redirect')?.toString() ?? '/app';

  if (!email) return redirect(to, 302);

  const supabase = createSupabaseServerClient(request, cookies);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: 'devpass123',
  });

  if (error) {
    console.error('[dev] switch-user failed:', error.message);
    return redirect(`/auth/sign-in`, 302);
  }

  return redirect(to, 302);
};
