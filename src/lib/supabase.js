import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ilphmqejliqqlfiupgrn.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlscGhtcWVqbGlxcWxmaXVwZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDc4NjgsImV4cCI6MjA4MDgyMzg2OH0.JJT3blNlZB5_uD8Yfi9T3WwtkElIB922-TcTsInWcxA";

export const supabase = createClient(supabaseUrl, supabaseKey);
