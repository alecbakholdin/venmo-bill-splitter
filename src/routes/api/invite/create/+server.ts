import { inviteLinkCollection } from '$lib/firestore/collections.server.js';
import {
    CreateInviteLinkSchema,
    createInviteJwt,
    type InviteAuthPayload
} from '$lib/types/inviteAuth.server.js';
import { addDays } from '$lib/utils';
import { getUser } from '$lib/utils.server.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals, url }) {
	const { billSlug, billId, action } = CreateInviteLinkSchema.parse(await request.json());
	const { email } = await getUser(locals);
	const authPayload: InviteAuthPayload = {
		billId,
		action,
		billOwner: email
	};
	const authToken = createInviteJwt(authPayload);
	const authLink = `${url.origin}/bill/${billSlug}/${action}?auth=${authToken}`;
	const authId = randomId();

	await inviteLinkCollection.add({
		expiration: addDays(new Date(), 7).toISOString(),
		id: authId,
		billId,
		billSlug,
		action,
		authToken,
	});
	return json({
		fullInviteLink: authLink,
		shortInviteLink: `${url.origin}/invite/${authId}`
	});
}

const randomString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function randomId() {
	return Array.from({ length: 10 })
		.map(() => randomString.charAt(Math.floor(Math.random() * randomString.length)))
		.join('');
}
