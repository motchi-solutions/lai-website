# Security policy

Report suspected vulnerabilities privately to the project owner. Do not open a public issue containing credentials, personal information, or reproduction data from real customers.

All third-party credentials belong in deployment environment variables and must be scoped to the minimum permissions required. Rotate a credential immediately if it is exposed. Form data must be validated server-side before storage; client-side validation is a usability aid only.

The contact endpoint rejects cross-origin and oversized requests, creates a server-side Google Cloud reCAPTCHA assessment, verifies token validity and the expected action, and limits each hashed client IP to five attempts per rolling 15-minute window. Google Sheets access uses short-lived Vercel OIDC credentials and Google Workload Identity Federation; no service-account private key is supported. The Google Cloud API key and project identifiers remain server-only. Only the reCAPTCHA site key is public.

Successful requests and expected bot rejections are not logged. Operational failure logs must contain only safe diagnostics and a reportable reference ID—never submitted form fields, IP addresses, CAPTCHA/OIDC tokens, API keys, or credentials. Review access to Vercel logs periodically and keep retention no longer than operationally necessary.
