import {SUPABASE_URL,SUPABASE_ANON_KEY} from '../config/configurations.js';

export const ServiceSupabase = {
    client: function(){
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}
