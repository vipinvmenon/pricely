'use client'

import { Button } from './Button'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-busy="true">
      <div className="loading-skeleton loading-skeleton--title" />
      <div className="loading-skeleton loading-skeleton--line" />
      <div className="loading-skeleton loading-skeleton--line loading-skeleton--short" />
      <span className="loading-state-label">{label}</span>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state-message">{message}</p>
      {onRetry ? (
        <Button variant="ghost" size="sm" type="button" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
