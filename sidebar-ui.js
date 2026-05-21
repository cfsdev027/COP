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

        // 1. O container principal (aside) ganha a semântica de navbar do Bootstrap
        this.container.className = "sidebar navbar navbar-expand-lg navbar-dark bg-dark";

        // 2. Container fluido interno
        const elNavbarContainer = el('div', ['container-fluid']);
        
        // 3. Header/Logo da Sidebar
        const elNavbarBrand = el('a', ['navbar-brand', 'sidebar-header'], { id: 'navbar-brand', href: `/COP?t=${Date.now()}` });
        elNavbarBrand.innerHTML = '<i class="bi bi-gear-fill logo-icon"></i> <span class="logo-text">OP-Control</span>';

        const elUserInfoToggler = el('button', ['navbar-toggler',], { type: 'button' });
        elUserInfoToggler.setAttribute('data-bs-toggle', 'collapse');
        elUserInfoToggler.setAttribute('data-bs-target', '#navbar-user-info');
        
        const elUserInfoTogglerIcon = el('span', ['bi', 'bi-person']);

        elUserInfoToggler.append(elUserInfoTogglerIcon);
        
        // 4. Botão Hambúrguer (Só aparece no Mobile)
        const elNavbarToggler = el('button', ['navbar-toggler'], { type: 'button' });
        elNavbarToggler.setAttribute('data-bs-toggle', 'collapse');
        elNavbarToggler.setAttribute('data-bs-target', '#navbar-options');

        const elNavbarTogglerIcon = el('span', ['navbar-toggler-icon']);
        elNavbarToggler.append(elNavbarTogglerIcon);

        // 5. O bloco que vai colapsar no mobile e virar a lista no desktop
        const elNavbarCollapse = el('div', ['collapse', 'navbar-collapse', 'w-100'], { id: 'navbar-options' });

        // 6. Lista horizontal de opções (nav)
        const elNavbarNav = el('div', ['navbar-nav', 'ms-auto'], { id: 'navbarNav' });

        const elNavbarUserInfoCollapse = el('div', ['collapse', 'navbar-collapse', 'w-100'], { id: 'navbar-user-info' });

        const elNavbarUserInfo = el('div', ['navbar-nav', 'ms-auto'], { id: 'navbarUserInfo' });
        
        // Montagem estrutural
        elNavbarCollapse.append(elNavbarNav);
        elNavbarUserInfoCollapse.append(elNavbarUserInfo);
        elNavbarContainer.append(elNavbarBrand, elUserInfoToggler, elNavbarToggler, elNavbarCollapse, elNavbarUserInfoCollapse);
        this.container.append(elNavbarContainer);

        (async () => {
            await this.dataInitAsync();
        })();
    },

    initSideNavbar() {
        const elNavbarNav = document.getElementById('navbarNav');
        elNavbarNav.innerHTML = '';
        
        const elNavbarOptions = el('ul', ['navbar-nav'], { id: 'navbar-options' });

        const options = this.getOptions();
        if(options === null || options.length < 1) return;
        
        options.forEach(opt => {
            const elOption = el('li', ['nav-item'], { id: opt.id });
            
            const elOptionText = el('button', ['nav-link', 'btn', 'btn-dark', 'w-100']);
            elOptionText.onclick = () => opt.action();
            elOptionText.innerHTML = opt.text;

            elOption.append(elOptionText);
            elNavbarOptions.append(elOption);
        });

        elNavbarNav.append(elNavbarOptions);
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
