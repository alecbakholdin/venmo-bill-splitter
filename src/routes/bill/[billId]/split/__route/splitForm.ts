import { VenmoSchema } from '$lib/firestore/schemas/Venmo';
import { z } from 'zod';

export const SplitBillSchema = z.object({
	email: z.string().email().toLowerCase(),
	venmo: VenmoSchema.optional(),
	items: z.array(z.number())
});
