import {COP_AUTH_COOKIE,COP_LS_KEY} from './configurations.js';
import {ServiceCookies} from './service-cookies.js';
import {ServiceStorage} from './service-storage.js';
import {ServiceUsers} from './service-users.js';

export const ServiceAuthentication = {
    get_auth_id: function() {
        return ServiceCookies.get(COP_AUTH_COOKIE);
    },
    set_auth_id: function(id) {
        if(id === null || id === undefined) throw '[ServiceAuthentication.set_auth_id] Invalid authentication ID.';
        
        ServiceCookies.set(COP_AUTH_COOKIE,id,1);
    },
    get_auth: function() {
        return ServiceStorage.get(COP_LS_KEY);
    },
    set_auth: function(auth) {
        if(auth === null || auth === undefined) throw '[ServiceAuthentication.set_auth] Invalid authentication object.';

        ServiceStorage.set(COP_LS_KEY,auth);
    },
    authenticate: async function(username,password,callback = null) {
        try {
            const user = await ServiceUsers.fetchByUsernameAndPassword(username,password);
            if(user === null || user === undefined)
                return false;

            this.set_auth_id(user.id);
            this.set_auth(user);

            if(typeof callback === 'function')
                callback(user);

            return true;

        } catch (err) {
            alert('Erro na autenticação: ' + JSON.stringify(err));
            console.error("Erro na autenticação:", err.message);
            return false;
        }
    },
    self_authenticate: async function() {
        try {
            const uuid = this.get_auth_id();
          
            if (!uuid || uuid === 'null') {
                return false;
            }

            const user = await ServiceUsers.fetch(uuid);
            if (user === null) {
                return false;
            }
                     
            this.set_auth(user);
            
            return true;

        } catch (err) {
            alert('Erro na autenticação: ' + JSON.stringify(err));
            console.error("Erro na autenticação:", err.message);
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
            alert('Erro no logout ' + JSON.stringify(err));
            console.error('Erro no logout', err.message);
            return false;
        }
    }
};
