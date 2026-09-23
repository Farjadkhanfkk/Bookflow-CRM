from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(path,fn):
 p=root/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
edit('tests/database.test.ts',lambda s:s.replace('describe.sequential(', 'describe('))
edit('src/app/api/booking/[action]/route.ts',lambda s:s.replace("await body(request, action === 'hold' ? slotSchema : availabilitySchema)","action === 'hold' ? await body(request, slotSchema) : await body(request, availabilitySchema)"))
# Marketing is explicit sample editorial content. Operational booking uses the live catalog only.
def featured(s):
 s=s.replace('useState, useEffect','useState').replace("import { supabase } from '@/lib/supabase';","import { SERVICES } from '@/data/spaData';")
 a=s.index('  const [services,');b=s.index('  const categories:',a)
 s=s[:a]+"  const services = SERVICES;\n\n"+s[b:]
 s=re.sub(r'  if \(loading\).*?\n','',s);s=re.sub(r'  if \(error\).*?\n','',s)
 s=s.replace('(service as any).image_url || ','').replace(' ?? (service as any).ideal_for','')
 return s
edit('src/components/FeaturedServices.tsx',featured)
def team(s):
 s=s.replace('React, { useState, useEffect }','React').replace("import { supabase } from '@/lib/supabase';\n",'')
 a=s.index('  const [teamMembers,');b=s.index('  const getInitials',a)
 s=s[:a]+'  const teamMembers = FALLBACK_TEAM;\n\n'+s[b:]
 s=re.sub(r'  if \(loading\).*?\n','',s);s=re.sub(r'  if \(error.*?\n','',s)
 return s.replace('World-Class Clinical Practitioners','Fictional Provider Profiles').replace('Meet Our Medical & Aesthetic Team','Meet the Concept Team')
edit('src/components/TeamSection.tsx',team)
# Remove fabricated reputation and compliance assertions while preserving the layout.
replacements={
 '4.98 ★ (850+ Reviews)':'Portfolio concept · Sample business',
 'Joined by <span className="text-[#2D302E] font-semibold">500+</span> happy clients this month':'Explore a sample appointment booking experience',
 'Verified Patient Outcomes':'Sample Customer Stories',
 'Verified BookFlow Visit':'Sample review · Not a real customer',
 '4.98 Google & Yelp Average':'Illustrative ratings only',
 'HIPAA Compliant Records via BookFlow':'Demo records · No medical information',
 'HIPAA Compliant':'Portfolio Demonstration',
 'Verified Client Satisfaction':'Illustrative Satisfaction',
 'Patient Results':'Sample Reviews',
 'Authentic & Verified':'Concept Experience',
}
for path in ['src/components/Hero.tsx','src/components/ReviewsSection.tsx','src/components/WhyChooseUs.tsx','src/components/Footer.tsx']:
 def change(s):
  for a,b in replacements.items(): s=s.replace(a,b)
  return s
 edit(path,change)
