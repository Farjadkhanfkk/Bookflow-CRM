'use client';
import { useEffect,useRef } from 'react';
export function useDialogFocus(open:boolean,onClose:()=>void){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement as HTMLElement|null;const oldOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const focusable=()=>Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')??[]).filter(el=>el.getClientRects().length>0);
  focusable()[0]?.focus();
  function keydown(event:KeyboardEvent){
   if(event.key==='Escape'){event.preventDefault();onClose();}
   if(event.key==='Tab'){const elements=focusable();const first=elements[0],last=elements.at(-1);if(!first){event.preventDefault();return;}if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  }
  document.addEventListener('keydown',keydown);
  return()=>{document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',keydown);previous?.focus();};
 },[open,onClose]);
 return ref;
}
