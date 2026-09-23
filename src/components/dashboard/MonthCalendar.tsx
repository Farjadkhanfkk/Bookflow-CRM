'use client';
import type { CRMAppointment } from '@/types';
import { useState } from 'react';
export function MonthCalendar({appointments,onSelect}:{appointments:CRMAppointment[];onSelect:(a:CRMAppointment)=>void}){
 const [month,setMonth]=useState(()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;});
 const [year,m]=month.split('-').map(Number);const count=new Date(year,m,0).getDate();const offset=new Date(year,m-1,1).getDay();
 return <details className="rounded-2xl border bg-white p-4"><summary className="cursor-pointer font-semibold">Month calendar</summary><label className="block my-4">Month <input className="ml-3 rounded-lg border p-2" type="month" value={month} onChange={e=>{if(e.target.value)setMonth(e.target.value);}}/></label><div className="overflow-x-auto"><div className="grid grid-cols-7 min-w-[600px]">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="p-2 text-sm font-semibold">{d}</div>)}{Array.from({length:offset},(_,i)=><div key={`empty-${i}`}/>)}{Array.from({length:count},(_,i)=>{const date=`${month}-${String(i+1).padStart(2,'0')}`;return <div key={date} className="min-h-28 border border-stone-100 p-2"><span className="text-xs">{i+1}</span>{appointments.filter(a=>a.date===date).map(a=><button key={a.id} className="my-1 block w-full rounded bg-stone-100 p-1 text-left text-[11px]" onClick={()=>onSelect(a)}>{a.startTime} · {a.patientName}</button>)}</div>;})}</div></div></details>;
}
