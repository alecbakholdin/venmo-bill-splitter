import { z } from 'zod';

export const VenmoSchema = z
	.string()
	.min(5)
	.max(30)
	.toLowerCase()
	.regex(/^@?[a-z-_\d]+$/);

export const VenmoPersonSchema = z.object({
	venmo: VenmoSchema,
	id: z.string().min(1),
	firstName: z.string(),
	lastName: z.string(),
	displayName: z.string(),
	avatar: z.string().url()
});
