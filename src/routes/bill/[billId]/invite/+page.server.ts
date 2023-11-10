import { BillSchema } from '$lib/firestore/schemas/Bill';
import { FriendSchema } from '$lib/firestore/schemas/Friend';
import { getDefaults } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { getBillFromJwt } from '../../../../lib/types/inviteAuth.server';
import { formatVenmo } from '../__route/VenmoPersonRow.svelte';
import { InviteSchema } from './__route/inviteForm';

export async function load({ url, params }) {
	const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'invite');
	const billData = bill.data();
	return { bill: billData, inviteForm: await superValidate(InviteSchema) };
}

export const actions = {
	async default({ request, params, url, fetch }) {
		const form = await superValidate(request, InviteSchema);
		if (!form.valid) return fail(400, { form });
		const venmo = formatVenmo(form.data.venmo);
		const email = form.data.email;
		const friendDefaults = getDefaults(FriendSchema);
		await fetch('/api/friend', {
			method: 'POST',
			body: JSON.stringify({ ...friendDefaults, email, venmo })
		});

		const bill = await getBillFromJwt(url.searchParams.get('auth'), params.billId, 'invite');
		const billData = bill.data();
		for (let i = 0; i < billData.items.length; i++) {
			const billItem = billData.items[i];
			const friendInBillItem = Boolean(billItem.friends.find((fr) => fr.email === email));
			const friendShouldBeInBillItem = Boolean(billItem.addNewFriends);
			if (friendInBillItem === friendShouldBeInBillItem) continue;
			else if (!friendInBillItem) {
				billItem.friends.push({ splitValue: 1, email, totalOwed: 0 });
			} else if (friendInBillItem) {
				billItem.friends = billItem.friends.filter((fr) => fr.email !== email);
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
