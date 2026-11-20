# Audit findings

Lasting findings and open items. Remove an item once it ships.

## Open (next release)

- **Privacy policy:** the site has a contact form (Google Sheets), analytics and Cloudflare Turnstile but no privacy policy page. Add `/privacy-policy` covering Vercel (hosting, CDN, Web Analytics: cookie-free, path plus `utm_*` only), Cloudflare Turnstile, Google Sheets (where enquiries are stored and who can access them) and Upstash Redis via Vercel (hashed rate-limit keys only). Link it from the footer and from the contact form's Turnstile notice, and add it to `src/app/sitemap.ts`.
