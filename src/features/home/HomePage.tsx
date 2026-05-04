import { AppShell } from "@/components/ui/AppShell";
import { ROUTES } from "@/constants/routes";
import { APP_NAME, APP_TAGLINE } from "@/config/site";

export function HomePage() {
  return (
    <AppShell>
      <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center gap-6 px-6 py-16 md:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          Foundation Ready
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] md:text-5xl">
          {APP_NAME}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
          {APP_TAGLINE}
        </p>
        <code className="inline-flex w-fit rounded-full border border-[var(--color-line-subtle)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">
          Start building features in {ROUTES.home}
        </code>
      </main>
    </AppShell>
  );
}
