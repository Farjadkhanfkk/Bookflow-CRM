from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(path,fn):
 p=root/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
edit('scripts/organize-imports.cjs',lambda s:s.replace("f.includes(`${path.sep}src${path.sep}`)","/[\\\\/]src[\\\\/]/.test(f)"))
edit('src/components/dashboard/ConfigurationPanel.tsx',lambda s:s.replace("<button onClick={() => window.location.assign('/api/google/connect')} className=\"underline\">Connect Google Calendar</button>",'<form action="/api/google/connect" method="get"><button className="underline">Connect Google Calendar</button></form>'))
edit('src/components/dashboard/SettingsTab.tsx',lambda s:"import { ConfigurationPanel } from './ConfigurationPanel';\nexport function SettingsTab() { return <ConfigurationPanel />; }\n")
edit('src/components/dashboard/StaffDashboard.tsx',lambda s:s.replace('<SettingsTab staffMembers={staffMembers} />','<SettingsTab />').replace("import { api }", "import { ProviderTools } from './ProviderTools';\nimport { formatInTimeZone } from 'date-fns-tz';\nimport { api }").replace("  const [staffMembers", "  const [timezone, setTimezone] = useState('America/Los_Angeles');\n  const [staffMembers").replace('staffRes, paymentRes]', 'staffRes, paymentRes, businessRes]').replace("supabase.from('payments').select('amount,refunded_amount')", "supabase.from('payments').select('amount,refunded_amount'),\n        supabase.from('businesses').select('timezone').single()").replace('      setStaffMembers(', "      const businessTimezone = businessRes.data?.timezone ?? 'America/Los_Angeles';\n      setTimezone(businessTimezone);\n      setStaffMembers(").replace('const startTime = toTimeLabel(apt.appointment_time);', "const startTime = formatInTimeZone(apt.appointment_time, businessTimezone, 'h:mm aa');").replace('const localDate = toDateStr(apt.appointment_time);',"const localDate = formatInTimeZone(apt.appointment_time, businessTimezone, 'yyyy-MM-dd');").replace('endTime: computeEndTimeLabel(apt.appointment_time, durationMinutes),',"endTime: formatInTimeZone(new Date(Date.parse(apt.appointment_time) + durationMinutes * 60000), businessTimezone, 'h:mm aa'),").replace('Schedule timezone: America/Los_Angeles','Schedule timezone: {timezone}').replace("          {activeTab === 'calendar' && (", "          {activeTab === 'calendar' && <ProviderTools />}\n          {activeTab === 'calendar' && (").replace('            <ScheduleTab\n','            <ScheduleTab\n              timezone={timezone}\n'))
edit('src/components/dashboard/ScheduleTab.tsx',lambda s:s.replace('import React,',"import { MonthCalendar } from './MonthCalendar';\nimport { formatInTimeZone } from 'date-fns-tz';\nimport React,").replace('interface ScheduleTabProps {','interface ScheduleTabProps {\n  timezone?: string;').replace('  appointments,','  timezone = \'America/Los_Angeles\',\n  appointments,',1).replace('addDays(new Date(), dayOffset), [dayOffset]',"addDays(new Date(formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd') + 'T12:00:00'), dayOffset), [dayOffset, timezone]").replace(".catch(console.error)",".catch(() => setStaffError('Provider schedules could not be loaded.'))").replace('  const [loadingStaff,',"  const [staffError, setStaffError] = useState('');\n  const [loadingStaff,").replace('      {/* Day View */}', '<MonthCalendar appointments={filteredAppointments} onSelect={onSelectAppointment}/>\n      {staffError && <p role="alert">{staffError}</p>}\n      {/* Day View */}'))
def provider_time(s):
 pos=s.index("    if (resource === 'tasks') {",s.index('export async function POST'))
 s=s[:pos]+'''    if (resource === 'my-time-off') {
      if(!m.staffId) throw new HttpError(400,'Link your account to a provider first.');
      const input=await body(request,z.object({starts_at:z.string().datetime({offset:true}),ends_at:z.string().datetime({offset:true}),reason:z.string().max(500)}).strict().refine(v=>Date.parse(v.ends_at)>Date.parse(v.starts_at)));
      const {error}=await db.rpc('save_my_time_off',{p_actor:m.user.id,p_start:input.starts_at,p_end:input.ends_at,p_reason:input.reason});
      if(error) throw new HttpError(409,'Time off could not be saved.');return json({saved:true});
    }
'''+s[pos:]
 return s
edit('src/app/api/crm/[resource]/route.ts',provider_time)
edit('src/components/ErrorBoundary.tsx',lambda s:s.replace("    console.error('Booking modal error:', error, errorInfo);", "    // Render the recovery UI without logging customer data or component props.\n    void error; void errorInfo;"))
edit('src/components/dashboard/StaffDashboard.tsx',lambda s:s.replace("      console.error('Error signing out:', err);", "      showToast('Sign-out failed. Please try again.');\n      void err;"))
edit('src/lib/appointment-data.ts',lambda s:re.sub(r'interface ConflictRow \{[^}]*\}\n','',s))
edit('.gitignore',lambda s:s+'\n/test-results/\n/playwright-report/\n!.env.example\n')
edit('README.md',lambda s:'''# Lumina Med Spa / BookFlow CRM

A fictional med-spa portfolio with Next.js, Supabase, server-validated appointment booking, Stripe deposits, customer/lead CRM, and queued integrations.

Use Node 24. Run `npm ci`, copy `.env.example` to `.env.local`, configure the private environment, and run `npm run dev`.

Before connecting a real database, read [Production setup](docs/PRODUCTION.md) and [Architecture](docs/ARCHITECTURE.md). Apply the additive migrations on staging first; the original repository did not include its deployed schema.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`. Browser tests require `npx playwright install chromium`.

Marketing content is explicitly illustrative. Bookings fail safely when backend configuration is missing. Use test data and Stripe test mode. No deployment is performed by these local changes.
''')
edit('src/app/api/booking/[action]/route.ts',lambda s:s.replace("if (action === 'view') return json({ appointment });", "if (action === 'view') { const { data: location } = await db.from('locations').select('timezone,name').eq('id',appointment.location_id).maybeSingle(); return json({ appointment: { ...appointment, timezone: location?.timezone ?? 'UTC', location_name: location?.name ?? '' } }); }"))
edit('src/components/ManageBooking.tsx',lambda s:s.replace('type Appointment = {','type Appointment = { timezone: string; location_name: string;').replace("timeZone: 'UTC'","timeZone: appointment.timezone").replace('} (UTC)</p>', '} ({appointment.timezone}) · {appointment.location_name}</p>'))
