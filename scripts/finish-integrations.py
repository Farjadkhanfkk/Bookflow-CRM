from pathlib import Path
root=Path(__file__).resolve().parents[1]
def edit(path,fn):
 p=root/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
edit('src/lib/validation.ts',lambda s:s.replace('  smsConsent: z.boolean().default(false),','  smsConsent: z.boolean().default(false),\n  whatsappConsent: z.boolean().default(false),'))
edit('src/components/BookingForm.tsx',lambda s:s.replace("smsConsent: data.get('smsConsent') === 'on',","smsConsent: data.get('smsConsent') === 'on', whatsappConsent: data.get('whatsappConsent') === 'on',").replace('<label className="check-label"><input type="checkbox" name="smsConsent" />Send booking updates and reminders by SMS. Carrier charges may apply.</label>','<label className="check-label"><input type="checkbox" name="smsConsent" />Send booking updates and reminders by SMS. Carrier charges may apply.</label>\n            <label className="check-label"><input type="checkbox" name="whatsappConsent" />Send appointment updates and reminders through WhatsApp.</label>'))
edit('supabase/migrations/202609220002_booking_transactions.sql',lambda s:s.replace('full_name,email,phone,email_consent,sms_consent)', 'full_name,email,phone,email_consent,sms_consent,whatsapp_consent)').replace("coalesce((h.customer->>'smsConsent')::boolean,false)) returning id", "coalesce((h.customer->>'smsConsent')::boolean,false),coalesce((h.customer->>'whatsappConsent')::boolean,false)) returning id"))
edit('supabase/migrations/202609220006_reports_members.sql',lambda s:s.replace("where channel='sms' and status='processing'", "where channel in ('sms','whatsapp') and status='processing'"))
edit('src/lib/server/providers.ts',lambda s:s+'''
export async function whatsapp(to:string,bookingUrl:string) {
 const account=secret('TWILIO_ACCOUNT_SID');const auth=secret('TWILIO_AUTH_TOKEN');
 const sender=secret('TWILIO_WHATSAPP_FROM');const template=secret('TWILIO_WHATSAPP_TEMPLATE_SID');
 try {
  const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`,{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:`Basic ${Buffer.from(`${account}:${auth}`).toString('base64')}`},body:new URLSearchParams({From:sender,To:`whatsapp:${to}`,ContentSid:template,ContentVariables:JSON.stringify({'1':bookingUrl}),StatusCallback:`${config().APP_URL}/api/twilio/status`})});
  if(response.status>=500)throw new DeliveryUncertain('WhatsApp delivery needs review');
  if(!response.ok)throw new Error('WhatsApp template was rejected');
  try { return (await response.json() as {sid:string}).sid; } catch { throw new DeliveryUncertain('WhatsApp delivery needs review'); }
 } catch(e) { if(e instanceof Error&&(e.name==='TypeError'||e.name==='TimeoutError'))throw new DeliveryUncertain('WhatsApp delivery needs review');throw e; }
}
''')
edit('src/lib/server/providers.ts',lambda s:s.replace("return (await response.json() as {sid:string}).sid;\n }catch", "try { return (await response.json() as {sid:string}).sid; } catch { throw new DeliveryUncertain('Message delivery needs review'); }\n }catch"))
edit('src/lib/server/outbox.ts',lambda s:s.replace('providerFetch,sms }','providerFetch,sms,whatsapp }').replace("select('email,phone,email_consent,sms_consent')","select('email,phone,email_consent,sms_consent,whatsapp_consent')").replace("job.channel==='sms'&&!customer.sms_consent", "job.channel==='sms'&&!customer.sms_consent||job.channel==='whatsapp'&&!customer.whatsapp_consent").replace("if(job.channel==='sms')return", "if(job.channel==='whatsapp')return {status:'sent',providerId:await whatsapp(customer.phone,url)};\n if(job.channel==='sms')return").replace('const message=`Lumina appointment update:', "const prefix=job.event_type==='review_request'?'Thank you for your visit. We welcome your feedback through the contact form. ':job.event_type==='no_show_followup'?'We missed you. You can arrange another appointment from our booking page. ':'';\n const message=`${prefix}Lumina appointment update:"))
edit('.env.example',lambda s:s+'\n# Approved WhatsApp template with variable 1 for the private booking URL.\nTWILIO_WHATSAPP_FROM=\nTWILIO_WHATSAPP_TEMPLATE_SID=\n')
edit('docs/PRODUCTION.md',lambda s:s.replace('Email/SMS are opt-in.', 'Email, SMS, and WhatsApp are separate opt-ins. WhatsApp requires `TWILIO_WHATSAPP_FROM` (including the `whatsapp:` prefix) and an approved `TWILIO_WHATSAPP_TEMPLATE_SID` whose variable `1` is the private booking URL; use the sandbox/approved test recipients before production.'))
