import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uqhobgiuekvyavaosybx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaG9iZ2l1ZWt2eWF2YW9zeWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDg0MzIsImV4cCI6MjA4NjcyNDQzMn0.YZEgs2T2EZaXOndZIqfMZ1_sUEwnVxdeQm3iG0CPDKE";

export const supabase = createClient(supabaseUrl, supabaseKey);
