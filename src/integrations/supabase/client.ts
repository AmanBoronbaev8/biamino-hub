
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wrmrqapqfxpaoywzekjb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybXJxYXBxZnhwYW95d3pla2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjQ1MDEsImV4cCI6MjA2MzE0MDUwMX0.7kVnlzALXF6KZtDfw9j-3cSLQFK7JjOwkgWIKz5BN60";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
