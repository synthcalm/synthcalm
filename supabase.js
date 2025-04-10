// supabase.js

const SUPABASE_URL = 'https://ysuaedvcfplzzfcmnkgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdWFlZHZjZnBsenpmY21ta2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTk5MDEsImV4cCI6MjA1ODUzNTkwMX0.yNG-z5iMK2pDmxzTUoArJOivbGXTfSve2HyHH7YWgzc'; // Ensure this is valid

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Handle session token (login logic)
const params = new URLSearchParams(window.location.search);
const access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');

if (access_token && refresh_token) {
  supabase.auth.setSession({ access_token, refresh_token })
    .then(() => {
      window.history.replaceState({}, document.title, "/synthcalm/");
      window.location.href = "https://synthcalm.com/reset-password"; // Redirect to main site
    });
}

export { supabase };
