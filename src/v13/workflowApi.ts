import {supabase} from '../lib/supabase';
import type {PageResult,PageState,Profile,Role} from './types';

function fail(error:any){if(error)throw new Error(error.message||'Request failed')}
const range=(p:PageState)=>[(p.page-1)*p.pageSize,p.page*p.pageSize-1] as const;
const term=(v:string)=>v.trim().replace(/[,%()]/g,' ');

export async function mastersV15(role?:Role){
 const isDriver=role==='driver';
 const requests:any[]=[
  supabase.from('transaction_categories').select('id,code,name,direction,active,system').eq('active',true).order('direction').order('name'),
  supabase.from('customers').select('id,name,phone,email,address,active').eq('active',true).order('name'),
  supabase.from('vendors').select('id,name,phone,email,address,active').eq('active',true).order('name'),
  supabase.from('vehicles').select('id,registration_number,make,model,status,is_default').is('archived_at',null).order('registration_number'),
  supabase.from('profiles').select('id,full_name,phone,role,active,default_vehicle_id').eq('active',true).order('full_name'),
  supabase.from('payment_accounts').select('id,name,code,account_type,active,is_default').eq('active',true).order('is_default',{ascending:false}).order('name'),
  supabase.from('app_settings').select('value').eq('key','company').maybeSingle()
 ];
 const results=await Promise.all(requests);for(const r of results)fail(r.error);
 const[cats,customers,vendors,vehicles,profiles,paymentAccounts,company]=results;
 return{categories:cats.data||[],customers:customers.data||[],vendors:isDriver?[]:vendors.data||[],vehicles:vehicles.data||[],profiles:profiles.data||[],paymentAccounts:paymentAccounts.data||[],company:company.data?.value||{}};
}

export async function unifiedTransactionsPage(p:PageState,direction:'income'|'expense'):Promise<PageResult<any>>{
 let q:any=supabase.from('transactions').select('id,transaction_number,transaction_date,direction,category_id,amount,paid_amount,delivery_id,vehicle_id,driver_id,customer_id,vendor_id,description,payment_status,payment_method,payment_account_id,external_reference,source,needs_review,transaction_categories(name,code),customers(name),vendors(name),vehicles(registration_number),profiles!transactions_driver_id_fkey(full_name),payment_accounts(name,code)',{count:'exact'}).is('archived_at',null).eq('direction',direction);
 if(p.from)q=q.gte('transaction_date',p.from);if(p.to)q=q.lte('transaction_date',p.to);if(p.categoryId)q=q.eq('category_id',p.categoryId);
 if(p.search){const s=term(p.search);q=q.or(`transaction_number.ilike.%${s}%,description.ilike.%${s}%`)}
 const[a,b]=range(p);const{data,error,count}=await q.order(p.sort,{ascending:p.ascending}).range(a,b);fail(error);return{rows:data||[],count:count||0};
}
export async function unifiedTransactionsExport(p:PageState,direction:'income'|'expense'){
 let q:any=supabase.from('transactions').select('id,transaction_number,transaction_date,direction,category_id,amount,paid_amount,delivery_id,vehicle_id,driver_id,customer_id,vendor_id,description,payment_status,payment_method,payment_account_id,external_reference,source,transaction_categories(name,code),customers(name),vendors(name),vehicles(registration_number),profiles!transactions_driver_id_fkey(full_name),payment_accounts(name,code)').is('archived_at',null).eq('direction',direction);
 if(p.from)q=q.gte('transaction_date',p.from);if(p.to)q=q.lte('transaction_date',p.to);if(p.categoryId)q=q.eq('category_id',p.categoryId);if(p.search){const s=term(p.search);q=q.or(`transaction_number.ilike.%${s}%,description.ilike.%${s}%`)}
 const{data,error}=await q.order(p.sort,{ascending:p.ascending}).range(0,9999);fail(error);return data||[];
}

export async function linkedRecord(row:any){
 if(row.delivery_id){const{data,error}=await supabase.from('deliveries').select('*,customers(name,email,phone,address),vehicles(registration_number),profiles!deliveries_driver_id_fkey(full_name)').eq('id',row.delivery_id).single();fail(error);return{kind:'delivery',record:data}}
 const ref=String(row.external_reference||'');
 if(ref.startsWith('fuel:')){const id=ref.slice(5);const{data,error}=await supabase.from('fuel_logs').select('*').eq('id',id).single();fail(error);return{kind:'fuel',record:data}}
 if(ref.startsWith('maintenance:')){const id=ref.slice(12);const{data,error}=await supabase.from('maintenance_records').select('*').eq('id',id).single();fail(error);return{kind:'maintenance',record:data}}
 return{kind:'transaction',record:row};
}

export async function recentActivity(limit=12){
 const{data,error}=await supabase.from('audit_logs').select('id,actor_id,table_name,record_id,action,created_at,profiles!audit_logs_actor_id_fkey(full_name,role)').order('created_at',{ascending:false}).limit(limit);fail(error);return data||[];
}

export async function reportBreakdown(start:string,end:string){
 const{data,error}=await supabase.from('transactions').select('direction,amount,driver_id,vehicle_id,category_id,profiles!transactions_driver_id_fkey(full_name),vehicles(registration_number),transaction_categories(name)').is('archived_at',null).gte('transaction_date',start).lte('transaction_date',end);fail(error);
 const rows:any[]=(data||[]) as any[];const group=(key:'driver_id'|'vehicle_id'|'category_id',label:(r:any)=>string)=>{const m=new Map<string,{name:string,income:number,expense:number}>();for(const r of rows){const id=String(r[key]||'unassigned'),name=label(r)||'Unassigned',x=m.get(id)||{name,income:0,expense:0};x[r.direction==='income'?'income':'expense']+=Number(r.amount||0);m.set(id,x)}return[...m.values()].map(x=>({...x,net:x.income-x.expense})).sort((a,b)=>Math.abs(b.net)-Math.abs(a.net))};return{drivers:group('driver_id',r=>r.profiles?.full_name||'Unassigned'),vehicles:group('vehicle_id',r=>r.vehicles?.registration_number||'Unassigned'),categories:group('category_id',r=>r.transaction_categories?.name||'Unclassified')};
}

export async function adminUsers(){const{data,error}=await supabase.from('profiles').select('id,full_name,phone,role,active,can_view_dashboard,history_months,default_vehicle_id,vehicles!profiles_default_vehicle_id_fkey(registration_number)').order('full_name');fail(error);return data||[]}
export async function updateUserAccess(id:string,payload:Partial<Profile>){const{error}=await supabase.from('profiles').update(payload).eq('id',id);fail(error)}
export async function paymentAccounts(){const{data,error}=await supabase.from('payment_accounts').select('*').order('is_default',{ascending:false}).order('name');fail(error);return data||[]}
export async function savePaymentAccount(payload:any,id?:string){if(payload.is_default){await supabase.from('payment_accounts').update({is_default:false}).neq('id',id||'00000000-0000-0000-0000-000000000000')}const q=id?supabase.from('payment_accounts').update(payload).eq('id',id):supabase.from('payment_accounts').insert(payload);const{data,error}=await q.select('*').single();fail(error);return data}
export async function setDefaultVehicle(id:string){const a=await supabase.from('vehicles').update({is_default:false}).eq('is_default',true);fail(a.error);const b=await supabase.from('vehicles').update({is_default:true}).eq('id',id);fail(b.error)}
