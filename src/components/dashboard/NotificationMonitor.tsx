'use client';
import { api } from '@/lib/api-client';
import { useEffect,useState } from 'react';
type Job={id:string;event_type:string;channel:string;status:string;last_error:string|null;attempts:number};
export function NotificationMonitor(){
 const [jobs,setJobs]=useState<Job[]>([]);const [error,setError]=useState('');const [reload,setReload]=useState(0);
 useEffect(()=>{let active=true;api<{jobs:Job[]}>('/api/crm/notifications').then(r=>{if(active){setJobs(r.jobs);setError('');}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[reload]);
 return <section className="space-y-3"><div className="flex items-center gap-4"><h3 className="text-2xl font-serif">Delivery monitor</h3><button className="underline" onClick={()=>setReload(v=>v+1)}>Refresh</button></div>{error&&<p role="alert">{error}</p>}<p className="text-sm">Failed or uncertain delivery needs provider configuration or operator review. Uncertain messages are not resent automatically.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>Event</th><th>Channel</th><th>Status</th><th>Attempts</th></tr></thead><tbody>{jobs.map(j=><tr key={j.id} className="border-t"><td className="p-2">{j.event_type}</td><td>{j.channel}</td><td>{j.status}{j.last_error&&<p className="text-xs">{j.last_error}</p>}</td><td>{j.attempts}</td></tr>)}</tbody></table></div>{!jobs.length&&!error&&<p>No queued deliveries.</p>}</section>;
}
