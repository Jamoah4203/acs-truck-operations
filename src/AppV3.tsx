import {useEffect} from 'react';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import AppV2 from './AppV2';
import {supabase} from './lib/supabase';

type VisibleSummary={title?:string;date?:string;detail?:string;amount?:string;status?:string};
let lastViewed:VisibleSummary={};

const hiddenLabels=new Set([
  'id','transaction id','category id','vehicle id','customer id','driver id','delivery id','vendor id','created by','approved by','approved at',
  'created at','updated at','archived at','archived by','external reference','source','needs review','legacy month'
]);
const rename:Record<string,string>={
  'transaction number':'Reference','transaction date':'Date','delivery number':'Delivery reference','delivery date':'Date','fuel date':'Date',
  'maintenance date':'Date','direction':'Type','amount':'Amount','paid amount':'Amount paid','payment status':'Payment status','payment method':'Payment method',
  'description':'Description','notes':'Notes','legacy client name':'Client','legacy from location':'From','legacy to location':'To',
  'legacy transporter':'Transporter','legacy truck id':'Truck','legacy trans type':'Category','expected income':'Delivery income','station':'Fuel station',
  'litres':'Litres','odometer':'Odometer','maintenance type':'Maintenance type','cost':'Cost','status':'Status'
};

function titleCase(value:string){return value.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function formatDate(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-GH',{day:'2-digit',month:'short',year:'numeric'})}
function money(value:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(Number(value)||0)}

function captureViewedSummary(target:Element){
  const card=target.closest('.v2-record-card');
  if(card){lastViewed={
    title:card.querySelector('h4')?.textContent?.trim(),
    date:card.querySelector('.v2-record-top small')?.textContent?.trim(),
    detail:card.querySelector('p')?.textContent?.trim(),
    amount:card.querySelector('.v2-record-money')?.textContent?.trim(),
    status:card.querySelector('.v2-status')?.textContent?.trim()
  };return;
  }
  const row=target.closest('tr');
  if(row){const cells=[...row.querySelectorAll('td')].map(x=>x.textContent?.trim()||'');lastViewed={title:cells[0],date:cells[1],detail:cells[2],amount:cells[3],status:cells[4]};}
}

function cleanDetailModal(modal:HTMLElement){
  if(modal.dataset.cleaned==='1')return;
  const heading=modal.querySelector('.v2-modal-head h3')?.textContent?.trim();
  if(heading!=='Record details')return;
  modal.dataset.cleaned='1';
  const detail=modal.querySelector('.v2-detail');
  if(!detail)return;

  const summary=document.createElement('div');
  summary.className='human-record-summary';
  const parts=[lastViewed.title,lastViewed.date,lastViewed.detail,lastViewed.amount,lastViewed.status].filter(Boolean);
  if(parts.length){
    summary.innerHTML=`<div><span>Record</span><strong>${escapeHtml(lastViewed.title||'Record')}</strong></div>${lastViewed.date?`<div><span>Date</span><strong>${escapeHtml(lastViewed.date)}</strong></div>`:''}${lastViewed.detail?`<p>${escapeHtml(lastViewed.detail)}</p>`:''}${lastViewed.amount?`<div class="human-record-amount">${escapeHtml(lastViewed.amount)}</div>`:''}${lastViewed.status?`<span class="human-record-status">${escapeHtml(titleCase(lastViewed.status))}</span>`:''}`;
    detail.parentElement?.insertBefore(summary,detail);
  }

  [...detail.children].forEach(node=>{
    const box=node as HTMLElement;
    const small=box.querySelector('small');
    const strong=box.querySelector('b');
    if(!small||!strong)return;
    const raw=(small.textContent||'').trim().toLowerCase();
    const value=(strong.textContent||'').trim();
    if(hiddenLabels.has(raw)||raw.endsWith(' id')||value==='null'||value==='—'||value===''){
      box.remove();return;
    }
    small.textContent=rename[raw]||titleCase(raw);
    if(raw.includes('date')||raw.endsWith(' at'))strong.textContent=formatDate(value);
    if(['amount','paid amount','expected income','cost'].includes(raw)&&!Number.isNaN(Number(value)))strong.textContent=money(Number(value));
    if(['direction','payment status','status','legacy trans type'].includes(raw))strong.textContent=titleCase(value);
  });

  if(!detail.children.length)detail.remove();
}

function escapeHtml(v:string){return v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]||c))}

async function imageAsDataUrl(path:string){
  if(!path||path.toLowerCase().endsWith('.svg'))return null;
  try{
    const {data}=supabase.storage.from('company-logos').getPublicUrl(path);
    const res=await fetch(data.publicUrl);
    if(!res.ok)return null;
    const blob=await res.blob();
    return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob)});
  }catch{return null}
}

