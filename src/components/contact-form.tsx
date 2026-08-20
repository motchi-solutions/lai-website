"use client";

import { FormEvent, useState } from "react";

type Submission = { name: string; email: string; organization: string; details: string };

export function ContactForm() {
  const [submission, setSubmission] = useState<Submission | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setSubmission({ name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), organization: String(data.get("organization") ?? ""), details: String(data.get("details") ?? "") });
    form.reset();
  }

  return (
    <div>
      <form className="contact-form" onSubmit={handleSubmit} aria-describedby="form-note">
        <p id="form-note">Tell us a little about your event. Fields marked with * are required.</p>
        <div className="field"><label htmlFor="name">Name <span aria-hidden="true">*</span></label><input id="name" name="name" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="email">Email <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" required /></div>
        <div className="field"><label htmlFor="organization">Business or organization name</label><input id="organization" name="organization" autoComplete="organization" /></div>
        <div className="field"><label htmlFor="details">Event details <span aria-hidden="true">*</span></label><textarea id="details" name="details" rows={7} required /></div>
        <button className="button" type="submit">Tell us about your event</button>
      </form>
      {submission ? <section className="submission" aria-live="polite" aria-labelledby="submission-title"><h3 id="submission-title">Thanks, {submission.name}!</h3><p>Your event request was submitted successfully.</p><dl><div><dt>Email</dt><dd>{submission.email}</dd></div>{submission.organization ? <div><dt>Organization</dt><dd>{submission.organization}</dd></div> : null}<div><dt>Event details</dt><dd>{submission.details}</dd></div></dl></section> : null}
    </div>
  );
}
