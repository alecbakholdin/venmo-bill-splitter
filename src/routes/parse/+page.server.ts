import { AZURE_FORM_RECOGNIZER_ENDPOINT } from '$env/static/private';
import { receiptParserClient, receiptParserCredential } from '$lib/azureFormRecognizer.server.js';
import { billCollection } from '$lib/firestore/collections.server';
import { BillSchema, type BillItemSchema } from '$lib/firestore/schemas/Bill';
import { ReceiptModelSchema } from '$lib/types/receiptModel.js';
import { getUser } from '$lib/utils.server';
import { redirect } from '@sveltejs/kit';
import type { z } from 'zod';
import _ from 'lodash';

export async function load({ url, locals }) {
	const operationLocationEncoded = url.searchParams.get('u');
	if (!operationLocationEncoded) {
		throw redirect(308, '/');
	}
	const operationLocation = decodeURI(operationLocationEncoded);
	const response = await fetch(operationLocation, {
		headers: {
			'Ocp-Apim-Subscription-Key': receiptParserCredential.key
		}
	});
	if (response.status !== 200) {
		console.log('redirecting');
		throw redirect(308, '/');
	}

	const data = await response.json();
	if (data.status === 'succeeded') {
		console.log(JSON.stringify(data?.analyzeResult?.documents?.[0].fields.TaxDetails, null, 2));
		const receipt = ReceiptModelSchema.parse(data?.analyzeResult?.documents?.[0]?.fields);
		const { email } = await getUser(locals);
		const bill = await createBill(email, receipt);
		throw redirect(308, `/bill/${bill.slug}`);
	}

	console.log(data.status);
	return {
		status: data.status,
		receipt: data?.analyzeResult?.documents?.[0]?.fields
	};
}

const defaultItem: Omit<z.infer<typeof BillItemSchema>, 'unitPrice' | 'quantity' | 'title'> = {
	friends: [],
	splitType: 'shares',
	total: 0,
	addNewFriends: false
};

async function createBill(email: string, result: z.infer<typeof ReceiptModelSchema>) {
	const dateString = new Date().toLocaleString();
	const bill = {
		dateCreated: new Date().toISOString(),
		items: [],
		title: `${result.MerchantName} (${dateString})` ?? `Bill ${dateString}`,
		slug: '',
		user: email,
		total: 0,
		friends: [],
		subtotal: 0
	} as z.infer<typeof BillSchema> satisfies z.infer<typeof BillSchema>;

	let calculatedSubtotal = 0;
	for (const item of result.Items || []) {
		console.log(item);
		const totalPrice = item?.TotalPrice ?? 0;
		const quantity = item?.Quantity ?? 1;
		const unitPrice = item?.Price ?? totalPrice / (quantity || 1);
		const newItem = {
			...defaultItem,
			title: item?.Description || 'Unnamed Item',
			quantity,
			unitPrice
		} as z.infer<typeof BillItemSchema>;
		console.log(newItem);
		if (newItem.quantity && newItem.unitPrice) {
			const existingItem = bill.items.find(
				(item) =>
					item.title === newItem.title && Math.abs(item.unitPrice - newItem.unitPrice) <= 0.01
			);
			if (existingItem) {
				existingItem.quantity += newItem.quantity;
			} else {
				bill.items.push(newItem);
			}
			calculatedSubtotal += newItem.quantity * newItem.unitPrice;
		}
	}
	// adjust if necessary
	const adjustment = (result.Subtotal ?? 0) - calculatedSubtotal;
	if (adjustment && result.Subtotal) {
		bill.items.unshift({
			...defaultItem,
			title: 'Missing Value',
			quantity: 1,
			unitPrice: adjustment
		});
	}

	// set tax and tip
	bill.tax = result.TotalTax ?? _.sumBy(result.TaxDetails ?? [], 'Amount');
	bill.tip = result.Tip;
	if (bill.tax !== undefined || bill.tip !== undefined) {
		bill.tax = bill.tax ?? 0;
		bill.tip = bill.tip ?? 0;
	}
	console.log(JSON.stringify(bill, null, 2));
	const billParsed = BillSchema.parse(bill);
	await billCollection.add(billParsed);
	return billParsed;
}
