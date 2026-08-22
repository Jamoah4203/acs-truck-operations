drop policy if exists invoices_read on public.invoices;
create policy invoices_read on public.invoices for select to authenticated using (public.is_manager() or created_by=(select auth.uid()));
