# ACS Truck Operations v1.5.1

## Save-path and access fixes
- Admin user-access changes now use the existing `admin_update_user_access` SECURITY DEFINER RPC rather than a direct `profiles` table update.
- Delivery source values are normalized at both UI and database boundaries; stale PWA clients sending labels such as `External delivery` are mapped to canonical values.
- Legacy `partial` payment status is normalized to canonical `part_paid` for deliveries and transactions.
- User-facing save/access errors no longer expose raw PostgreSQL constraint/RLS messages.
- Admin changes show visible success feedback.
- Inline Customer/Vendor/Vehicle creation now invalidates the correct v1.5 master-data query so newly created records become selectable immediately.

## Document-assisted entry
- PDF/image attachments can be sent to the authenticated Supabase `extract-document` Edge Function for structured extraction.
- Extraction is suggestion-only: the result is shown for review with confidence/warnings before the user applies it to the form.
- Supported suggestions include date, reference, amount, vendor/customer, payment channel/account hint, truck registration, litres, odometer, route, description and category hint.
- Uploaded source documents remain attached to the saved operational/accounting record.
- Automatic extraction requires the server-side `OPENAI_API_KEY` Edge Function secret; the key is never exposed to the browser.
