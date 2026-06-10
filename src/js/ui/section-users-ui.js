import { USERS_SECTION_ID, USERS_CONTAINER_ID, USERS_DEFAULT_TITLE } from '../config/ui/config-users-ui.js';
import { RegistryComponent } from './registry-component-ui.js';
import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';
import {UserSchema} from '../schemas/user-schema.js';
import {ServiceUsers} from '../services/service-users.js';

export const SectionUsersUI = {
    container: document.getElementById(USERS_SECTION_ID),
    
    init() {
        try {
            if (!this.container) throw { stack: 'SectionUsersUI.init', message_error: 'App main wrapper content element not found.' };
            
            this.render();
        } catch (err) {
            CatchError('SectionUsersUI', err);
        }
    },

    dispose() {
        if (!this.container || this.container === null) return;

        this.container.innerHTML = '';
    },

    render() {
        // Remove instâncias anteriores se houver para evitar duplicidade no DOM
        this.dispose();

        if (typeof el !== 'function') throw { stack: 'SectionUsersUI.render', message_error: 'el is not a function.' };

        // Cria a div interna que o RegistryComponent vai preencher com o título, busca e o grid
        const elRegistryContainer = el('div', [], { id: USERS_CONTAINER_ID });
        
        this.container.append(elRegistryContainer);

        (async () => {
            // Inicializa de fato o componente passando o ID do elemento da section que criamos acima
            await RegistryComponent.initAsync(USERS_SECTION_ID, USERS_DEFAULT_TITLE, UserSchema, ServiceUsers);
        })();
    }
};          
