import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',fullyParallel:true,timeout:45000,
  use:{baseURL:'http://127.0.0.1:3100',headless:true,trace:'retain-on-failure'},
  webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100/api/health',reuseExistingServer:!process.env.CI,timeout:120000,env:{APP_URL:'http://127.0.0.1:3100',NEXT_PUBLIC_SUPABASE_URL:'https://unconfigured.invalid',NEXT_PUBLIC_SUPABASE_ANON_KEY:'test-public-key-with-no-real-access'}},
  projects:[{name:'chromium',use:{browserName:'chromium'}}],
});
