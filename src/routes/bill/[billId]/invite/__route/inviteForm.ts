import { VenmoSchema } from "$lib/firestore/schemas/Venmo";
import { z } from "zod";

export const InviteSchema = z.object({
    venmo: VenmoSchema,
})