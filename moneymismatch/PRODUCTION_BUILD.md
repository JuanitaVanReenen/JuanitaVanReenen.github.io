# MoneyMismatch — production build plan

## Current state
The browser MVP is working at:
https://juanitavanreenen.github.io/moneymismatch/

It demonstrates CSV comparison, exception detection, evidence, affected amounts, recommended actions, plans and a 5-day trial flow.

## Production architecture
- Authentication: Supabase Auth
- Database: Supabase Postgres
- Tenant isolation: workspace membership + Row Level Security
- Private uploads: private Supabase Storage bucket, workspace-scoped
- Billing: connect a payment provider after merchant eligibility is confirmed
- Application: keep the public GitHub Pages landing/demo, then connect the production app to the backend
- Never put service-role keys or payment secrets in GitHub Pages JavaScript.

## Database
Run `supabase_schema.sql` in the Supabase SQL Editor.

## Billing rule
Trial length: 5 days.
Plans: Starter $79/mo, Business $149/mo, Professional $299/mo.
Do not activate real recurring billing until the selected payment provider confirms Namibia merchant eligibility, international card acceptance, recurring billing and settlement.

## Security rule
The MVP currently processes uploaded CSV data locally in the browser. That is suitable for a demonstration only. The production SaaS must authenticate every user and enforce workspace-level authorization server-side before accepting real financial records.
