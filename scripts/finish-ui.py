from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(path,fn):
 p=root/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
def customers(s):
 a=s.index("      console.error('Add customer error:'");b=s.index('\n    } finally',a)
 s=s[:a]+"      setAddError(err instanceof Error ? err.message : 'Customer could not be saved.');"+s[b:]
 s=s.replace('    loadCustomers();\n  }, [loadCustomers]);', '    const timer = window.setTimeout(() => { void loadCustomers(); }, 0);\n    return () => clearTimeout(timer);\n  }, [loadCustomers]);')
 return s
edit('src/components/dashboard/CustomersTab.tsx',customers)
edit('src/components/dashboard/OverviewTab.tsx',lambda s:s.replace("Today's Schedule","Today&apos;s Schedule"))
edit('src/components/dashboard/ConfigurationPanel.tsx',lambda s:s.replace("import { useEffect,useState }", "import { NotificationMonitor } from './NotificationMonitor';\nimport { MembershipPanel } from './MembershipPanel';\nimport { useEffect,useState }").replace('<a href="/api/google/connect" className="underline">Connect Google Calendar</a>','<button onClick={() => window.location.assign(\'/api/google/connect\')} className="underline">Connect Google Calendar</button><button className="ml-4 underline" onClick={async () => { try { await api(\'/api/google/disconnect\', {}); setMessage(\'Calendar disconnected.\'); } catch (e) { setError(e instanceof Error ? e.message : \'Disconnect failed.\'); } }}>Disconnect</button>').replace('  </section>;','    <MembershipPanel/><NotificationMonitor/>\n  </section>;'))
def detail(s):
 s="import { CustomerRecordPanel } from './CustomerRecordPanel';\n"+s
 pos=s.rfind('      </div>\n    </div>')
 s=s[:pos]+'        <CustomerRecordPanel id={customer.id}/>\n'+s[pos:]
 s=s.replace("customer.appointmentHistory\n      .filter((item) => item.status === 'completed')\n      .reduce((sum, item) => sum + item.servicePrice, 0) || customer.totalSpend",'customer.totalSpend')
 return s
edit('src/components/dashboard/CustomerDetailModal.tsx',detail)
def crm(s):
 s=s.replace('export async function GET(_request: Request','export async function GET(request: Request')
 pos=s.index("    if (resource === 'notifications')")
 s=s[:pos]+'''    if (resource === 'customer-detail') {
      const id = uuid.parse(new URL(request.url).searchParams.get('id'));
      const { data: customer, error } = await member.db.from('customers').select('id,full_name,email,phone,notes,email_consent,sms_consent,whatsapp_consent').eq('id',id).maybeSingle();
      if(error) throw error; if(!customer) throw new HttpError(404,'Customer not found.');
      const { data: appointments, error: ae } = await member.db.from('appointments').select('id').eq('customer_id',id); if(ae) throw ae;
      const ids=(appointments??[]).map(a=>a.id);
      const [payments,jobs,tasks]=await Promise.all([
        member.db.from('payments').select('id,amount,refunded_amount,currency,status').in('appointment_id',ids),
        adminDb().from('outbox').select('id,event_type,channel,status').in('appointment_id',ids).order('created_at',{ascending:false}).limit(100),
        member.db.from('tasks').select('id,title,status').eq('customer_id',id),
      ]);
      for(const r of [payments,jobs,tasks]) if(r.error) throw r.error;
      return json({customer,payments:payments.data,jobs:jobs.data,tasks:tasks.data});
    }
'''+s[pos:]
 a=s.index("    if (resource === 'reports') {");b=s.index("    throw new HttpError(404",a)
 s=s[:a]+'''    if (resource === 'reports') {
      const { data, error } = await adminDb().rpc('operational_report',{p_actor:member.user.id,p_since:new Date(Date.now()-30*86400000).toISOString(),p_until:new Date().toISOString()});
      if(error) throw error; return json(data);
    }
'''+s[b:]
 pos=s.index("    if (m.role === 'staff') throw")
 s=s[:pos]+'''    if (resource === 'members') {
      if(m.role!=='owner') throw new HttpError(403,'Owner access is required.');
      const input=await body(request,z.object({user_id:uuid,role:z.enum(['owner','admin','receptionist','staff']),staff_id:uuid.nullable(),is_active:z.boolean()}).strict());
      const {error}=await db.rpc('set_membership',{p_actor:m.user.id,p_user:input.user_id,p_role:input.role,p_staff:input.staff_id,p_active:input.is_active});
      if(error) throw new HttpError(409,'Membership could not be updated. Check the user and provider IDs; the last owner must remain active.');
      return json({updated:true});
    }
'''+s[pos:]
 return s
