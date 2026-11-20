import "server-only";
import { randomUUID } from "node:crypto";

/* Server-side check of a Cloudflare Turnstile token. Every submission must be
   verified here; the widget alone proves nothing. Shared Motchi standard, see
   AGENTS.md.

   Source: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
   Tokens last 5 minutes, are single-use and are at most 2048 characters.
   Check `action` and `hostname` as well as `success`, and retry
   `internal-error` once with the same idempotency key. */

export const turnstileAction = "contact";
const siteverify = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Cloudflare's test secrets accept only the dummy token and report a
    placeholder hostname, so action and hostname checks are skipped for them. */
const testSecrets = new Set([
    "1x0000000000000000000000000000000AA",
    "2x0000000000000000000000000000000AA",
    "3x0000000000000000000000000000000AA",
]);

export type TurnstileOutcome =
    | { ok: true }
    /** The visitor (or a bot) did not pass. Ask them to try again. */
    | { ok: false; reason: "failed" }
    /** Missing secret, or Cloudflare could not be reached. Our problem, not the visitor's. */
    | { ok: false; reason: "unavailable" };

export async function verifyTurnstile(
    { token, ip, hostname }: { token: string; ip?: string; hostname: string },
    fetchImpl: typeof fetch = fetch,
): Promise<TurnstileOutcome> {
    const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
    if (!secret) return { ok: false, reason: "unavailable" };
    if (!token || token.length > 2048) return { ok: false, reason: "failed" };
    const idempotencyKey = randomUUID();
    for (let attempt = 0; attempt < 2; attempt++) {
        let body: {
            success?: boolean;
            action?: string;
            hostname?: string;
            "error-codes"?: string[];
        };
        try {
            const response = await fetchImpl(siteverify, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret,
                    response: token,
                    idempotency_key: idempotencyKey,
                    ...(ip ? { remoteip: ip } : {}),
                }),
                signal: AbortSignal.timeout(5000),
                cache: "no-store",
            });
            body = await response.json();
        } catch {
            continue;
        }
        const codes = body["error-codes"] ?? [];
        if (body.success) {
            const testing = testSecrets.has(secret);
            if (!testing && body.action !== turnstileAction) return { ok: false, reason: "failed" };
            if (!testing && body.hostname !== hostname) return { ok: false, reason: "failed" };
            return { ok: true };
        }
        if (codes.includes("internal-error")) continue;
        if (codes.some((code) => code.includes("input-secret")))
            return { ok: false, reason: "unavailable" };
        return { ok: false, reason: "failed" };
    }
    return { ok: false, reason: "unavailable" };
}

/** The hostname the visitor used, for the Turnstile hostname check. */
export function requestHostname(request: Request): string {
    return new URL(request.url).hostname;
}

/** First address in x-forwarded-for (set by Vercel), if any. */
export function requestIp(request: Request): string | undefined {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}
