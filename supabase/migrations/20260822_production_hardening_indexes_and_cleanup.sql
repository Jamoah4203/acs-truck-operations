-- Production hardening applied to the acs-truck Supabase project.
-- Historical migration staging is no longer required after reconciliation.
drop table if exists public.legacy_import_stage;

create index if not exists idx_app_settings_updated_by on public.app_settings(updated_by);
create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_deliveries_archived_by on public.deliveries(archived_by);
create index if not exists idx_deliveries_created_by on public.deliveries(created_by);
create index if not exists idx_deliveries_customer_id on public.deliveries(customer_id);
create index if not exists idx_delivery_status_history_changed_by on public.delivery_status_history(changed_by);
create index if not exists idx_delivery_status_history_delivery_id on public.delivery_status_history(delivery_id);
create index if not exists idx_documents_uploaded_by on public.documents(uploaded_by);
create index if not exists idx_fuel_logs_archived_by on public.fuel_logs(archived_by);
create index if not exists idx_fuel_logs_created_by on public.fuel_logs(created_by);
create index if not exists idx_fuel_logs_delivery_id on public.fuel_logs(delivery_id);
create index if not exists idx_fuel_logs_driver_id on public.fuel_logs(driver_id);
create index if not exists idx_invoices_created_by on public.invoices(created_by);
create index if not exists idx_invoices_customer_id on public.invoices(customer_id);
create index if not exists idx_invoices_delivery_id on public.invoices(delivery_id);
create index if not exists idx_maintenance_archived_by on public.maintenance_records(archived_by);
create index if not exists idx_maintenance_created_by on public.maintenance_records(created_by);
create index if not exists idx_maintenance_vendor_id on public.maintenance_records(vendor_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_transaction_categories_parent_id on public.transaction_categories(parent_id);
create index if not exists idx_transactions_approved_by on public.transactions(approved_by);
create index if not exists idx_transactions_archived_by on public.transactions(archived_by);
create index if not exists idx_transactions_created_by on public.transactions(created_by);
create index if not exists idx_transactions_customer_id on public.transactions(customer_id);
create index if not exists idx_transactions_driver_id on public.transactions(driver_id);
create index if not exists idx_transactions_vendor_id on public.transactions(vendor_id);
create index if not exists idx_vehicle_issue_reports_reported_by on public.vehicle_issue_reports(reported_by);
create index if not exists idx_vehicle_issue_reports_vehicle_id on public.vehicle_issue_reports(vehicle_id);
create index if not exists idx_vehicles_archived_by on public.vehicles(archived_by);
