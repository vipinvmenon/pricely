import { NextResponse } from 'next/server'

function fareHistory() {
  const labels = ['-5h', '-4h', '-3h', '-2h', '-1h', 'Now']
  return labels.map((label, i) => ({
    label,
    blusmart: 480 + Math.round((Math.random() - 0.5) * 60) + i * 5,
    rapido: 560 + Math.round((Math.random() - 0.5) * 80) + i * 8,
    uber: 680 + Math.round((Math.random() - 0.5) * 100) + i * 12,
    ola: 720 + Math.round((Math.random() - 0.5) * 100) + i * 10,
  }))
}

export function GET() {
  const data = {
    fares: [
      {
        id: 'blusmart',
        name: 'BluSmart',
        isLowest: true,
        price: 498,
        eta: '4 min away',
        bookUrl: '#',
      },
      {
        id: 'rapido',
        name: 'Rapido',
        price: 572,
        eta: '3 min away',
        bookUrl: '#',
      },
      {
        id: 'uber',
        name: 'Uber',
        price: 698,
        eta: '6 min away',
        surgeMultiplier: 1.4,
        bookUrl: '#',
      },
      {
        id: 'ola',
        name: 'Ola',
        price: 742,
        eta: '8 min away',
        surgeMultiplier: 1.4,
        bookUrl: '#',
      },
    ],
    fareHistory: fareHistory(),
  }

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
