// supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create a single reusable database instance
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
