import { z } from "zod";

export const CreateBillSchema = z.object({
    receipt: z.any().optional()
})