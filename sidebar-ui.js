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

        // 1. Cria a barra principal da Navbar (Garante estilo Bootstrap)
        // Adicionamos 'navbar-expand-lg' para ela ficar horizontal no desktop e colapsar no mobile
        const elNavbar = el('nav', ['navbar', 'navbar-expand-lg', 'navbar-dark', 'bg-dark', 'w-100']);

        // 2. Container interno fluido para alinhar os elementos nas extremidades
        const elNavbarContainer = el('div', ['container-fluid']);
        
        // 3. Marca/Logo do sistema
        const elNavbarBrand = el('a', ['navbar-brand'], { id: 'navbar-brand', href: `/COP?t=${Date.now()}` });
        elNavbarBrand.innerHTML = "OP-Control";

        // 4. Botão Hamburguer (Aparece apenas no Mobile)
        const elNavbarToggler = document.createElement('button');
        elNavbarToggler.className = 'navbar-toggler';
        elNavbarToggler.type = 'button';
        elNavbarToggler.setAttribute('data-bs-toggle', 'collapse');
        elNavbarToggler.setAttribute('data-bs-target', '#navbar-options');

        const elNavbarTogglerIcon = el('span', ['navbar-toggler-icon']);
        elNavbarToggler.append(elNavbarTogglerIcon);

        // 5. Container que vai guardar as opções e sumir no mobile (Colapsável)
        const elNavbarCollapse = el('div', ['collapse', 'navbar-collapse'], { id: 'navbar-options' });
        
        // 6. Lista horizontal de opções (nav)
        const elNavbarNav = el('div', ['navbar-nav', 'ms-auto']); // 'ms-auto' joga os botões para a direita

        // Mapeia e injeta as opções do menu
        this.getOptions().forEach(opt => {
            // Criando como link estilizado do bootstrap para ganhar o visual correto
            const elOption = el('button', ['nav-link', 'btn', 'btn-link', 'text-start', 'mx-2'], { id: opt.id });
            elOption.onclick = () => opt.action();
            
            const elOptionText = el('i', ['bi', 'bi-briefcase']);
            elOptionText.innerHTML = ` ${opt.text}`; // Espaço para separar do ícone

            elOption.append(elOptionText);
            elNavbarNav.append(elOption);
        });

        // --- MONTAGEM DA ÁRVORE DO DOM ---
        elNavbarCollapse.append(elNavbarNav); // Coloca a lista dentro do bloco colapsável
        elNavbarContainer.append(elNavbarBrand, elNavbarToggler, elNavbarCollapse); // Coloca tudo no container fluido
        elNavbar.append(elNavbarContainer); // Adiciona o container na tag nav principal
        
        this.container.append(elNavbar); // Injeta a navbar completa no container do seu HTML
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
