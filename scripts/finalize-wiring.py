from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(path,fn):
 p=root/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
edit('supabase/migrations/202609220002_booking_transactions.sql',lambda s:s.replace("interval '15 minutes') tick","interval '1 minute') tick").replace('s.deposit_amount,b.currency,s.name,p_reschedule from businesses b where b.id=s.business_id','s.deposit_amount,biz.currency,s.name,p_reschedule from businesses biz where biz.id=s.business_id'))
edit('src/components/BookingForm.tsx',lambda s:s.replace('setRemaining(Math.floor((Date.parse(result.expiresAt) - Date.now()) / 1000))','setRemaining(45 * 60)'))
edit('src/components/auth/LoginForm.tsx',lambda s:s.replace('<a href="/forgot-password" className="block text-sm underline">Forgot password?</a>','<Link href="/forgot-password" className="block text-sm underline">Forgot password?</Link>'))
edit('src/components/dashboard/SettingsTab.tsx',lambda s:"import { ConfigurationPanel } from './ConfigurationPanel';\nimport type { TeamMember } from '@/types';\nexport function SettingsTab(_props: {staffMembers: TeamMember[]}) { return <ConfigurationPanel />; }\n")
edit('src/components/dashboard/DashboardSidebar.tsx',lambda s:s[:s.index('        {/* Quick Sanctuary Status Pill */}')]+s[s.index('      </div>\n\n      {/* Bottom User Info',s.index('        {/* Quick Sanctuary Status Pill */}')):])
def sidebar(s):
 a=s.index('        {/* Active Staff Card */}');b=s.index('        {/* Back to Client',a)
 s=s[:a]+'''        <p className="hidden sm:block p-3 text-xs capitalize">Signed in · {role}</p>
'''+s[b:]
 s=s.replace('{item.badge && (','{item.badge && (').replace('className={`text-[10px] px-1.5','className={`hidden sm:inline text-[10px] px-1.5').replace('<span>Public Spa Website</span>','<span className="hidden sm:inline">Public Spa Website</span>')
 return s
edit('src/components/dashboard/DashboardSidebar.tsx',sidebar)
edit('src/components/Footer.tsx',lambda s:'import Link from \'next/link\';\n'+s.replace('<span>Physician Supervised Clinic</span>','<Link href="/privacy">Privacy notice</Link>').replace('<span>FDA-Cleared Devices</span>','<Link href="/booking-policy">Booking policy</Link>').replace('Lumina Med Spa Inc. All rights reserved.','Lumina Med Spa · Portfolio concept.'))
# Avoid mixed visitor/clinic timezone conversions in operational data.
edit('src/lib/appointment-data.ts',lambda s:s.replace("import { supabase }", "import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';\nimport { supabase }").replace('return `${datePart}T${timePart}`;',"return fromZonedTime(`${datePart}T${timePart}`, 'America/Los_Angeles').toISOString();").replace("return iso.split('T')[0];","return formatInTimeZone(iso, 'America/Los_Angeles', 'yyyy-MM-dd');"))
def times(s):
 a=s.index('  const d = new Date(iso);',s.index('export function toTimeLabel'));b=s.index('\n}',a)
 s=s[:a]+"  return formatInTimeZone(iso, 'America/Los_Angeles', 'h:mm aa');"+s[b:]
 a=s.index('  const end = new Date',s.index('export function computeEndTimeLabel'));b=s.index('\n}',a)
 s=s[:a]+"  return toTimeLabel(new Date(new Date(isoStart).getTime() + durationMinutes * 60000).toISOString());"+s[b:]
 return s
edit('src/lib/appointment-data.ts',times)
edit('src/components/dashboard/StaffDashboard.tsx',lambda s:s.replace('toTimeLabel, computeEndTimeLabel','toTimeLabel, computeEndTimeLabel, toDateStr').replace("const localDate = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;", "const localDate = toDateStr(apt.appointment_time);").replace("      <div className=\"flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen\">", "      <div className=\"flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen\">\n        <p className=\"px-4 py-2 text-xs text-stone-600\">Schedule timezone: America/Los_Angeles</p>"))
edit('src/lib/customer-data.ts',lambda s:s.replace("import { api }", "import { toDateStr, toTimeLabel } from './appointment-data';\nimport { api }").replace("return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });",'return toTimeLabel(date.toISOString());').replace("const liveSpend = completed.reduce((sum, item) => sum + item.servicePrice, 0);", "const liveSpend = history.filter(item => item.paymentStatus === 'paid').reduce((sum, item) => sum + item.servicePrice, 0);"))
edit('src/app/api/stripe/webhook/route.ts',lambda s:s.replace("if (fulfillError) throw fulfillError; // Retry; never acknowledge an unfulfilled payment.",'''if (fulfillError) {
        if (fulfillError.code !== 'P0001' || !/Hold expired|Booking rules changed/.test(fulfillError.message)) throw fulfillError;
        const { error: refundError } = await db.rpc('record_unfulfilled_payment', {
          p_hold: hold.id, p_session: s.id, p_intent: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id,
          p_amount: s.amount_total, p_currency: s.currency, p_event: event.id,
        });
        if (refundError) throw refundError;
      }'''))
edit('src/lib/server/booking.ts',lambda s:s.replace("import { HttpError }", "import { refreshBusy } from './providers';\nimport { HttpError }").replace('  if (h.deposit_amount === 0) {','  await refreshBusy(h.staff_id);\n  if (h.deposit_amount === 0) {'))
edit('src/app/api/booking/[action]/route.ts',lambda s:s.replace("import { z }", "import { refreshBusy } from '@/lib/server/providers';\nimport { z }").replace("      if (action === 'availability' && 'date' in input) {",'''      const { data: providers, error: providersError } = await db.from('staff_members').select('id').eq('business_id', config().BUSINESS_ID).eq('is_bookable', true);
      if (providersError) throw providersError;
      for (const provider of providers ?? []) if (!input.staffId || provider.id === input.staffId) await refreshBusy(provider.id);
      if (action === 'availability' && 'date' in input) {'''))
# Pending/failed outbox records must remain visible to authorized operators.
edit('src/app/api/crm/[resource]/route.ts',lambda s:s.replace("    if (resource === 'leads') {",'''    if (resource === 'notifications') {
      if (!['owner','admin'].includes(member.role)) throw new HttpError(403,'Not allowed.');
      const { data: a, error: ae } = await member.db.from('appointments').select('id'); if (ae) throw ae;
      const { data, error } = await adminDb().from('outbox').select('id,appointment_id,event_type,channel,status,attempts,last_error,created_at').in('appointment_id',(a??[]).map(r=>r.id)).order('created_at',{ascending:false}).limit(200);
      if (error) throw error; return json({ jobs:data });
    }
    if (resource === 'leads') {''',1))
edit('vitest.config.ts',lambda s:s.replace("hookTimeout: 60000", "hookTimeout: 60000"))
# Native ESM config avoids the Vite 5 warning without changing application module semantics.
(root/'vitest.config.ts').rename(root/'vitest.config.mts')
