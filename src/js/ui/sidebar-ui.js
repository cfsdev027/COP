import { ENV } from '../config/configurations.js';
import { SIDEBAR_ID, SIDEBAR_NAV_ID } from '../config/ui/config-sidebar-ui.js';
import { CatchError } from '../catch-error.js';
import { el } from './el-ui.js';
import { AppRouter } from '../app-router.js';
import { ServiceStorage } from '../services/service-storage.js';
import { ServiceAuthentication } from '../services/service-authentication.js';

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

        this.container.classList.add('sidebar');
        this.container.classList.add('navbar-nav');
        this.container.classList.add('navbar-expand-lg');
        this.container.classList.add('navbar-dark');
        this.container.classList.add('bg-dark');

        const elNavbarContainer = el('div', ['container-fluid', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap']);
        elNavbarContainer.style.maxWidth = '992px !important';
        
        const elNavbarBrand = el('a', ['navbar-brand', 'sidebar-header', 'flex-grow-1'], { id: 'navbar-brand', href: `/COP/src/index.html?t=${Date.now()}` });
        elNavbarBrand.innerHTML = '<i class="bi bi-gear-fill logo-icon"></i> <span class="logo-text">OP-Control</span>';

        const elNavbarGroup = el('div', ['navbar-toggler-group', 'navbar-toggler', 'btn-group'], { role: 'group' });
        
        const elUserInfoToggler = el('button', ['btn', 'btn-dark', 'user-info-toggler', 'pr-1'], { type: 'button' });
        elUserInfoToggler.addEventListener('click', () => {
            this.navbarCollapseController('user-info');
        });
        
        const elUserInfoTogglerIcon = el('span', ['bi', 'bi-person']);

        elUserInfoToggler.append(elUserInfoTogglerIcon);

        const elLogoutToggler = el('button', ['btn', 'btn-dark', 'logout-toggler', 'pr-1'], { type: 'button' });
        elLogoutToggler.addEventListener('click', () => {
            this.navbarCollapseController('logout');
            this.logout();
        });
        
        const elLogoutTogglerIcon = el('span', ['bi', 'bi-box-arrow-right']);

        elLogoutToggler.append(elLogoutTogglerIcon);
        
        const elNavbarToggler = el('button', ['btn', 'btn-dark', 'options-toggler'], { type: 'button' });
        elNavbarToggler.addEventListener('click', () => {
            this.navbarCollapseController('options');
        });

        const elNavbarTogglerIcon = el('span', ['navbar-toggler-icon']);
        elNavbarToggler.append(elNavbarTogglerIcon);

        elNavbarGroup.append(elUserInfoToggler, elLogoutToggler, elNavbarToggler);

        const elNavbarCollapseMobile = el('div', ['collapse', 'navbar-collapse', 'w-100'], { id: 'navbar-collapse-mobile' });
        const elNavbarCollapseDesktop = el('div', ['collapse', 'navbar-collapse', 'w-100'], { id: 'navbar-collapse-desktop' });
        this.makeOptionsMenu(elNavbarCollapseDesktop);
        
        elNavbarContainer.append(elNavbarBrand, elNavbarGroup, elNavbarCollapseMobile, elNavbarCollapseDesktop);
        this.container.append(elNavbarContainer);

        (async () => {
            await this.dataInitAsync();
        })();
    },

    logout() {
        if(!confirm("Deseja realmente sair?")) return;

        (async () => {
            let isLogout = await ServiceAuthentication.logout();
            if(!isLogout) {
                return;
            }

            window.location.reload();
        })();
    },

    navbarCollapseController(opt) {
        const elNavbarCollapse = document.getElementById('navbar-collapse-mobile');
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
                this.makeOptionsMenu(elNavbarCollapse, true);
                break;
            case 'logout':
                elNavbarCollapse.classList.remove('show');
                break;
            default:
                break;
        }
    },

    makeOptionsMenu(elNavbarCollapse, mobile = false) {
        const elNavbarOptionsMenu = el('ul', ['navbar-nav', 'ms-auto'], { id: 'navbar-options-menu' });
        
        const options = this.getOptions();
        if(options === null || options.length < 1) return;
        
        options.forEach(opt => {
            const elOption = el('li', ['nav-item'], { id: opt.id });
            
            const elOptionText = el('button', ['nav-link', 'btn', 'btn-dark', 'w-100']);
            elOptionText.onclick = () => opt.action(this.callbackOptionClick.bind(this));
            elOptionText.innerHTML = opt.text;

            elOption.append(elOptionText);
            elNavbarOptionsMenu.append(elOption);
        });

        elNavbarCollapse.append(elNavbarOptionsMenu);
    },

    makeUserInfoMenu(elNavbarCollapse) {
        const elNavbarUserInfoMenu = el('ul', ['navbar-nav', 'ms-auto'], { id: 'navbar-user-info-menu' });
        elNavbarUserInfoMenu.style.color = '#ffffff';
        
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

    callbackOptionClick() {
        this.navbarCollapseController('options');
    },

    getOptions() {
        return [
            {
                id: 'opt-users',
                text: 'Usuários',
                action: (callback) => {
                    if(typeof callback !== 'function') return;
                    
                    AppRouter['users'].init();
                    callback();
                }
            },
            {
                id: 'opt-services',
                text: 'Serviços',
                action: (callback) => {
                    if(typeof callback !== 'function') return;
                    
                    AppRouter['services'].init();
                    callback();
                }
            },
            {
                id: 'opt-steps',
                text: 'Etapas',
                action: (callback) => {
                    if(typeof callback !== 'function') return;
                    
                    AppRouter['steps'].init();
                    callback();
                }
            },
            {
                id: 'opt-ops',
                text: 'Ordens de Produção (OPs)',
                action: (callback) => {
                    if(typeof callback !== 'function') return;
                    
                    AppRouter['ops'].init();
                    callback();
                }
            },
            {
                id: 'opt-journeys',
                text: 'Jornadas',
                action: (callback) => {
                    if(typeof callback !== 'function') return;
                    
                    AppRouter['journeys'].init();
                    callback();
                }
            },
            {
                id: 'opt-relatorios',
                text: 'Relatórios',
                action: (callback) => {
                    if(typeof callback !== 'function') return;
                    
                    AppRouter['reports'].init();
                    callback();
                }
            },
        ];
    }
};
