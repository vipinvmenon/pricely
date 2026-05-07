import { headers } from "next/headers";

import { HomeClient } from "./_components/HomeClient";

function greetingForHour(hour: number): "Morning" | "Afternoon" | "Evening" {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default async function DashboardIndexPage() {
  const h = await headers();
  const cityHeader = h.get("x-vercel-ip-city");
  const cityName = cityHeader && cityHeader.trim().length > 0 ? cityHeader : "Bengaluru";
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
          GOOD {greeting.toUpperCase()}
        </div>
        <div className="mt-2 font-[var(--font-display)] text-[38px] font-semibold tracking-[-1.6px] text-[var(--color-text-primary)] leading-[1.05]">
          Find the cheapest, fastest{" "}
          <span className="bg-[var(--gradient-ramp-accent)] bg-clip-text text-transparent">
            everything.
          </span>
        </div>
        <div className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--color-text-secondary)]">
          A real-time price comparison &amp; decision engine. India-first, mobile-first.
          <br />
          Premium graphite glass · Spotify-green accent · liquid-glass surfaces.
        </div>
      </div>

      <HomeClient cityName={cityName} />
    </div>
  );
}

