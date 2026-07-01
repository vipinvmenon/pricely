import { createHash } from 'crypto'

export function hashSeed(input: string): number {
  const hex = createHash('sha256').update(input).digest('hex')
  return parseInt(hex.slice(0, 8), 16)
}

export function deterministicInt(
  seed: string,
  min: number,
  max: number,
  salt = '',
): number {
  const range = max - min + 1
  if (range <= 0) return min
  return min + (hashSeed(`${seed}:${salt}`) % range)
}

export function deterministicFloat(seed: string, salt = ''): number {
  return hashSeed(`${seed}:${salt}`) / 0xffffffff
}
