import {createClient} from '@supabase/supabase-js';

const url=import.meta.env.VITE_SUPABASE_URL as string;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
if(!url||!key)console.warn('Supabase environment variables are missing');

async function fetchWithTimeout(input:RequestInfo|URL,init?:RequestInit,ms=15_000){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);
 try{return await fetch(input,{...init,signal:controller.signal})}finally{clearTimeout(timer)}
}

export async function clearDataCache(){
 if(typeof caches!=='undefined'){for(const name of await caches.keys())if(name.startsWith('acs-truck-data'))await caches.delete(name)}
 localStorage.removeItem('acs-truck:last-page');
}

export const supabase=createClient(url||'',key||'',{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
 global:{fetch:(input,init)=>fetchWithTimeout(input,init)}
});
