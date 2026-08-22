import {ReactNode,useEffect,useState} from 'react';
import {LogOut,ShieldAlert} from 'lucide-react';
import AppV2 from './AppV2';
import AdminRefinements from './AdminRefinements';
import {supabase} from './lib/supabase';

type Profile={id:string;full_name:string|null;phone:string|null;role:'admin'|'operations'|'accounts'|'driver';active:boolean};

export default function AppRoot(){const[session,setSession]=useState<any>(undefined),[profile,setProfile]=useState<Profile|null>(null),[checking,setChecking]=useState(true);useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session));const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);useEffect(()=>{if(session===undefined)return;if(!session){setProfile(null);setChecking(false);return}setChecking(true);supabase.from('profiles').select('id,full_name,phone,role,active').eq('id',session.user.id).single().then(({data})=>{setProfile(data as Profile|null);setChecking(false)})},[session]);if(checking&&session)return <div className="access-check">Checking account access…</div>;if(session&&profile&&!profile.active)return <DisabledAccount/>;return <><AppV2/>{session&&profile?.active&&<AdminRefinements profile={profile}/>}</>}

function DisabledAccount(){return <main className="access-disabled"><section><ShieldAlert size={42}/><h1>Account inactive</h1><p>Your ACS Truck account has been deactivated by an administrator. Operational and financial data access is blocked until the account is reactivated.</p><button onClick={()=>supabase.auth.signOut()}><LogOut size={17}/>Sign out</button></section></main>}
