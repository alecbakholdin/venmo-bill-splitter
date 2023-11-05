import { BillSchema } from '$lib/firestore/schemas/Bill';
import { getForm } from 'formsnap';
import type { z } from 'zod';

export function getBillForm() {
	return getForm<z.ZodEffects<typeof BillSchema>>();
}

export function getBillFormConfig() {
	const form = getBillForm();
	return {
		form,
		schema: BillSchema
	};
}