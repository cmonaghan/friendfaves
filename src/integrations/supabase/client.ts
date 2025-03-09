
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qwrgxjgvpytxzotzisvs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3cmd4amd2cHl0eHpvdHppc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODQ0MTgsImV4cCI6MjA1NzA2MDQxOH0.WSkQvdkZwC5VDd_-GmAp9h6Wm-J-LZXL-aS6GM_nLko";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
