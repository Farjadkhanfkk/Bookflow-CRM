import { PasswordForm } from '@/components/auth/PasswordForm';
export const metadata={title:'Reset password | Lumina',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){return <PasswordForm reset invalid={!!(await searchParams).error}/>;}