edit('src/data/spaData.ts',lambda s:s.replace('"12,500+"','"Demo"').replace('"99.4%"','"Sample"').replace('"18+"','"Concept"').replace('doctorLed: "100%"','doctorLed: "Sample"'))
edit('src/app/layout.tsx',lambda s:s.replace('Experience bespoke aesthetic medicine, advanced clinical skincare, and restorative wellness curated by board-certified physicians. Powered by BookFlow CRM.','A fictional med-spa website and appointment booking portfolio concept powered by BookFlow CRM.').replace('Premium, physician-led aesthetic treatments in a serene boutique sanctuary.','Explore a fictional med-spa booking and CRM portfolio concept.').replace('{children}', '<div className="bg-[#263c2c] px-4 py-2 text-center text-xs text-white">Portfolio concept · Fictional business, providers, treatments, and reviews. Use test details only.</div>\n        {children}'))
# A signed-in but disabled/non-member account must not bounce between login/dashboard.
edit('src/app/login/page.tsx',lambda s:s.replace("import { redirect } from 'next/navigation';\n",'').replace("import { getCurrentUser } from '@/lib/auth/session';\n",'').replace("  const user = await getCurrentUser();\n  if (user) redirect('/dashboard');\n",''))
edit('src/components/auth/LoginForm.tsx',lambda s:s.replace('{/* Submit */}', '<a href="/forgot-password" className="block text-sm underline">Forgot password?</a>\n{/* Submit */}'))
def dashboard(s):
 s=s.replace("import { supabase }", "import { api } from '@/lib/api-client';\nimport { OperationsTab } from './OperationsTab';\nimport { supabase }")
 s=s.replace("  userEmail?: string;", "  userEmail?: string;\n  role?: import('@/lib/validation').Role;")
 s=s.replace('  userEmail,','  userEmail,\n  role = \'staff\',')
 s=s.replace(': any','')
 s=s.replace("const [aptRes, custRes, servRes, staffRes]", "const [aptRes, custRes, servRes, staffRes, paymentRes]")
 s=s.replace("supabase.from('staff_members').select('*')", "supabase.from('staff_members').select('*'),\n        supabase.from('payments').select('amount,refunded_amount')",1)
 s=s.replace('const servicePrice = serv.price;', 'const servicePrice = apt.price_amount != null ? apt.price_amount / 100 : 0;')
 s=s.replace("parseInt(String(servicePrice || '0').replace(/[^0-9]/g, ''), 10)","parseFloat(String(servicePrice || '0').replace(/[^0-9.]/g, ''))")
 s=s.replace("status: (apt.status as AppointmentStatus)","status: (String(apt.status).toLowerCase() as AppointmentStatus)")
 s=s.replace("price: numericPrice,", "price: numericPrice,\n          depositAmount: (apt.deposit_amount ?? 0) / 100,")
 a=s.index('      const revenue =');b=s.index('      const pendingRevenue',a)
 s=s[:a]+"      const revenue = (paymentRes.data ?? []).reduce((sum, p) => sum + (p.amount - p.refunded_amount) / 100, 0);\n"+s[b:]
 s=s.replace("subtext: 'From completed treatments'","subtext: 'Captured payments less refunds'")
 s=re.sub(r"change: '(?:\+?[\d.]+%)'","change: ''",s)
 a=s.index('     } catch (err) {');b=s.index('      setAppointments([]);',a)
 s=s[:a]+"     } catch {\n      setError('We could not load your dashboard data. Please check configuration and access.');\n"+s[b:]
 s=s.replace('(payload) => {', '() => {');s=re.sub(r"\s*console\.log\([^\n]+\);",'',s)
 s=s.replace('    loadDashboardData();\n\n    const channel', '    const initialLoad = window.setTimeout(() => { void loadDashboardData(); }, 0);\n\n    const channel')
 s=s.replace('      supabase.removeChannel(channel);','      clearTimeout(initialLoad);\n      supabase.removeChannel(channel);')
 a=s.index('  const handleUpdateStatus =');b=s.index('  const handleAddAppointmentSuccess',a)
 s=s[:a]+'''  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await api('/api/crm/appointments', { id: appointmentId, status: newStatus });
      setSelectedAppointment(prev => prev?.id === appointmentId ? { ...prev, status: newStatus } : prev);
      showToast('Appointment status saved.');
      await loadDashboardData();
    } catch (e) { showToast(e instanceof Error ? e.message : 'Status could not be saved.'); }
  };
  const handleUpdateNotes = async (appointmentId: string, notes: string) => {
    await api('/api/crm/appointments', { id: appointmentId, notes });
    setSelectedAppointment(prev => prev?.id === appointmentId ? { ...prev, notes } : prev);
    await loadDashboardData();
  };

'''+s[b:]
 s=s.replace('        activeTab={activeTab}', '        role={role}\n        activeTab={activeTab}')
 s=s.replace("          {activeTab === 'settings' && (", "          {(['leads','tasks','reports'] as string[]).includes(activeTab) && <OperationsTab resource={activeTab as 'leads' | 'tasks' | 'reports'} />}\n          {activeTab === 'settings' && (" )
 s=s.replace('      <AppointmentDetailDrawer\n', '      {selectedAppointment && <AppointmentDetailDrawer\n        key={selectedAppointment.id}\n')
 s=s.replace('        onUpdateNotes={handleUpdateNotes}\n      />','        onUpdateNotes={handleUpdateNotes}\n      />}')
 s=s.replace('px-6 py-3.5','px-3 sm:px-6 py-3.5').replace('text-xs font-semibold uppercase tracking-[0.2em]','hidden sm:inline text-xs font-semibold uppercase tracking-[0.2em]')
 return s
