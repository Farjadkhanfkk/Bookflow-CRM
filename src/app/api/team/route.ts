import { adminDb } from '@/lib/server/db';
import { body, checkOrigin, handle, HttpError, json, requireMember } from '@/lib/server/http';
import { config } from '@/lib/server/config';
import { uuid } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  return handle(async () => {
    const m = await requireMember(['owner', 'admin']);
    const db = adminDb();
    const [members, providers] = await Promise.all([
      db.from('business_members').select('user_id,role,staff_id,is_active').eq('business_id', m.businessId),
      db.from('staff_members').select('id,name,is_bookable').eq('business_id', m.businessId).order('name'),
    ]);
    if (members.error || providers.error) throw new Error('Team unavailable');
    const rows = await Promise.all(members.data.map(async member => {
      const { data, error } = await db.auth.admin.getUserById(member.user_id);
      if (error) throw error;
      return { ...member, email: data.user.email };
    }));
    return json({ members: rows, providers: providers.data, role: m.role });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const m = await requireMember(['owner', 'admin']);
    const input = await body(request, z.discriminatedUnion('action', [
      z.object({ action: z.literal('update'), user_id: uuid, role: z.enum(['owner','admin','receptionist','staff']), staff_id: uuid.nullable(), is_active: z.boolean() }).strict(),
      z.object({ action: z.enum(['link','invite']), email: z.string().trim().email().max(254), name: z.string().trim().min(2).max(120), role: z.enum(['owner','admin','receptionist','staff']), staff_id: uuid.nullable() }).strict(),
    ]));
    if (m.role === 'admin' && ['owner','admin'].includes(input.role)) throw new HttpError(403, 'Only an owner can manage administrator accounts.');
    const db = adminDb();
    if (input.action === 'update') {
      const { error } = await db.rpc('set_membership', { p_actor:m.user.id, p_user:input.user_id, p_role:input.role, p_staff:input.staff_id, p_active:input.is_active });
      if (error) throw new HttpError(409, 'Could not update access. The last owner must stay active and each provider can have one active account.');
      return json({ message: input.is_active ? 'Access updated. Re-enable booking in provider settings if needed.' : 'Access removed. Linked provider is no longer bookable; existing appointments remain for reassignment.' });
    }
    // Check the chosen provider before sending an invitation to avoid an unusable account.
    if (input.staff_id) {
      const { data, error } = await db.from('staff_members').select('id').eq('id',input.staff_id).eq('business_id',m.businessId).maybeSingle();
      if (error || !data) throw new HttpError(400, 'Choose a provider from this business.');
      const { data: linked, error: linkError } = await db.from('business_members').select('user_id').eq('staff_id',input.staff_id).eq('is_active',true);
      if (linkError) throw linkError;
      if (input.action === 'invite' && linked?.length) throw new HttpError(409, 'This provider already has an active account.');
    }
    if (input.action === 'invite') {
      const { error } = await db.auth.admin.inviteUserByEmail(input.email.toLowerCase(), { redirectTo: `${config().APP_URL}/auth/callback?next=/reset-password` });
      if (error) throw new HttpError(409, 'Invitation could not be sent. For an existing account, choose Link existing account.');
    }
    const { error } = await db.rpc('link_team_member', { p_actor:m.user.id, p_email:input.email, p_role:input.role, p_staff:input.staff_id, p_name:input.name });
    if (error) throw new HttpError(409, input.action === 'invite' ? 'Invitation sent, but access could not be linked. Use Link existing account to finish setup.' : 'Could not link account. Check that the email exists in Supabase Auth and that the provider is not already assigned.');
    return json({ message: input.action === 'invite' ? 'Invitation sent and access assigned. Configure provider services and working hours before enabling bookings.' : 'Account linked. Staff providers need services, locations and working hours before enabling bookings.' });
  });
}
