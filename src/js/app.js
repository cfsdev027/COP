// Coloque isso no topo do seu index.js (ou arquivo principal)
window.onerror = function(msg, url, line) {
    alert("Erro Global: " + msg + "\nLocal: " + url + "\nLinha: " + line);
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    alert("Erro de Promessa: " + event.reason);
});

import { AppRouter } from './src/js/app-router.js';
import { CatchError } from './src/js/catch-error.js';
import { ServiceAuthentication } from './src/js/services/service-authentication.js';

// Função utilitária para injetar CSS com cache-busting
function appendStyleSheetWithoutCache(css) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./src/css/${css}?v=${Date.now()}`; 
    document.head.appendChild(link);
}

// GARANTIA: Só executa quando o DOM estiver completamente carregado
window.addEventListener('DOMContentLoaded', () => {
    (async () => {
        try {
            // Injeta as folhas de estilo com segurança
            appendStyleSheetWithoutCache('style.css');
            appendStyleSheetWithoutCache('sidebar.css');
            appendStyleSheetWithoutCache('section-login-ui.css');
            
            // Segue com o fluxo de autenticação e roteamento
            let isAuthenticated = await ServiceAuthentication.self_authenticate();
            if (isAuthenticated) {
                AppRouter['dashboard'].init(); 
            } else {
                AppRouter['login'].init();
            }
        } catch(err) {
            CatchError('App', err);
        }
    })();
});
