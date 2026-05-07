import { GlassCard } from "@/components/ui/GlassCard";

export default function AlertsPage() {
  return (
    <div className="flex flex-col gap-4">
      <GlassCard padding="lg">
        <div className="font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.6px] text-[var(--color-text-primary)]">
          Alerts
        </div>
        <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          Coming soon (Phase 9 will wire alerts + cron).
        </div>
      </GlassCard>
    </div>
  );
}

