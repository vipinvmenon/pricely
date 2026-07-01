'use client'

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ProductImage({
  name,
  imageUrl,
  className,
}: {
  name: string
  imageUrl?: string
  className?: string
}) {
  const label = name.trim() || 'Product'

  if (imageUrl && imageUrl !== '#demo-price') {
    return (
      <img
        src={imageUrl}
        alt=""
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: 'inherit',
        }}
      />
    )
  }

  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
        background: 'var(--bg2)',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '1.25rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
      }}
    >
      {initialsFromName(label) || '?'}
    </div>
  )
}
