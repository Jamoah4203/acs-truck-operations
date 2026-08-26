# ACS Truck Operations v1.5.1

- Fix External Delivery saves by normalizing UI labels to the canonical delivery source values accepted by PostgreSQL.
- Add an administrator-authorized user-access update path and restore admin profile access updates under RLS.
- Replace common raw database/network form failures with user-facing messages while preserving unsaved drafts.
- Add JWT-protected PDF/image document analysis through the Supabase `extract-document` Edge Function.
- Add **Extract details** beside selected attachments in Delivery, Income/Expense, Fuel and Maintenance forms.
- Extracted values are suggestions only and are applied to matching form fields for user verification before save.
- Support suggested date, reference, amount, vendor/customer, payment method/account, truck, litres, odometer, route, description and category/direction hints.
- Keep OpenAI credentials server-side through the `OPENAI_API_KEY` Supabase Function secret.
