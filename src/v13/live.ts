import {useEffect} from 'react';
import {supabase} from '../lib/supabase';
import {queryClient} from './query';

export function useLiveInvalidation(){
 useEffect(()=>{
  const channel=supabase.channel('v13-live');
  const watch=(table:string,keys:string[])=>channel.on('postgres_changes',{event:'*',schema:'public',table},()=>{for(const key of keys)queryClient.invalidateQueries({queryKey:[key]})});
  watch('transactions',['transactions','dashboard','pnl']);
  watch('deliveries',['deliveries','dashboard']);
  watch('fuel_logs',['fuel']);
  watch('maintenance_records',['maintenance','dashboard']);
  watch('vehicles',['vehicles','dashboard','masters']);
  watch('customers',['masters']);watch('vendors',['masters']);watch('transaction_categories',['masters']);watch('profiles',['masters']);watch('app_settings',['masters']);
  channel.subscribe();return()=>{supabase.removeChannel(channel)}
 },[])
}
