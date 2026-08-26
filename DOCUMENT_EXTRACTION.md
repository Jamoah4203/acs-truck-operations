# Document extraction

ACS Truck v1.5.1 can analyse a selected PDF or image before a record is saved.

## User workflow
1. Open Delivery, Income, Expense, Fuel or Maintenance entry.
2. Select a waybill, receipt, invoice or photo.
3. Choose **Extract details**.
4. The authenticated client sends the selected file to the JWT-protected `extract-document` Supabase Edge Function.
5. The function returns structured suggestions for supported fields such as date, reference, amount, vendor/customer, payment method/account hint, truck registration, litres, odometer, route, description and category/direction hints.
6. Suggested values are applied to the open form where a matching field or configured option exists.
7. The user must verify/correct the suggestions before saving. Extraction never posts an accounting entry automatically.

## Provider configuration
The Edge Function requires the Supabase Function secret `OPENAI_API_KEY`. Keep this secret server-side; never expose it through a Vite/frontend environment variable.

The function uses OpenAI Responses API image/file inputs and structured JSON output. The current model is `gpt-5.4-mini` to keep routine receipt/waybill extraction economical while retaining document understanding.

## Limits and safety
- Authenticated users only (JWT verification enabled).
- PDF and image input only.
- Automatic-analysis limit: 6 MB per document.
- Unknown fields return null rather than being invented.
- A confidence score and warnings are returned to the user.
- Original documents continue to be stored through the existing protected Supabase Storage/document workflow after the business record is saved.
