import {COP_AUTH_COOKIE,COP_LS_KEY} from './configurations.js';
import {ServiceCookies} from './service-cookies.js';
import {ServiceStorage} from './service-storage.js';
import {ServiceUsers} from './service-users.js';

export const ServiceAuthentication = {
    get_auth_id: function() {
        return ServiceCookies.get(COP_AUTH_COOKIE);
    },
    set_auth_id: function(id) {
        ServiceCookies.set(COP_AUTH_COOKIE,id,1);
    },
    get_auth: function() {
        let cop_ls = ServiceStorage.get(COP_LS_KEY);
        if(cop_ls === null || cop_ls === undefined) throw '[ServiceAuthentication.get_auth] AppData is inaccessible in local storage.';

        return cop_ls.auth;
    },
    set_auth: function(auth) {
        if(auth === null || auth === undefined) throw '[ServiceAuthentication.set_auth] Invalid authentication object.';
      
        let cop_ls = ServiceStorage.get(COP_LS_KEY);
        if(cop_ls === null || cop_ls === undefined) throw '[ServiceAuthentication.set_auth] AppData is inaccessible in local storage.';

        cop_ls.auth = auth;
        ServiceCookies.set(COP_LS_KEY,cop_ls,1);
    },
    authenticate: async function(username,password,callback) {
        try {
            const user = await ServiceUsers.fetchByUsernameAndPassword(username,password);
            if(user === null || user === undefined)
                return false;

            this.set_auth_id(user.id);
            this.set_auth({user: user});

            if(typeof callback === 'function')
                callback(data);

            return true;

        } catch (err) {
            console.error("Erro na autenticação:", err.message);

            return false;
        }
    },
    self_authenticate: async function() {
        try {
            const uuid = ServiceCookies.get(COP_AUTH_COOKIE);
          
            if (!uuid || uuid === 'null') {
                return false;
            }

            const data = await ServiceUsers.fetch(uuid);
            if (data === null) {
                return false;
            }
                     
            ServiceStorage.set(COP_LS_KEY, data);
            return true;

        } catch (err) {
            return false;
        }
    },
    logout: function(callback){
        try {
            ServiceCookies.erase(COP_AUTH_COOKIE);
            ServiceStorage.erase(COP_LS_KEY);

            if(typeof callback === 'function')
                callback();

            return true;
        } catch(e) {
            return false;
        }
    }
};
