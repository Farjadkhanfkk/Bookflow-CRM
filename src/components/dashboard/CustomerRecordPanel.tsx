'use client';
import { api } from '@/lib/api-client';
import { useEffect,useState } from 'react';
type RecordData={customer:{id:string;full_name:string;email:string;phone:string;notes:string;email_consent:boolean;sms_consent:boolean;whatsapp_consent:boolean};payments:{id:string;amount:number;refunded_amount:number;currency:string;status:string}[];jobs:{id:string;event_type:string;channel:string;status:string}[];tasks:{id:string;title:string;status:string}[]};
export function CustomerRecordPanel({id}:{id:string}){
 const [data,setData]=useState<RecordData|null>(null);const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;api<RecordData>(`/api/crm/customer-detail?id=${encodeURIComponent(id)}`).then(r=>{if(active)setData(r);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[id]);
 return <section className="booking-form space-y-4 border-t p-6"><h3 className="font-semibold">Customer record</h3>{error&&<p role="alert" className="text-red-800">{error}</p>}{message&&<p role="status">{message}</p>}{data&&<>
  <p>Email consent: {data.customer.email_consent?'Yes':'No'} · SMS consent: {data.customer.sms_consent?'Yes':'No'}</p>
  <form className="space-y-3" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{await api('/api/crm/customers',{id,full_name:data.customer.full_name,notes:String(new FormData(e.currentTarget).get('notes')??'')});setMessage('Customer notes saved.');}catch(err){setError(err instanceof Error?err.message:'Save failed.');}finally{setBusy(false);}}}><label>Internal customer notes<textarea name="notes" maxLength={5000} defaultValue={data.customer.notes??''}/></label><button disabled={busy} className="action-button">Save notes</button></form>
  <h4 className="font-semibold">Recorded payments</h4>{!data.payments.length&&<p>No recorded payments.</p>}{data.payments.map(p=><p key={p.id}>{new Intl.NumberFormat('en-US',{style:'currency',currency:p.currency}).format((p.amount-p.refunded_amount)/100)} · {p.status}</p>)}
  <h4 className="font-semibold">Follow-up tasks</h4>{data.tasks.length?data.tasks.map(t=><p key={t.id}>{t.title} · {t.status}</p>):<p>No linked tasks.</p>}
  <h4 className="font-semibold">Communication history</h4>{data.jobs.length?data.jobs.map(j=><p key={j.id}>{j.event_type.replaceAll('_',' ')} · {j.channel} · {j.status}</p>):<p>No queued communications.</p>}
 </>}</section>;
}
