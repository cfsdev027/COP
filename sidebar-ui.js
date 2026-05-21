import { ENV } from './configurations.js';
import { SIDEBAR_ID, SIDEBAR_NAV_ID } from './config-sidebar-ui.js';
import { CatchError } from './catch-error.js';
import { el } from './el-ui.js';
import { AppRouter } from './app-router.js';
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

        const elNavbarContainer = el('div',['container-fluid'], { id: 'navbar-container' });
        
        const elNavbarBrand = el('a', ['navbar-brand'], { id: 'navbar-brand', href: `/COP?t=${Date.now()}` });
        const elNavbarTogglerIcon = el('span', ['navbar-toggler-icon']);
        elNavbarTogglerIcon.innerHTML = 'OP Controll';
        
        const elNavbarToggler = el('button', ['navbar-toggler'], 
            { 
                type: 'button', 
                'data-bs-toggle': 'collapse', 
                'data-bs-target': '#navbarNav', 
                'aria-controls': 'navbarNav',
                'aria-expanded': 'false',
                'aria-label': 'Toggle navigation'
            }
        );

        elNavbarToggler.append(elNavbarTogglerIcon);

        const elNavbarCollapse = el('div',['collapse', 'navbar-collapse'], { id: 'navbarNav' });

        elNavbarContainer.append(elNavbarBrand, elNavbarToggler, elNavbarCollapse);

        this.container.append(elNavbarContainer);

        (async () => {
            await this.dataInitAsync();
        })();
    },

    initSideNavbar() {
        const elSideNavbar = document.getElementById('navbarNav');
        elSideNavbar.innerHTML = '';
        
        const elNavbarOptions = el('ul', ['navbar-nav'], { id: 'navbar-options' });

        const options = this.getOptions();
        if(options === null || options.length < 1) return;
        
        options.forEach(opt => {
            const elOption = el('li', ['nav-item'], { id: opt.id });
            
            const elOptionText = el('button', ['nav-link', 'bi', 'bi-briefcase']);
            elOptionText.onclick = () => opt.action();
            elOptionText.innerHTML = opt.text;

            elOption.append(elOptionText);
            elNavbarOptions.append(elOption);
        });

        elSideNavbar.append(elNavbarOptions);
    },

    async dataInitAsync() {
        this.initSideNavbar();
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
