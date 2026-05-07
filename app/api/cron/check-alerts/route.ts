import { unauthorized, json } from "@/lib/api/http";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ ok: true, skipped: true, reason: "CRON_SECRET not set" });

  const header = req.headers.get("x-cron-secret");
  if (header !== secret) return unauthorized("Invalid cron secret");

  return json({ ok: true, checked: 0 });
}

