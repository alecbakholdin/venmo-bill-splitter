import type { Cookies } from '@sveltejs/kit';
import { setAccessToken, setCsrfCookie, venmoRestHeaders } from '../../../__route/util.server';

export async function venmoLogin(cookies: Cookies, username: string, password: string) {
	const headers = venmoRestHeaders(cookies);
	const loginResponse = await fetch('https://venmo.com/login', {
		headers,
		method: 'POST',
		body: JSON.stringify({
			phoneEmailUsername: username,
			password,
			isGroup: false
		})
	});
	setCsrfCookie(cookies, loginResponse);
	setAccessToken(cookies, loginResponse);

	switch (loginResponse.status) {
		case 201:
			return 'success';
		case 400:
		case 401:
			const otpSecret = await getOtpSecret(loginResponse);
			if(!otpSecret) {
				console.error(`Login response ${loginResponse.status} did not include OTP secret`);
				return "failure";
			}
			return {otpSecret};
		default:
			console.error(`Unexpected response ${loginResponse.status} ${await loginResponse.text()}`);
			return "failure";
	}
}

async function getOtpSecret(response: Response) {
	return response.headers.get('venmo-otp-secret') || (await response.json()).secret;
}
