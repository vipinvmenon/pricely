import { NextResponse } from 'next/server'

function generateHistory() {
  const history = []
  const base = 27000
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const noise = (Math.random() - 0.5) * 6000
    history.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(base + noise),
    })
  }
  history[history.length - 1].price = 23450
  return history
}

export function GET() {
  const data = {
    product: {
      id: 'sony-wh-1000xm5',
      name: 'WH-1000XM5 Wireless Noise Cancelling',
      brand: 'Sony',
      category: 'Headphones',
      image: null,
    },
    retailers: [
      {
        rank: 1,
        name: 'Amazon',
        isLowest: true,
        price: 23450,
        mrp: 29990,
        delivery: 'Free · 1 day',
        returns: '7 days',
        stock: 'In stock',
        buyUrl: '#',
      },
      {
        rank: 2,
        name: 'Flipkart',
        price: 24499,
        mrp: 29990,
        delivery: 'Free · 2 days',
        returns: '7 days',
        stock: 'In stock',
        buyUrl: '#',
      },
      {
        rank: 3,
        name: 'Croma',
        price: 25990,
        mrp: 29990,
        delivery: '₹99 · 3 days',
        returns: '10 days',
        stock: 'Low stock',
        buyUrl: '#',
      },
      {
        rank: 4,
        name: 'Reliance Digital',
        price: 26490,
        mrp: 29990,
        delivery: 'Free · 2 days',
        returns: '7 days',
        stock: 'In stock',
        buyUrl: '#',
      },
      {
        rank: 5,
        name: 'Vijay Sales',
        price: 27200,
        mrp: 29990,
        delivery: '₹149 · 4 days',
        returns: '7 days',
        stock: 'In stock',
        buyUrl: '#',
      },
      {
        rank: 6,
        name: 'Tata Cliq',
        price: 28000,
        mrp: 29990,
        delivery: 'Free · 3 days',
        returns: '15 days',
        stock: 'In stock',
        buyUrl: '#',
      },
    ],
    history: generateHistory(),
  }

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
