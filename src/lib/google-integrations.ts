import "server-only";

import { getVercelOidcToken } from "@vercel/oidc";
import { google, type sheets_v4 } from "googleapis";

import type { ContactPayload } from "./contact-schema";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_RANGES = ["'Form Responses'!A:E", "form_responses"] as const;
const REQUEST_TIMEOUT_MS = 10_000;
const TORONTO_DATE_TIME = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
});

let sheetsClient: sheets_v4.Sheets | undefined;

type StorageStage =
    | "configuration"
    | "oidc_token"
    | "token_exchange"
    | "service_account_impersonation"
    | "sheets_append";

export type FormResponseErrorCode =
    | "CONTACT_CONFIGURATION"
    | "CONTACT_OIDC_UNAVAILABLE"
    | "CONTACT_FEDERATION_FAILED"
    | "CONTACT_IMPERSONATION_FAILED"
    | "CONTACT_SHEET_PERMISSION"
    | "CONTACT_SHEET_NOT_FOUND"
    | "CONTACT_SHEET_RANGE"
    | "CONTACT_SHEET_RATE_LIMIT"
    | "CONTACT_STORAGE_UNAVAILABLE";

class StorageConfigurationError extends Error {
    constructor() {
        super("Google Sheets configuration is incomplete.");
        this.name = "StorageConfigurationError";
    }
}

class OidcTokenUnavailableError extends Error {
    constructor(cause: unknown) {
        super("The Vercel OIDC token is unavailable.", { cause });
        this.name = "OidcTokenUnavailableError";
    }
}

function requiredEnv(name: string) {
    const value = process.env[name]?.trim();
    if (!value) throw new StorageConfigurationError();
    return value;
}

export class FormResponseStorageError extends Error {
    readonly operation = "append_form_response";

    constructor(
        readonly errorCode: FormResponseErrorCode,
        readonly stage: StorageStage,
        readonly status?: number,
        readonly googleCode?: string,
        cause?: unknown,
    ) {
        super("The form response could not be stored.", { cause });
        this.name = "FormResponseStorageError";
    }
}

function safeGoogleErrorDetails(error: unknown) {
    let current: unknown = error;
    let status: number | undefined;
    let googleCode: string | undefined;
    let stage: StorageStage = "sheets_append";

    for (let depth = 0; current && typeof current === "object" && depth < 5; depth += 1) {
        if (current instanceof StorageConfigurationError) stage = "configuration";
        if (current instanceof OidcTokenUnavailableError) stage = "oidc_token";

        const candidate = current as {
            code?: unknown;
            cause?: unknown;
            config?: { url?: unknown };
            response?: {
                status?: unknown;
                data?: { error?: string | { status?: unknown } };
            };
        };
        if (status === undefined && typeof candidate.response?.status === "number") {
            status = candidate.response.status;
        }
        const responseError = candidate.response?.data?.error;
        if (typeof responseError === "string") {
            stage = "token_exchange";
            if (!googleCode) googleCode = responseError.toUpperCase();
        }
        const responseCode =
            responseError && typeof responseError === "object" ? responseError.status : undefined;
        if (!googleCode && typeof responseCode === "string") googleCode = responseCode;
        if (
            !googleCode &&
            (typeof candidate.code === "string" || typeof candidate.code === "number")
        ) {
            googleCode = String(candidate.code);
        }

        if (candidate.config?.url) {
            try {
                const host = new URL(String(candidate.config.url)).hostname;
                if (host === "sts.googleapis.com") stage = "token_exchange";
                if (host === "iamcredentials.googleapis.com") {
                    stage = "service_account_impersonation";
                }
                if (host === "sheets.googleapis.com") stage = "sheets_append";
            } catch {
                // Keep the safest stage when a diagnostic URL is malformed.
            }
        }

        current = candidate.cause;
    }

    return { status, googleCode, stage };
}

function publicErrorCode(
    stage: StorageStage,
    status?: number,
    googleCode?: string,
): FormResponseErrorCode {
    if (stage === "configuration") return "CONTACT_CONFIGURATION";
    if (stage === "oidc_token") return "CONTACT_OIDC_UNAVAILABLE";
    if (stage === "token_exchange") return "CONTACT_FEDERATION_FAILED";
    if (stage === "service_account_impersonation") return "CONTACT_IMPERSONATION_FAILED";
    if (status === 403 || googleCode === "PERMISSION_DENIED") return "CONTACT_SHEET_PERMISSION";
    if (status === 404 || googleCode === "NOT_FOUND") return "CONTACT_SHEET_NOT_FOUND";
    if (status === 400 || googleCode === "INVALID_ARGUMENT") return "CONTACT_SHEET_RANGE";
    if (status === 429 || googleCode === "RESOURCE_EXHAUSTED") {
        return "CONTACT_SHEET_RATE_LIMIT";
    }
    return "CONTACT_STORAGE_UNAVAILABLE";
}

function createSheetsClient() {
    const projectNumber = requiredEnv("GCP_PROJECT_NUMBER");
    const poolId = requiredEnv("GCP_WORKLOAD_IDENTITY_POOL_ID");
    const providerId = requiredEnv("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");
    const serviceAccountEmail = requiredEnv("GCP_SERVICE_ACCOUNT_EMAIL");
    const audiencePath = `projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

    const auth = google.auth.ExternalAccountClient.fromJSON({
        type: "external_account",
        audience: `//iam.googleapis.com/${audiencePath}`,
        subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
        token_url: "https://sts.googleapis.com/v1/token",
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
        scopes: [SHEETS_SCOPE],
        subject_token_supplier: {
            getSubjectToken: async () => {
                try {
                    return await getVercelOidcToken();
                } catch (error) {
                    throw new OidcTokenUnavailableError(error);
                }
            },
        },
    });

    if (!auth) throw new Error("Google Workload Identity Federation could not be initialized.");
    return google.sheets({ version: "v4", auth });
}

function getSheetsClient() {
    sheetsClient ??= createSheetsClient();
    return sheetsClient;
}

export async function appendContactSubmission(payload: ContactPayload) {
    try {
        const sheets = getSheetsClient();
        const spreadsheetId = requiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
        const values = [
            [
                TORONTO_DATE_TIME.format(new Date()),
                payload.name,
                payload.email,
                payload.organization,
                payload.details,
            ],
        ];

        for (const [index, range] of SHEETS_RANGES.entries()) {
            try {
                await sheets.spreadsheets.values.append(
                    {
                        spreadsheetId,
                        range,
                        valueInputOption: "RAW",
                        insertDataOption: "INSERT_ROWS",
                        requestBody: { values },
                    },
                    { timeout: REQUEST_TIMEOUT_MS },
                );
                return;
            } catch (error) {
                const { status, googleCode, stage } = safeGoogleErrorDetails(error);
                const isRangeError =
                    stage === "sheets_append" &&
                    (status === 400 || googleCode === "INVALID_ARGUMENT");
                const hasFallback = index < SHEETS_RANGES.length - 1;
                if (!isRangeError || !hasFallback) throw error;
            }
        }
    } catch (error) {
        const { status, googleCode, stage } = safeGoogleErrorDetails(error);
        throw new FormResponseStorageError(
            publicErrorCode(stage, status, googleCode),
            stage,
            status,
            googleCode,
            error,
        );
    }
}
