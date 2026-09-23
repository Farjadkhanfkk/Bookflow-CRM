import { z } from 'zod';
import { uuid } from './validation';
const timezone=z.string().refine(value=>{try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}},'Use an IANA timezone');
const name=z.string().trim().min(2).max(120);
const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/);
export const settingsSchemas = {
  businesses:z.object({name,timezone,currency:z.enum(['usd','gbp','eur','cad','aud']),notice_hours:z.number().int().min(0).max(720),horizon_days:z.number().int().min(1).max(365),cancellation_hours:z.number().int().min(0).max(720),interval_minutes:z.number().int().min(5).max(60)}).strict(),
  locations:z.object({name,address:z.string().max(500),timezone,is_active:z.boolean()}).strict(),
  services:z.object({name,slug:z.string().regex(/^[a-z0-9-]+$/).max(100),category:z.enum(['facials','injectables','lasers','body-wellness']),duration_minutes:z.number().int().min(5).max(480),preparation_minutes:z.number().int().min(0).max(120),cleanup_minutes:z.number().int().min(0).max(120),price_amount:z.number().int().min(0).max(10000000),deposit_amount:z.number().int().min(0),is_active:z.boolean()}).strict().refine(v=>v.deposit_amount<=v.price_amount),
  staff_members:z.object({name,title:z.string().max(120),is_bookable:z.boolean()}).strict(),
  staff_services:z.object({staff_id:uuid,service_id:uuid}).strict(),
  staff_locations:z.object({staff_id:uuid,location_id:uuid}).strict(),
  location_hours:z.object({location_id:uuid,weekday:z.number().int().min(0).max(6),opens:time,closes:time}).strict().refine(v=>v.opens<v.closes),
  staff_availability:z.object({staff_id:uuid,location_id:uuid,weekday:z.number().int().min(0).max(6),opens:time,closes:time}).strict().refine(v=>v.opens<v.closes),
  staff_time_off:z.object({staff_id:uuid,starts_at:z.string().datetime({offset:true}),ends_at:z.string().datetime({offset:true}),reason:z.string().max(500)}).strict().refine(v=>Date.parse(v.starts_at)<Date.parse(v.ends_at)),
};
export type SettingsResource=keyof typeof settingsSchemas;
