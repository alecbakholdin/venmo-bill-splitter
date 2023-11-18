import { AZURE_FORM_RECOGNIZER_ENDPOINT, AZURE_FORM_RECOGNIZER_KEY } from '$env/static/private';
import { billCollection } from '$lib/firestore/collections.server';
import { BillItemSchema, BillSchema } from '$lib/firestore/schemas/Bill';
import { getUser } from '$lib/utils.server';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
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

const receiptParserCredential = new AzureKeyCredential(AZURE_FORM_RECOGNIZER_KEY);
const receiptParserClient = new DocumentAnalysisClient(
	AZURE_FORM_RECOGNIZER_ENDPOINT,
	receiptParserCredential
);

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
		if (file instanceof Blob) await parseReceipt(file, bill);

		// finish creating bill and redirect user to bill
		const billParsed = BillSchema.parse(bill);
		await billCollection.add(billParsed);
		throw redirect(308, `/bill/${billParsed.slug}`);
	}
};

async function parseReceipt(receipt: Blob, bill: z.infer<typeof BillSchema>) {
	const poller = await receiptParserClient.beginAnalyzeDocument(
		'prebuilt-receipt',
		await receipt.arrayBuffer()
	);
	const result = await poller.pollUntilDone();
	const docFields = result?.documents?.[0]?.fields;
	const { Items, ...fields } = docFields as any;
	printObj(result);
	printObj(fields);
	//printObj(Items);
	if (docFields) {
		const items = (docFields.Items as any)?.values;
		let calculatedSubtotal = 0;
		const defaultItem: Omit<z.infer<typeof BillItemSchema>, 'unitPrice' | 'quantity' | 'title'> = {
			friends: [],
			splitType: 'shares',
			total: 0,
			addNewFriends: false
		};
		for (const { properties } of items) {
			//printObj(properties);
			const title: string = properties.Description?.value ?? 'Item';
			const quantity: number = properties.Quantity?.value ?? 1;
			const unitPrice: number =
				properties.Price?.value ?? (properties.TotalPrice?.value ?? 0) / quantity;
			bill.items.push({ ...defaultItem, unitPrice, quantity, title });
			calculatedSubtotal += quantity * unitPrice;
		}
		const parsedSubtotal = (docFields.Subtotal as any)?.value ?? 0;
		const subtotalDiff = parsedSubtotal - calculatedSubtotal;
		if (parsedSubtotal && subtotalDiff > 0.01) {
			bill.items.unshift({
				...defaultItem,
				unitPrice: subtotalDiff,
				quantity: 1,
				title: 'Missing Value'
			});
		}
		bill.tax =
			(docFields.TotalTax as any)?.value ??
			(docFields.TaxDetails as any)?.values?.reduce(
				(total: number, obj: any) => (obj?.properties?.Amount?.value?.amount ?? 0) + total,
				0
			);
		bill.tip = (docFields.Tip as any)?.value;
		if (bill.tax !== undefined || bill.tip !== undefined) {
			bill.tax = bill.tax ?? 0;
			bill.tip = bill.tip ?? 0;
		}
	}
}

function printObj(obj: any) {
	console.log(JSON.stringify(formatObject(obj), null, 2));
}

function formatObject(obj: any): any {
	if (!obj) return obj;
	if (Array.isArray(obj)) {
		return obj.map(formatObject);
	}
	if (typeof obj !== 'object') return obj;
	return Object.fromEntries(
		Object.entries(obj)
			.filter(([key]) => key !== 'boundingRegions')
			.map(([key, value]) => [key, formatObject(value)])
	);
}