function fieldValue(modal:HTMLElement,label:string){
  const labels=[...modal.querySelectorAll('label')];
  const found=labels.find(x=>(x.childNodes[0]?.textContent||x.textContent||'').trim().toLowerCase().startsWith(label.toLowerCase()));
  const input=found?.querySelector('input,textarea') as HTMLInputElement|HTMLTextAreaElement|null;
  return input?.value?.trim()||'';
}

async function generateInvoicePdf(modal:HTMLElement,button:HTMLButtonElement){
  const old=button.textContent||'';button.disabled=true;button.textContent='Generating PDF…';
  try{
    const invoiceNumber=fieldValue(modal,'Invoice number');
    const dueDate=fieldValue(modal,'Due date');
    const terms=fieldValue(modal,'Terms');
    const preview=modal.querySelector('.v2-invoice-preview');
    const deliveryNumber=preview?.querySelector('span')?.textContent?.trim()||'';
    if(!deliveryNumber)throw new Error('Delivery reference could not be identified.');

    const [{data:delivery,error:dErr},{data:settings,error:sErr},{data:{session}}]=await Promise.all([
      supabase.from('deliveries').select('*,customers(*),vehicles(registration_number),profiles!deliveries_driver_id_fkey(full_name)').eq('delivery_number',deliveryNumber).maybeSingle(),
      supabase.from('app_settings').select('value').eq('key','company').maybeSingle(),
      supabase.auth.getSession()
    ]);
    if(dErr)throw dErr;if(sErr)throw sErr;if(!delivery)throw new Error('Delivery record was not found.');
    const company:any=settings?.value||{};
    const total=Number(delivery.expected_income||0);
    const issueDate=new Date().toISOString().slice(0,10);

    const {error:saveErr}=await supabase.from('invoices').upsert({
      invoice_number:invoiceNumber||`INV-${deliveryNumber}`,
      delivery_id:delivery.id,
      customer_id:delivery.customer_id,
      issue_date:issueDate,
      due_date:dueDate||issueDate,
      status:'issued',
      subtotal:total,
      tax_amount:0,
      notes:terms||company.invoice_terms||'',
      created_by:session?.user?.id||null
    },{onConflict:'invoice_number'});
    if(saveErr)throw saveErr;

    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const amber:[number,number,number]=[245,158,11];
    const navy:[number,number,number]=[15,23,42];
    const muted:[number,number,number]=[100,116,139];
    let headerX=18;
    const logo=await imageAsDataUrl(company.logo_path||'');
    if(logo){try{doc.addImage(logo,'PNG',18,14,28,18);headerX=52}catch{headerX=18}}

    doc.setFillColor(...navy);doc.rect(0,0,pageW,7,'F');
    doc.setTextColor(...navy);doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text(company.name||'Avenue Construction Supply GH Ltd',headerX,19);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...muted);
    const companyLine=[company.address,company.phone,company.email,company.website].filter(Boolean).join('  •  ');
    doc.text(companyLine||'ACS Truck Operations',headerX,25,{maxWidth:105});
    if(company.tax_id)doc.text(`Tax / Registration ID: ${company.tax_id}`,headerX,30);

    doc.setTextColor(...navy);doc.setFont('helvetica','bold');doc.setFontSize(25);doc.text('INVOICE',pageW-18,18,{align:'right'});
    doc.setFontSize(10);doc.setFont('helvetica','normal');doc.setTextColor(...muted);
    doc.text(invoiceNumber||`INV-${deliveryNumber}`,pageW-18,24,{align:'right'});
    doc.text(`Issued: ${formatDate(issueDate)}`,pageW-18,29,{align:'right'});
    doc.text(`Due: ${formatDate(dueDate||issueDate)}`,pageW-18,34,{align:'right'});
    doc.setDrawColor(...amber);doc.setLineWidth(1.2);doc.line(18,39,pageW-18,39);

    doc.setFont('helvetica','bold');doc.setTextColor(...navy);doc.setFontSize(10);doc.text('BILL TO',18,49);
    doc.setFont('helvetica','normal');doc.setFontSize(11);doc.text(delivery.customers?.name||'Customer',18,56);
    doc.setFontSize(9);doc.setTextColor(...muted);
    const customerLines=[delivery.customers?.address,delivery.customers?.phone,delivery.customers?.email].filter(Boolean);
    customerLines.forEach((line:string,i:number)=>doc.text(String(line),18,62+i*5,{maxWidth:78}));

    doc.setFont('helvetica','bold');doc.setTextColor(...navy);doc.setFontSize(10);doc.text('DELIVERY DETAILS',112,49);
    doc.setFont('helvetica','normal');doc.setTextColor(...muted);doc.setFontSize(9);
    doc.text(`Reference: ${delivery.delivery_number}`,112,56);
    doc.text(`Date: ${formatDate(delivery.delivery_date)}`,112,61);
    if(delivery.vehicles?.registration_number)doc.text(`Vehicle: ${delivery.vehicles.registration_number}`,112,66);
    if(delivery.profiles?.full_name)doc.text(`Driver: ${delivery.profiles.full_name}`,112,71);

    const route=[delivery.from_location,delivery.to_location].filter(Boolean).join(' → ')||'Delivery service';
    autoTable(doc,{
      startY:82,
      margin:{left:18,right:18},
      head:[['Description','Route / Reference','Qty','Amount']],
      body:[[delivery.description||'Transport / delivery service',`${route}\n${delivery.delivery_number}`,'1',money(total)]],
      styles:{font:'helvetica',fontSize:9,cellPadding:4,textColor:navy},
      headStyles:{fillColor:navy,textColor:[255,255,255],fontStyle:'bold'},
      columnStyles:{0:{cellWidth:70},1:{cellWidth:62},2:{cellWidth:14,halign:'center'},3:{cellWidth:30,halign:'right'}},
      theme:'grid'
    });
    const y=(doc as any).lastAutoTable?.finalY||110;
    doc.setFontSize(9);doc.setTextColor(...muted);doc.text('Subtotal',135,y+12);doc.text(money(total),pageW-18,y+12,{align:'right'});
    doc.text('Tax',135,y+18);doc.text(money(0),pageW-18,y+18,{align:'right'});
    doc.setDrawColor(220,225,232);doc.line(135,y+22,pageW-18,y+22);
    doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...navy);doc.text('TOTAL',135,y+30);doc.text(money(total),pageW-18,y+30,{align:'right'});

    const termsY=Math.min(y+48,pageH-58);
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('TERMS & CONDITIONS',18,termsY);
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...muted);
    const termText=terms||company.invoice_terms||'Payment is due according to the agreed terms. Please reference the invoice number when making payment.';
    const wrapped=doc.splitTextToSize(termText,pageW-36);doc.text(wrapped,18,termsY+6);

    doc.setDrawColor(225,228,235);doc.line(18,pageH-25,pageW-18,pageH-25);
    doc.setFontSize(8);doc.setTextColor(...muted);
    const footer=[company.trading_name||company.name,company.phone,company.email,company.website].filter(Boolean).join('  •  ');
    doc.text(footer||'ACS Truck Operations',18,pageH-18,{maxWidth:145});
    doc.text('Generated by ACS Truck Operations',pageW-18,pageH-18,{align:'right'});
    doc.text(`Page 1 of 1`,pageW-18,pageH-12,{align:'right'});
    doc.save(`${(invoiceNumber||deliveryNumber).replace(/[^a-zA-Z0-9_-]/g,'_')}.pdf`);
    button.textContent='PDF generated';
    setTimeout(()=>{button.textContent=old||'Generate PDF';button.disabled=false},1800);
  }catch(err:any){
    alert(err?.message||'Could not generate the PDF.');button.textContent=old;button.disabled=false;
  }
}

