import { friendCollection } from '$lib/firestore/collections.server.js';
import { FriendSchema } from '$lib/firestore/schemas/Friend.js';
import { getUser } from '$lib/utils.server.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { email } = await getUser(locals);
	const friendInput = { ...(await request.json()), user: email };
	console.log('input', friendInput);
	const friend = FriendSchema.parse(friendInput);

	const resp = await friendCollection
		.where('user', '==', email)
		.where('email', '==', friend.email)
		.get();
	if (!resp.empty) {
		await resp.docs[0].ref.set(friend);
		console.log('updated', friend);
	} else {
		await friendCollection.add(friend);
		console.log('created', friend);
	}

	return json(friend);
}
