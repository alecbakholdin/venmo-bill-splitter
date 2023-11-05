import { z } from 'zod';
import { VenmoSchema } from './Venmo';

export const BillItemSchema = z
	.object({
		title: z.string(),
		quantity: z.number().int().nonnegative(),
		unitPrice: z.number().nonnegative(),
		total: z.number().nonnegative(),
		splitType: z.enum(['shares']),
		addNewFriends: z.boolean().optional(),
		friends: z.array(
			z.object({
				venmo: VenmoSchema,
				splitValue: z.number().positive(),
				totalOwed: z.number()
			})
		)
	})
	.transform((billItem) => {
		if (billItem.splitType !== 'shares') throw Error('Unexpected splitType');
		const totalShares = billItem.friends?.reduce((total, friend) => total + friend.splitValue, 0);
		const total = billItem.unitPrice * billItem.quantity;
		const friends =
			billItem.friends?.map((friend) => ({
				...friend,
				totalOwed: totalShares ? (friend.splitValue / totalShares) * total : 0
			})) ?? [];
		return {
			...billItem,
			total,
			friends
		};
	});

export const BillFriendSchema = z.object({
	venmo: VenmoSchema,
	subtotal: z.number(),
	total: z.number()
});

export const BillSchema = z
	.object({
		user: z.string().email(),
		title: z.string(),
		slug: z.string(),
		dateCreated: z.string(),
		items: z.array(BillItemSchema),
		friends: z.array(BillFriendSchema),
		subtotal: z.number(),
		tax: z.number().optional(),
		tip: z.number().optional(),
		total: z.number()
	})
	.transform((values) => {
		const subtotal = values.items.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0
		);
		const tax = values.tax ?? 0;
		const tip = values.tip ?? 0;
		const total = subtotal + tax + tip;
		return {
			...values,
			slug: values.title
				.toLowerCase()
				.replaceAll(/\s+/g, '-')
				.replaceAll(/[^\w\d-]/g, ''),
			subtotal,
			total,
			friends: values.friends.map((friend) => {
				const friendSubtotal = values.items
					.flatMap((item) => item.friends.filter((itemFriend) => itemFriend.venmo === friend.venmo))
					.reduce((total, { totalOwed }) => total + totalOwed, 0);
				const friendTotal = friendSubtotal + (friendSubtotal / subtotal) * (tax + tip);
				return {
					...friend,
					subtotal: friendSubtotal,
					total: friendTotal
				};
			})
		};
	});
