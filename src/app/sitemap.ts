import { SERVICES,TEAM_MEMBERS } from '@/data/spaData';
import type { MetadataRoute } from 'next';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.APP_URL??'https://luminamedspa.vercel.app';return ['','/about','/services','/team','/locations','/contact','/privacy','/booking-policy',...SERVICES.map(s=>`/services/${s.id}`),...TEAM_MEMBERS.map(p=>`/team/${p.id}`)].map(path=>({url:base+path}));}
