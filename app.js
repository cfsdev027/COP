import {AppRouter} from './app-router.js';
import {ServiceAuthentication} from './service-authentication.js';

(async () => {
    let isAuthenticated = await ServiceAuthentication.self_authenticate();
    if (isAuthenticated) {
        AppRouter['srp'].init(); 
    } else {
        AppRouter['login'].init();
    }
})();
