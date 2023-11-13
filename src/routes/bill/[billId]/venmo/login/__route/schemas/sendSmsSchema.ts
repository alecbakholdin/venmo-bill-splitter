import { z } from "zod";

export const SendSmsSchema = z.object({
    otpSecret: z.string().min(1, "Missing OTP secret")
})