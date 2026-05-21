// Coloque isso no topo do seu index.js (ou arquivo principal)
window.onerror = function(msg, url, line) {
    alert("Erro Global: " + msg + "\nLocal: " + url + "\nLinha: " + line);
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    alert("Erro de Promessa: " + event.reason);
});

import {AppRouter} from './app-router.js';
import {ServiceAuthentication} from './service-authentication.js';

function appendStyleSheetWithoutCache(css) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${css}?v=${Date.now()}`; 
    document.head.appendChild(link);
};

(async () => {
    try {
        this.appendStyleSheetWithoutCache('style.css');
        this.appendStyleSheetWithoutCache('sidebar.css');
        this.appendStyleSheetWithoutCache('section-login-ui.css');
        
        let isAuthenticated = await ServiceAuthentication.self_authenticate();
        if (isAuthenticated) {
            AppRouter['dashboard'].init(); 
        } else {
            AppRouter['login'].init();
        }
    } catch(err) {
        alert(JSON.stringify(err));
    }
})();
