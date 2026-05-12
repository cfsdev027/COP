import {
    SECTION_DASHBOARD_USERS_ID
} from './config-dashboard-users-ui.js';
import {ENV} from './configurations.js';
import {ServiceAuthentication} from './service-authentication.js';
import {ServiceUsers} from './service-users.js';

export const DashboardUsersUI = {
    section: document.getElementById(SECTION_DASHBOARD_USERS_ID),
    auth: ServiceAuthentication.get_auth(),
    is_auth() {
        return (this.auth !== null && this.auth !== undefined);
    },
    init() {
        try {
            if(SECTION_DASHBOARD_USERS_ID == null) 
                throw {stack: 'DashboardUsersUI.init()', error_message: 'Missing SECTION_DASHBOARD_USERS_ID'};
            
            if (this.section) {
                this.render();
                this.dataInit();
            } else {
                throw {stack: 'DashboardUsersUI.init()', error_message: 'Missing SECTION'};
            }
        } catch(err) {
            if(ENV !== 'dev') return;
            if(typeof err === 'string'){
                alert('[DASHBOARD_init_error]: ' + err);
            } else {
                alert('[DASHBOARD_init_error]: ' + JSON.stringify(err));
            }
        }
    },

    el(tag, classes = [], attrs = {}) {
        const element = document.createElement(tag);
        if (classes.length) element.classList.add(...classes.filter(c => c));
        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'innerHTML') element.innerHTML = val;
            else if (key === 'textContent') element.textContent = val;
            else element.setAttribute(key, val);
        }
        return element;
    },

    render() {
        this.section.innerHTML = '';
        const main = this.el('div', ['container-fluid', 'p-2', 'p-md-4', 'bg-light', 'overflow-hidden', 'w-100']);
        
        // --- TOOLBAR (Busca e Novo) ---
        const toolbar = this.getToolBar();

        // --- GRID MOBILE (Cards) ---
        const m_container = this.el('div', ['d-md-none', 'd-flex', 'flex-column', 'gap-3'], { id: 'gridMobile' });

        main.append(toolbar, m_container);
        this.section.append(main);
    },

    async dataInit() {
        const load = async () => {
            const users = await ServiceUsers.get();
            this.populate(users);
        };

        await load();
        document.getElementById('btnSearch').onclick = async () => {
            const val = document.getElementById('f_username').value;
            const res = await ServiceUsers.fetchByUsernameAndPassword(val, "");
            this.populate(Array.isArray(res) ? res : [res]);
        };
    },

    getToolBar() {
        const navbar = this.el('nav', ['navbar', 'navbar-light', 'bg-white', 'shadow-sm', 'rounded', 'p-3', 'mb-4']);
     
        // O Form agora é um container flex que muda de direção conforme o tamanho da tela
        // No mobile: flex-column (empilhado) | No desktop: flex-md-row (alinhado)
        const filterForm = this.el('div', ['d-flex', 'flex-column', 'flex-md-row', 'gap-2', 'w-100']);

        // 1. Select Box de Filtros
        const selectFilter = this.el('select', ['form-select', 'w-100'], { 
            id: 'filterType',
            style: 'max-width: 200px;' // Limita o tamanho apenas no desktop
        });
    
        const options = [
            { value: 'none', text: 'Nenhum' },
            { value: 'username', text: 'Username' },
            { value: 'document', text: 'Documento' },
            { value: 'role', text: 'Perfil (Role)' },
            { value: 'active', text: 'Status (Ativo)' }
        ];

        options.forEach(opt => {
            const o = this.el('option', [], { value: opt.value, textContent: opt.text });
            selectFilter.append(o);
        });

        // 2. Input de Valor
        const inputVal = this.el('input', ['form-control', 'flex-grow-1', 'w-100'], { 
            id: 'filterValue', 
            type: 'text', 
            placeholder: 'Digite o valor para pesquisar...',
            'aria-label': 'Search'
        });

        // 3. Botão de Pesquisa (sem submit)
        const btnSearch = this.el('button', ['btn', 'btn-outline-success', 'w-100'], { 
            id: 'btnExecuteSearch',
            type: 'button', // Importante para não disparar reload da página
            textContent: 'Pesquisar'
        });
        
        // Ajuste de largura para desktop: o botão não deve ser gigante
        btnSearch.style.width = 'auto';
        btnSearch.classList.add('flex-md-shrink-0');

        // Agrupamento
        filterForm.append(selectFilter, inputVal, btnSearch);
        navbar.append(filterForm);

        return navbar;
    },
    
    populate(users) {
        const mobile = document.getElementById('gridMobile');
        mobile.innerHTML = '';

        users.forEach(user => {
            // Render Mobile Card
            const card = this.el('div', ['card', 'border-0', 'shadow-sm']);
            const cBody = this.el('div', ['card-body']);
            cBody.innerHTML = `
                <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span class="fw-bold text-primary">${user.username}</span>
                    <span class="badge bg-light text-dark">ID: ${user.id}</span>
                </div>
                <div class="small mb-1"><strong>Documento:</strong> ${user.document_type} - ${user.document}</div>
                <div class="small mb-3"><strong>Perfil:</strong> ${user.role} | <strong>Status:</strong> ${user.active ? 'Ativo' : 'Inativo'}</div>
            `;
            cBody.append(this.createActions(user, true));
            card.append(cBody);
            mobile.append(card);
        });
    },

    createActions(user, isMobile) {
        const container = this.el('div', [isMobile ? 'd-grid' : 'd-flex', 'gap-2']);
        const btnEdit = this.el('button', ['btn', 'btn-sm', isMobile ? 'btn-outline-primary' : 'btn-light'], { textContent: 'Editar' });
        
        btnEdit.onclick = () => {
            const newName = prompt(`Editar Username para ${user.username}:`, user.username);
            if(newName) {
                ServiceUsers.update(user.id, newName, user.password, user.document_type, user.document, user.role, user.active);
                location.reload();
            }
        };

        container.append(btnEdit);
        if(!isMobile) {
            const td = this.el('td');
            td.append(container);
            return td;
        }
        return container;
    }
};
