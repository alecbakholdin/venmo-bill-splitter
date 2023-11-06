import { error, fail, redirect } from '@sveltejs/kit';
import { sendSms } from '../__route/actions/sendSms.server.js';
import { message, superValidate } from 'sveltekit-superforms/server';
import { ConfirmSmsSchema } from '../__route/schemas/confirmSmsSchema.js';
import { confirmSms } from '../__route/actions/confirmSms.server.js';

export async function load({ cookies, url }) {
	const otpSecret = url.searchParams.get('k');
	if (!otpSecret) throw redirect(308, url.pathname.slice(0, url.pathname.lastIndexOf('/2fa')));

	const smsResp = await sendSms(cookies, otpSecret);
	if (smsResp === 'failure') {
		throw error(503, { message: 'Unexpected error sending SMS' });
	}
	const form = await superValidate(ConfirmSmsSchema);
	form.data = { ...form.data, ...smsResp };
	return {
		form
	};
}

export const actions = {
	async default({ request, cookies, url }) {
		const form = await superValidate(request, ConfirmSmsSchema);
		if (!form.valid) return fail(400, { form });

		const { rememberDevice, ...config } = form.data;
		const confirmResp = await confirmSms(cookies, config);

		if (confirmResp === 'failure')
			return message(form, { message: 'Failed to confirm SMS' }, { status: 503 });

        throw redirect(308, url.pathname.slice(0, url.pathname.lastIndexOf('/login/2fa')));
	}
};
