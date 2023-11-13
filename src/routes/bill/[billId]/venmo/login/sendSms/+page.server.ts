import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { sendSms } from '../__route/actions/sendSms.server.js';
import { SendSmsSchema } from '../__route/schemas/sendSmsSchema.js';

export async function load({ cookies, url }) {
	const otpSecret = url.searchParams.get('k');
	if (!otpSecret) throw redirect(308, url.pathname.slice(0, url.pathname.lastIndexOf('/2fa')));

	return {
		form: await superValidate(SendSmsSchema),
		otpSecret
	};
}

export const actions = {
	async default({ request, cookies, url }) {
		const form = await superValidate(request, SendSmsSchema);
		if (!form.valid) return fail(400, { form });

		const { otpSecret } = form.data;
		console.log('otpSecret', otpSecret);
		const smsResp = await sendSms(cookies, otpSecret);

		if (smsResp === 'failure') {
            console.error("Failure");
			return message(form, { message: 'Failed to confirm SMS' }, { status: 503 });
		}

		const newPath = url.pathname.slice(0, url.pathname.lastIndexOf('/sendSms')) + '/2fa';
		throw redirect(308, `${newPath}?k=${otpSecret}&csrfToken=${smsResp.csrfToken}`);
	}
};
