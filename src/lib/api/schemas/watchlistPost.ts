import { z } from "zod/v3";

export const watchlistPostSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    productId: z.string().min(1),
    city: z.string().min(1),
    title: z.string().min(1),
    category: z.enum(["grocery", "electronics", "cabs"]),
    subtitle: z.string().optional(),
  }),
  z.object({
    action: z.literal("remove"),
    productId: z.string().min(1),
    city: z.string().min(1),
  }),
]);

export type WatchlistPostBody = z.infer<typeof watchlistPostSchema>;
