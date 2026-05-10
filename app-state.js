import {ServiceStorage} from './service-storage.js';

const COP_AS_CURRENT_SECTION = 'COP_AS_CURRENT_SECTION';
const COP_AS_AUTHENTICATED_USER = 'COP_AS_AUTHENTICATED_USER';

export const AppState = {
    get_authenticated_user: function() {
        try {
            return ServiceStorage.get(COP_AS_AUTHENTICATED_USER);
        } catch(err) {
            console.log('[AppState.get_authenticated_user] ' + err.message);
            return null;
        }
    },
    set_authenticated_user: function(value) {
        try {
            return ServiceStorage.set(COP_AS_AUTHENTICATED_USER, value);
        } catch(err) {
            console.log('[AppState.set_authenticated_user] ' + err.message);
        }
    },
}
