import { NextResponse } from 'next/server'

const TRENDING = [
  { id: '1', query: 'Milk 1L Amul', category: 'grocery' },
  { id: '2', query: 'Bread Brown 400g', category: 'grocery' },
  { id: '3', query: 'Sony WH-1000XM5', category: 'electronics' },
  { id: '4', query: 'iPhone 15 128GB', category: 'electronics' },
  { id: '5', query: 'Dyson V12 Detect Slim', category: 'electronics' },
]

export function GET() {
  return NextResponse.json(TRENDING, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
