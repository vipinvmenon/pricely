import { badRequest, json } from "@/lib/api/http";

type AlertRequest = {
  productId: string;
  targetPrice: number;
  platform?: string;
  city: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown as Partial<AlertRequest> | null;
  if (!body || typeof body.productId !== "string") return badRequest("productId is required");
  if (typeof body.targetPrice !== "number") return badRequest("targetPrice must be a number");
  if (typeof body.city !== "string") return badRequest("city is required");

  return json({
    ok: true,
    alertId: `a_${Math.random().toString(16).slice(2)}`,
  });
}

import { NextResponse } from "next/server";

import { createAlert, deleteAlert, getAlerts } from "@/services/alert-service";

type AlertCreateBody = {
  productId?: string;
  targetPrice?: number;
  platformId?: string;
};

type AlertDeleteBody = {
  id?: string;
};

export async function GET() {
  const alerts = await getAlerts();
  return NextResponse.json(alerts);
}

export async function POST(request: Request) {
  const body = (await request.json()) as AlertCreateBody;
  const productId = body.productId?.trim();
  const targetPrice = Number(body.targetPrice);

  if (!productId || !Number.isFinite(targetPrice)) {
    return NextResponse.json(
      { error: "productId and targetPrice are required." },
      { status: 400 }
    );
  }

  const alert = await createAlert({
    productId,
    targetPrice,
    platformId: body.platformId,
  });
  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as AlertDeleteBody;
  const id = body.id?.trim();

  if (!id) {
    return NextResponse.json({ error: "Alert id is required." }, { status: 400 });
  }

  const removed = await deleteAlert(id);
  if (!removed) {
    return NextResponse.json({ error: "Alert not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
