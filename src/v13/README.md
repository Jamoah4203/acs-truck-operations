# ACS Truck v1.3 frontend

This directory is the consolidated production frontend introduced in v1.3.0.

Principles:
- page-level lazy loading
- React Query owns server state and cache invalidation
- PostgreSQL RPCs provide dashboard/report aggregates
- server-side pagination/filtering/sorting for registers
- one realtime channel invalidates only affected query families
- forms save the record first and upload documents against the returned exact ID
- no MutationObserver/querySelector feature overrides
- fleet merge is a single PostgreSQL transaction

The pre-v1.3 override components remain in git history for reference but are no longer mounted by AppRoot.
