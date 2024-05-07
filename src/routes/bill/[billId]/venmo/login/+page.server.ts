import { message, superValidate } from 'sveltekit-superforms/server';
import { LoginSchema } from './__route/schemas/loginSchema.js';
import { fail, redirect } from '@sveltejs/kit';
import { venmoLogin } from './__route/actions/login.server.js';
import {kv} from '$lib/kv.server.js'
import { DEPLOYMENT_HOOK } from '$env/static/private';

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
				await redeployIfNecessary()
				return message(
					form,
					{ message: 'Either your credentials are wrong or Venmo hates me right now. Generally, waiting 2 minutes fixes the latter problem.' },
					{ status: 503 }
				);
			default:
				throw redirect(308, `${url.pathname}/sendSms?k=${loginResp.otpSecret}`);
		}
	}
};

async function redeployIfNecessary() {
	const lastDeployed = await kv.get<string>('last-deployment')
	console.log(lastDeployed);
	if (!lastDeployed || (new Date().getTime() - new Date(lastDeployed).getTime() ?? 0) > (2 * 60 * 1000)) {
		console.log('Triggering redeploy')
		await fetch(DEPLOYMENT_HOOK)
		await kv.set<string>('last-deployment', new Date().toISOString())
	}
}
