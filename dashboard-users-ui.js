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
    el(tag, classes = [], attributes = {}) {
        const element = document.createElement(tag);
        if (classes.length) element.classList.add(...classes.filter(c => c));
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    },

    render() {
        this.section.innerHTML = ''; // Limpa para evitar duplicidade
        const container = this.el('div', ['container-fluid', 'py-4']);

        // --- SEÇÃO DE FILTROS ---
        const cardFilter = this.el('div', ['card', 'border-0', 'shadow-sm', 'mb-4']);
        const cardBody = this.el('div', ['card-body']);
        const filterForm = this.el('div', ['row', 'g-2']);

        // Criando os inputs de filtro
        const colUser = this.el('div', ['col-12', 'col-md-3']);
        const inputUser = this.el('input', ['form-control'], { id: 'f_username', placeholder: 'Usuário' });
        colUser.append(inputUser);

        const colDoc = this.el('div', ['col-12', 'col-md-3']);
        const inputDoc = this.el('input', ['form-control'], { id: 'f_doc', placeholder: 'Documento' });
        colDoc.append(inputDoc);

        const colBtn = this.el('div', ['col-12', 'col-md-2', 'd-grid']);
        const btnFilter = this.el('button', ['btn', 'btn-primary'], { id: 'btnFilter' });
        btnFilter.textContent = 'Filtrar';
        colBtn.append(btnFilter);

        filterForm.append(colUser, colDoc, colBtn);
        cardBody.append(filterForm);
        cardFilter.append(cardBody);

        // --- GRIDVIEW RESPONSIVO ---
        const gridWrapper = this.el('div', ['card', 'border-0', 'shadow-sm']);
        const gridBody = this.el('div', ['card-body', 'p-0'], { id: 'userGridContainer' });
        
        // Criamos o header da tabela (oculto no mobile via CSS)
        const table = this.el('table', ['table', 'table-hover', 'd-none', 'd-md-table', 'mb-0']);
        const thead = this.el('thead', ['table-light']);
        const trH = this.el('tr');
        ['ID', 'Usuário', 'Doc', 'Role', 'Status', ''].forEach(text => {
            const th = this.el('th');
            th.textContent = text;
            trH.append(th);
        });
        thead.append(trH);
        
        const tbody = this.el('tbody', [], { id: 'userTableBody' });
        table.append(thead, tbody);
        
        // Container para versão Mobile (Cards)
        const mobileContainer = this.el('div', ['d-md-none'], { id: 'userMobileContainer' });

        gridBody.append(table, mobileContainer);
        gridWrapper.append(gridBody);

        container.append(cardFilter, gridWrapper);
        this.section.append(container);
    },

    async dataInit() {
        const users = await ServiceUsers.get();
        this.populateGrid(users);

        document.getElementById('btnFilter').onclick = async () => {
            const user = document.getElementById('f_username').value;
            const res = await ServiceUsers.fetchByUsernameAndPassword(user, "");
            this.populateGrid(Array.isArray(res) ? res : [res]);
        };
    },

    populateGrid(users) {
        const tbody = document.getElementById('userTableBody');
        const mobileContainer = document.getElementById('userMobileContainer');
        
        tbody.innerHTML = '';
        mobileContainer.innerHTML = '';

        users.forEach(user => {
            // Versão Desktop (Linha da Tabela)
            const tr = this.el('tr', ['align-middle']);
            tr.append(
                this.el('td', ['text-muted'], {}, `#${user.id}`),
                this.el('td', ['fw-bold'], {}, user.username),
                this.el('td', [], {}, `${user.document_type}: ${user.document}`),
                this.el('td', [], {}, user.role),
                this.el('td', [], {}, user.active ? 'Ativo' : 'Inativo'),
                this.createActionBtn(user.id)
            );
            tbody.append(tr);

            // Versão Mobile (Card)
            const mCard = this.el('div', ['p-3', 'border-bottom']);
            mCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${user.username}</strong>
                    <span class="badge ${user.active ? 'bg-success' : 'bg-danger'}">${user.role}</span>
                </div>
                <div class="small text-muted mt-1">${user.document_type}: ${user.document}</div>
            `;
            const btnWrap = this.el('div', ['mt-2']);
            btnWrap.append(this.createActionBtn(user.id, true));
            mCard.append(btnWrap);
            mobileContainer.append(mCard);
        });
    },

    createActionBtn(id, fullWidth = false) {
        const td = this.el('td', [fullWidth ? 'd-grid' : 'text-end']);
        const btn = this.el('button', ['btn', 'btn-sm', 'btn-outline-secondary']);
        btn.textContent = 'Editar';
        btn.onclick = () => this.openEdit(id);
        td.append(btn);
        return td;
    }
};
