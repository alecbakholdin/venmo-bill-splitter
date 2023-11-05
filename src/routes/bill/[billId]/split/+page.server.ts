import { BillItemSchema, BillSchema } from '$lib/firestore/schemas/Bill';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formatVenmo } from '../__route/VenmoPersonRow.svelte';
import { getBillFromJwt } from '../__route/inviteAuth.server';
import { SplitBillSchema } from './__route/splitForm';
import { ConstructionIcon } from 'lucide-svelte';

export async function load({ url, params }) {
	const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'split');
	const billData = bill.data();
	const splitForm = await superValidate(SplitBillSchema);
	splitForm.data.items = Array.from({ length: billData.items.length });
	return { bill: billData, splitForm };
}

export const actions = {
	async default({ request, params, url }) {
		const form = await superValidate(request, SplitBillSchema);
		if (!form.valid) return fail(400, { form });
		const venmo = formatVenmo(form.data.venmo);
        console.log(form.data);

		const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'split');
		const billData = bill.data();
		for(let i = 0; i < billData.items.length; i++) {
            const billItem = billData.items[i];
            const friendInBillItem = Boolean(billItem.friends.find(fr => fr.venmo === venmo));
            const friendShouldBeInBillItem = Boolean(form.data.items[i]);
            if(friendInBillItem === friendShouldBeInBillItem) continue;
            else if(!friendInBillItem) {
                billItem.friends.push({splitValue: 1, venmo, totalOwed: 0})
            } else if(friendInBillItem) {
                billItem.friends = billItem.friends.filter(fr => fr.venmo !== venmo);
            }
        }
		if (!billData.friends.find((x) => x.venmo === venmo)) {
			billData.friends.push({ venmo, total: 0, subtotal: 0, items: [] });
		}
        const newBill = BillSchema.parse(billData);
        await bill.ref.set(newBill);
		throw redirect(308, url.pathname + '/success');
	}
};
