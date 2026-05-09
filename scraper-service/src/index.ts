import { createServer } from "node:http";

import { notFound, unauthorized } from "./http";
import { handlePricesV1 } from "./routes/v1/prices";

function getSecret(): string | null {
  const s = process.env.SCRAPER_SERVICE_SECRET;
  return typeof s === "string" && s.length > 0 ? s : null;
}

function isAuthorized(req: import("node:http").IncomingMessage): boolean {
  const secret = getSecret();
  if (!secret) return false;
  const hdr = req.headers["x-scraper-secret"];
  if (typeof hdr === "string" && hdr === secret) return true;
  if (Array.isArray(hdr) && hdr[0] === secret) return true;
  return false;
}

const port = Number(process.env.PORT ?? 8080);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const method = (req.method ?? "GET").toUpperCase();

    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (url.pathname === "/v1/prices" && method === "POST") {
      if (!isAuthorized(req)) {
        const r = unauthorized("Invalid scraper secret");
        await writeResponse(res, r);
        return;
      }
      const request = await toRequest(req, url);
      const r = await handlePricesV1(request);
      await writeResponse(res, r);
      return;
    }

    await writeResponse(res, notFound());
  } catch {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[scraper-service] listening on :${port}`);
});

async function toRequest(req: import("node:http").IncomingMessage, url: URL): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Buffer));
  const body = Buffer.concat(chunks);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(","));
  }

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: body.length > 0 ? body : undefined,
  });
}

async function writeResponse(res: import("node:http").ServerResponse, response: Response): Promise<void> {
  const headers: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    headers[k] = v;
  });
  res.writeHead(response.status, headers);
  const text = await response.text();
  res.end(text);
}

