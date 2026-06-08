import { USERS_SECTION_ID, USERS_CONTAINER_ID, USERS_DEFAULT_TITLE } from '../config/ui/config-users-ui.js';
import { RegistryComponent } from './registry-component-ui.js';
import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';

export const SectionUsersUI = {
    container: document.getElementById(USERS_SECTION_ID),
    
    // Dados iniciais baseados no modelo fornecido
    usersMockData: [
        {
            "id": "bf7406ae-e0a7-4ae8-9668-a85c57cfe43a",
            "created_at": "2026-05-11 10:35:43",
            "username": "admin",
            "password": "123mudar",
            "active": "true",
            "document": "41.714.641/0001-95",
            "document_type": "CNPJ",
            "role": "ADMIN"
        },
        {
            "id": "c5babc88-2ef3-49f3-9e44-010d92233544",
            "created_at": "2026-05-13 12:46:32",
            "username": "operador",
            "password": "123mudar",
            "active": "true",
            "document": "157.769.760-06",
            "document_type": "CPF",
            "role": "DEFAULT"
        }
    ],

    init() {
        try {
            if (!this.container) throw { stack: 'SectionUsersUI.init', message_error: 'App main wrapper content element not found.' };
            
            this.loadStyles();
            this.render();
        } catch (err) {
            CatchError('SectionUsersUI', err);
        }
    },

    loadStyles() {
        // Garante que o CSS da seção não seja duplicado se o init for chamado múltiplas vezes
        if (!document.getElementById('css-section-users')) {
            const link = el('link', [], {
                id: 'css-section-users',
                rel: 'stylesheet',
                href: './section-users-ui.css?v=' + Date.now()
            });
            document.head.appendChild(link);
        }
    },

    disposeStyles() {
        // Garante que o CSS da seção não seja duplicado se o init for chamado múltiplas vezes
        const css = document.getElementById('css-section-users');
        if (!css || css === null) return;

        css.remove();
    },

    dispose() {
        if (!this.container || this.container === null) return;

        this.container.innerHTML = '';
        this.disposeStyles();
    },

    render() {
        // Remove instâncias anteriores se houver para evitar duplicidade no DOM
        this.dispose();

        if (typeof el !== 'function') throw { stack: 'SectionUsersUI.render', message_error: 'el is not a function.' };

        // Cria a div interna que o RegistryComponent vai preencher com o título, busca e o grid
        const elRegistryContainer = el('div', [], { id: USERS_CONTAINER_ID });
        
        this.container.append(elRegistryContainer);

        // --- INTEGRAÇÃO COM O REGISTRY COMPONENT ---
        // Adaptamos as propriedades internas do RegistryComponent para bater com o modelo de Usuários antes de inicializá-lo
        RegistryComponent.title = USERS_DEFAULT_TITLE;
        RegistryComponent.data = [...this.usersMockData];
        
        // Inicializa de fato o componente passando o ID do elemento da section que criamos acima
        RegistryComponent.init(USERS_SECTION_ID);
    }
};          
