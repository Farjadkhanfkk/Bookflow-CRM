import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
export async function GET(request:Request){
 const url=new URL(request.url);const code=url.searchParams.get('code');const tokenHash=url.searchParams.get('token_hash');
 const target=new URL('/reset-password',request.url);
 try{
  const db=await createServerSupabaseClient();
  const result=code?await db.auth.exchangeCodeForSession(code):tokenHash&&['recovery','invite'].includes(url.searchParams.get('type')??'')?await db.auth.verifyOtp({token_hash:tokenHash,type:url.searchParams.get('type') as 'recovery'|'invite'}):null;
  if(!result||result.error)target.searchParams.set('error','expired');
 }catch{target.searchParams.set('error','expired');}
 return NextResponse.redirect(target);
}
