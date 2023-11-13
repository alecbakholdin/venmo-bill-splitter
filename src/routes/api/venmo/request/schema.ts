import { z } from "zod";

export const VenmoRequestSchema = z.object({
    id: z.string(),
    amountInCents: z.number().int(),
    description: z.string()
})
export type VenmoRequest = z.infer<typeof VenmoRequestSchema>
export const VenmoRequestResponseSchema = z.object({
    transactionId: z.string()
})
export type VenmoRequestResponse = z.infer<typeof VenmoRequestResponseSchema>