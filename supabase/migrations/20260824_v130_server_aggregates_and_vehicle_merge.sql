create or replace function public.get_dashboard_summary(p_start date, p_end date)
returns jsonb language sql stable security invoker set search_path=public as $$
with pt as (select * from public.transactions where archived_at is null and transaction_date between p_start and p_end),
pd as (select * from public.deliveries where archived_at is null and delivery_date between p_start and p_end),
pm as (select * from public.maintenance_records where archived_at is null and maintenance_date between p_start and p_end),
rd as (select jsonb_agg(x order by x.delivery_date desc) items from (select d.id,d.delivery_number,d.delivery_date,d.status,d.from_location,d.to_location,d.expected_income,c.name customer_name from public.deliveries d left join public.customers c on c.id=d.customer_id where d.archived_at is null and d.delivery_date between p_start and p_end order by d.delivery_date desc,d.created_at desc limit 6)x),
rt as (select jsonb_agg(x order by x.transaction_date desc) items from (select t.id,t.transaction_number,t.transaction_date,t.direction,t.amount,t.description,t.payment_status,tc.name category_name from public.transactions t left join public.transaction_categories tc on tc.id=t.category_id where t.archived_at is null and t.transaction_date between p_start and p_end order by t.transaction_date desc,t.created_at desc limit 6)x)
select jsonb_build_object('income',coalesce((select sum(amount) from pt where direction='income'),0),'expenses',coalesce((select sum(amount) from pt where direction='expense'),0),'receivables',coalesce((select sum(greatest(amount-paid_amount,0)) from pt where direction='income'),0),'pending',coalesce((select count(*) from pd where status not in ('delivered','cancelled')),0),'completed',coalesce((select count(*) from pd where status='delivered'),0),'vehicles',coalesce((select count(*) from public.vehicles where archived_at is null),0),'maintenance',coalesce((select count(*) from pm),0),'recent_deliveries',coalesce((select items from rd),'[]'::jsonb),'recent_transactions',coalesce((select items from rt),'[]'::jsonb));$$;
grant execute on function public.get_dashboard_summary(date,date) to authenticated;

create or replace function public.get_pnl_report(p_start date,p_end date,p_prev_start date,p_prev_end date)
returns jsonb language sql stable security invoker set search_path=public as $$
with cur as (select t.*,tc.name category_name from public.transactions t left join public.transaction_categories tc on tc.id=t.category_id where t.archived_at is null and t.transaction_date between p_start and p_end),prev as (select * from public.transactions where archived_at is null and transaction_date between p_prev_start and p_prev_end),inc as (select coalesce(category_name,'Unclassified') name,sum(amount) amount from cur where direction='income' group by 1 order by 2 desc),exp as (select coalesce(category_name,'Unclassified') name,sum(amount) amount from cur where direction='expense' group by 1 order by 2 desc)
select jsonb_build_object('current',jsonb_build_object('income',coalesce((select sum(amount) from cur where direction='income'),0),'expenses',coalesce((select sum(amount) from cur where direction='expense'),0),'receivables',coalesce((select sum(greatest(amount-paid_amount,0)) from cur where direction='income'),0)),'previous',jsonb_build_object('income',coalesce((select sum(amount) from prev where direction='income'),0),'expenses',coalesce((select sum(amount) from prev where direction='expense'),0),'receivables',coalesce((select sum(greatest(amount-paid_amount,0)) from prev where direction='income'),0)),'income_categories',coalesce((select jsonb_agg(jsonb_build_object('name',name,'amount',amount)) from inc),'[]'::jsonb),'expense_categories',coalesce((select jsonb_agg(jsonb_build_object('name',name,'amount',amount)) from exp),'[]'::jsonb));$$;
grant execute on function public.get_pnl_report(date,date,date,date) to authenticated;

create or replace function public.merge_vehicles(p_target uuid,p_sources uuid[])
returns integer language plpgsql security invoker set search_path=public as $$
declare n integer:=0;begin
if not exists(select 1 from public.profiles where id=auth.uid() and role='admin' and active) then raise exception 'Administrator access required';end if;
if p_target=any(p_sources) then raise exception 'Target cannot be included in source vehicles';end if;
if not exists(select 1 from public.vehicles where id=p_target and archived_at is null) then raise exception 'Target vehicle not found';end if;
update public.deliveries set vehicle_id=p_target where vehicle_id=any(p_sources);get diagnostics n=row_count;
update public.transactions set vehicle_id=p_target where vehicle_id=any(p_sources);
update public.fuel_logs set vehicle_id=p_target where vehicle_id=any(p_sources);
update public.maintenance_records set vehicle_id=p_target where vehicle_id=any(p_sources);
update public.vehicle_issue_reports set vehicle_id=p_target where vehicle_id=any(p_sources);
update public.vehicles set archived_at=now(),archived_by=auth.uid(),status='inactive' where id=any(p_sources) and id<>p_target;
return n;end;$$;
grant execute on function public.merge_vehicles(uuid,uuid[]) to authenticated;
