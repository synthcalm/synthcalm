// supabase.js

const SUPABASE_URL = 'https://ysuaedvcfplzzfcmnkgb.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // make sure this is valid

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional: Handle magic link tokens
const params = new URLSearchParams(window.location.search);
const access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');

if (access_token && refresh_token) {
  supabase.auth.setSession({ access_token, refresh_token }).then(() => {
    window.history.replaceState({}, document.title, "/synthcalm/");
  });
}

export { supabase };
