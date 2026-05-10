import { z } from "zod/v3";

export const alertCreateBodySchema = z
  .object({
    productId: z.string().min(1),
    targetPrice: z.number().finite().nonnegative(),
    city: z.string().min(1),
    platformId: z.string().min(1).optional(),
    platform: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    category: z.enum(["grocery", "electronics", "cabs"]).optional(),
  })
  .strict();

export type AlertCreateBody = z.infer<typeof alertCreateBodySchema>;

export function normalizeAlertCreateBody(
  data: AlertCreateBody,
): Omit<AlertCreateBody, "platform"> & { platformId?: string } {
  const { platform, ...rest } = data;
  const platformId = rest.platformId ?? platform;
  return { ...rest, platformId };
}
