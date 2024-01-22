import { inviteLinkCollection } from '$lib/firestore/collections.server.js';
import { addDays } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, url }) {
	const linkQuery = await inviteLinkCollection
		.where('id', '==', params.inviteId)
		.where('expiration', '>=', addDays(new Date(), -7).toISOString())
		.orderBy('expiration', 'desc')
		.get();

	if (linkQuery.empty) throw error(404, { message: 'Link is expired or invalid' });
	const { billSlug, action, authToken } = linkQuery.docs[0].data();
	const link = `${url.origin}/bill/${billSlug}/${action}?auth=${authToken}`;
	throw redirect(308, link);
}
