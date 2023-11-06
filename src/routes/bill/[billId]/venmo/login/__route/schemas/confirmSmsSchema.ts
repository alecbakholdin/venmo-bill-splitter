import { z } from "zod";

export const ConfirmSmsSchema = z.object({
    code: z.string().length(6),
    rememberDevice: z.boolean().default(true),
    csrfToken: z.string(),
    otpSecret: z.string()
})