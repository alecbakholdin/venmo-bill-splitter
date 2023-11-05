import { VenmoSchema } from '$lib/firestore/schemas/Venmo';
import { z } from 'zod';

export const SplitBillSchema = z.object({
	venmo: VenmoSchema,
	items: z.array(z.boolean())
});
