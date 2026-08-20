import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const append = vi.fn();
    const sheets = vi.fn(() => ({ spreadsheets: { values: { append } } }));
    const fromJSON = vi.fn(() => ({}));
    const getVercelOidcToken = vi.fn(async () => "test-oidc-token");

    return { append, sheets, fromJSON, getVercelOidcToken };
});

vi.mock("server-only", () => ({}));
vi.mock("@vercel/oidc", () => ({ getVercelOidcToken: mocks.getVercelOidcToken }));
vi.mock("googleapis", () => ({
    google: {
        auth: { ExternalAccountClient: { fromJSON: mocks.fromJSON } },
        sheets: mocks.sheets,
    },
}));

import { appendContactSubmission, FormResponseStorageError } from "./google-integrations";

const payload = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    organization: "Analytical Events",
    details: "A catered launch event for approximately 80 guests.",
    captchaToken: "verified-by-route",
    website: "",
};

describe("appendContactSubmission", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID = "spreadsheet-id";
        process.env.GCP_PROJECT_NUMBER = "123456789012";
        process.env.GCP_SERVICE_ACCOUNT_EMAIL = "forms@example.iam.gserviceaccount.com";
        process.env.GCP_WORKLOAD_IDENTITY_POOL_ID = "vercel";
        process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = "vercel";
    });

    it("performs one append with the stable column order and a Toronto timestamp", async () => {
        mocks.append.mockResolvedValueOnce({ data: { updates: { updatedRows: 1 } } });

        await appendContactSubmission(payload);

        expect(mocks.append).toHaveBeenCalledTimes(1);
        const [params, options] = mocks.append.mock.calls[0];
        expect(params).toMatchObject({
            spreadsheetId: "spreadsheet-id",
            range: "'Form Responses'!A:E",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
        });
        expect(options).toEqual({ timeout: 10_000 });
        expect(params.requestBody.values[0].slice(1)).toEqual([
            payload.name,
            payload.email,
            payload.organization,
            payload.details,
        ]);
        expect(params.requestBody.values[0][0]).toMatch(
            /^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2} (?:a\.m\.|p\.m\.) (?:EST|EDT)$/,
        );

        const [config] = mocks.fromJSON.mock.calls[0] as unknown as [
            {
                type: string;
                audience: string;
                service_account_impersonation_url: string;
                subject_token_supplier: { getSubjectToken: () => Promise<string> };
            },
        ];
        expect(config).toMatchObject({
            type: "external_account",
            audience:
                "//iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/vercel/providers/vercel",
            service_account_impersonation_url:
                "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/forms@example.iam.gserviceaccount.com:generateAccessToken",
        });
        await config.subject_token_supplier.getSubjectToken();
        expect(mocks.getVercelOidcToken).toHaveBeenCalledWith();
    });

    it("does not retry and exposes only safe error metadata", async () => {
        mocks.append.mockRejectedValueOnce({
            response: { status: 403, data: { error: { status: "PERMISSION_DENIED" } } },
        });

        const error = await appendContactSubmission(payload).catch((reason: unknown) => reason);

        expect(mocks.append).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(FormResponseStorageError);
        expect(error).toMatchObject({
            operation: "append_form_response",
            errorCode: "CONTACT_SHEET_PERMISSION",
            stage: "sheets_append",
            status: 403,
            googleCode: "PERMISSION_DENIED",
        });
    });

    it("retries the named range only when the worksheet range is invalid", async () => {
        mocks.append
            .mockRejectedValueOnce({
                response: { status: 400, data: { error: { status: "INVALID_ARGUMENT" } } },
            })
            .mockResolvedValueOnce({ data: { updates: { updatedRows: 1 } } });

        await appendContactSubmission(payload);

        expect(mocks.append).toHaveBeenCalledTimes(2);
        expect(mocks.append.mock.calls[0][0].range).toBe("'Form Responses'!A:E");
        expect(mocks.append.mock.calls[1][0].range).toBe("form_responses");
    });

    it("does not misclassify a token-exchange 400 as a sheet range failure", async () => {
        mocks.append.mockRejectedValueOnce({
            config: { url: new URL("https://sts.googleapis.com/v1/token") },
            response: { status: 400, data: { error: "invalid_grant" } },
        });

        const error = await appendContactSubmission(payload).catch((reason: unknown) => reason);

        expect(mocks.append).toHaveBeenCalledTimes(1);
        expect(error).toMatchObject({
            errorCode: "CONTACT_FEDERATION_FAILED",
            stage: "token_exchange",
            status: 400,
            googleCode: "INVALID_GRANT",
        });
    });
});
