import {
  chromium,
  type Browser,
  type LaunchOptions,
  type Page,
} from 'playwright'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const STEALTH_INIT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-IN', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = { runtime: {} };
`

function baseLaunchOptions(): LaunchOptions {
  const proxyUrl = process.env.SCRAPER_PROXY_URL

  return {
    headless: true,
    ...(proxyUrl ? { proxy: { server: proxyUrl } } : {}),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  }
}

function launchChannels(): Array<LaunchOptions['channel'] | undefined> {
  const preferred = process.env.PLAYWRIGHT_CHANNEL as LaunchOptions['channel'] | undefined
  const channels: Array<LaunchOptions['channel'] | undefined> = []

  if (preferred) channels.push(preferred)
  if (!channels.includes('chrome')) channels.push('chrome')
  channels.push(undefined)

  return channels
}

async function launchBrowser(): Promise<Browser> {
  const errors: string[] = []

  for (const channel of launchChannels()) {
    try {
      return await chromium.launch({
        ...baseLaunchOptions(),
        ...(channel ? { channel } : {}),
      })
    } catch (err) {
      errors.push(
        `${channel ?? 'chromium'}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  throw new Error(`Unable to launch browser (${errors.join('; ')})`)
}

export interface BrowserSession {
  browser: Browser
  context: import('playwright').BrowserContext
  page: Page
}

export async function createBrowserSession(): Promise<BrowserSession> {
  const browser = await launchBrowser()
  const context = await browser.newContext({
    userAgent: CHROME_UA,
    viewport: { width: 1280, height: 800 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    extraHTTPHeaders: {
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  })

  await context.addInitScript(STEALTH_INIT)

  const page = await context.newPage()
  return { browser, context, page }
}

export async function withBrowserPage<T>(
  fn: (page: Page) => Promise<T>,
): Promise<T> {
  const session = await createBrowserSession()
  try {
    return await fn(session.page)
  } finally {
    await session.context.close()
    await session.browser.close()
  }
}

export function isAccessDenied(title: string, bodyText: string): boolean {
  const haystack = `${title}\n${bodyText}`.toLowerCase()
  return haystack.includes('access denied') || haystack.includes("don't have permission")
}

export function absoluteProductUrl(origin: string, href: string): string {
  if (href.startsWith('http')) return href.split('?')[0] ?? href
  return `${origin.replace(/\/$/, '')}/${href.replace(/^\//, '').split('?')[0]}`
}
