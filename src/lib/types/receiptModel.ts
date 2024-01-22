import { number, z, type AnyZodObject, type ZodTypeAny } from 'zod';

export interface ReceiptFieldsModel {
	MerchantName?: string;
	MerchantPhoneNumber?: string;
	MerchantAddress?: string;
	Total?: string;
	TransactionDate?: string;
	TransactionTime?: string;

	Subtotal?: number;
}

const FieldSchema = z.object({
	content: z.string().optional(),
	valueNumber: z.number().optional(),
	valueCurrency: z
		.object({
			amount: z.number(),
		})
		.optional(),
	valueDate: z.string().optional(),
	valueObject: z.any()
});

function stringField() {
	return FieldSchema.transform((x) => x.content).optional();
}
function numberField() {
	return FieldSchema.transform((x) => x.valueNumber).optional();
}
function currencyField() {
	return FieldSchema.transform((x) => x.valueCurrency?.amount).optional();
}
function dateField() {
	return FieldSchema.transform((x) => x.valueDate && new Date(x.valueDate)).optional();
}
function arrayOfObjectsField<T extends ZodTypeAny>(objSchema: T) {
	return z
		.object({
			valueArray: z.array(
				z.object({
					valueObject: objSchema
				})
			)
		})
		.transform((x) => x.valueArray.map((item) => item.valueObject))
		.optional();
}

export const ReceiptItemSchema = z.object({
	TotalPrice: numberField(),
	Description: stringField(),
	Quantity: numberField(),
	Price: numberField(),
	ProductCode: stringField(),
	QuantityUnit: stringField()
});

export const ReceiptModelSchema = z.object({
	MerchantName: stringField(),
	MerchantPhoneNumber: stringField(),
	MerchantAddress: stringField(),

	TransactionDate: dateField(),
	TransactionTime: dateField(),

	Total: numberField(),
	Subtotal: numberField(),
	TotalTax: numberField(),
	Tip: numberField(),

	Items: arrayOfObjectsField(ReceiptItemSchema),
	TaxDetails: arrayOfObjectsField(
		z.object({
			Amount: currencyField()
		}).optional()
	)
});
