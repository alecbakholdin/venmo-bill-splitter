import { BillSchema } from '$lib/firestore/schemas/Bill.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { billExists, getBill } from './__route/utils.server.js';
import { createInviteJwt } from '../../../lib/types/inviteAuth.server.js';

export async function load({ params, locals, url }) {
	const bill = (await getBill(params.billId, locals)).data();

	const editBillForm = await superValidate(BillSchema);
	editBillForm.data = bill;
	const billInviteUrl =
		url.origin +
		url.pathname +
		'/invite?auth=' +
		createInviteJwt({ billId: bill.slug, billOwner: bill.user, action: 'invite' });
	const billSplitUrl =
		url.origin +
		url.pathname +
		'/split?auth=' +
		createInviteJwt({ billId: bill.slug, billOwner: bill.user, action: 'split' });
	return {
		bill,
		billInviteUrl,
		billSplitUrl,
		editBillForm
	};
}

export const actions = {
	async editBill({ request, params, locals }) {
		const form = await superValidate(request, BillSchema);
		if (!form.valid) return fail(400, { form });

		const [bill, exists] = await Promise.all([
			getBill(params.billId, locals),
			billExists(form.data.slug, locals)
		]);
		const titleIsChanged = params.billId.toLowerCase() !== form.data.slug;
		if (exists && titleIsChanged) {
			form.errors.title = ['This title is already taken'];
			return fail(400, { form });
		}
		await bill.ref.set(form.data);
		if (titleIsChanged) {
			throw redirect(308, `/bill/${form.data.slug}`);
		}
	}
};
