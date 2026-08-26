import {supabase} from '../lib/supabase';

export type DocumentExtraction={document_type:string|null;date:string|null;reference:string|null;amount:number|null;tax_amount:number|null;vendor:string|null;customer:string|null;payment_method:string|null;payment_account_hint:string|null;truck_registration:string|null;litres:number|null;odometer:number|null;from_location:string|null;to_location:string|null;description:string|null;category_hint:string|null;direction_hint:'income'|'expense'|null;confidence:number;warnings:string[]};

const toBase64=(file:File)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(new Error('The selected document could not be read.'));r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.readAsDataURL(file)});

async function edgeErrorMessage(error:any){try{const res=error?.context;if(res instanceof Response){const body=await res.clone().json();if(body?.error)return String(body.error)}}catch{}return error?.message||'The document could not be analysed.'}

export async function analyzeDocument(file:File):Promise<DocumentExtraction>{
 if(!file)throw new Error('Choose a document first.');
 if(file.size>6_000_000)throw new Error('Use a document smaller than 6 MB for automatic analysis.');
 if(!(file.type.startsWith('image/')||file.type==='application/pdf'))throw new Error('Automatic analysis currently supports PDF and image files.');
 const data_base64=await toBase64(file);
 const{data,error}=await supabase.functions.invoke('extract-document',{body:{file_name:file.name,mime_type:file.type,data_base64}});
 if(error)throw new Error(await edgeErrorMessage(error));
 if(data?.error)throw new Error(data.error);
 if(!data?.extracted)throw new Error('No usable fields were found in this document.');
 return data.extracted as DocumentExtraction;
}

export function applyExtractionToForm(form:HTMLFormElement,x:DocumentExtraction){
 const set=(name:string,value:unknown)=>{if(value===null||value===undefined||value==='')return;const el=form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null;if(!el)return;const proto=el instanceof HTMLSelectElement?HTMLSelectElement.prototype:el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value')?.set?.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
 set('transaction_date',x.date);set('delivery_date',x.date);set('fuel_date',x.date);set('maintenance_date',x.date);set('transaction_number',x.reference);set('delivery_number',x.reference);set('amount',x.amount);set('expected_income',x.amount);set('cost',x.amount);set('litres',x.litres);set('odometer',x.odometer);set('from_location',x.from_location);set('to_location',x.to_location);set('description',x.description);set('notes',x.description);
 const match=(name:string,hint:string|null)=>{if(!hint)return;const el=form.elements.namedItem(name) as HTMLSelectElement|null;if(!el?.options)return;const h=hint.toLowerCase();const opt=[...el.options].find(o=>o.text.toLowerCase().includes(h)||h.includes(o.text.toLowerCase()));if(opt)set(name,opt.value)};
 match('vehicle_id',x.truck_registration);match('customer_id',x.customer);match('vendor_id',x.vendor);match('payment_account_id',x.payment_account_hint||x.payment_method);match('category_id',x.category_hint);
}
