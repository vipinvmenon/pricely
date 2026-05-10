import { NextResponse } from 'next/server'

const WATCHLIST = [
  {
    id: '1',
    initials: 'SW',
    name: 'Sony WH-1000XM5',
    subtitle: 'Amazon · Headphones',
    target: 22000,
    now: 23450,
    mrp: 29990,
    vsTarget: 7,
    trend: [27000, 26200, 25100, 24800, 24200, 23800, 23450],
    status: 'Watching',
  },
  {
    id: '2',
    initials: 'AI',
    name: 'Apple iPad Air 11"',
    subtitle: 'Flipkart · Tablets',
    target: 55000,
    now: 58999,
    mrp: 64900,
    vsTarget: 7,
    trend: [64900, 63000, 61500, 60000, 59500, 59000, 58999],
    status: 'Watching',
  },
  {
    id: '3',
    initials: 'DV',
    name: 'Dyson V12 Detect Slim',
    subtitle: 'Amazon · Vacuum',
    target: 42000,
    now: 44990,
    mrp: 52900,
    vsTarget: 7,
    trend: [52900, 50000, 48000, 47000, 46000, 45500, 44990],
    status: 'Holding',
  },
  {
    id: '4',
    initials: 'AN',
    name: 'Asics Novablast 4',
    subtitle: 'Flipkart · Running Shoes',
    target: 8500,
    now: 8249,
    mrp: 12999,
    vsTarget: -3,
    trend: [12999, 11000, 10000, 9500, 9000, 8500, 8249],
    status: 'Target hit',
  },
  {
    id: '5',
    initials: 'BQ',
    name: 'Bose QC Ultra',
    subtitle: 'Croma · Headphones',
    target: 30000,
    now: 32490,
    mrp: 37990,
    vsTarget: 8,
    trend: [37990, 36000, 35000, 34000, 33500, 33000, 32490],
    status: 'Watching',
  },
]

export function GET() {
  return NextResponse.json(WATCHLIST, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
