import {SUPABASE_URL,SUPABASE_ANON_KEY} from '../config/configurations.js';

export const ServiceSupabase = {
    c: null,
    client: function(){
        if(!c || c === null) c = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        return c;
    }
}
