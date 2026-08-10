import { createClient } from '@supabase/supabase-js';

// Project URL + anon/public key — safe to ship in the client bundle by design.
// Real security comes from Row Level Security policies (see supabase_schema.sql),
// not from hiding these values.
const SUPABASE_URL = 'https://ccqctxaizxnxgqmtltnf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcWN0eGFpenhueGdxbXRsdG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNDMzMjgsImV4cCI6MjEwMTkxOTMyOH0.WCMANpPY8Pg2StwLqeEkezn07bGjk90JEy_KUAEl0TU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
