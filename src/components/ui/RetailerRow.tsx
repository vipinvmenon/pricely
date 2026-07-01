'use client'

import { PriceBadge } from './PriceBadge'
import { Button } from './Button'

interface RetailerRowProps {
  rank: number
  name: string
  isLowest?: boolean
  available?: boolean
  price: number
  mrp?: number
  delivery: string
  returns: string
  stock: string
  onBuy: () => void
}

export function RetailerRow({
  rank,
  name,
  isLowest,
  available = true,
  price,
  mrp,
  delivery,
  returns,
  stock,
  onBuy,
}: RetailerRowProps) {
  const isLowStock = stock.toLowerCase().includes('low')
  const stockLabel = stock === 'not_listed' ? 'Not listed' : stock
  const buyLabel = `Buy ${name}`

  return (
    <div
      role="row"
      className="retailer-row"
      style={{
        background: isLowest ? 'var(--accent-dim)' : 'transparent',
        borderLeft: isLowest ? '2px solid var(--accent)' : '2px solid transparent',
        opacity: available ? 1 : 0.55,
      }}
    >
      <div className="retailer-row-main">
        <span className="retailer-row-rank mono">{rank}</span>

        <div className="retailer-row-identity">
          <span className="retailer-row-name">{name}</span>
          {isLowest && <span className="retailer-row-badge">LOWEST</span>}
        </div>

        <div className="retailer-row-price">
          {available ? (
            <>
              <PriceBadge value={price} size="md" />
              {mrp && mrp > price && <PriceBadge value={mrp} size="sm" strike />}
            </>
          ) : (
            <span className="retailer-row-unavailable">—</span>
          )}
        </div>

        <span className="retailer-row-delivery">{delivery}</span>
        <span className="retailer-row-returns">{returns}</span>
        <span
          className="retailer-row-stock"
          style={{ color: isLowStock ? 'var(--warn)' : 'var(--text-dim)' }}
        >
          {stockLabel}
        </span>

        <div className="retailer-row-action">
          {available ? (
            <Button variant={isLowest ? 'primary' : 'ghost'} size="sm" onClick={onBuy}>
              Buy
            </Button>
          ) : (
            <span className="retailer-row-unavailable">—</span>
          )}
        </div>
      </div>

      <div className="retailer-row-mobile-meta">
        <span>{delivery}</span>
        <span>{returns}</span>
        <span style={{ color: isLowStock ? 'var(--warn)' : 'var(--text-dim)' }}>{stockLabel}</span>
      </div>

      {available && (
        <div className="retailer-row-mobile-footer">
          <div>
            <PriceBadge value={price} size="md" />
            {mrp && mrp > price && <PriceBadge value={mrp} size="sm" strike />}
          </div>
          <Button variant={isLowest ? 'primary' : 'ghost'} size="sm" onClick={onBuy}>
            {buyLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
