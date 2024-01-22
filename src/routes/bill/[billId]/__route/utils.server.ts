import { billCollection } from '$lib/firestore/collections.server';
import { getUser, type SessionContainer } from '$lib/utils.server';
import { error } from '@sveltejs/kit';

export async function getBillBySlug(billSlug: string, sessionContainer: SessionContainer | string) {
	return getBillByField(sessionContainer, 'slug', billSlug);
}

export async function getBillById(billId: string, sessionContainer: SessionContainer | string) {
	return getBillByField(sessionContainer, '__name__', billId);
}

export async function getBillByField(
	sessionContainer: SessionContainer | string,
	field: '__name__' | 'slug',
	value: string
) {
	const { email } =
		typeof sessionContainer === 'string'
			? { email: sessionContainer }
			: await getUser(sessionContainer);
	console.log(field, value);
	const bills = await billCollection
		.where('user', '==', email)
		.where(field, '==', field === 'slug' ? value.toLowerCase() : value)
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
		await getBillBySlug(urlBillId, sessionContainer);
		return true;
	} catch {
		return false;
	}
}
