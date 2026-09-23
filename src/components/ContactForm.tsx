'use client';
import { api } from '@/lib/api-client';
import { useState } from 'react';
export function ContactForm(){
 const [error,setError]=useState('');const [sent,setSent]=useState(false);const [busy,setBusy]=useState(false);
 if(sent)return <p role="status" className="rounded-2xl bg-stone-100 p-6">Your consultation request has been received. The team can now follow up from the CRM.</p>;
 return <form className="booking-form max-w-2xl space-y-5" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');try{await api('/api/contact',{name:f.get('name'),email:f.get('email'),phone:f.get('phone'),message:f.get('message'),consent:f.get('consent')==='on',website:f.get('website')});setSent(true);}catch(err){setError(err instanceof Error?err.message:'Your request could not be sent.');}finally{setBusy(false);}}}>
 <p>Please use test details for this portfolio concept. Do not send medical information.</p>
 <label>Full name<input name="name" required minLength={2} maxLength={120} autoComplete="name"/></label><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Phone (optional)<input name="phone" type="tel" maxLength={25} autoComplete="tel"/></label><label>Your enquiry<textarea name="message" required minLength={10} maxLength={2000}/></label><div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="check-label"><input type="checkbox" name="consent" required/>I consent to a reply about this request and have read the privacy notice.</label>{error&&<p role="alert" className="text-red-800">{error}</p>}<button disabled={busy} className="action-button">{busy?'Sending…':'Request a consultation'}</button></form>;
}
