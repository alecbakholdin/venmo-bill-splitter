import { z } from "zod";

export const ConfirmSmsSchema = z.object({
    code: z.string().length(6),
    rememberDevice: z.boolean().default(true),
    csrfToken: z.string().min(1, "Missing CSRF token"),
    otpSecret: z.string().min(1, "Missing OTP secret")
})