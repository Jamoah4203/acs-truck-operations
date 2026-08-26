import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import ReportsPage from './ReportsPage';
import {reportBreakdown} from './workflowApi';
import {money,today} from './format';
import {ErrorState,Loading} from './components';
const yearStart=()=>`${new Date().getFullYear()}-01-01`;
export default function ReportsPageV15(){const[from,setFrom]=useState(yearStart()),[to,setTo]=useState(today());const q=useQuery({queryKey:['operational-breakdown',from,to],queryFn:()=>reportBreakdown(from,to)});return <><ReportsPage/><section className="v13-settings-card v15-analysis"><header><div><h2>Operational analysis</h2><p>Compare performance by driver, truck and category.</p></div><div className="v15-date-inline"><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" min={from} value={to} onChange={e=>setTo(e.target.value)}/></label></div></header>{q.isLoading?<Loading label="Loading operational analysis…"/>:q.error?<ErrorState message={(q.error as Error).message} retry={()=>q.refetch()}/>:<div className="v15-breakdowns"><Breakdown title="By driver" rows={q.data!.drivers}/><Breakdown title="By truck" rows={q.data!.vehicles}/><Breakdown title="By category" rows={q.data!.categories}/></div>}</section></>}
function Breakdown({title,rows}:{title:string;rows:any[]}){return <section><h3>{title}</h3><div className="v15-break-table"><div className="head"><b>Name</b><b>Income</b><b>Expense</b><b>Net</b></div>{rows.slice(0,12).map((r:any)=><div key={r.name}><span>{r.name}</span><span>{money(r.income)}</span><span>{money(r.expense)}</span><strong className={r.net<0?'negative':'positive'}>{money(r.net)}</strong></div>)}</div></section>}
