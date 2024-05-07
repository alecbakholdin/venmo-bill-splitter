import { z } from 'zod';

export const BillItemFriendSchema = z.object({
	email: z.string().email().toLowerCase(),
	splitValue: z.number().positive().default(1),
	totalOwed: z.number().default(0)
});

export const BillItemSchema = z
	.object({
		title: z.string(),
		quantity: z.number().int().nonnegative(),
		unitPrice: z.number(),
		total: z.number().nonnegative(),
		splitType: z.enum(['shares']),
		addNewFriends: z.boolean().optional(),
		friends: z.array(BillItemFriendSchema)
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
	email: z.string().email().toLowerCase().default(''),
	items: z
		.array(
			z.object({
				title: z.string(),
				totalOwed: z.number()
			})
		)
		.default([]),
	subtotal: z.number().default(0),
	total: z.number().default(0)
});

export const BillSchema = z
	.object({
		user: z.string().email().toLowerCase(),
		title: z.string(),
		slug: z.string(),
		dateCreated: z.string(),
		items: z.array(BillItemSchema),
		friends: z.array(BillFriendSchema),
		subtotal: z.number(),
		tax: z.number().optional(),
		tip: z.number().optional(),
		total: z.number(),
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
				const items = values.items.filter((item) =>
					item.friends.find((fr) => fr.email === friend.email)
				);
				const friendSubtotal = values.items
					.flatMap((item) => item.friends.filter((itemFriend) => itemFriend.email === friend.email))
					.reduce((total, { totalOwed }) => total + totalOwed, 0);
				const friendSubtotalFraction = subtotal > 0 ? friendSubtotal / subtotal : 0;
				const friendTotal = friendSubtotal + friendSubtotalFraction * (tax + tip);
				return {
					...friend,
					items: items.map((item) => ({
						title: item.title,
						totalOwed: item.friends.find((fr) => fr.email === friend.email)!.totalOwed
					})),
					subtotal: friendSubtotal,
					total: friendTotal
				};
			})
		};
	});
