import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/dashboard','/api/','/manage-booking/','/book/success','/reset-password']},sitemap:`${process.env.APP_URL??'https://luminamedspa.vercel.app'}/sitemap.xml`};}
