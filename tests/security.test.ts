import { describe,it,expect,vi,afterEach } from 'vitest';
import { customerSchema,slotSchema,checkoutSchema,safeRedirect } from '../src/lib/validation';
import { encrypt,decrypt,email,sms,notifyN8n,DeliveryUncertain } from '../src/lib/server/providers';
import { hashToken,newToken } from '../src/lib/server/security';
import { POST as webhook } from '../src/app/api/stripe/webhook/route';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
describe('input and integration security',()=>{
 it('rejects client commercial values and requires policy acceptance',()=>{
  const customer={name:'Test User',email:'user@example.test',phone:'+15555550100',policyAccepted:true};
  expect(customerSchema.safeParse(customer).success).toBe(true);
  expect(customerSchema.safeParse({...customer,policyAccepted:false}).success).toBe(false);
  expect(checkoutSchema.safeParse({holdId:'10000000-0000-4000-8000-000000000001',token:'a'.repeat(43),customer,amount:1}).success).toBe(false);
  expect(slotSchema.safeParse({serviceId:'bad',startsAt:'tomorrow'}).success).toBe(false);
 });
 it('allows only dashboard redirects',()=>{for(const path of ['//evil.test','/\\evil.test','https://evil.test','/login','/dashboard\\evil'])expect(safeRedirect(path)).toBe('/dashboard');expect(safeRedirect('/dashboard?tab=calendar')).toBe('/dashboard?tab=calendar');});
 it('stores opaque token hashes and authenticated encryption rejects changes',()=>{
  vi.stubEnv('GOOGLE_TOKEN_ENCRYPTION_KEY',Buffer.alloc(32,7).toString('base64'));
  const raw=newToken();expect(raw.length).toBe(43);expect(hashToken(raw)).not.toContain(raw);
  const sealed=encrypt('refresh-secret');expect(sealed).not.toContain('refresh-secret');expect(decrypt(sealed)).toBe('refresh-secret');
  const bytes=Buffer.from(sealed,'base64');bytes[20]^=1;expect(()=>decrypt(bytes.toString('base64'))).toThrow();
 });
 it('sends email with a stable idempotency key',async()=>{
  vi.stubEnv('RESEND_API_KEY','test');vi.stubEnv('RESEND_FROM_EMAIL','test@example.test');
  const fetch=vi.fn().mockResolvedValue(Response.json({id:'mail_1'}));vi.stubGlobal('fetch',fetch);
  expect(await email('user@example.test','Test message','event:email')).toBe('mail_1');
  expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('event:email');
 });
 it('does not automatically retry ambiguous SMS sends',async()=>{
  vi.stubEnv('TWILIO_ACCOUNT_SID','test');vi.stubEnv('TWILIO_AUTH_TOKEN','test');vi.stubEnv('TWILIO_FROM_NUMBER','+15555550100');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','a'.repeat(30));vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','b'.repeat(30));vi.stubEnv('APP_URL','https://example.test');vi.stubEnv('BOOKING_TOKEN_SECRET','s'.repeat(32));
  const fetch=vi.fn().mockRejectedValue(new TypeError('network'));vi.stubGlobal('fetch',fetch);
  await expect(sms('+15555550101','test')).rejects.toBeInstanceOf(DeliveryUncertain);expect(fetch).toHaveBeenCalledTimes(1);
 });
 it('signs n8n events with stable event identity and no customer payload',async()=>{
  vi.stubEnv('N8N_WEBHOOK_URL','https://n8n.example.test/webhook');vi.stubEnv('N8N_WEBHOOK_SECRET','test');const fetch=vi.fn().mockResolvedValue(new Response('',{status:200}));vi.stubGlobal('fetch',fetch);
  await notifyN8n('event','confirmed','appointment');expect(fetch.mock.calls[0][1].headers['X-BookFlow-Signature']).toMatch(/^[a-f0-9]{64}$/);expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({eventId:'event',eventType:'confirmed',appointmentId:'appointment'});
 });
 it('rejects unsigned Stripe webhooks without touching the database',async()=>{
  vi.stubEnv('STRIPE_SECRET_KEY','sk_test_dummy');vi.stubEnv('STRIPE_WEBHOOK_SECRET','whsec_test');
  const response=await webhook(new Request('https://example.test/api/stripe/webhook',{method:'POST',body:'{}'}));expect(response.status).toBe(400);
 });
});
