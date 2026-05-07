export function getCityFromHeaders(headers: Headers): string {
  const raw = headers.get("x-vercel-ip-city") ?? headers.get("x-city") ?? "";
  const city = raw.trim();
  return city.length > 0 ? city : "Bengaluru";
}

export function getCityFromRequest(req: Request): string {
  return getCityFromHeaders(req.headers);
}

