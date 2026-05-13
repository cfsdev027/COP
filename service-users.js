import {ServiceSupabase} from './service-supabase.js';

export const ServiceUsers = {
    get: async function() {
        try {
            const client = ServiceSupabase.client();

           const { data, error } = await client.from('users').select();

           if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.get: ' + err.message);
          
            return null;
        }
    },
    fetch: async function(id) {
        try {
            if (!id) return null;
                    
            const client = ServiceSupabase.client();

            const { data, error } = await client.from('users')
              .select()
              .eq('id', id)
              .maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            alert('An exception has ben throw in service Users.fetch: ' + err.message);
            console.log('An exception has ben throw in service Users.fetch: ' + err.message);
            return null;
        }
    },
    fetchByUsername: async function(username) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client.from('users')
              .select()
              .eq('username', username)
              .maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            alert('An exception has ben throw in service Users.fetchByUsernameAndPassword: ' + err.message);
            console.log('An exception has ben throw in service Users.fetchByUsernameAndPassword: ' + err.message);
            return null;
        }
    },
    fetchByUsernameAndPassword: async function(username,password) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client.from('users')
              .select()
              .eq('username', username)
              .eq('password', password)
              .maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            alert('An exception has ben throw in service Users.fetchByUsernameAndPassword: ' + err.message);
            console.log('An exception has ben throw in service Users.fetchByUsernameAndPassword: ' + err.message);
            return null;
        }
    },
    fetchByDocumentTypeAndDocument: async function(documentType,document) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client.from('users')
              .select()
              .eq('document_type', documentType)
              .eq('document', document)
              .maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.fetchByDocument: ' + err.message);
          
            return null;
        }
    },
    fetchByRole: async function(role) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client.from('users')
              .select()
              .eq('role', role);

            if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.fetchByDocument: ' + err.message);
          
            return null;
        }
    },
    fetchByActive: async function(active) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client.from('users')
              .select()
              .eq('active', active);

            if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.fetchByDocument: ' + err.message);
          
            return null;
        }
    },
    add: async function(username,password,documentType,document,role) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client
                .from('users')
                .insert([{
                    username: username,
                    password: password,
                    document_type: documentType,
                    document: document,
                    role: role
                }]).select().maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.add: ' + err.message);
          
            return null;
        }
    },
    update: async function(id,username,password,document_type,document,role,active) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client
                .from('users')
                .update({
                    username: username,
                    password: password,
                    document_type: document_type,
                    document: document,
                    role: role,
                    active: active
                }).select()
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.add: ' + err.message);
          
            return null;
        }
    },
    delete: async function(id) {
        try {
            const client = ServiceSupabase.client();

            const { data, error } = await client
                .from('users')
                .update({
                  ativo: false
                }).select()
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;

            return data;
        } catch(err) {
            console.log('An exception has ben throw in service Users.add: ' + err.message);
          
            return null;
        }
    },
}
