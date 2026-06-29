const AUTH_ERROR_MESSAGES: Record<string, string> = {
  missing_code:
    'Sign-in was interrupted. Please try again.',
  supabase_not_configured:
    'Supabase is not configured. Check your .env.local file.',
  'Invalid login credentials':
    'Wrong email or password. If you are new, create an account first.',
  'Email not confirmed':
    'Confirm your email first — check your inbox for the Supabase confirmation link.',
  'Provider is not enabled':
    'Enable Google under Supabase → Authentication → Providers, then add both redirect URLs under Authentication → URL Configuration: http://localhost:3000/auth/callback and https://pricelyco.vercel.app/auth/callback',
}

export function formatAuthError(raw: string | null): string | null {
  if (!raw) return null
  const decoded = decodeURIComponent(raw)

  if (decoded.includes('PKCE code verifier')) {
    return (
      'Google sign-in opened on a different site than where it started (often production vs localhost). ' +
      'For local dev: open http://localhost:3000, add http://localhost:3000/auth/callback to Supabase → Authentication → URL Configuration → Redirect URLs, ' +
      'and set NEXT_PUBLIC_APP_URL=http://localhost:3000 in .env.local.'
    )
  }

  return AUTH_ERROR_MESSAGES[decoded] ?? decoded
}