edit('src/components/dashboard/StaffDashboard.tsx',dashboard)
def drawer(s):
 s=s.replace('onUpdateNotes: (appointmentId: string, notes: string) => void;', 'onUpdateNotes: (appointmentId: string, notes: string) => Promise<void>;')
 s=s.replace('  if (!appointment) return null;\n','').replace("useState<string>(appointment.notes || '')","useState<string>(appointment?.notes || '')")
 a=s.index('  const handleSaveNotes =');b=s.index('  const getStatusBadge',a)
 s=s[:a]+'''  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!appointment) return null;
  const handleSaveNotes = async () => {
    setSaving(true); setError(''); setSavedNotes(false);
    try { await onUpdateNotes(appointment.id, notes); setSavedNotes(true); }
    catch { setError('Notes could not be saved. Please retry.'); }
    finally { setSaving(false); }
  };
'''+s[b:]
 s=s.replace('onClick={handleSaveNotes}', 'disabled={saving} onClick={handleSaveNotes}')
 s=s.replace('{/* Drawer Body Content */}', '{error && <p role="alert" className="p-4 text-red-800">{error}</p>}\n        {/* Drawer Body Content */}')
 s=s.replace('-$50.00', "-${(appointment.depositAmount ?? 0).toFixed(2)}")
 s=s.replace("${appointment.paymentStatus === 'paid' ? '0.00' : `${appointment.price - 50}.00`}","${Math.max(0, appointment.price - (appointment.paymentStatus === 'paid' ? appointment.depositAmount ?? 0 : 0)).toFixed(2)}")
 a=s.index('          <button\n            onClick={() => alert(');b=s.index('          <div className="flex items-center gap-2">',a)
 s=s[:a]+'''          <p className="text-xs text-stone-600">Notifications are queued automatically with customer consent.</p>

'''+s[b:]
 return s
edit('src/components/dashboard/AppointmentDetailDrawer.tsx',drawer)
edit('src/components/dashboard/DashboardApp.tsx',lambda s:s.replace('  userEmail?: string;','  userEmail?: string;\n  role?: import(\'@/lib/validation\').Role;').replace('({ userEmail })','({ userEmail, role })').replace('      userEmail={userEmail}','      userEmail={userEmail}\n      role={role}'))
edit('src/app/dashboard/page.tsx',lambda s:s.replace("import { requireUser }", "import { requireMember } from '@/lib/server/http';\nimport { requireUser }").replace("  return <DashboardApp userEmail={user.email ?? ''} />;","  const member = await requireMember();\n  return <DashboardApp userEmail={user.email ?? ''} role={member.role} />;"))
def sidebar(s):
 s=s.replace("| 'settings';","| 'settings' | 'leads' | 'tasks' | 'reports';")
 s=s.replace('  activeTab: DashboardTab;',"  activeTab: DashboardTab;\n  role?: import('@/lib/validation').Role;")
 s=s.replace('  activeTab,','  activeTab,\n  role = \'staff\',')
 s=s.replace('todayAppointmentsCount = 22','todayAppointmentsCount = 0')
 s=s.replace("  ];\n\n  return", "    ,{ id: 'leads' as DashboardTab, label: 'Leads', icon: Users, badge: undefined },\n    { id: 'tasks' as DashboardTab, label: 'Tasks', icon: ClipboardList, badge: undefined },\n    { id: 'reports' as DashboardTab, label: 'Reports', icon: LayoutDashboard, badge: undefined }\n  ].filter(item => role !== 'staff' || ['calendar','appointments','tasks'].includes(item.id)).filter(item => item.id !== 'settings' || ['owner','admin'].includes(role));\n\n  return")
 s=s.replace('w-64 bg-', 'w-16 sm:w-64 bg-')
 s=s.replace('<span>{item.label}</span>','<span className="hidden sm:inline">{item.label}</span>')
 s=s.replace('key={item.id}', 'key={item.id}\n                aria-label={item.label}')
 s=s.replace('className="p-5 border-b', 'className="hidden sm:block p-5 border-b').replace('className="px-3 text-[10px]', 'className="hidden sm:block px-3 text-[10px]')
 return s
edit('src/components/dashboard/DashboardSidebar.tsx',sidebar)
def customer(s):
 s=s.replace("import { supabase }", "import { api } from '@/lib/api-client';\nimport { supabase }")
 s=s.replace("parseInt(value.replace(/[^0-9]/g, ''), 10)","parseFloat(value.replace(/[^0-9.]/g, ''))")
 a=s.index('  } catch (err) {');b=s.index('\n  return {\n    customers: [],',a)
 s=s[:a]+"  } catch { /* Safe, non-sensitive failure below. */ }\n"+s[b:]
 a=s.index('  const { data, error } = await supabase',s.index('export async function createCustomer'))
 s=s[:a]+"  return api<{ id: string }>('/api/crm/customers', details);\n}\n"
 return s
edit('src/lib/customer-data.ts',customer)
edit('src/components/dashboard/CustomersTab.tsx',lambda s:s.replace('catch (err: any)', 'catch (err)').replace("err.message", "(err instanceof Error ? err.message : 'Customer could not be saved.')"))
edit('src/types.ts',lambda s:s.replace("'pending_payment' | 'cancelled';", "'pending_payment' | 'cancelled' | 'no_show';").replace("'paid' | 'pending' | 'deposit_only' | 'refunded'", "'paid' | 'pending' | 'deposit_only' | 'refunded' | 'not_required' | 'partially_refunded'"))
