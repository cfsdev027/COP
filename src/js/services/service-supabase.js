import {SUPABASE_URL,SUPABASE_ANON_KEY} from '../config/configurations.js';

export const ServiceSupabase = {
    c: null,
    client: function(){
        if(!this.c || this.c === null) this.c = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        return this.c;
    }
}
