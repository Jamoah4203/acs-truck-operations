-- Production RLS optimization applied to acs-truck.
-- Access semantics are preserved while auth.uid() calls are initialized once per statement.

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using ((id = (select auth.uid())) or public.is_manager());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated using ((id = (select auth.uid())) and active = true) with check (id = (select auth.uid()));

drop policy if exists deliveries_driver_update on public.deliveries;
drop policy if exists deliveries_manager_update on public.deliveries;
create policy deliveries_update on public.deliveries for update to authenticated using (public.is_ops_manager() or driver_id = (select auth.uid())) with check (public.is_ops_manager() or driver_id = (select auth.uid()));
drop policy if exists deliveries_read on public.deliveries;
create policy deliveries_read on public.deliveries for select to authenticated using (public.is_manager() or driver_id = (select auth.uid()));

drop policy if exists history_insert on public.delivery_status_history;
create policy history_insert on public.delivery_status_history for insert to authenticated with check (changed_by = (select auth.uid()) or public.is_manager());
drop policy if exists history_read on public.delivery_status_history;
create policy history_read on public.delivery_status_history for select to authenticated using (public.is_manager() or exists(select 1 from public.deliveries d where d.id=delivery_status_history.delivery_id and d.driver_id=(select auth.uid())));

drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents for select to authenticated using (public.is_manager() or uploaded_by=(select auth.uid()));
drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert to authenticated with check (uploaded_by=(select auth.uid()));
drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents for delete to authenticated using (public.is_manager() or uploaded_by=(select auth.uid()));

drop policy if exists fuel_read on public.fuel_logs;
create policy fuel_read on public.fuel_logs for select to authenticated using (public.is_manager() or driver_id=(select auth.uid()) or created_by=(select auth.uid()));
drop policy if exists fuel_insert on public.fuel_logs;
create policy fuel_insert on public.fuel_logs for insert to authenticated with check (public.is_manager() or (driver_id=(select auth.uid()) and created_by=(select auth.uid())));
drop policy if exists fuel_update on public.fuel_logs;
create policy fuel_update on public.fuel_logs for update to authenticated using (public.is_manager() or created_by=(select auth.uid())) with check (public.is_manager() or created_by=(select auth.uid()));

drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

drop policy if exists transactions_read on public.transactions;
create policy transactions_read on public.transactions for select to authenticated using (public.is_manager() or driver_id=(select auth.uid()) or created_by=(select auth.uid()));
drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions for insert to authenticated with check (public.is_manager() or (public.current_role()='driver' and direction='expense' and created_by=(select auth.uid()) and driver_id=(select auth.uid())));
drop policy if exists transactions_update on public.transactions;
create policy transactions_update on public.transactions for update to authenticated using (public.is_manager() or (created_by=(select auth.uid()) and approved_at is null)) with check (public.is_manager() or (created_by=(select auth.uid()) and approved_at is null));

drop policy if exists issues_read on public.vehicle_issue_reports;
create policy issues_read on public.vehicle_issue_reports for select to authenticated using (public.is_manager() or reported_by=(select auth.uid()));
drop policy if exists issues_insert on public.vehicle_issue_reports;
create policy issues_insert on public.vehicle_issue_reports for insert to authenticated with check (reported_by=(select auth.uid()) or public.is_manager());

-- Split ALL write policies so SELECT does not evaluate duplicate permissive policies.
drop policy if exists settings_write on public.app_settings;
create policy settings_insert on public.app_settings for insert to authenticated with check (public.current_role()='admin');
create policy settings_update on public.app_settings for update to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');
create policy settings_delete on public.app_settings for delete to authenticated using (public.current_role()='admin');

drop policy if exists customers_write on public.customers;
create policy customers_insert on public.customers for insert to authenticated with check (public.is_ops_manager());
create policy customers_update on public.customers for update to authenticated using (public.is_ops_manager()) with check (public.is_ops_manager());
create policy customers_delete on public.customers for delete to authenticated using (public.is_ops_manager());

drop policy if exists invoices_write on public.invoices;
create policy invoices_insert on public.invoices for insert to authenticated with check (public.is_manager());
create policy invoices_update on public.invoices for update to authenticated using (public.is_manager()) with check (public.is_manager());
create policy invoices_delete on public.invoices for delete to authenticated using (public.is_manager());

drop policy if exists maintenance_write on public.maintenance_records;
create policy maintenance_insert on public.maintenance_records for insert to authenticated with check (public.is_ops_manager());
create policy maintenance_update on public.maintenance_records for update to authenticated using (public.is_ops_manager()) with check (public.is_ops_manager());
create policy maintenance_delete on public.maintenance_records for delete to authenticated using (public.is_ops_manager());

drop policy if exists categories_write on public.transaction_categories;
create policy categories_insert on public.transaction_categories for insert to authenticated with check (public.is_manager());
create policy categories_update on public.transaction_categories for update to authenticated using (public.is_manager()) with check (public.is_manager());
create policy categories_delete on public.transaction_categories for delete to authenticated using (public.is_manager());

drop policy if exists vehicles_write on public.vehicles;
create policy vehicles_insert on public.vehicles for insert to authenticated with check (public.is_ops_manager());
create policy vehicles_update on public.vehicles for update to authenticated using (public.is_ops_manager()) with check (public.is_ops_manager());
create policy vehicles_delete on public.vehicles for delete to authenticated using (public.is_ops_manager());

drop policy if exists vendors_write on public.vendors;
create policy vendors_insert on public.vendors for insert to authenticated with check (public.is_manager());
create policy vendors_update on public.vendors for update to authenticated using (public.is_manager()) with check (public.is_manager());
create policy vendors_delete on public.vendors for delete to authenticated using (public.is_manager());
