import type { z } from 'zod';
import { friendCollection } from './firestore/collections.server';
import { FriendSchema } from './firestore/schemas/Friend';

export async function createOrUpdateFriend(
	friendObj: z.infer<typeof FriendSchema> & { user?: string },
	email: string
) {
	const friendInput = {
		...Object.fromEntries(Object.entries(friendObj).filter(([_, val]) => val)),
		user: email
	};
	const friendUpdate = FriendSchema.parse(friendInput);

	const resp = await friendCollection
		.where('user', '==', email)
		.where('email', '==', friendUpdate.email)
		.get();
	if (!resp.empty) {
        const existingFriend = resp.docs[0];
		await existingFriend.ref.update(friendUpdate);
		console.log('updated', friendUpdate);
        return {...existingFriend.data(), ...friendUpdate};
	} else {
		await friendCollection.add(friendUpdate);
		console.log('created', friendUpdate);
        return friendUpdate;
	}
}
