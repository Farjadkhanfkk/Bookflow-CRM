'use client';
import { api } from '@/lib/api-client';
import { useEffect, useState } from 'react';
type Notice={id:string;appointment_id:string|null;message:string;read_at:string|null;created_at:string};
export function StaffInbox({onAppointment}:{onAppointment:(id:string)=>void}){
 const [notices,setNotices]=useState<Notice[]>([]);const [error,setError]=useState('');
 useEffect(()=>{let active=true;async function refresh(){try{const r=await api<{notifications:Notice[]}>('/api/staff-notifications');if(active){setNotices(r.notifications);setError('');}}catch{if(active)setError('Notifications could not refresh.');}}void refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},30000);return()=>{active=false;clearInterval(timer);};},[]);
 async function read(n:Notice){try{await api('/api/staff-notifications',{id:n.id});setNotices(rows=>rows.map(row=>row.id===n.id?{...row,read_at:new Date().toISOString()}:row));setError('');}catch{setError('Could not mark notification read.');}}
 return <details className="rounded-xl border bg-white p-4 mb-4"><summary className="cursor-pointer font-semibold">Notifications ({notices.filter(n=>!n.read_at).length} unread)</summary>{error&&<p role="alert" className="text-sm text-red-800">{error}</p>}<div className="max-h-80 overflow-y-auto mt-3 space-y-2">{notices.length===0&&!error&&<p className="text-sm">No notifications yet.</p>}{notices.map(n=><div key={n.id} className={`rounded-lg border p-3 ${n.read_at?'':'bg-green-50'}`}><p className="text-sm">{n.message}</p><time className="text-xs text-stone-600">{new Date(n.created_at).toLocaleString()}</time><div className="flex gap-4 mt-1">{n.appointment_id&&<button className="text-xs underline" onClick={()=>{onAppointment(n.appointment_id!);void read(n);}}>View appointment</button>}{!n.read_at&&<button className="text-xs underline" onClick={()=>void read(n)}>Mark read</button>}</div></div>)}</div></details>;
}
