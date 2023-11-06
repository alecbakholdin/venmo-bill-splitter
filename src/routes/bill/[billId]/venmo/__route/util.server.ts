import { error, type Cookies } from '@sveltejs/kit';
import request from 'graphql-request';

export const VENMO_ACCESS_TOKEN_COOKIE = 'VENMO_ACCESS_TOKEN';
export const VENMO_DEVICE_ID_COOKIE = 'VENMO_DEVICE_ID';
export const VENMO_W_FC_COOKIE = 'W_FC_COOKIE';
export const VENMO_CSRF_COOKIE = 'VENMO_CSRF_COOKIE';
export const VENMO_LOGIN_EMAIL_COOKIE = 'VENMO_LOGIN_EMAIL';
const USER_AGENT =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';

export function isLoggedIntoVenmo(cookies: Cookies) {
	return Boolean(cookies.get(VENMO_ACCESS_TOKEN_COOKIE));
}

export function venmoRestHeaders(
	cookies: Cookies,
	options?: {
		ignoreCsrfCookie?: boolean;
		csrfToken?: string;
		otpSecret?: string;
		printHeaders?: boolean;
		origin?: string;
	}
) {
	cookies.set(VENMO_W_FC_COOKIE, cookies.get(VENMO_W_FC_COOKIE) || crypto.randomUUID(), {
		path: '/'
	});
	cookies.set(
		VENMO_DEVICE_ID_COOKIE,
		cookies.get(VENMO_DEVICE_ID_COOKIE) || `fp01-${crypto.randomUUID()}`,
		{ path: '/', maxAge: 86_400 * 365 }
	);

	const headers = {
		'User-Agent': USER_AGENT,
		'Content-Type': 'application/json',
		...(options?.csrfToken && {
			'Csrf-Token': options.csrfToken,
			'Xsrf-Token': options.csrfToken
		}),
		...(options?.otpSecret && {
			'venmo-otp-secret': options.otpSecret
		}),
		Cookie: [
			['api_access_token', cookies.get(VENMO_ACCESS_TOKEN_COOKIE)],
			['v_id', cookies.get(VENMO_DEVICE_ID_COOKIE)],
			['_csrf', options?.ignoreCsrfCookie ? undefined : cookies.get(VENMO_CSRF_COOKIE)],
			['login_email', cookies.get(VENMO_LOGIN_EMAIL_COOKIE)],
			['w_fc', cookies.get(VENMO_W_FC_COOKIE)]
		]
			.filter(([_, value]) => value)
			.map(([key, val]) => `${key}=${val};`)
			.join(' ')
	};
	if (options?.printHeaders) {
		console.log(headers);
	}
	return headers;
}

export function getVenmoResponseCookie(response: Response, key: string): string {
	const setCookieHeader = response.headers.get('set-cookie');
	const pair = setCookieHeader
		?.split(';')
		.map((v) => v.trim().split('='))
		.find((v) => v[0].trim() === key || v[0].trim() === `Secure, ${key}`);
	return pair?.length ? pair[1] : '';
}

export async function parseCsrfToken(response: Response): Promise<string | undefined> {
	const text = await response.text();
	const csrfMatch = text.match(
		/<script id="__NEXT_DATA__" type="application\/json">([^<>]+)<\/script>/
	);
	const csrfData = csrfMatch?.[1];
	const parsedData = JSON.parse(csrfData ?? '');
	return parsedData?.['props']?.['pageProps']?.['csrfToken'] as string | undefined;
}

export function setCookieIfPresent(
	cookies: Cookies,
	response: Response,
	apiKey: string,
	venmoKey: string,
	opt?: { maxAge?: number; path?: string }
) {
	const value = getVenmoResponseCookie(response, venmoKey);
	if (value) {
		cookies.set(apiKey, value, opt);
	}
}

export function setAccessToken(cookies: Cookies, response: Response) {
	return setCookieIfPresent(cookies, response, VENMO_ACCESS_TOKEN_COOKIE, 'api_access_token', {
		maxAge: 1800,
		path: '/'
	});
}

export function setCsrfCookie(cookies: Cookies, response: Response) {
	return setCookieIfPresent(cookies, response, VENMO_CSRF_COOKIE, '_csrf');
}

export function graphQlRequest(cookies: Cookies, query: string, variables: any = {}) {
	if (!cookies.get(VENMO_ACCESS_TOKEN_COOKIE) || !cookies.get(VENMO_DEVICE_ID_COOKIE)) {
		throw error(400, 'Missing access token or device ID');
	}
	return request('https://api.venmo.com/graphql', query, variables, {
		Authorization: `Bearer ${cookies.get(VENMO_ACCESS_TOKEN_COOKIE)}`,
		'Venmo-Device-Id': cookies.get(VENMO_DEVICE_ID_COOKIE),
		'Venmo-Client-Id': 10,
		'User-Agent': USER_AGENT
	} as any) as any;
}
