export type RetryOptions = {
  retries: number;
  minDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number; // 0..1
};

const DEFAULT_RETRY: RetryOptions = {
  retries: 3,
  minDelayMs: 2_000,
  maxDelayMs: 8_000,
  jitterRatio: 0.15,
};

export type BaseScraperOptions = {
  retry?: Partial<RetryOptions>;
};

export class BaseScraper {
  protected readonly retry: RetryOptions;

  constructor(opts?: BaseScraperOptions) {
    this.retry = { ...DEFAULT_RETRY, ...(opts?.retry ?? {}) };
  }

  protected userAgent(): string {
    // Keep UA stable-ish and realistic; scraper service may override per-provider.
    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    ];
    return uas[Math.floor(Math.random() * uas.length)] ?? uas[0]!;
  }

  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const { retries } = this.retry;
    let lastErr: unknown = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt >= retries) break;
        await sleepMs(this.backoffDelayMs(attempt));
      }
    }

    throw lastErr instanceof Error ? lastErr : new Error("Scraper failed after retries");
  }

  protected backoffDelayMs(attempt: number): number {
    const base = Math.min(this.retry.maxDelayMs, this.retry.minDelayMs * Math.pow(2, attempt));
    const jitter = base * this.retry.jitterRatio * (Math.random() * 2 - 1);
    const delay = base + jitter;
    return Math.max(0, Math.round(delay));
  }
}

export async function sleepMs(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

