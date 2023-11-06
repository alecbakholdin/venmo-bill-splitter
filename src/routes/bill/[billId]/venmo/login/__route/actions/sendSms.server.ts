import type { Cookies } from '@sveltejs/kit';
import { parseCsrfToken, setCsrfCookie, venmoRestHeaders } from '../../../__route/util.server';

export async function sendSms(cookies: Cookies, otpSecret: string) {
	const headers = venmoRestHeaders(cookies, { ignoreCsrfCookie: true });
	const smsPageResponse = await fetch(`https://venmo.com/account/mfa/sms?k=${otpSecret}`, {
		headers
	});
	console.log('otp secret', otpSecret);
	setCsrfCookie(cookies, smsPageResponse);
	const csrfToken = await parseCsrfToken(smsPageResponse);
	if (smsPageResponse.status >= 300) {
		console.error('SMS Page returned error', smsPageResponse.status, smsPageResponse.statusText);
		return 'failure';
	} else if (!csrfToken) {
		console.error('Failed to parse CSRF token for sms page');
		return 'failure';
	}
	const sendSmsResponse = await fetch('https://venmo.com/api/account/mfa/token', {
		method: 'POST',
		headers: venmoRestHeaders(cookies, { otpSecret, csrfToken }),
		body: JSON.stringify({ via: 'sms' })
	});
	if (sendSmsResponse.status === 200) return {
		csrfToken,
		otpSecret,
	};

	console.error(
		'Failed to send SMS POST request',
		sendSmsResponse.status,
		sendSmsResponse.statusText
	);
	return 'failure';
}
