"use client";

import { FormEvent, useState } from "react";

type Submission = { name: string; email: string; organization: string; details: string };

const field = "relative";
const label = "pointer-events-none absolute top-2 left-5 z-1 text-sm text-slate-600";
const input =
    "w-full rounded-2xl border-2 border-ink bg-white/30 px-5 pt-7 pb-2 text-ink transition duration-200 focus:border-lai-blue focus:ring-4 focus:ring-lai-blue/10 focus:outline-none";

export function ContactForm() {
    const [submission, setSubmission] = useState<Submission | null>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        setSubmission({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            organization: String(data.get("organization") ?? ""),
            details: String(data.get("details") ?? ""),
        });
        form.reset();
    }

    return (
        <div>
            <form className="grid gap-4" onSubmit={handleSubmit} aria-describedby="form-note">
                <p className="mb-2 text-slate-700" id="form-note">
                    Tell us a little about your event. Fields marked with * are required.
                </p>
                <div className={field}>
                    <label className={label} htmlFor="name">
                        Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                        className={`${input} min-h-17`}
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                    />
                </div>
                <div className={field}>
                    <label className={label} htmlFor="email">
                        Email <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        className={`${input} min-h-17`}
                    />
                </div>
                <div className={field}>
                    <label className={label} htmlFor="organization">
                        Business or organization name
                    </label>
                    <input
                        className={`${input} min-h-17`}
                        id="organization"
                        name="organization"
                        autoComplete="organization"
                    />
                </div>
                <div className={field}>
                    <label className={label} htmlFor="details">
                        Event details <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                        className={`${input} min-h-68 resize-y`}
                        id="details"
                        name="details"
                        rows={7}
                        required
                    />
                </div>
                <button
                    className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-ink bg-ink px-5 py-3.5 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-transparent hover:text-ink lg:w-auto lg:justify-self-end"
                    type="submit"
                >
                    Tell us about your event
                </button>
            </form>
            {submission ? (
                <section
                    className="mt-8 rounded-r-2xl border-l-5 border-lai-blue bg-mist p-6"
                    aria-live="polite"
                    aria-labelledby="submission-title"
                >
                    <h3 className="text-2xl text-lai-blue" id="submission-title">
                        Thanks, {submission.name}!
                    </h3>
                    <p className="mt-1 mb-4">Your event request was submitted successfully.</p>
                    <dl className="m-0">
                        <div className="border-t border-line py-2.5">
                            <dt className="font-semibold">Email</dt>
                            <dd className="m-0 whitespace-pre-wrap [overflow-wrap:anywhere]">
                                {submission.email}
                            </dd>
                        </div>
                        {submission.organization ? (
                            <div className="border-t border-line py-2.5">
                                <dt className="font-semibold">Organization</dt>
                                <dd className="m-0 whitespace-pre-wrap [overflow-wrap:anywhere]">
                                    {submission.organization}
                                </dd>
                            </div>
                        ) : null}
                        <div className="border-t border-line py-2.5">
                            <dt className="font-semibold">Event details</dt>
                            <dd className="m-0 whitespace-pre-wrap [overflow-wrap:anywhere]">
                                {submission.details}
                            </dd>
                        </div>
                    </dl>
                </section>
            ) : null}
        </div>
    );
}
