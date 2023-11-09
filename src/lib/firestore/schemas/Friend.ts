import { z } from 'zod';
import { VenmoPersonSchema, VenmoSchema } from './Venmo';

export const FriendSchema = z.object({
	user: z.string().email().toLowerCase(),

	email: z.string().email().toLowerCase().default(''),
	preferredPaymentMethod: z.enum(['venmo', 'cash']).default('venmo'),

	name: z.string().optional(),

	venmo: VenmoSchema.optional()
});
