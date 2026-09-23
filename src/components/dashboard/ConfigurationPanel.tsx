'use client';
import { api } from '@/lib/api-client';
import type { SettingsResource } from '@/lib/settings-schema';
import { useEffect,useState } from 'react';
import { MembershipPanel } from './MembershipPanel';
import { NotificationMonitor } from './NotificationMonitor';
type Value=string|number|boolean|null;
type Row=Record<string,Value>;
const fields:Record<SettingsResource,Record<string,Value>>={
  businesses:{name:'Lumina Med Spa',timezone:'America/Los_Angeles',currency:'usd',notice_hours:4,horizon_days:90,cancellation_hours:24,interval_minutes:15},
  services:{name:'',slug:'',category:'facials',duration_minutes:60,preparation_minutes:0,cleanup_minutes:0,price_amount:0,deposit_amount:0,is_active:false},
  staff_members:{name:'',title:'',is_bookable:false},locations:{name:'',address:'',timezone:'America/Los_Angeles',is_active:false},
  staff_services:{staff_id:'',service_id:''},staff_locations:{staff_id:'',location_id:''},
  location_hours:{location_id:'',weekday:1,opens:'09:00',closes:'17:00'},
  staff_availability:{staff_id:'',location_id:'',weekday:1,opens:'09:00',closes:'17:00'},
  staff_time_off:{staff_id:'',starts_at:'',ends_at:'',reason:''},
};
export function ConfigurationPanel(){
  const [resource,setResource]=useState<SettingsResource>('businesses');const [rows,setRows]=useState<Row[]>([]);
  const [editing,setEditing]=useState<Row|null>(null);const [error,setError]=useState('');const [message,setMessage]=useState('');
  const [reload,setReload]=useState(0);const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;api<{rows:Row[]}>(`/api/settings/${resource}`).then(r=>{if(active){setRows(r.rows);setError('');}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[resource,reload]);
  async function save(values:Row,remove=false){setBusy(true);setError('');setMessage('');try{await api(`/api/settings/${resource}`,{...(editing?.id?{id:editing.id}:{}),values,remove});setEditing(null);setReload(v=>v+1);setMessage('Configuration saved.');}catch(e){setError(e instanceof Error?e.message:'Save failed.');}finally{setBusy(false);}}
  return <section className="booking-form space-y-5"><h2 className="text-3xl font-serif">Business configuration</h2><p className="text-sm">Amounts are in minor currency units (100 = $1 for USD). Weekdays: Sunday 0 through Saturday 6. Use multiple availability intervals to create breaks. New services and providers start inactive.</p>
    <label>Configuration area<select value={resource} onChange={e=>{setResource(e.target.value as SettingsResource);setEditing(null);setRows([]);setMessage('');}}>{Object.keys(fields).map(k=><option key={k} value={k}>{k.replaceAll('_',' ')}</option>)}</select></label>
    {error&&<p role="alert" className="text-red-800">{error}</p>}{message&&<p role="status">{message}</p>}
    {resource!=='businesses'&&<button className="action-button" onClick={()=>setEditing({...fields[resource]})}>Add record</button>}
    <div className="space-y-2">{rows.map((row,i)=><button key={String(row.id??i)} className="w-full text-left bg-white border rounded-xl p-4 break-all" onClick={()=>setEditing(row)}><strong>{String(row.name??row.staff_id??row.location_id??'Record')}</strong><span className="block text-xs text-stone-600">{Object.entries(row).filter(([k])=>k!=='name').map(([k,v])=>`${k}: ${v}`).join(' · ')}</span></button>)}</div>
    {editing&&<form key={`${resource}-${editing.id??'new'}`} className="border rounded-2xl bg-white p-5 space-y-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const values:Row={};for(const [key,defaultValue] of Object.entries(fields[resource])){values[key]=typeof defaultValue==='boolean'?f.get(key)==='on':typeof defaultValue==='number'?Number(f.get(key)):String(f.get(key)??'');}void save(values);}}>
      <div className="grid sm:grid-cols-2 gap-4">{Object.entries(fields[resource]).map(([key,value])=><label key={key}>{key.replaceAll('_',' ')}{typeof value==='boolean'?<input type="checkbox" name={key} defaultChecked={Boolean(editing[key]??value)}/>:<input name={key} type={typeof value==='number'?'number':'text'} defaultValue={String(editing[key]??value)} required={key!=='reason'&&key!=='title'&&key!=='address'} placeholder={key.endsWith('_at')?'2026-10-01T09:00:00-07:00':undefined}/>}</label>)}</div>
      <button className="action-button" disabled={busy}>Save</button><button type="button" className="ml-3 underline" onClick={()=>setEditing(null)}>Close</button>
      {!['businesses','services','locations','staff_members'].includes(resource)&&<button disabled={busy} type="button" className="ml-3 text-red-800 underline" onClick={()=>{const values:Row={};for(const k of Object.keys(fields[resource]))values[k]=editing[k];void save(values,true);}}>Remove interval or assignment</button>}
    </form>}
    <div className="border rounded-xl p-5"><h3 className="font-semibold">Calendar connection</h3><p className="text-sm mb-3">A linked provider account can connect its own Google Calendar. Integration secrets are configured on the server.</p><form action="/api/google/connect" method="get"><button className="underline">Connect Google Calendar</button></form><button className="ml-4 underline" onClick={async () => { try { await api('/api/google/disconnect', {}); setMessage('Calendar disconnected.'); } catch (e) { setError(e instanceof Error ? e.message : 'Disconnect failed.'); } }}>Disconnect</button></div>
    <MembershipPanel/><NotificationMonitor/>
  </section>;
}
