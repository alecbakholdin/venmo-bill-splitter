import { VenmoSchema } from "$lib/firestore/schemas/Venmo";
import { z } from "zod";

export const InviteSchema = z.object({
    email: z.string().toLowerCase().email(),
    venmo: VenmoSchema,
})