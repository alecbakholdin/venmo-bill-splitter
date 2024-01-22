import { createOrUpdateFriend } from '$lib/friends.util.js';
import { getUser } from '$lib/utils.server.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { email } = await getUser(locals);
	const friend = await createOrUpdateFriend(await request.json(), email);
	return json(friend);
}
