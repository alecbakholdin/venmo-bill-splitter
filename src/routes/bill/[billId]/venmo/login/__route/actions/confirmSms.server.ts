import type { Cookies } from '@sveltejs/kit';
import { setAccessToken, venmoRestHeaders } from '../../../__route/util.server';

export async function confirmSms(
	cookies: Cookies,
	config: { code: string; csrfToken: string; otpSecret: string }
) {
	console.log(config);
	const { csrfToken, otpSecret, code } = config;
	const smsTokenResponse = await fetch('https://venmo.com/api/account/mfa/sign-in', {
		method: 'POST',
		headers: venmoRestHeaders(cookies, { otpSecret, csrfToken, printHeaders: true }),
		body: JSON.stringify({
			code,
			isGroup: false
		})
	});
	if (smsTokenResponse.status === 200) {
		setAccessToken(cookies, smsTokenResponse);
		return 'success';
	}
	console.error(
		'Failed confirmation POST request',
		smsTokenResponse.status,
		smsTokenResponse.statusText
	);
	return 'failure';
}
