import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { productsService } from '@/services/productsService'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await productsService.getProduct(id)
  const title = product?.title ?? id

  return {
    title: `${title} — Pricely`,
    description: `Compare prices and price history for ${title} across supported Indian retailers.`,
    openGraph: {
      title: `${title} — Pricely`,
      description: `Live price comparison for ${title}`,
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await productsService.getProduct(id)

  if (product?.searchQuery) {
    redirect(`/compare?q=${encodeURIComponent(product.searchQuery)}`)
  }

  if (product?.title) {
    redirect(`/compare?q=${encodeURIComponent(product.title)}`)
  }

  redirect(`/compare?q=${encodeURIComponent(id)}`)
}
