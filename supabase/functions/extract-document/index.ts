import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  try{
    const apiKey=Deno.env.get('OPENAI_API_KEY');
    if(!apiKey)return json({error:'Document analysis is not configured yet. An administrator must add the OPENAI_API_KEY Supabase Edge Function secret.'},503);
    const{file_name,mime_type,data_base64}=await req.json();
    if(!file_name||!mime_type||!data_base64)return json({error:'A document file is required.'},400);
    if(!(String(mime_type).startsWith('image/')||mime_type==='application/pdf'))return json({error:'Only PDF and image documents can be analysed.'},415);
    const approxBytes=Math.ceil(String(data_base64).length*3/4);
    if(approxBytes>6_000_000)return json({error:'The document is too large to analyse. Use a file smaller than 6 MB.'},413);

    const instructions=`You extract bookkeeping and fleet-operation fields from a business document for assisted data entry. Return JSON only. Never invent missing values. Use null for unknown fields. Amounts must be numbers without currency symbols. Dates must be YYYY-MM-DD only when confidently identifiable. Recognize Ghanaian payment channels such as cash, MoMo/mobile money and bank. Truck registration should be copied exactly if visible. Determine likely transaction direction and category only when supported by the document. The extracted data is a suggestion for a human to review, not an accounting posting. Output exactly these keys: document_type, date, reference, amount, tax_amount, vendor, customer, payment_method, payment_account_hint, truck_registration, litres, odometer, from_location, to_location, description, category_hint, direction_hint, confidence, warnings. confidence is 0 to 1. warnings is an array of short strings describing uncertainty or conflicts.`;
    const fileInput=String(mime_type).startsWith('image/')
      ? {type:'input_image',image_url:`data:${mime_type};base64,${data_base64}`,detail:'high'}
      : {type:'input_file',filename:file_name,file_data:`data:${mime_type};base64,${data_base64}`};

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),45_000);
    let r:Response;
    try{
      r=await fetch('https://api.openai.com/v1/responses',{
        method:'POST',
        signal:controller.signal,
        headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'gpt-5.4-mini-2026-03-17',
          store:false,
          max_output_tokens:1200,
          input:[
            {role:'developer',content:[{type:'input_text',text:instructions}]},
            {role:'user',content:[{type:'input_text',text:'Extract only the supported fields from this document.'},fileInput]}
          ],
          text:{format:{type:'json_schema',name:'document_extraction',strict:true,schema:{
            type:'object',additionalProperties:false,
            properties:{
              document_type:{type:['string','null']},date:{type:['string','null']},reference:{type:['string','null']},
              amount:{type:['number','null']},tax_amount:{type:['number','null']},vendor:{type:['string','null']},customer:{type:['string','null']},
              payment_method:{type:['string','null']},payment_account_hint:{type:['string','null']},truck_registration:{type:['string','null']},
              litres:{type:['number','null']},odometer:{type:['number','null']},from_location:{type:['string','null']},to_location:{type:['string','null']},
              description:{type:['string','null']},category_hint:{type:['string','null']},direction_hint:{type:['string','null'],enum:['income','expense',null]},
              confidence:{type:'number',minimum:0,maximum:1},warnings:{type:'array',items:{type:'string'}}
            },
            required:['document_type','date','reference','amount','tax_amount','vendor','customer','payment_method','payment_account_hint','truck_registration','litres','odometer','from_location','to_location','description','category_hint','direction_hint','confidence','warnings']
          }}}
        })
      });
    }catch(e){
      if(e instanceof DOMException&&e.name==='AbortError')return json({error:'Document analysis timed out. Your form has not been changed. Please retry.'},504);
      throw e;
    }finally{clearTimeout(timer)}

    const body=await r.json();
    if(!r.ok)return json({error:'Document analysis service could not process this file.',detail:body?.error?.message||null},502);
    const text=body.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==='output_text')?.text||body.output_text;
    if(!text)return json({error:'No extractable information was returned.'},422);
    let extracted;
    try{extracted=JSON.parse(text)}catch{return json({error:'The analysis response could not be read safely.'},502)}
    return json({extracted});
  }catch(e){return json({error:e instanceof Error?e.message:'Document analysis failed.'},500)}
});
