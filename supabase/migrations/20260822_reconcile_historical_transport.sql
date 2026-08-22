-- Historical transport reconciliation applied to the acs-truck Supabase project.
-- Source authority: Truck_Transactions.ods TRANSPORT register, 299 dated rows (Jan-Aug 2026).
-- Agreed rules: blank-amount companion rows remain at 0.00; maintenance/repair work takes priority over incidental fuel wording.

-- Normalized source classifications
update public.transactions set legacy_trans_type='MAINTENANCE', category_id=(select id from public.transaction_categories where code='MAINTENANCE' limit 1)
where source='historical_import' and transaction_number in ('REF-260803600','REF-260803922','REF-260803846','REF-260330526');

update public.transactions set legacy_trans_type='DELIVERY', direction='income', category_id=(select id from public.transaction_categories where code='DELIVERY_INCOME' limit 1)
where source='historical_import' and transaction_number in ('REF-260729492','REF-260728953');

update public.transactions set legacy_trans_type='FUEL', direction='expense', category_id=(select id from public.transaction_categories where code='FUEL' limit 1)
where source='historical_import' and transaction_number in ('REF-260609583','REF-260425543');

-- Reconciled source totals:
-- 299 transactions; GHS 104,200.00 income; GHS 63,759.85 expense.
-- Derived registers: 182 deliveries; 60 fuel; 44 maintenance.
-- Monthly row counts: Jan 26, Feb 16, Mar 33, Apr 68, May 56, Jun 45, Jul 43, Aug 12.
