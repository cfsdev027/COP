import { ENV } from './configurations.js';
import { SIDEBAR_ID, SIDEBAR_NAV_ID } from './config-sidebar-ui.js';
import { CatchError } from './catch-error.js';
import { el } from './el-ui.js';
import { AppRouter } from './app-router.js';
import { ServiceStorage } from './service-storage.js';
import { ServiceAuthentication } from './service-authentication.js';

export const SidebarUI = {
    container: document.getElementById(SIDEBAR_ID),
    auth: ServiceAuthentication.get_auth(),

    dispose() {
        this.container.classList.add('d-none');
        this.container.innerHTML = '';
    },
    
    init() {
        try {
            if (!this.container) throw { stack: 'init', message_error: 'Missing CONTAINER.' };
            
            this.render();
        } catch (err) {
            if(typeof CatchError === 'function')
                CatchError('SidebarUI', err);
        }
    },

    render() {
        this.container.innerHTML = '';
        this.container.classList.remove('d-none');

        if(typeof el !== 'function') throw {
            stack: 'render',
            message_error: 'el is not a function.'
        };

        this.container.className = "sidebar navbar navbar-expand-lg navbar-dark bg-dark";

        const elNavbarContainer = el('div', ['container-fluid']);
        
        const elNavbarBrand = el('a', ['navbar-brand', 'sidebar-header'], { id: 'navbar-brand', href: `/COP?t=${Date.now()}` });
        elNavbarBrand.innerHTML = '<i class="bi bi-gear-fill logo-icon"></i> <span class="logo-text">OP-Control</span>';

        const elNavbarGroup = el('div', ['navbar-toggler', 'btn-group'], { role: 'group' });
        
        const elUserInfoToggler = el('button', ['btn', 'btn-dark', 'user-info-toggler', 'pr-1'], { type: 'button' });
        elUserInfoToggler.addEventListener('click', () => {
            this.navbarCollapseController('user-info');
        });
        
        const elUserInfoTogglerIcon = el('span', ['bi', 'bi-person']);

        elUserInfoToggler.append(elUserInfoTogglerIcon);
        
        const elNavbarToggler = el('button', ['btn', 'btn-dark', 'options-toggler'], { type: 'button' });
        elNavbarToggler.addEventListener('click', () => {
            this.navbarCollapseController('options');
        });

        const elNavbarTogglerIcon = el('span', ['navbar-toggler-icon']);
        elNavbarToggler.append(elNavbarTogglerIcon);

        elNavbarGroup.append(elUserInfoToggler, elNavbarToggler);

        const elNavbarCollapse = el('div', ['collapse', 'navbar-collapse', 'w-100'], { id: 'navbar-collapse' });
        
        elNavbarContainer.append(elNavbarBrand, elNavbarGroup, elNavbarCollapse);
        this.container.append(elNavbarContainer);

        (async () => {
            await this.dataInitAsync();
        })();
    },

    navbarCollapseController(opt) {
        const elNavbarCollapse = document.getElementById('navbar-collapse');
        elNavbarCollapse.innerHTML = '';
        
        const currentState = ServiceStorage.get('COP_NAVBAR_CURRENT');
        if (currentState === opt) {
            ServiceStorage.set('COP_NAVBAR_CURRENT', 'none');
            elNavbarCollapse.classList.remove('show');
            return;
        }
        else {
            ServiceStorage.set('COP_NAVBAR_CURRENT', opt);
            elNavbarCollapse.classList.add('show');
        }
        
        switch(opt) {
            case 'user-info':
                this.makeUserInfoMenu(elNavbarCollapse);
                break;
            case 'options':
                this.makeOptionsMenu(elNavbarCollapse);
                break;
            default:
                break;
        }
    },

    makeOptionsMenu(elNavbarCollapse) {
        const elNavbarOptionsMenu = el('ul', ['navbar-nav', 'ms-auto'], { id: 'navbar-options-menu' });
        
        const options = this.getOptions();
        if(options === null || options.length < 1) return;
        
        options.forEach(opt => {
            const elOption = el('li', ['nav-item'], { id: opt.id });
            
            const elOptionText = el('button', ['nav-link', 'btn', 'btn-dark', 'w-100']);
            elOptionText.onclick = () => opt.action();
            elOptionText.innerHTML = opt.text;

            elOption.append(elOptionText);
            elNavbarOptionsMenu.append(elOption);
        });

        elNavbarCollapse.append(elNavbarOptionsMenu);
    },

    makeUserInfoMenu(elNavbarCollapse) {
        const elNavbarUserInfoMenu = el('ul', ['navbar-nav', 'ms-auto'], { id: 'navbar-user-info-menu' });
        
        const elUsernameView = el('li', ['nav-item'], { id: 'username-view' });
        elUsernameView.innerHTML = `<strong>Username:&nbsp</strong>${this.auth.username}`;

        const elDocumentView = el('li', ['nav-item'], { id: 'document-view' });
        elDocumentView.innerHTML = `<strong>${this.auth.document_type}:&nbsp</strong>${this.auth.document}`;

        const elRoleView = el('li', ['nav-item'], { id: 'role-view' });
        elRoleView.innerHTML = `<strong>Role:&nbsp</strong>${this.auth.role}`;

        elNavbarUserInfoMenu.append(elUsernameView, elDocumentView, elRoleView);
        elNavbarCollapse.append(elNavbarUserInfoMenu);
    },

    async dataInitAsync() {
    },

    getOptions() {
        return [
            {
                id: 'opt-users',
                text: 'Usuários',
                action: () => {
                    alert('USUÁRIOS');
                }
            },
            {
                id: 'opt-services',
                text: 'Serviços',
                action: () => {
                    alert('SERVIÇOS');
                }
            },
            {
                id: 'opt-steps',
                text: 'Etapas',
                action: () => {
                    alert('ETAPAS');
                }
            },
            {
                id: 'opt-ops',
                text: 'Ordens de Produção (OPs)',
                action: () => {
                    alert('ORDENS DE PRODUÇÃO (OPs)');
                }
            },
            {
                id: 'opt-journeys',
                text: 'Jornadas',
                action: () => {
                    alert('JORNADAS');
                }
            },
            {
                id: 'opt-relatorios',
                text: 'Relatórios',
                action: () => {
                    alert('RELATÓRIOS');
                }
            },
        ];
    }
};
