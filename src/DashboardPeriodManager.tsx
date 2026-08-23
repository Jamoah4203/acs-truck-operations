import {useEffect,useMemo,useState} from 'react';
import {ChevronRight,Receipt,Truck} from 'lucide-react';
import {createPortal} from 'react-dom';
import {supabase} from './lib/supabase';
import './dashboard-period-manager.css';

type Period='month'|'year'|'all';

const money=(n:any)=>new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(Number(n)||0);
const dateLabel=(v:any)=>v?new Date(`${String(v).slice(0,10)}T00:00:00`).toLocaleDateString('en-GH',{day:'2-digit',month:'short',year:'numeric'}):'—';
const clean=(v:any)=>String(v??'—').replace(/_/g,' ');

export default function DashboardPeriodManager(){
 const[active,setActive]=useState(false),[host,setHost]=useState<HTMLElement|null>(null),[period,setPeriod]=useState<Period>('year');
 const[tx,setTx]=useState<any[]>([]),[deliveries,setDeliveries]=useState<any[]>([]),[maintenance,setMaintenance]=useState<any[]>([]),[vehicles,setVehicles]=useState<any[]>([]);

 useEffect(()=>{
  const detect=()=>{const main=document.querySelector('.prod-main') as HTMLElement|null;const title=main?.querySelector('.prod-head h1')?.textContent?.trim();const on=title==='Dashboard';setHost(main);setActive(on);if(main)main.classList.toggle('dashboard-period-managed',on)};
  detect();const observer=new MutationObserver(detect);observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  return()=>{observer.disconnect();document.querySelector('.prod-main')?.classList.remove('dashboard-period-managed')}
 },[]);

 useEffect(()=>{if(!active)return;let cancelled=false;const load=async()=>{const[a,b,c,d]=await Promise.all([
   supabase.from('transactions').select('id,transaction_number,transaction_date,direction,amount,paid_amount,description,transaction_categories(name)').is('archived_at',null).order('transaction_date',{ascending:false}).limit(5000),
   supabase.from('deliveries').select('id,delivery_number,delivery_date,status,from_location,to_location,customers(name)').is('archived_at',null).order('delivery_date',{ascending:false}).limit(5000),
   supabase.from('maintenance_records').select('id,maintenance_date').is('archived_at',null).order('maintenance_date',{ascending:false}).limit(5000),
   supabase.from('vehicles').select('id').is('archived_at',null)
  ]);if(cancelled)return;setTx(a.data||[]);setDeliveries(b.data||[]);setMaintenance(c.data||[]);setVehicles(d.data||[])};load();
  const ch=supabase.channel('dashboard-period-manager').on('postgres_changes',{event:'*',schema:'public',table:'transactions'},load).on('postgres_changes',{event:'*',schema:'public',table:'deliveries'},load).on('postgres_changes',{event:'*',schema:'public',table:'maintenance_records'},load).subscribe();
  return()=>{cancelled=true;supabase.removeChannel(ch)}
 },[active]);

 const now=new Date();
 const inPeriod=(value:any)=>{if(period==='all')return true;if(!value)return false;const d=new Date(`${String(value).slice(0,10)}T00:00:00`);if(Number.isNaN(d.getTime()))return false;if(period==='year')return d.getFullYear()===now.getFullYear();return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()};
 const ptx=useMemo(()=>tx.filter(t=>inPeriod(t.transaction_date)),[tx,period]);
 const pdel=useMemo(()=>deliveries.filter(d=>inPeriod(d.delivery_date)),[deliveries,period]);
 const pmaint=useMemo(()=>maintenance.filter(m=>inPeriod(m.maintenance_date)),[maintenance,period]);
 const income=ptx.filter(t=>t.direction==='income').reduce((s,t)=>s+Number(t.amount||0),0);
 const expenses=ptx.filter(t=>t.direction==='expense').reduce((s,t)=>s+Number(t.amount||0),0);
 const receivables=ptx.filter(t=>t.direction==='income').reduce((s,t)=>s+Math.max(0,Number(t.amount||0)-Number(t.paid_amount||0)),0);
 const net=income-expenses,pending=pdel.filter(d=>!['delivered','cancelled'].includes(d.status)).length,completed=pdel.filter(d=>d.status==='delivered').length;
 const label=period==='month'?now.toLocaleDateString('en-GH',{month:'long',year:'numeric'}):period==='year'?String(now.getFullYear()):'All recorded history';
 const go=(name:string)=>{const button=[...document.querySelectorAll('.prod-side nav button')].find(b=>b.textContent?.trim().toLowerCase()===name.toLowerCase()) as HTMLButtonElement|undefined;button?.click()};
 const cards=[['Income',money(income),'Income'],['Expenses',money(expenses),'Expenses'],['Net P/L',money(net),'Reports'],['Receivables',money(receivables),'Reports'],['Pending',String(pending),'Income'],['Completed',String(completed),'Income'],['Fleet vehicles',String(vehicles.length),'Fleet'],['Maintenance',String(pmaint.length),'Expenses']];
 if(!active||!host)return null;
 return createPortal(<div className="dashboard-managed-root"><section className="dashboard-period-bar"><div><small>MANAGEMENT PERIOD</small><strong>{label}</strong></div><div className="dashboard-period-options"><button className={period==='month'?'active':''} onClick={()=>setPeriod('month')}>This Month</button><button className={period==='year'?'active':''} onClick={()=>setPeriod('year')}>This Year</button><button className={period==='all'?'active':''} onClick={()=>setPeriod('all')}>All Time</button></div></section><section className="dashboard-managed-metrics">{cards.map(([title,value,target])=><button key={title} onClick={()=>go(target)}><small>{title}</small><strong className={title==='Net P/L'&&net<0?'negative':''}>{value}</strong><span>{title==='Fleet vehicles'?'Current fleet':label}</span><ChevronRight size={15}/></button>)}</section><section className="dashboard-managed-split"><article><header><h2>Recent deliveries</h2><small>{label}</small></header>{pdel.slice(0,6).map(d=><button className="dashboard-managed-row" key={d.id} onClick={()=>go('Income')}><Truck size={16}/><span><b>{d.delivery_number}</b><small>{d.customers?.name||'No customer'} · {d.from_location||'—'} → {d.to_location||'—'}</small></span><em>{clean(d.status)}</em></button>)}{!pdel.length&&<p className="dashboard-empty">No deliveries in this period.</p>}</article><article><header><h2>Recent transactions</h2><small>{label}</small></header>{ptx.slice(0,6).map(t=><button className="dashboard-managed-row" key={t.id} onClick={()=>go(t.direction==='income'?'Income':'Expenses')}><Receipt size={16}/><span><b>{t.transaction_categories?.name||t.transaction_number}</b><small>{dateLabel(t.transaction_date)} · {t.description||''}</small></span><em className={t.direction==='income'?'positive':'negative'}>{t.direction==='income'?'+':'-'}{money(t.amount)}</em></button>)}{!ptx.length&&<p className="dashboard-empty">No transactions in this period.</p>}</article></section></div>,host)
}
