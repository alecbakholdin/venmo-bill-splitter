import { error, json } from '@sveltejs/kit';
import {
	VENMO_CSRF_COOKIE,
	isLoggedIntoVenmo,
	parseCsrfToken,
	setCsrfCookie,
	venmoRestHeaders
} from '../../../bill/[billId]/venmo/__route/util.server.js';
import { VenmoRequestSchema } from './schema.js';

export async function POST({ request, cookies, fetch }) {
	if (!isLoggedIntoVenmo(cookies)) throw error(401, { message: 'Not logged into venmo' });
	const body = VenmoRequestSchema.parse(await request.json());

	const paymentPayload: any = {
		amountInCents: body.amountInCents,
		audience: 'private',
		type: 'request',
		note: body.description,
		targetUserDetails: { userId: body.id }
	};

	const payPageResponse = await fetch('https://account.venmo.com/pay', {
		credentials: 'include',
		headers: venmoRestHeaders(cookies, { ignoreCsrfCookie: true })
	});
	const csrfToken = await parseCsrfToken(payPageResponse);
	setCsrfCookie(cookies, payPageResponse);
	if (!csrfToken || !cookies.get(VENMO_CSRF_COOKIE)) {
		console.error('Could not parse CSRF cookie or token');
		throw error(400, { message: 'Coult not parse CSRF cookie or token' });
	}

	const resp = await fetch('https://account.venmo.com/api/payments', {
		method: 'POST',
		credentials: 'include',
		headers: venmoRestHeaders(cookies, { csrfToken }),
		referrerPolicy: 'origin',
		mode: 'cors',
		body: JSON.stringify(paymentPayload)
	});
	if (resp.status >= 300) {
		console.error('Unexpected error', resp.status, resp.statusText, await resp.text());
		throw error(resp.status, { message: resp.statusText });
	}
	return json(await resp.json());
}
