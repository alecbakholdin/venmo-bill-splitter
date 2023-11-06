import jwt from 'jsonwebtoken';
import { AUTH_SECRET } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { getBill } from '../../routes/bill/[billId]/__route/utils.server';
import { z } from 'zod';

export const CreateInviteLinkSchema = z.object({
	billId: z.string(),
	action: z.enum(['split', 'invite'])
});
export const InviteAuthPayloadSchema = z.object({
	billId: z.string(),
	billOwner: z.string(),
	action: z.enum(['split', 'invite'])
});
export type InviteAuthPayload = z.infer<typeof InviteAuthPayloadSchema>;

export function createInviteJwt(payload: InviteAuthPayload) {
	return jwt.sign({ data: payload }, AUTH_SECRET, { expiresIn: '7d' });
}

export function decodeInviteJwt(token: string | null | undefined): InviteAuthPayload {
	if (!token) throw error(401, { message: 'Unauthenticated' });
	try {
		const payload = jwt.verify(token, AUTH_SECRET);
		if (typeof payload === 'string')
			throw error(500, { message: 'Weird error, idk man, ask Alec' });
		return payload.data;
	} catch {
		throw error(403, { message: 'Unauthorized' });
	}
}

export async function getBillFromJwt(
	token: string | null | undefined,
	urlBillId: string,
	expectedAction: 'split' | 'invite'
) {
	const { billId, billOwner, action } = decodeInviteJwt(token);
	if (billId !== urlBillId || action !== expectedAction)
		throw error(403, { message: 'Wrong bill' });

	return await getBill(billId, billOwner);
}
