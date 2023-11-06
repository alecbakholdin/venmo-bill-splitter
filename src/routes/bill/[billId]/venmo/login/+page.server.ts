import { message, superValidate } from 'sveltekit-superforms/server';
import { LoginSchema } from './__route/schemas/loginSchema.js';
import { fail, redirect } from '@sveltejs/kit';
import { venmoLogin } from './__route/actions/login.server.js';

export async function load() {
	return {
		form: await superValidate(LoginSchema)
	};
}

export const actions = {
	async default({ request, cookies, url }) {
		const form = await superValidate(request, LoginSchema);
		if (!form.valid) return fail(400, { form });

		const loginResp = await venmoLogin(cookies, form.data.usernameOrEmail, form.data.password);
		switch (loginResp) {
			case 'success':
				throw redirect(308, url.pathname.slice(0, url.pathname.lastIndexOf('/login')));
			case 'failure':
				return message(
					form,
					{ message: 'Something bad happened while logging in' },
					{ status: 503 }
				);
			default:
				throw redirect(308, `${url.pathname}/2fa?k=${loginResp.otpSecret}`);
		}
	}
};
