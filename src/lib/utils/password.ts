export function passwordValidationError(password: string): string | null {
  if (!password) return null
  if (password.length < 8) return 'Use at least 8 characters.'
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  if (!hasLetter || !hasNumber) return 'Include letters and numbers for a stronger password.'
  return null
}

export function passwordStrengthLabel(password: string): string | null {
  if (!password) return null
  const validationError = passwordValidationError(password)
  if (validationError) return validationError
  return 'Strong enough.'
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password.length > 0 && password === confirm
}
