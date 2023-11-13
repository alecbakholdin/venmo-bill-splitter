import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { confirmSms } from '../__route/actions/confirmSms.server.js';
import { ConfirmSmsSchema } from '../__route/schemas/confirmSmsSchema.js';

export async function load({ cookies, url }) {
	const otpSecret = url.searchParams.get('k');
	const csrfToken = url.searchParams.get('csrfToken');
	if (!otpSecret || !csrfToken) {
		console.log('missing csrfToken or otpSecret', csrfToken, otpSecret);
		throw redirect(308, url.pathname.slice(0, url.pathname.lastIndexOf('/2fa')));
	}

	const form = await superValidate(ConfirmSmsSchema);
	form.data = {
		otpSecret,
		csrfToken,
		code: '',
		rememberDevice: true
	};
	return {
		form,
		csrfToken,
		otpSecret
	};
}

export const actions = {
	async default({ request, cookies, url }) {
		const form = await superValidate(request, ConfirmSmsSchema);
		console.log(form.data);
		if (!form.valid) return fail(400, { form });

		const { rememberDevice, ...config } = form.data;
		const confirmResp = await confirmSms(cookies, config);

		if (confirmResp === 'failure')
			return message(form, { message: 'Failed to confirm SMS' }, { status: 503 });

		throw redirect(308, url.pathname.slice(0, url.pathname.lastIndexOf('/login/2fa')));
	}
};
