import { friendCollection } from '$lib/firestore/collections.server';
import { getUser } from '$lib/utils.server.js';
import { error, json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
	const { email } = await getUser(locals);
	const response = await friendCollection
		.where('user', '==', email)
		.where('email', '==', params.email)
		.get();
	if (response.empty) throw error(404, { message: 'User not found' });

	if (response.docs.length > 1)
		console.warn(
			'Returned multiple users for same email',
			response.docs.map((doc) => doc.data())
		);
	return json(response.docs[0].data());
}
