import { friendCollection } from '$lib/firestore/collections.server.js';
import { getUser } from '$lib/utils.server.js';
import { json } from '@sveltejs/kit';

export async function GET({ url, locals }) {
	const q = url.searchParams.get('q')?.trim().toLowerCase();
	const { email } = await getUser(locals);

	console.log(q);
	let query = friendCollection.where('user', '==', email).limit(10).orderBy('email', 'asc');
	if (q) {
		const lessThanQ =
			q.slice(0, q.length - 1) + String.fromCharCode(q.charCodeAt(q.length - 1) + 1);
		query = query.where('email', '>=', q).where('email', '<=', lessThanQ);
	}
	const result = await query.get();
	return json({
		friends: [...result.docs.map((doc) => doc.data()), {email: 'json@gmail.com'}]
	});
}
