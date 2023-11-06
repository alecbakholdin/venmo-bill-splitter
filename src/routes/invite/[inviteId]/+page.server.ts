import { inviteLinkCollection } from '$lib/firestore/collections.server.js';
import { addDays } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const linkQuery = await inviteLinkCollection
		.where('id', '==', params.inviteId)
		.where('expiration', '>=', addDays(new Date(), -7).toISOString())
		.orderBy('expiration', 'desc')
		.get();

	if (linkQuery.empty) throw error(404, { message: 'Link is expired or invalid' });
	const { link } = linkQuery.docs[0].data();
	throw redirect(308, link);
}
