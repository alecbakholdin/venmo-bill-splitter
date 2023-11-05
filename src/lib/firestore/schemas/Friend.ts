import { z } from 'zod';
import { VenmoSchema } from './Venmo';

export const FriendSchema = z.object({
	user: z.string(),
	name: z.string(),
	nicknames: z.array(z.string()),
	avatar: z.string().optional(),
	venmo: VenmoSchema
});

