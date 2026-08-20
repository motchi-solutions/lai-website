"use client";

import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";

import { contactSchema, type ContactPayload } from "@/lib/contact-schema";

type FormField = "name" | "email" | "organization" | "details";
type FieldErrors = Partial<Record<FormField, string>>;
type Status = {
    type: "idle" | "error" | "success";
    message?: string;
    errorCode?: string;
    referenceId?: string;
};
type CaptchaResult = {
    message?: string;
    fieldErrors?: Record<string, string[]>;
    errorCode?: string;
    referenceId?: string;
};

declare global {
    interface Window {
        grecaptcha?: {
            enterprise?: {
                ready: (callback: () => void) => void;
                execute: (siteKey: string, options: { action: "contact" }) => Promise<string>;
            };
        };
    }
}

const fields = ["name", "email", "organization", "details"] as const;
const field = "relative";
const label = "pointer-events-none absolute top-2 left-5 z-1 text-sm text-slate-600";
const input =
    "w-full rounded-2xl border-2 border-ink bg-white/30 px-5 pt-7 pb-2 text-ink transition duration-200 placeholder:text-slate-400 focus:border-lai-blue focus:ring-4 focus:ring-lai-blue/10 focus:outline-none disabled:cursor-wait disabled:opacity-60";

let captchaPromise: Promise<void> | null = null;

function loadCaptcha(siteKey: string) {
    if (window.grecaptcha?.enterprise) {
        return new Promise<void>((resolve) => window.grecaptcha?.enterprise?.ready(resolve));
    }
    if (captchaPromise) return captchaPromise;

    captchaPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;
        script.dataset.recaptcha = "true";
        script.onload = () => {
            const enterprise = window.grecaptcha?.enterprise;
            if (!enterprise) {
                captchaPromise = null;
                reject(new Error("CAPTCHA unavailable"));
                return;
            }
            enterprise.ready(resolve);
        };
        script.onerror = () => {
            captchaPromise = null;
            reject(new Error("CAPTCHA failed to load"));
        };
        document.head.appendChild(script);
    });

    return captchaPromise;
}

function parseForm(form: HTMLFormElement) {
    return contactSchema.safeParse({
        ...Object.fromEntries(new FormData(form)),
        captchaToken: "client-validation",
    });
}

