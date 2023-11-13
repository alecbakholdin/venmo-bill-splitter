import { z } from "zod";

export const SendInvoiceSchema = z.object({
    billTitle: z.string(),
    items: z.array(z.object({
        title: z.string(),
        itemTotal: z.string(),
        amountOwed: z.string(),
    })),
    subtotal: z.string(),
    tipAndTax: z.string(),
    total: z.string()
})