// Test harness only: permit a preinstalled Chromium without downloading browsers.
import {chromium as installed} from 'playwright';
export const chromium={launch(options={}){return installed.launch({...options,...(process.env.BC1Q21_TEST_CHROMIUM?{executablePath:process.env.BC1Q21_TEST_CHROMIUM}:{}),args:[...(options.args||[]),'--no-sandbox']});}};
