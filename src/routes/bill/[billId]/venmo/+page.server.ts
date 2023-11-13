import { redirect } from '@sveltejs/kit';
import { isLoggedIntoVenmo } from './__route/util.server.js';
import { getBill } from '../__route/utils.server.js';
import type { z } from 'zod';
import type { BillSchema } from '$lib/firestore/schemas/Bill.js';

export async function load({ cookies, params, locals, url }) {
	if (!isLoggedIntoVenmo(cookies)) throw redirect(308, url.pathname + '/login');
	const bill = (await getBill(params.billId, locals)).data() as z.infer<typeof BillSchema>;

    return {
        bill
    }
}
