export const money=(n:any)=>`GHS ${Number(n||0).toLocaleString('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const dateLabel=(v:any)=>{if(!v)return '—';const d=v instanceof Date?v:new Date(`${String(v).slice(0,10)}T00:00:00`);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('en-GH',{day:'2-digit',month:'short',year:'numeric'})};
export const clean=(v:any)=>String(v??'—').replace(/_/g,' ');
export const today=()=>new Date().toISOString().slice(0,10);
export const ref=(prefix:string)=>`${prefix}-${Date.now().toString().slice(-11)}`;
export function bounds(kind:'month'|'year'|'all',anchor=new Date()){
 if(kind==='all')return{start:'1900-01-01',end:'2999-12-31',label:'All recorded history'};
 if(kind==='year')return{start:`${anchor.getFullYear()}-01-01`,end:`${anchor.getFullYear()}-12-31`,label:String(anchor.getFullYear())};
 const m=String(anchor.getMonth()+1).padStart(2,'0');const end=new Date(anchor.getFullYear(),anchor.getMonth()+1,0).getDate();
 return{start:`${anchor.getFullYear()}-${m}-01`,end:`${anchor.getFullYear()}-${m}-${String(end).padStart(2,'0')}`,label:anchor.toLocaleDateString('en-GH',{month:'long',year:'numeric'})};
}
