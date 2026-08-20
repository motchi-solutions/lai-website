import { z } from "zod";

const cleanText = (max: number) =>
    z.string().trim().max(max).transform((value) => value.replace(/\r\n/g, "\n"));

export const contactSchema = z.object({
    name: cleanText(100).pipe(z.string().min(2, "Please enter your full name.")),
    email: cleanText(254).pipe(z.string().email("Please enter a valid email address.")),
    organization: cleanText(150),
    details: cleanText(3000).pipe(
        z.string().min(20, "Please share at least 20 characters about your event."),
    ),
    captchaToken: z.string().min(1),
    website: z.string().max(0),
});

export type ContactPayload = z.infer<typeof contactSchema>;
