import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { firestore } from '$lib/firebase.server';

const anonPaths = ['/login', '/api/venmo/u', '/bill/[billId]/invite', '/bill/[billId]/split'] as const;

function isAnonPathId(path: string | null) {
	if(!path) return false;
	for(const anonPath of anonPaths) {
		if(path.startsWith(anonPath)) return true;
	}
	return false;
}

const authorization: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const fullpath = `${path}${event.url.search}`;
	if (!isAnonPathId(event.route.id)) {
		const session = await event.locals.getSession();
		if (!session) {
			throw redirect(303, `/login?redirect=${fullpath}`);
		}
	}

	return resolve(event);
};

const redirectOnLogin: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const redirectUrl = event.url.searchParams.get('redirect');
	if (path.startsWith('/login') && redirectUrl) {
		const session = await event.locals.getSession();
		if (session) {
			throw redirect(308, redirectUrl);
		}
	}
	return resolve(event);
};

export const handle = sequence(
	SvelteKitAuth({
		providers: [Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })],
		adapter: FirestoreAdapter(firestore)
	}),
	authorization,
	redirectOnLogin
);
