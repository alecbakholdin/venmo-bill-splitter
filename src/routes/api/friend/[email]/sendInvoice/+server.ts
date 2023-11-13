import { SENDGRID_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import { SendInvoiceSchema } from './schema.js';

sgMail.setApiKey(SENDGRID_API_KEY);

export async function POST({ request, params }) {
	const { email } = params;
	const data = SendInvoiceSchema.parse(await request.json());
	await sgMail.send({
		to: email,
		from: 'noreply@bakholdin.com',
		subject: `${data.billTitle} Invoice`,
		templateId: 'd-3cae296998ff4f7bb9c4678dc9d3fa95',
		dynamicTemplateData: data
	});
	return json({ message: 'ok' });
}
