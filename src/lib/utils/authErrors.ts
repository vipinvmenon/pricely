const AUTH_ERROR_MESSAGES: Record<string, string> = {
  missing_code:
    'Sign-in was interrupted. Please try again.',
  supabase_not_configured:
    'Supabase is not configured. Check your .env.local file.',
  'Invalid login credentials':
    'Wrong email or password. If you are new, create an account first.',
  'Email not confirmed':
    'Confirm your email first — check your inbox for the Supabase confirmation link.',
}

export function formatAuthError(raw: string | null): string | null {
  if (!raw) return null
  const decoded = decodeURIComponent(raw)
  return AUTH_ERROR_MESSAGES[decoded] ?? decoded
}
