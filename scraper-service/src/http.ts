export function json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  const body = JSON.stringify(data);
  return new Response(body, {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

export function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return json({ error: message }, { status: 401 });
}

export function notFound() {
  return json({ error: "Not found" }, { status: 404 });
}

