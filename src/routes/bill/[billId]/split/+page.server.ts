import { BillSchema } from '$lib/firestore/schemas/Bill';
import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { formatVenmo } from '../__route/VenmoPersonRow.svelte';
import { getBillFromJwt } from '../../../../lib/types/inviteAuth.server';
import { SplitBillSchema } from './__route/splitForm';
import { getDefaults } from '$lib/utils';
import { FriendSchema } from '$lib/firestore/schemas/Friend';
import { createOrUpdateFriend } from '$lib/friends.util';
import { split } from 'lodash';

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
		console.log(form.data);;
		const venmo = formatVenmo(form.data.venmo);
		const email = form.data.email;
		const friendDefaults = getDefaults(FriendSchema);
		console.log({...friendDefaults, email, venmo});
		
		const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'split');
		await createOrUpdateFriend({...friendDefaults, email, venmo}, bill.data().user);

		const billData = bill.data();
		for (let i = 0; i < billData.items.length; i++) {
			const billItem = billData.items[i];
			const friend = billItem.friends.find(fr => fr.email === email)
			const splitAmount = form.data.items[i]
			const isFriendInBillItem = Boolean(friend)
			const shouldFriendBeInBillItem = Boolean(splitAmount)

			if(shouldFriendBeInBillItem && isFriendInBillItem) {
				friend!.splitValue = splitAmount;
			} else if (shouldFriendBeInBillItem && !isFriendInBillItem) {
				billItem.friends.push({ splitValue: splitAmount, email, totalOwed: 0 });
			} else if (!shouldFriendBeInBillItem) {
				billItem.friends = billItem.friends.filter(x => x.email !== email)
			}
		}
		if (!billData.friends.find((x) => x.email === email)) {
			billData.friends.push({ email, total: 0, subtotal: 0, items: [] });
		}
		const newBill = BillSchema.parse(billData);
		await bill.ref.set(newBill);
		throw redirect(308, url.pathname + '/success');
	}
};
