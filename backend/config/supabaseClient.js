const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Set them in your .env (see .env.example)."
  );
}

// Server-side client using the SERVICE ROLE key — this bypasses Row Level
// Security, so it must only ever be used from backend code, never shipped
// to the frontend.
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
