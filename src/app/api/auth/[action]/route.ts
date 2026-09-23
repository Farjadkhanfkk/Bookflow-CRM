import { config } from '@/lib/server/config';
import { body,checkOrigin,handle,HttpError,json,rateLimit } from '@/lib/server/http';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';
export async function POST(request:Request,context:{params:Promise<{action:string}>}){
 return handle(async()=>{
  checkOrigin(request);const {action}=await context.params;await rateLimit(request,`auth:${action}`,5);
  const db=await createServerSupabaseClient();
  if(action==='forgot'){
   const input=await body(request,z.object({email:z.string().trim().email().max(254)}).strict());
   const {error}=await db.auth.resetPasswordForEmail(input.email,{redirectTo:`${config().APP_URL}/auth/callback`});
   if(error)throw new HttpError(503,'Password recovery is temporarily unavailable.');
   return json({message:'If this address has an account, a recovery email will arrive shortly.'});
  }
  if(action==='reset'){
   const input=await body(request,z.object({password:z.string().min(12).max(128)}).strict());
   const {data:{user}}=await db.auth.getUser();if(!user)throw new HttpError(401,'Open a valid recovery link before resetting your password.');
   const {error}=await db.auth.updateUser({password:input.password});if(error)throw new HttpError(400,'The password could not be updated. Try another password or request a new link.');
   await db.auth.signOut();return json({message:'Password updated. Please sign in with your new password.'});
  }
  throw new HttpError(404,'Not found.');
 });
}
