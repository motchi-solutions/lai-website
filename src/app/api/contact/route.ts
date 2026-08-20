import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { contactSchema } from "@/lib/contact-schema";
import { appendContactSubmission, FormResponseStorageError } from "@/lib/google-integrations";
import { checkContactRateLimit } from "@/lib/rate-limit";
import { verifyRecaptchaEnterprise } from "@/lib/recaptcha-enterprise";

export const runtime = "nodejs";
const responseHeaders = { "Cache-Control": "no-store, max-age=0" };

function json(body: object, status: number) {
    return NextResponse.json(body, { status, headers: responseHeaders });
}

function getTrustedClientIp(request: Request) {
    if (process.env.VERCEL !== "1") return undefined;
    return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

export async function POST(request: Request) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin) {
        return json({ message: "Request could not be verified." }, 403);
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
        return json({ message: "Unsupported request format." }, 415);
    }
    if (Number(request.headers.get("content-length") ?? "0") > 12_000) {
        return json({ message: "Request is too large." }, 413);
    }

    let body: unknown;
    try {
        const rawBody = await request.text();
        if (rawBody.length > 12_000) return json({ message: "Request is too large." }, 413);
        body = JSON.parse(rawBody);
    } catch {
        return json({ message: "Invalid request." }, 400);
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
        return json(
            {
                message: "Please review the highlighted fields.",
                fieldErrors: parsed.error.flatten().fieldErrors,
            },
            400,
        );
    }
    if (parsed.data.website)
        return json({ message: "Thanks! Your request has been received." }, 200);

    const clientIp = getTrustedClientIp(request);
    const rateIdentifier = clientIp ?? request.headers.get("user-agent") ?? "unknown";
    const rateKey = createHash("sha256").update(rateIdentifier).digest("hex");
    try {
        const limit = await checkContactRateLimit(rateKey);
        if (!limit.success) {
            return json(
                { message: "Too many requests. Please wait a few minutes and try again." },
                429,
            );
        }
        const captcha = await verifyRecaptchaEnterprise({
            token: parsed.data.captchaToken,
            userAgent: request.headers.get("user-agent") ?? undefined,
            clientIp,
            requestedUri: new URL(request.url).origin,
        });
        if (!captcha.valid) {
            return json({ message: "We couldn't verify your submission. Please try again." }, 403);
        }
        try {
            await appendContactSubmission(parsed.data);
        } catch (error) {
            const referenceId = randomUUID().slice(0, 8).toUpperCase();
            const errorCode =
                error instanceof FormResponseStorageError
                    ? error.errorCode
                    : "CONTACT_STORAGE_UNAVAILABLE";
            console.error("Contact submission storage failed", {
                referenceId,
                integration: "google_sheets",
                operation:
                    error instanceof FormResponseStorageError
                        ? error.operation
                        : "append_form_response",
                stage: error instanceof FormResponseStorageError ? error.stage : "sheets_append",
                errorCode,
                errorType: error instanceof Error ? error.name : "UnknownError",
                status: error instanceof FormResponseStorageError ? error.status : undefined,
                googleCode:
                    error instanceof FormResponseStorageError ? error.googleCode : undefined,
            });
            return json(
                {
                    message: "We couldn't save your request right now. Please try again shortly.",
                    errorCode,
                    referenceId,
                },
                503,
            );
        }
        return json({ message: "Thanks! Your event request has been sent." }, 201);
    } catch (error) {
        console.error("Contact submission verification failed", {
            errorType: error instanceof Error ? error.name : "UnknownError",
        });
        return json(
            { message: "We could not send your request right now. Please try again shortly." },
            503,
        );
    }
}
