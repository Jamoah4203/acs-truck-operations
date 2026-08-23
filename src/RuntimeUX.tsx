import {useEffect,useState} from 'react';
import {AlertTriangle,CheckCircle2,CloudOff,RefreshCw,X} from 'lucide-react';
import './runtime-ux.css';

const NAV_KEY='acs-truck:last-page';

export default function RuntimeUX(){
 const[online,setOnline]=useState(navigator.onLine),[message,setMessage]=useState(''),[fresh,setFresh]=useState(false);
 useEffect(()=>{
  const onOnline=()=>{setOnline(true);setMessage('Connection restored. Refreshing data…');setTimeout(()=>setMessage(''),2200)};
  const onOffline=()=>{setOnline(false);setMessage('You are offline. Cached information remains available where possible.')};
  const onError=(e:any)=>setMessage(e.detail?.message||'Some data could not be refreshed.');
  const onFresh=()=>{setFresh(true);setTimeout(()=>setFresh(false),1200)};
  window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);window.addEventListener('acs:data-error',onError);window.addEventListener('acs:data-fresh',onFresh);
  return()=>{window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline);window.removeEventListener('acs:data-error',onError);window.removeEventListener('acs:data-fresh',onFresh)};
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
 return <>{(message||!online)&&<div className={`runtime-banner ${online?'warn':'offline'}`}>{online?<AlertTriangle size={16}/>:<CloudOff size={16}/>}<span>{message||'Offline mode'}</span><button onClick={reload}><RefreshCw size={14}/>Retry</button>{online&&<button className="close" onClick={()=>setMessage('')}><X size={14}/></button>}</div>}{fresh&&<div className="runtime-fresh"><CheckCircle2 size={14}/>Data refreshed</div>}</>
}