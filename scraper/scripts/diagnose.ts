import { chromium } from 'playwright'

async function diagnose(
  name: string,
  url: string,
  selector: string,
): Promise<void> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    extraHTTPHeaders: { 'Accept-Language': 'en-IN,en;q=0.9' },
  })
  const page = await context.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 }).catch((err: Error) => {
      console.log('goto error:', err.message.split('\n')[0])
    })
    if (page.url() === 'about:blank') return
    console.log(`\n=== ${name} ===`)
    console.log('title:', await page.title())
    console.log('url:', page.url())
    await page.waitForSelector(selector, { timeout: 15_000 }).catch((err: Error) => {
      console.log('selector error:', err.message.split('\n')[0])
    })
    const info = await page.evaluate((sel) => {
      const links = Array.from(document.querySelectorAll(sel)).slice(0, 5)
      return {
        linkCount: document.querySelectorAll(sel).length,
        samples: links.map((a) => ({
          href: (a as HTMLAnchorElement).getAttribute('href'),
          text: (a as HTMLAnchorElement).textContent?.replace(/\s+/g, ' ').trim().slice(0, 100),
        })),
        bodySnippet: document.body.innerText.slice(0, 300),
      }
    }, selector)
    console.log(JSON.stringify(info, null, 2))
  } finally {
    await context.close()
    await browser.close()
  }
}

async function main(): Promise<void> {
  await diagnose(
    'vijay_sales',
    'https://www.vijaysales.com/search?q=LG%20refrigerator',
    'a[href*="/p/"]',
  )
  await diagnose(
    'croma',
    'https://www.croma.com/search?q=Dyson%20V12',
    'a[href*="/p/"]',
  )
  await diagnose(
    'myntra slug',
    'https://www.myntra.com/nike-sneakers',
    'a[href*="/buy"]',
  )
  await diagnose(
    'myntra search',
    'https://www.myntra.com/search?q=Nike%20sneakers',
    'a[href*="/buy"]',
  )
}

void main()