export function ContactForm() {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [status, setStatus] = useState<Status>({ type: "idle" });
    const [pending, setPending] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);

    function validate(form: HTMLFormElement): ContactPayload | null {
        const result = parseForm(form);
        setCanSubmit(result.success);
        if (result.success) return result.data;

        const flattened = result.error.flatten().fieldErrors;
        const nextErrors: FieldErrors = {};
        for (const key of fields) if (flattened[key]?.[0]) nextErrors[key] = flattened[key][0];

        setErrors(nextErrors);
        setStatus({ type: "error", message: "Please review the highlighted fields." });
        requestAnimationFrame(() =>
            document
                .getElementById(fields.find((key) => nextErrors[key]) ?? "form-status")
                ?.focus(),
        );
        return null;
    }

    function updateFieldError(name: FormField, message?: string) {
        const nextErrors = { ...errors };
        if (message) nextErrors[name] = message;
        else delete nextErrors[name];

        setErrors(nextErrors);
        if (
            status.type === "error" &&
            status.message === "Please review the highlighted fields." &&
            !Object.values(nextErrors).some(Boolean)
        ) {
            setStatus({ type: "idle" });
        }
    }

    function validateField(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const form = event.currentTarget.form;
        if (!form) return;
        const result = parseForm(form);
        setCanSubmit(result.success);
        const name = event.currentTarget.name as FormField;
        const message = result.success ? undefined : result.error.flatten().fieldErrors[name]?.[0];
        updateFieldError(name, message);
    }

    function revalidateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const name = event.currentTarget.name as FormField;
        const form = event.currentTarget.form;
        if (!form) return;
        const result = parseForm(form);
        setCanSubmit(result.success);
        if (!errors[name]) return;

        const message = result.success ? undefined : result.error.flatten().fieldErrors[name]?.[0];
        updateFieldError(name, message);
    }

    async function getCaptchaToken() {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) throw new Error("CAPTCHA is not configured");

        await loadCaptcha(siteKey);
        const enterprise = window.grecaptcha?.enterprise;
        if (!enterprise) throw new Error("CAPTCHA unavailable");
        return enterprise.execute(siteKey, { action: "contact" });
    }

    async function submit(payload: ContactPayload, captchaToken: string) {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                ...payload,
                captchaToken,
            }),
            signal: AbortSignal.timeout(20_000),
        });
        return { response, result: (await response.json()) as CaptchaResult };
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        setStatus({ type: "idle" });
        const payload = validate(form);
        if (!payload) return;

        setPending(true);
        try {
            const captchaToken = await getCaptchaToken();
            const { response, result } = await submit(payload, captchaToken);

            if (!response.ok) {
                const serverErrors: FieldErrors = {};
                for (const key of fields) {
                    if (result.fieldErrors?.[key]?.[0])
                        serverErrors[key] = result.fieldErrors[key][0];
                }
                setErrors(serverErrors);
                if (Object.keys(serverErrors).length > 0) setCanSubmit(false);
                setStatus({
                    type: "error",
                    message: result.message ?? "Please try again.",
                    errorCode: result.errorCode,
                    referenceId: result.referenceId,
                });
                requestAnimationFrame(() => document.getElementById("form-status")?.focus());
                return;
            }

            form.reset();
            setErrors({});
            setCanSubmit(false);
            setStatus({ type: "success", message: result.message });
            requestAnimationFrame(() => document.getElementById("form-success")?.focus());
        } catch {
            setStatus({
                type: "error",
                message: "We could not send your request. Check your connection and try again.",
                errorCode: "CONTACT_NETWORK",
            });
            requestAnimationFrame(() => document.getElementById("form-status")?.focus());
        } finally {
            setPending(false);
        }
    }

    if (status.type === "success") {
        return (
            <section
                id="form-success"
                className="rounded-2xl border-2 border-lai-blue bg-mist p-7"
                aria-live="polite"
                tabIndex={-1}
            >
                <h3 className="text-3xl text-lai-blue">Your request is on its way.</h3>
                <p className="mt-2">{status.message} We&apos;ll be in touch soon.</p>
                <button
                    type="button"
                    className="mt-6 cursor-pointer font-semibold text-lai-blue underline underline-offset-4"
                    onClick={() => setStatus({ type: "idle" })}
                >
                    Send another request
                </button>
            </section>
        );
    }

    return (
        <form
            className="grid gap-4"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={pending}
            aria-describedby="form-note form-status"
        >
            <p className="mb-2 text-slate-700" id="form-note">
                Tell us a little about your event. Fields marked with * are required.
            </p>
            <div
                id="form-status"
                className={
                    status.type === "error"
                        ? "rounded-xl border border-wine bg-white/70 px-4 py-3 text-wine"
                        : "sr-only"
                }
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
            >
                <p>{status.message}</p>
                {status.errorCode ? (
                    <p className="mt-2 text-sm font-semibold tracking-wide">
                        Error code: {status.errorCode}
                        {status.referenceId ? ` · Reference: ${status.referenceId}` : ""}
                    </p>
                ) : null}
            </div>
            <FormField
                id="name"
                label="Name"
                required
                autoComplete="name"
                minLength={2}
                maxLength={100}
                placeholder="Your full name"
                error={errors.name}
                pending={pending}
                onBlur={validateField}
                onChange={revalidateField}
            />
            <FormField
                id="email"
                label="Email"
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                error={errors.email}
                pending={pending}
                onBlur={validateField}
                onChange={revalidateField}
            />
            <FormField
                id="organization"
                label="Business or organization name"
                autoComplete="organization"
                maxLength={150}
                placeholder="Your company or organization (optional)"
                error={errors.organization}
                pending={pending}
                onBlur={validateField}
                onChange={revalidateField}
            />
            <div className={field}>
                <label className={label} htmlFor="details">
                    Event details <span aria-hidden="true">*</span>
                </label>
                <textarea
                    className={`${input} min-h-68 resize-y`}
                    id="details"
                    name="details"
                    rows={7}
                    minLength={20}
                    maxLength={3000}
                    placeholder="Share the date, location, guest count, and service you have in mind."
                    required
                    disabled={pending}
                    aria-invalid={Boolean(errors.details)}
                    aria-describedby={
                        errors.details ? "details-help details-error" : "details-help"
                    }
                    onBlur={validateField}
                    onChange={revalidateField}
                />
                <p id="details-help" className="mt-1 px-2 text-sm text-slate-500">
                    Minimum 20 characters.
                </p>
                <FieldError id="details-error" message={errors.details} />
            </div>
            <div className="absolute left-[-10000px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <button
                className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-ink bg-ink px-5 py-3.5 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-ink disabled:hover:text-white motion-reduce:transition-none motion-reduce:hover:transform-none lg:w-auto lg:justify-self-end"
                type="submit"
                disabled={pending || !canSubmit}
            >
                {pending ? "Sending your request…" : "Tell us about your event"}
            </button>
            <p className="text-xs text-slate-600">
                This site is protected by reCAPTCHA and the Google{" "}
                <a className="underline" href="https://policies.google.com/privacy">
                    Privacy Policy
                </a>{" "}
                and{" "}
                <a className="underline" href="https://policies.google.com/terms">
                    Terms of Service
                </a>{" "}
                apply.
            </p>
        </form>
    );
}

type FormFieldProps = {
    id: FormField;
    label: string;
    error?: string;
    pending: boolean;
    required?: boolean;
    type?: "email" | "text";
    autoComplete: string;
    minLength?: number;
    maxLength: number;
    placeholder?: string;
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function FormField({
    id,
    label: text,
    error,
    pending,
    required = false,
    type = "text",
    ...props
}: FormFieldProps) {
    return (
        <div className={field}>
            <label className={label} htmlFor={id}>
                {text} {required ? <span aria-hidden="true">*</span> : null}
            </label>
            <input
                className={`${input} min-h-17`}
                id={id}
                name={id}
                type={type}
                inputMode={type === "email" ? "email" : undefined}
                required={required}
                disabled={pending}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                {...props}
            />
            <FieldError id={`${id}-error`} message={error} />
        </div>
    );
}

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? (
        <p id={id} className="mt-1 px-2 text-sm text-wine">
            {message}
        </p>
    ) : null;
}
