import {useQuery} from '@tanstack/react-query';
import {Download} from 'lucide-react';
import {documentsFor,signedDocument} from './api';
import {clean,dateLabel,money} from './format';
import {Loading} from './components';

const hidden=new Set(['id','transaction_id','vehicle_id','driver_id','delivery_id','customer_id','vendor_id','category_id','created_by','approved_by','archived_by','created_at','updated_at','approved_at','archived_at','legacy_month','legacy_client_name','legacy_from_location','legacy_to_location','legacy_transporter','legacy_truck_id','legacy_trans_type','source','external_reference','needs_review']);
const moneyKeys=/amount|income|cost|paid/i;const dateKeys=/date$|_at$/i;
const label=(k:string)=>k.replace(/^expected_/,'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export default function RecordDetail({type,record}:{type:string;record:any}){const docs=useQuery({queryKey:['documents',type,record.id],queryFn:()=>documentsFor(type,record.id),enabled:!!record.id});const entries=Object.entries(record).filter(([k,v])=>!hidden.has(k)&&v!=null&&typeof v!=='object');async function open(d:any){const url=await signedDocument(d.bucket,d.path);if(url)window.open(url,'_blank','noopener,noreferrer')}return <div className="v13-detail"><div className="v13-detail-grid">{entries.map(([k,v])=><div key={k}><small>{label(k)}</small><b>{moneyKeys.test(k)?money(v):dateKeys.test(k)?dateLabel(v):clean(v)}</b></div>)}</div><section className="v13-docs"><h3>Documents</h3>{docs.isLoading?<Loading label="Loading documents…"/>:docs.data?.length?docs.data.map((d:any)=><button key={d.id} onClick={()=>open(d)}><span><b>{d.original_name}</b><small>{d.mime_type||'Document'}</small></span><Download size={16}/></button>):<p>No files attached.</p>}</section></div>}
