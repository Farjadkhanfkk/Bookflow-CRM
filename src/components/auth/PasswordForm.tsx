'use client';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { useState } from 'react';
export function PasswordForm({reset=false,invalid=false}:{reset?:boolean;invalid?:boolean}){
 const [message,setMessage]=useState('');const [error,setError]=useState(invalid?'This recovery link is invalid or expired. Request another link.':'');const [busy,setBusy]=useState(false);
 return <main className="mx-auto w-full max-w-lg p-6 py-16 booking-form space-y-6"><Link href="/login" className="underline">← Staff sign in</Link><h1 className="text-4xl font-serif">{reset?'Choose a new password':'Recover your account'}</h1>
 {error&&<p role="alert" className="text-red-800">{error}</p>}{message&&<p role="status">{message}</p>}
 {!invalid&&<form className="space-y-5" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);try{const result=await api<{message:string}>(`/api/auth/${reset?'reset':'forgot'}`,reset?{password:f.get('password')}:{email:f.get('email')});setMessage(result.message);}catch(err){setError(err instanceof Error?err.message:'Request failed.');}finally{setBusy(false);}}}>
 {reset?<label>New password<input name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password"/></label>:<label>Work email<input name="email" type="email" required autoComplete="email"/></label>}<button disabled={busy} className="action-button">{busy?'Working…':reset?'Update password':'Send recovery email'}</button></form>}
 {invalid&&<Link href="/forgot-password" className="underline">Request a new recovery link</Link>}</main>;
}
