import { unauthorized, json } from "@/lib/api/http";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ ok: true, skipped: true, reason: "CRON_SECRET not set" });

  const xCron = req.headers.get("x-cron-secret");
  const auth = req.headers.get("authorization");
  const bearer = typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")
    ? auth.slice("bearer ".length).trim()
    : null;

  if (xCron !== secret && bearer !== secret) return unauthorized("Invalid cron secret");

  return json({ ok: true, checked: 0 });
}

