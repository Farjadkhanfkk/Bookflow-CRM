import { PublicShell } from '@/components/PublicShell';
import { SERVICES,TEAM_MEMBERS } from '@/data/spaData';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
export async function generateMetadata({params}:{params:Promise<{section:string;slug:string}>}){const {section,slug}=await params;const item=section==='services'?SERVICES.find(s=>s.id===slug):section==='team'?TEAM_MEMBERS.find(s=>s.id===slug):null;return {title:`${item?.name??'Not found'} | Lumina`};}
export default async function Page({params}:{params:Promise<{section:string;slug:string}>}){
 const {section,slug}=await params;const service=section==='services'?SERVICES.find(s=>s.id===slug):null;const provider=section==='team'?TEAM_MEMBERS.find(s=>s.id===slug):null;
 if(!service&&!provider)notFound();
 const name=service?.name??provider!.name;return <PublicShell title={name}><div className="grid gap-8 md:grid-cols-2"><Image src={service?.image??provider!.avatar} width={800} height={650} alt={`Illustrative image for ${name}`} className="w-full rounded-3xl object-cover max-h-[480px]"/><div className="space-y-5"><p className="text-sm text-stone-600">Sample portfolio content · Fictional business</p><p className="text-lg leading-relaxed">{service?.description??provider?.bio}</p>{service&&<p>Sample pricing: {service.price} · Duration: {service.duration}</p>}{provider&&<p>{provider.title}</p>}<Link href="/book" className="action-button inline-block">Check appointment availability</Link><p className="text-sm">Live booking options and prices may differ from this illustrative profile.</p></div></div></PublicShell>;
}