export default function AppV3(){
  useEffect(()=>{
    const clickCapture=(event:MouseEvent)=>{
      const target=event.target as Element|null;if(!target)return;
      const button=target.closest('button') as HTMLButtonElement|null;if(!button)return;
      if((button.title||'').toLowerCase()==='view')captureViewedSummary(button);
      const text=(button.textContent||'').trim().toLowerCase();
      if(text.includes('save & print invoice')||text.includes('generate pdf')){
        const modal=button.closest('.v2-modal') as HTMLElement|null;
        if(modal&&modal.querySelector('.v2-modal-head h3')?.textContent?.trim()==='Generate invoice'){
          event.preventDefault();event.stopPropagation();(event as any).stopImmediatePropagation?.();void generateInvoicePdf(modal,button);
        }
      }
    };
    document.addEventListener('click',clickCapture,true);
    const observer=new MutationObserver(()=>{
      document.querySelectorAll<HTMLElement>('.v2-modal').forEach(modal=>{
        cleanDetailModal(modal);
        if(modal.querySelector('.v2-modal-head h3')?.textContent?.trim()==='Generate invoice'){
          const btn=[...modal.querySelectorAll('button')].find(b=>(b.textContent||'').toLowerCase().includes('save & print invoice'));
          if(btn&&btn.textContent)btn.innerHTML=btn.innerHTML.replace('Save &amp; print invoice','Generate PDF').replace('Save & print invoice','Generate PDF');
        }
      });
    });
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>{document.removeEventListener('click',clickCapture,true);observer.disconnect()};
  },[]);
  return <AppV2/>;
}
