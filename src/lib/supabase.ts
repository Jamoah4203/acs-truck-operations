import { createClient } from '@supabase/supabase-js';

const url=import.meta.env.VITE_SUPABASE_URL as string;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
if(!url||!key) console.warn('Supabase environment variables are missing');

const CACHE_NAME='acs-truck-data-v1';
const STALE_MS=15*60_000;

function userKey(init?:RequestInit){
 const headers=new Headers(init?.headers||{});
 const auth=headers.get('authorization')||'';
 const token=auth.replace(/^Bearer\s+/i,'');
 if(!token)return 'anon';
 try{const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return payload.sub||'auth'}catch{return 'auth'}
}
async function networkWithTimeout(input:RequestInfo|URL,init?:RequestInit,ms=12_000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);try{return await fetch(input,{...init,signal:controller.signal})}finally{clearTimeout(timer)}}
async function cachedFetch(input:RequestInfo|URL,init?:RequestInit){
 const request=input instanceof Request?input:new Request(input,init),isRestGet=request.method==='GET'&&request.url.includes('/rest/v1/');
 if(!isRestGet||typeof caches==='undefined')return networkWithTimeout(input,init);
 const cache=await caches.open(CACHE_NAME),cacheUrl=new URL(request.url);cacheUrl.searchParams.set('__acs_cache_user',userKey(init));const cacheReq=new Request(cacheUrl.toString(),{method:'GET'}),cached=await cache.match(cacheReq),cachedAt=Number(cached?.headers.get('x-acs-cached-at')||0),age=Date.now()-cachedAt,startup=performance.now()<6000;
 const network=async()=>{try{const response=await networkWithTimeout(input,init);if(response.ok){const headers=new Headers(response.headers);headers.set('x-acs-cached-at',String(Date.now()));await cache.put(cacheReq,new Response(await response.clone().blob(),{status:response.status,statusText:response.statusText,headers}));window.dispatchEvent(new CustomEvent('acs:data-fresh'))}else window.dispatchEvent(new CustomEvent('acs:data-error',{detail:{message:`Data refresh failed (${response.status}). Your last available information may still be shown.`}}));return response}catch(error){window.dispatchEvent(new CustomEvent('acs:data-error',{detail:{message:'Unable to refresh data. Showing the most recent available information where available.'}}));throw error}};
 if(startup&&cached&&age<STALE_MS){void network().catch(()=>{});return cached.clone()}
 try{return await network()}catch(error){if(cached)return cached.clone();throw error}
}
export async function clearDataCache(){if(typeof caches!=='undefined')await caches.delete(CACHE_NAME)}
export const supabase=createClient(url||'',key||'',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{fetch:cachedFetch}});