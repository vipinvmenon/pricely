function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPriceAlertEmail(input: {
  to: string;
  productTitle: string;
  productId: string;
  city: string;
  targetPrice: number;
  observedPrice: number;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const from = process.env.RESEND_FROM_EMAIL ?? "Pricely <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Price alert: ${input.productTitle}`,
      html: [
        "<p>",
        `Your target of <strong>₹${input.targetPrice}</strong> for `,
        `<strong>${escapeHtml(input.productTitle)}</strong> in `,
        `<strong>${escapeHtml(input.city)}</strong> was reached.`,
        "</p>",
        `<p>Latest observed: <strong>₹${input.observedPrice}</strong></p>`,
        `<p style="color:#666;font-size:12px">Product ID: ${escapeHtml(input.productId)}</p>`,
      ].join(""),
    }),
  });

  return res.ok;
}
