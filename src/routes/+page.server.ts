import { receiptParserClient } from '$lib/azureFormRecognizer.server';
import { billCollection } from '$lib/firestore/collections.server';
import { BillItemSchema, BillSchema } from '$lib/firestore/schemas/Bill';
import { getUser } from '$lib/utils.server';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import type { z } from 'zod';
import { CreateBillSchema } from './__route/schemas';

export async function load({ parent }) {
	const { email } = await getUser(parent);

	async function getRecentBills() {
		const response = await billCollection
			.where('user', '==', email)
			.orderBy('dateCreated', 'desc')
			.limit(5)
			.get();
		return response.docs.map((doc) => doc.data());
	}

	return {
		createBillForm: await superValidate(CreateBillSchema),
		promises: {
			recentBills: getRecentBills()
		}
	};
}

export const actions = {
	async createBill({ request, locals }) {
		const formData = await request.formData();
		const form = await superValidate(formData, CreateBillSchema);
		if (!form.valid) return fail(400, { form });

		// default bill creation
		const { email } = await getUser(locals);
		const numBills = (await billCollection.where('user', '==', email).count().get()).data().count;
		const bill = {
			dateCreated: new Date().toISOString(),
			items: [],
			title: `Bill ${numBills + 1}`,
			slug: '',
			user: email,
			total: 0,
			friends: [],
			subtotal: 0
		} satisfies z.infer<typeof BillSchema>;

		// parse receipt if possible
		const receiptFile = formData.get('receiptFile') as Blob;
		const receiptPicture = formData.get('receiptPicture') as Blob;
		const file = receiptFile.size ? receiptFile : receiptPicture.size ? receiptPicture : null;
		console.log('file', file);
		if (file instanceof Blob) {
			const poller = await receiptParserClient.beginAnalyzeDocument(
				'prebuilt-receipt',
				await file.arrayBuffer()
			);
			const operationLocation = encodeURI(poller.getOperationState().operationLocation);
			throw redirect(308, `/parse?u=${operationLocation}`);
		}

		// finish creating bill and redirect user to bill
		const billParsed = BillSchema.parse(bill);
		await billCollection.add(billParsed);
		throw redirect(308, `/bill/${billParsed.slug}`);
	}
};
