from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
def edit(path,fn):
 p=root/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
edit('eslint.config.mjs',lambda s:s.replace('    ".next/**",','    ".next/**",\n    ".kilo/**",\n    "test-results/**",\n    "playwright-report/**",\n    "scripts/*.cjs",'))
edit('tsconfig.json',lambda s:s.replace('"exclude": ["node_modules"]','"exclude": ["node_modules", ".kilo", "test-results", "playwright-report"]'))
edit('tests/e2e/site.spec.ts',lambda s:s.replace("page.getByRole('alert')", "page.locator('[role=alert]').filter({hasText:'unavailable'})").replace('fullPage:true','fullPage:true,caret:\'initial\''))
for p in (root/'src').rglob('*'):
 if p.suffix in ('.ts','.tsx'):
  s=p.read_text(encoding='utf-8').replace('photo-1512290903671-17adc8174f88','photo-1570172619644-dfd03ed5d881').replace('photo-1594824813511-208cb21ec68a','photo-1559839734-2b71ea197ec2')
  p.write_text(s,encoding='utf-8')
def footer(s):
 a=s.index('  const [newsletterEmail');b=s.index('  return (',a);s=s[:a]+s[b:]
 a=s.index('          <div className="lg:col-span-5">');b=s.index('        {/* Main Footer Links',a)
 s=s[:a]+'''          <div className="lg:col-span-5"><Link href="/contact" className="inline-block rounded-full bg-[#8B9D83] px-6 py-3 text-white">Request a consultation</Link></div>
        </div>

'''+s[b:]
 s=s.replace('Lumina Privilege Club','Your next step').replace('Receive $50 Toward Your First Treatment','A conversation comes first').replace('Join our private guest registry for physician skincare insights, seasonal treatment releases, and VIP appointment access.','Explore this fictional business through a sample consultation request. No discounts or vouchers are issued.')
 return s
edit('src/components/Footer.tsx',footer)
def overview(s):
 s=s.replace("import { MOCK_ACTIVITY_LOGS,MOCK_ROOMS } from '../../data/crmData';",'')
 a=s.index('  const getRoomStatusColor');b=s.index('  return (',a);s=s[:a]+s[b:]
 a=s.index('          {/* Recent Activity */}')
 # Replace the right-hand simulated suite/activity cards with real current appointments.
 start=s.rfind('          <div className="bg-white rounded-2xl',0,a)
 # The first suite card begins before the first Sanctuary Suites title.
 title=s.index('Sanctuary Suites');start=s.rfind('          <div className="bg-white',0,title)
 end=s.index('        </div>\n      </div>\n    </div>',a)
 s=s[:start]+'''          <div className="bg-white rounded-2xl border border-[#F0EDE8] p-5 space-y-4">
            <h2 className="text-sm font-bold">Current sessions</h2>
            {activeSessions.length === 0 && <p className="text-sm text-stone-600">No checked-in or active treatments.</p>}
            {activeSessions.map(appointment => <button key={appointment.id} className="block w-full text-left rounded-xl border p-3" onClick={() => onSelectAppointment(appointment)}><strong className="text-sm">{appointment.patientName}</strong><p className="text-xs">{appointment.serviceName} · {appointment.status.replaceAll('_',' ')}</p></button>)}
          </div>
'''+s[end:]
 s=s.replace("Today&apos;s Schedule",'Upcoming appointments')
 return s
edit('src/components/dashboard/OverviewTab.tsx',overview)
# Remove the obsolete client-side mutation/conflict implementation entirely.
def appointment(s):
 for start_marker,end_marker in [('/** Parse a date-time string','/** Convert ISO datetime to "YYYY-MM-DD"'),('/**\n * Check whether','/** Generate time-slot options'),('/** Fetch customers for the staff booking dropdown.', 'export type { AppointmentInsert };')]:
  a=s.find(start_marker);b=s.find(end_marker,a)
  if a>=0 and b>=0:s=s[:a]+s[b:]
 return s.replace('parseInt(priceStr.replace(/[^0-9.]/g, \'\'), 10)',"parseFloat(priceStr.replace(/[^0-9.]/g, ''))")
edit('src/lib/appointment-data.ts',appointment)
def customers(s):
 s=s.replace("import { toTimeLabel }", "import { toDateStr, toTimeLabel }")
 a=s.index('  return `${date.getFullYear()}');b=s.index('\n}',a);s=s[:a]+'  return toDateStr(date.toISOString());'+s[b:]
 s=s.replace('  notes?: string | null;','  notes?: string | null;\n  price_amount?: number;\n  deposit_amount?: number;\n  service_name_snapshot?: string;')
 s=s.replace("serviceName: row.services?.name ?? 'Treatment'","serviceName: row.service_name_snapshot ?? row.services?.name ?? 'Treatment'").replace('servicePrice: numericPrice(row.services?.price)','servicePrice: (row.price_amount ?? 0) / 100')
 s=s.replace('  historyRows: AppointmentJoinRow[]\n','  historyRows: AppointmentJoinRow[],\n  payments: {appointment_id:string;amount:number;refunded_amount:number}[]\n')
 a=s.index('  // Lifetime spend:');b=s.index('\n  return {',a)
 s=s[:a]+'''  const appointmentIds = new Set(history.map(a => a.id));
  const totalSpend = payments.filter(p => appointmentIds.has(p.appointment_id)).reduce((sum,p) => sum + (p.amount - p.refunded_amount) / 100,0);
'''+s[b:]
 s=s.replace('const [customerRes, historyRes]','const [customerRes, historyRes, paymentRes]')
 s=s.replace('payment_status, notes, services(name, price)', 'payment_status, notes, price_amount, deposit_amount, service_name_snapshot, services(name, price)')
 s=s.replace('        ),\n    ]);', "        ),\n      supabase.from('payments').select('appointment_id,amount,refunded_amount'),\n    ]);")
 s=s.replace('(historyRes.data ?? []) as AppointmentJoinRow[]','(historyRes.data ?? []) as AppointmentJoinRow[],\n        paymentRes.data ?? []')
 return s
edit('src/lib/customer-data.ts',customers)
edit('src/components/Hero.tsx',lambda s:s.replace('<Image width={800}', '<Image loading="eager" width={800}',1))
# Browser hardening without blocking required provider-hosted images or checkout navigation.
edit('next.config.ts',lambda s:s.replace('const nextConfig: NextConfig = {','''const nextConfig: NextConfig = {
  async headers() { return [{ source: '/:path*', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'no-referrer' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ] }]; },'''))