edit('src/app/api/crm/[resource]/route.ts',crm)
edit('src/components/dashboard/OperationsTab.tsx',lambda s:s.replace('appointmentCount?:number','providers?:{name:string;appointments:number}[]; services?:{name:string;appointments:number}[]; leads?:Lead[]; leadCount?:number; converted?:number; appointmentCount?:number').replace('Recorded operational totals.','Operational totals for the last 30 days.').replace("{resource==='leads'&&", "{resource==='reports'&&<div className=\"grid gap-5 sm:grid-cols-2\">{(['providers','services'] as const).map(group=><div key={group} className=\"rounded-xl border bg-white p-5\"><h3 className=\"capitalize font-semibold\">{group}</h3>{data[group]?.map(row=><p key={row.name}>{row.name}: {row.appointments}</p>)}</div>)}</div>}\n    {resource==='leads'&&"))
# Extend the existing typed status model and labels; server still enforces transitions.
edit('src/components/dashboard/AppointmentsListTab.tsx',lambda s:s.replace('<option value="pending_payment">Pending Payment</option>','<option value="pending_payment">Pending Payment</option><option value="cancelled">Cancelled</option><option value="no_show">No-show</option>').replace('placeholder="Search patient, phone, service, room..."','aria-label="Search appointments" placeholder="Search patient, phone, service, room..."').replace('value={statusFilter}','aria-label="Filter by status" value={statusFilter}').replace('value={specialistFilter}','aria-label="Filter by provider" value={specialistFilter}'))
# Add a single list of valid next states to the appointment details.
edit('src/components/dashboard/AppointmentDetailDrawer.tsx',lambda s:"import { statusTransitions } from '@/lib/validation';\n"+s.replace('{/* Drawer Bottom Actions */}', '''<div className="px-6 py-3 flex flex-wrap gap-3">{(statusTransitions[appointment.status] ?? []).map(status => <button className="underline text-sm" key={status} onClick={() => onUpdateStatus(appointment.id, status as AppointmentStatus)}>{status.replaceAll('_',' ')}</button>)}</div>
        {/* Drawer Bottom Actions */}'''))
edit('src/components/dashboard/StaffDashboard.tsx',lambda s:s.replace("useState<DashboardTab>('dashboard')","useState<DashboardTab>(role === 'staff' ? 'calendar' : 'dashboard')").replace('        const aptDate = new Date(apt.appointment_time);\n',''))
# Focus trapping and Escape for existing custom overlays.
for file,condition in [('src/components/ServiceDetailModal.tsx','service'),('src/components/dashboard/CustomerDetailModal.tsx','customer'),('src/components/dashboard/AppointmentDetailDrawer.tsx','appointment')]:
 def dialog(s):
  s="import { useDialogFocus } from '@/components/useDialogFocus';\n"+s
  s=s.replace(f'  if (!{condition}) return null;',f'  const dialogRef = useDialogFocus(!!{condition}, onClose);\n  if (!{condition}) return null;',1)
  s=s.replace('<div className="fixed inset-0','<div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Details" className="fixed inset-0',1)
  if condition=='customer':s=s.replace('<div\n      className="fixed inset-0','<div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Customer details"\n      className="fixed inset-0',1)
  return s
 edit(file,dialog)
edit('src/components/TeamSection.tsx',lambda s:re.sub(r'  const getInitials = .*?;\n','',s))
# Use Next image optimization without altering the established layout.
for p in (root/'src').rglob('*.tsx'):
 s=p.read_text(encoding='utf-8')
 if '<img' in s:
  s="import Image from 'next/image';\n"+s.replace('<img','<Image width={800} height={600} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"')
  p.write_text(s,encoding='utf-8')
