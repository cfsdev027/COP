// Coloque isso no topo do seu index.js (ou arquivo principal)
window.onerror = function(msg, url, line) {
    alert("Erro Global: " + msg + "\nLocal: " + url + "\nLinha: " + line);
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    alert("Erro de Promessa: " + event.reason);
});

alert('Init');

import {AppRouter} from './app-router.js';
import {ServiceAuthentication} from './service-authentication.js';

(async () => {
    try {
        let isAuthenticated = await ServiceAuthentication.self_authenticate();
        if (isAuthenticated) {
            AppRouter['srp'].init(); 
        } else {
            AppRouter['login'].init();
        }
    } catch(err) {
        alert(JSON.stringify(err));
    }
})();
