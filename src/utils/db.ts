import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

export { db };
