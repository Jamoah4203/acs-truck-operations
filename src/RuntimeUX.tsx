import {useEffect,useState} from 'react';
import {AlertTriangle,CheckCircle2,CloudOff,RefreshCw,Wrench,X} from 'lucide-react';
import './runtime-ux.css';

const NAV_KEY='acs-truck:last-page';

export default function RuntimeUX(){
 const[online,setOnline]=useState(navigator.onLine),[message,setMessage]=useState(''),[fresh,setFresh]=useState(false),[stalled,setStalled]=useState(false),[repairing,setRepairing]=useState(false);
 useEffect(()=>{
  const onOnline=()=>{setOnline(true);setMessage('Connection restored. Refreshing data…');setTimeout(()=>setMessage(''),2200)};
  const onOffline=()=>{setOnline(false);setMessage('You are offline. Cached information remains available where possible.')};
  const onError=(e:any)=>setMessage(e.detail?.message||'Some data could not be refreshed.');
  const onFresh=()=>{setFresh(true);setStalled(false);setTimeout(()=>setFresh(false),1200)};
  window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);window.addEventListener('acs:data-error',onError);window.addEventListener('acs:data-fresh',onFresh);
  return()=>{window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline);window.removeEventListener('acs:data-error',onError);window.removeEventListener('acs:data-fresh',onFresh)};
 },[]);
 useEffect(()=>{
  const timer=window.setInterval(()=>setStalled(Boolean(document.querySelector('.prod-loading,.access-check'))),2500);
  const first=window.setTimeout(()=>setStalled(Boolean(document.querySelector('.prod-loading,.access-check'))),9000);
  return()=>{clearInterval(timer);clearTimeout(first)};
 },[]);
 useEffect(()=>{
  let restored=false;
  const restore=()=>{
   const nav=document.querySelector('.prod-side nav');
   if(!nav)return;
   nav.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>localStorage.setItem(NAV_KEY,(btn.textContent||'Dashboard').trim())));
   if(restored)return;restored=true;
   const last=localStorage.getItem(NAV_KEY);if(!last||last==='Dashboard')return;
   const target=[...nav.querySelectorAll('button')].find(b=>(b.textContent||'').trim()===last) as HTMLButtonElement|undefined;
   if(target)setTimeout(()=>target.click(),50);
  };
  restore();const observer=new MutationObserver(restore);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();
 },[]);
 const reload=()=>window.location.reload();
 async function latest(){setRepairing(true);try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();if(reg?.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});setTimeout(()=>window.location.reload(),900)}catch{window.location.reload()}finally{setRepairing(false)}}
 async function repair(){setRepairing(true);try{if('caches'in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>!k.startsWith('acs-truck-data')).map(k=>caches.delete(k)))}const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();window.location.replace('/?repair='+Date.now())}catch{window.location.reload()}}
 return <>{(message||!online)&&<div className={`runtime-banner ${online?'warn':'offline'}`}>{online?<AlertTriangle size={16}/>:<CloudOff size={16}/>}<span>{message||'Offline mode'}</span><button onClick={reload}><RefreshCw size={14}/>Retry</button>{online&&<button className="close" onClick={()=>setMessage('')}><X size={14}/></button>}</div>}{stalled&&<div className="runtime-stalled"><AlertTriangle size={18}/><div><b>ACS Truck is taking too long to start</b><small>{online?'The network or an older cached release may be blocking startup.':'You are offline and no usable cached startup response was available.'}</small></div><button onClick={latest} disabled={repairing}><RefreshCw size={14}/>Latest version</button><button onClick={repair} disabled={repairing}><Wrench size={14}/>Repair cache</button></div>}{fresh&&<div className="runtime-fresh"><CheckCircle2 size={14}/>Data refreshed</div>}</>
}