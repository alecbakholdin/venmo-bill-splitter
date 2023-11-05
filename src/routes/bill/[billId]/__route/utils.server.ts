import { billCollection } from '$lib/firestore/collections.server';
import { getUser, type SessionContainer } from '$lib/utils.server';
import { error } from '@sveltejs/kit';

export async function getBill(urlBillId: string, sessionContainer: SessionContainer | string) {
	const { email } =
		typeof sessionContainer === 'string'
			? { email: sessionContainer }
			: await getUser(sessionContainer);
	const bills = await billCollection
		.where('user', '==', email)
		.where('slug', '==', urlBillId.toLowerCase())
		.get();
	if (bills.empty) throw error(404, { message: 'This bill does not exist' });
	const bill = bills.docs[0];
	return bill;
}

export async function billExists(
	urlBillId: string | undefined,
	sessionContainer: SessionContainer
) {
	if (!urlBillId) return false;
	try {
		await getBill(urlBillId, sessionContainer);
		return true;
	} catch {
		return false;
	}
}
