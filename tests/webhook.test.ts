import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import Stripe from 'stripe';
const state=vi.hoisted(()=>({rpc:vi.fn(),lookup:vi.fn()}));
vi.mock('../src/lib/server/db',()=>({adminDb:()=>({from:()=>({select:()=>({eq:()=>({maybeSingle:state.lookup})})}),rpc:state.rpc})}));
import { POST } from '../src/app/api/stripe/webhook/route';
const stripe=new Stripe('sk_test_unused');
const holdId='10000000-0000-4000-8000-000000000001';
function request(signature=true,amount=2500){
 const payload=JSON.stringify({id:'evt_test_signed',object:'event',type:'checkout.session.completed',data:{object:{id:'cs_test_checkout',object:'checkout.session',payment_status:'paid',payment_intent:'pi_test',amount_total:amount,currency:'usd',metadata:{holdId}}}});
 return new Request('https://example.test/api/stripe/webhook',{method:'POST',body:payload,headers:{'stripe-signature':signature?stripe.webhooks.generateTestHeaderString({payload,secret:'whsec_test'}):'invalid'}});
}
beforeEach(()=>{
 vi.stubEnv('STRIPE_SECRET_KEY','sk_test_unused');vi.stubEnv('STRIPE_WEBHOOK_SECRET','whsec_test');vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','a'.repeat(30));vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','b'.repeat(30));vi.stubEnv('APP_URL','https://example.test');vi.stubEnv('BOOKING_TOKEN_SECRET','s'.repeat(32));
 state.lookup.mockResolvedValue({data:{id:holdId,token_hash:'hash'},error:null});state.rpc.mockResolvedValue({data:'appointment',error:null});
});
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
describe('Stripe webhook boundary',()=>{
 it('passes only verified payment values to the atomic fulfillment function',async()=>{
  const response=await POST(request());expect(response.status).toBe(200);
  expect(state.rpc).toHaveBeenCalledWith('confirm_booking',expect.objectContaining({p_hold:holdId,p_amount:2500,p_currency:'usd',p_session:'cs_test_checkout',p_intent:'pi_test',p_event:'evt_test_signed'}));
 });
 it('rejects bad signatures before any database calls',async()=>{expect((await POST(request(false))).status).toBe(400);expect(state.lookup).not.toHaveBeenCalled();});
 it('does not acknowledge database failures or tampered amounts',async()=>{state.rpc.mockResolvedValue({error:{code:'P0001',message:'Payment mismatch'}});expect((await POST(request(true,1))).status).toBe(503);});
 it('records a late payment and queues refund only after fulfillment is impossible',async()=>{
  state.rpc.mockResolvedValueOnce({error:{code:'P0001',message:'Hold expired or incomplete'}}).mockResolvedValueOnce({error:null});
  expect((await POST(request())).status).toBe(200);expect(state.rpc).toHaveBeenLastCalledWith('record_unfulfilled_payment',expect.objectContaining({p_amount:2500,p_hold:holdId}));
 });
});
