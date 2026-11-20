import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    appendContactSubmission: vi.fn(),
    checkContactRateLimit: vi.fn(async () => ({ success: true })),
    verifyTurnstile: vi.fn(),
}));

vi.mock("@/lib/google-integrations", () => ({
    appendContactSubmission: mocks.appendContactSubmission,
    FormResponseStorageError: class FormResponseStorageError extends Error {},
}));
vi.mock("@/lib/rate-limit", () => ({ checkContactRateLimit: mocks.checkContactRateLimit }));
vi.mock("@/lib/turnstile", () => ({
    verifyTurnstile: mocks.verifyTurnstile,
    requestHostname: (request: Request) => new URL(request.url).hostname,
}));

import { POST } from "./route";

const validBody = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    organization: "Analytical Events",
    details: "A catered launch event for approximately 80 guests.",
    captchaToken: "captcha-token",
    website: "",
};

function request(body: object) {
    return new Request("https://lai.example/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://lai.example" },
        body: JSON.stringify(body),
    });
}

describe("POST /api/contact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.checkContactRateLimit.mockResolvedValue({ success: true });
        mocks.appendContactSubmission.mockResolvedValue(undefined);
    });

    it("does not verify Turnstile or write invalid form data", async () => {
        const response = await POST(request({ ...validBody, details: "Too short" }));

        expect(response.status).toBe(400);
        expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
        expect(mocks.appendContactSubmission).not.toHaveBeenCalled();
    });

    it("does not write when Turnstile verification fails", async () => {
        mocks.verifyTurnstile.mockResolvedValue({ ok: false, reason: "failed" });

        const response = await POST(request(validBody));

        expect(response.status).toBe(403);
        expect(mocks.verifyTurnstile).toHaveBeenCalledTimes(1);
        expect(mocks.appendContactSubmission).not.toHaveBeenCalled();
    });

    it("writes exactly once after validation and Turnstile succeed", async () => {
        mocks.verifyTurnstile.mockResolvedValue({ ok: true });

        const response = await POST(request(validBody));

        expect(response.status).toBe(201);
        expect(mocks.verifyTurnstile).toHaveBeenCalledTimes(1);
        expect(mocks.appendContactSubmission).toHaveBeenCalledOnce();
        expect(mocks.appendContactSubmission).toHaveBeenCalledWith(validBody);
    });

    it("returns 503 without writing when Turnstile is unavailable", async () => {
        mocks.verifyTurnstile.mockResolvedValue({ ok: false, reason: "unavailable" });

        const response = await POST(request(validBody));

        expect(response.status).toBe(503);
        expect(mocks.appendContactSubmission).not.toHaveBeenCalled();
    });

    it("returns a reportable code and reference when storage fails", async () => {
        mocks.verifyTurnstile.mockResolvedValue({ ok: true });
        mocks.appendContactSubmission.mockRejectedValue(new Error("Internal integration failure"));

        const response = await POST(request(validBody));
        const body = (await response.json()) as { errorCode?: string; referenceId?: string };

        expect(response.status).toBe(503);
        expect(body.errorCode).toBe("CONTACT_STORAGE_UNAVAILABLE");
        expect(body.referenceId).toMatch(/^[A-F0-9]{8}$/);
    });
});
