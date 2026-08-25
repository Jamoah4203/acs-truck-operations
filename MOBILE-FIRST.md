# ACS Truck Mobile-First UI Standard

v1.4.1 establishes phone-first responsive behaviour across Dashboard, Income, Expenses, Reports, Fleet, Settings, forms, filters, record cards and detail dialogs.

## Breakpoints
- <= 390px: narrow phones, single-column filters/details where required.
- 391–760px: phones and large phones; compact two-column summaries, card-based registers, bottom-sheet filters and dialogs.
- 761–1100px: tablets; denser multi-column layouts without desktop overflow assumptions.
- > 1100px: desktop.

## Rules
- No important action may depend on horizontal scrolling.
- Filter panels and date selectors must fit within the viewport.
- Text actions on repeated record cards should become icon actions where the icon is unambiguous.
- Register cards should show the minimum useful summary and keep details in View/Edit.
- Touch targets remain usable while visual padding is reduced.
- Tables are replaced by mobile record cards on phones rather than squeezed into the viewport.
- Modals become bottom sheets on phones.
- Tabs may scroll horizontally because they are navigation, not required record content.
- Logos, receipts, invoices, proof-of-delivery files and operational photos must be stored server-side and referenced by database metadata; device-local paths are never authoritative.
- Private documents are opened with short-lived signed URLs and role-aware Storage/database access policies.
