import { BillSchema } from '$lib/firestore/schemas/Bill.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formatVenmo } from '../__route/VenmoPersonRow.svelte';
import { getBillFromJwt } from '../../../../lib/types/inviteAuth.server.js';
import { InviteSchema } from './__route/inviteForm.js';

export async function load({ url, params }) {
	const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'invite');
	return { bill: bill.data(), inviteForm: await superValidate(InviteSchema) };
}

export const actions = {
	async default({ request, params, url }) {
		const form = await superValidate(request, InviteSchema);
		if (!form.valid) return fail(400, { form });
        const venmo = formatVenmo(form.data.venmo);

        const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'invite');
        const billData = bill.data();
        if(!billData.friends.find(x => x.email === venmo)) {
            billData.friends.push({email: venmo, total: 0, subtotal: 0, items: []});
            const newBill = BillSchema.parse(billData);
            await bill.ref.set(newBill);
        }
        throw redirect(308, url.pathname + '/success');
	}
};
