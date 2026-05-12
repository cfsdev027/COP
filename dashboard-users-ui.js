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
        const toolbar = this.el('div', ['d-flex', 'flex-column', 'flex-md-row', 'justify-content-between', 'gap-2', 'mb-3']);
        
        const searchBox = this.el('div', ['input-group', 'shadow-sm']);
        const input = this.el('input', ['form-control'], { id: 'f_username', placeholder: 'Buscar usuário...' });
        const btnS = this.el('button', ['btn', 'btn-primary'], { id: 'btnSearch', textContent: 'Pesquisar' });
        searchBox.append(input, btnS);

        const actions = this.el('div', ['d-flex', 'gap-2']);
        const btnNew = this.el('button', ['btn', 'btn-success', 'flex-grow-1'], { id: 'btnNew', textContent: '+ Novo Usuário' });
        actions.append(btnNew);

        toolbar.append(searchBox, actions);

        // --- GRID DESKTOP (Table) ---
        const d_card = this.el('div', ['card', 'd-none', 'd-md-block', 'border-0', 'shadow-sm']);
        const table = this.el('table', ['table', 'table-hover', 'align-middle', 'mb-0']);
        const thead = this.el('thead', ['table-dark']);
        const trH = this.el('tr');
        ['ID', 'Usuário', 'Documento', 'Role', 'Status', 'Ações'].forEach(t => {
            trH.append(this.el('th', ['small', 'py-3'], { textContent: t }));
        });
        thead.append(trH);
        const tbody = this.el('tbody', [], { id: 'gridDesktop' });
        table.append(thead, tbody);
        d_card.append(table);

        // --- GRID MOBILE (Cards) ---
        const m_container = this.el('div', ['d-md-none', 'd-flex', 'flex-column', 'gap-3'], { id: 'gridMobile' });

        main.append(toolbar, d_card, m_container);
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

    populate(users) {
        const desktop = document.getElementById('gridDesktop');
        const mobile = document.getElementById('gridMobile');
        desktop.innerHTML = '';
        mobile.innerHTML = '';

        users.forEach(user => {
            // Render Desktop Row
            const tr = this.el('tr');
            tr.append(
                this.el('td', ['text-muted'], { textContent: user.id }),
                this.el('td', ['fw-bold'], { textContent: user.username }),
                this.el('td', [], { textContent: `${user.document_type}: ${user.document}` }),
                this.el('td', [], { textContent: user.role }),
                this.el('td', [], { innerHTML: user.active ? '<span class="badge bg-success">Ativo</span>' : '<span class="badge bg-danger">Inativo</span>' }),
                this.createActions(user, false)
            );
            desktop.append(tr);

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
