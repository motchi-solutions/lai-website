import "server-only";

const EXPECTED_ACTION = "contact";

type AssessmentResponse = {
    tokenProperties?: {
        valid?: boolean;
        invalidReason?: string;
        action?: string;
    };
    riskAnalysis?: {
        score?: number;
        reasons?: string[];
        challenge?: string;
    };
};

export type RecaptchaVerification = {
    valid: boolean;
    category:
        | "valid"
        | "invalid-token"
        | "wrong-action"
        | "failed-challenge"
        | "malformed-response"
        | "api-error";
};

function requiredEnv(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not configured.`);
    return value;
}

export async function verifyRecaptchaEnterprise({
    token,
    userAgent,
    clientIp,
    requestedUri,
}: {
    token: string;
    userAgent?: string;
    clientIp?: string;
    requestedUri: string;
}): Promise<RecaptchaVerification> {
    const projectId = requiredEnv("GCP_PROJECT_ID");
    const apiKey = requiredEnv("GOOGLE_RECAPTCHA_API_KEY");
    const siteKey = requiredEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
    const event: Record<string, string> = {
        token,
        siteKey,
        expectedAction: EXPECTED_ACTION,
        requestedUri,
    };
    if (userAgent) event.userAgent = userAgent;
    if (clientIp) event.userIpAddress = clientIp;

    let response: Response;
    try {
        response = await fetch(
            `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments?key=${encodeURIComponent(apiKey)}`,
            {
                method: "POST",
                headers: { "content-type": "application/json; charset=utf-8" },
                body: JSON.stringify({ event }),
                cache: "no-store",
                signal: AbortSignal.timeout(8_000),
            },
        );
    } catch {
        console.warn("reCAPTCHA assessment failed", { category: "network-or-timeout" });
        return { valid: false, category: "api-error" };
    }

    if (!response.ok) {
        console.warn("reCAPTCHA assessment failed", {
            category: "api-error",
            status: response.status,
        });
        return { valid: false, category: "api-error" };
    }

    let assessment: AssessmentResponse;
    try {
        assessment = (await response.json()) as AssessmentResponse;
    } catch {
        console.warn("reCAPTCHA assessment failed", { category: "malformed-response" });
        return { valid: false, category: "malformed-response" };
    }

    const properties = assessment.tokenProperties;
    if (!properties || typeof properties.valid !== "boolean") {
        console.warn("reCAPTCHA assessment failed", { category: "malformed-response" });
        return { valid: false, category: "malformed-response" };
    }
    if (!properties.valid) {
        return { valid: false, category: "invalid-token" };
    }
    if (properties.action !== EXPECTED_ACTION) {
        return { valid: false, category: "wrong-action" };
    }

    const score = assessment.riskAnalysis?.score;
    if (typeof score !== "number" || score < 0 || score > 1) {
        console.warn("reCAPTCHA assessment failed", { category: "malformed-response" });
        return { valid: false, category: "malformed-response" };
    }

    const challenge = assessment.riskAnalysis?.challenge;
    if (challenge === "FAILED" || challenge === "FAIL") {
        return { valid: false, category: "failed-challenge" };
    }

    return { valid: true, category: "valid" };
}
