import { unauthorized, json, serverError } from "@/lib/api/http";
import { runAlertChecks } from "@/lib/alerts/run-checks";
import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-server";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ ok: true, skipped: true, reason: "CRON_SECRET not set" });

  const xCron = req.headers.get("x-cron-secret");
  const auth = req.headers.get("authorization");
  const bearer = typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")
    ? auth.slice("bearer ".length).trim()
    : null;

  if (xCron !== secret && bearer !== secret) return unauthorized("Invalid cron secret");

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return json({
      ok: true,
      checked: 0,
      emailsSent: 0,
      skipped: true,
      reason: "SUPABASE_SERVICE_ROLE_KEY not set",
    });
  }

  try {
    const stats = await runAlertChecks(supabase);
    return json({ ok: true, ...stats });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Alert check failed";
    return serverError(message);
  }
}

