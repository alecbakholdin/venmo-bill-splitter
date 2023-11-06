import { z } from "zod";

export const InviteLinkSchema = z.object({
    id: z.string(),
    expiration: z.string().datetime(),
    link: z.string().url()
})