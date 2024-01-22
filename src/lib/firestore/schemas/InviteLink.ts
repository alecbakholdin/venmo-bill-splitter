import { z } from "zod";

export const InviteLinkSchema = z.object({
    id: z.string(),
    expiration: z.string().datetime(),
    billId: z.string(),
    billSlug: z.string(),
    action: z.enum(['invite', 'split']),
    authToken: z.string()
})