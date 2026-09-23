from pathlib import Path
root=Path(__file__).resolve().parents[1]
for p in (root/'src').rglob('*.tsx'):
 s=p.read_text(encoding='utf-8')
 for directive in ["'use client';",'"use client";']:
  if directive in s and not s.startswith(directive):s=directive+'\n'+s.replace(directive,'',1)
 p.write_text(s,encoding='utf-8')
p=root/'src/components/dashboard/OperationsTab.tsx';s=p.read_text();s=s.replace(' services?:{name:string;appointments:number}[]; leads?:Lead[];', ' services?:{name:string;appointments:number}[];');p.write_text(s)
p=root/'supabase/migrations/202609220006_reports_members.sql';s=p.read_text();s=s.replace("'leads',(select count(*)", "'leadCount',(select count(*)");p.write_text(s)
