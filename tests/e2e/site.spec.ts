import { test,expect } from '@playwright/test';
const service='10000000-0000-4000-8000-000000000001';
const staff='20000000-0000-4000-8000-000000000001';
const location='30000000-0000-4000-8000-000000000001';
test.beforeEach(async({page})=>{
 await page.route(/supabase\.co|unconfigured\.invalid|api\.stripe|googleapis\.com|api\.resend|api\.twilio/,route=>route.abort());
});
for(const width of [375,768,1024,1440]){
 test(`marketing and booking layout at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  await expect(page.getByText('Portfolio concept · Fictional business', {exact:false})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true,caret:'initial'});
  await page.goto('/book');await expect(page.getByRole('heading',{name:'Your next appointment'})).toBeVisible();
  await expect(page.locator('[role=alert]').filter({hasText:'unavailable'})).toContainText('unavailable');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);expect(errors).toEqual([]);
 });
}
test('public routes, recovery, invalid token, and staff protection',async({page})=>{
 for(const path of ['/about','/services','/team','/locations','/contact','/privacy','/booking-policy','/forgot-password','/reset-password?error=expired','/manage-booking/invalid']){
  const response=await page.goto(path);expect(response?.status()).toBe(200);await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
 }
 await page.goto('/dashboard');await expect(page).toHaveURL(/\/login/);
 const missing=await page.goto('/unknown-page');expect(missing?.status()).toBe(404);
});
test('mobile booking uses server slots, reserves, and confirms once',async({page})=>{
 await page.setViewportSize({width:375,height:850});let checkouts=0;
 await page.route('**/api/catalog',route=>route.fulfill({json:{services:[{id:service,slug:'test-treatment',name:'Test treatment',duration_minutes:60,price_amount:10000,deposit_amount:0}],staff:[{id:staff,name:'Test provider'}],locations:[{id:location,name:'Test location',timezone:'America/Los_Angeles'}],business:{currency:'usd',cancellation_hours:24,horizon_days:90}}}));
 await page.route('**/api/booking/availability',route=>route.fulfill({json:{slots:[{starts_at:'2026-10-15T18:00:00Z',staff_id:staff}]}}));
 await page.route('**/api/booking/hold',route=>route.fulfill({json:{id:'40000000-0000-4000-8000-000000000001',token:'a'.repeat(43),expiresAt:new Date(Date.now()+45*60000).toISOString(),staffId:staff,startsAt:'2026-10-15T18:00:00Z',depositAmount:0,priceAmount:10000,currency:'usd'}}));
 await page.route('**/api/booking/checkout',async route=>{checkouts++;const input=route.request().postDataJSON();expect(input.customer.policyAccepted).toBe(true);expect(input.amount).toBeUndefined();await route.fulfill({json:{confirmed:true,manageToken:'b'.repeat(43)}});});
 await page.goto('/book');await page.getByLabel('Preferred date').fill('2026-10-15');await page.getByRole('button',{name:'Find available times'}).click();await page.getByRole('button',{name:/Oct 15/}).click();
 await expect(page.getByText('Review your appointment')).toBeVisible();await page.getByLabel('Full name',{exact:true}).fill('Test User');await page.getByLabel('Email',{exact:true}).fill('user@example.test');await page.getByLabel('Phone',{exact:true}).fill('+15555550100');
 await page.getByRole('checkbox',{name:/I accept/}).check();await page.getByRole('button',{name:'Confirm booking',exact:true}).click();await expect(page.getByText('Your booking is confirmed')).toBeVisible();expect(checkouts).toBe(1);
 await page.screenshot({path:'test-results/booking-mobile.png',fullPage:true,caret:'initial'});
});
test('booking modal supports Escape and restores focus',async({page})=>{
 await page.goto('/');const trigger=page.getByRole('button',{name:/Book.*Appointment/i}).first();await trigger.click();await expect(page.getByRole('dialog',{name:'Reserve your appointment'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Reserve your appointment'})).not.toBeVisible();await expect(trigger).toBeFocused();
});
test('contact form reports provider failure without fake success',async({page})=>{
 await page.route('**/api/contact',route=>route.fulfill({status:503,json:{error:'Consultation service is unavailable.'}}));await page.goto('/contact');await page.getByLabel('Full name').fill('Test User');await page.getByLabel('Email',{exact:true}).fill('user@example.test');await page.getByLabel('Your enquiry').fill('I would like a sample consultation.');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Request a consultation'}).click();await expect(page.locator('[role=alert]').filter({hasText:'unavailable'})).toContainText('unavailable');
});
