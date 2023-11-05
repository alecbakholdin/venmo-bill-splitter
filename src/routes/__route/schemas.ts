import { z } from "zod";

export const CreateBillSchema = z.object({
    receiptFile: z.any().optional(),
    receiptPicture: z.any().optional()
})