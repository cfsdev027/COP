import { SECTION_DASHBOARD_USERS_ID } from './config-dashboard-users-ui.js';
import { ENV } from './configurations.js';
import { ServiceAuthentication } from './service-authentication.js';
import { ServiceUsers } from './service-users.js';

export const DashboardUsersUI = {
    section: document.getElementById(SECTION_DASHBOARD_USERS_ID),
    auth: ServiceAuthentication.get_auth(),
    filters: [
        {v: 'none', t: 'Nenhum'},
        {v: 'username', t: 'Usuário'},
        {v: 'document', t: 'Documento'},
        {v: 'role', t: 'Role'},
        {v: 'active', t: 'Ativo'}
    ],
    
    init() {
        try {
            if (!this.section) throw "Missing SECTION";
            this.render();
            // Aumentamos levemente o tempo para garantir o fluxo do navegador
            setTimeout(() => this.dataInit(), 100);
        } catch (err) {
            console.error('[DASHBOARD_init_error]:', err);
        }
    },

    el(tag, classes = [], attrs = {}) {
        const element = document.createElement(tag);
        if (classes.length > 0) {
            classes.forEach(cls => cls && element.classList.add(cls));
        }
        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'textContent') element.textContent = val;
            else if (key === 'innerHTML') element.innerHTML = val;
            else element.setAttribute(key, val);
        }
        return element;
    },
    
    getNavbar() {
        // 'h-auto' garante que a navbar não estique verticalmente
        const navbar = this.el('nav', 
            ['navbar', 'navbar-light', 'bg-white', 'shadow-sm', 'rounded', 'p-3', 'mb-4', 'border', 'h-auto']
        );
        
        const container = this.el('div', ['container-fluid', 'p-0']);
        // 'align-items-center' mantém os filtros centralizados sem esticar
        const row = this.el('div', ['row', 'g-2', 'w-100', 'm-0', 'align-items-center']);

        const colSelect = this.el('div', ['col-12', 'col-md-3']);
        const select = this.el('select', ['form-select'], { id: 'navbar-filter-select' });
        this.filters.forEach(f => select.append(this.el('option', [], { value: f.v, textContent: f.t })));
        colSelect.append(select);

        const colInput = this.el('div', ['col-12', 'col-md-7']);
        const input = this.el('input', ['form-control'], { 
            id: 'navbar-filter-input', 
            placeholder: 'Pesquisar valor...' 
        });
        colInput.append(input);

        const colBtn = this.el('div', ['col-12', 'col-md-2', 'd-grid']);
        const btn = this.el('button', ['btn', 'btn-primary'], { 
            id: 'btnExecuteSearch', 
            textContent: 'Pesquisar' 
        });
        colBtn.append(btn);

        row.append(colSelect, colInput, colBtn);
        container.append(row);
        navbar.append(container);
        return navbar;
    },

    render() {
        this.section.innerHTML = '';
        // Usamos 'd-flex flex-column' para empilhar os elementos corretamente
        const main = this.el('div', ['container-fluid', 'py-4', 'px-3', 'bg-light', 'min-vh-100', 'd-flex', 'flex-column']);

        const navbar = this.getNavbar();
        const gridContent = this.el('div', ['w-100'], { id: 'gridContent' });

        main.append(navbar, gridContent);
        this.section.append(main);
    },

    async dataInit() {
        const btn = document.getElementById('btnExecuteSearch');
        if (!btn) return;

        btn.onclick = async () => {
            const filter = document.getElementById('navbar-filter-select').value;
            const val = document.getElementById('navbar-filter-input').value;
            const users = await this.populateGridWithFilter(filter,val);
            this.populateGrid(users);
        };

        this.populateGrid(await ServiceUsers.get());
    },

    async populateGridWithFilter(filter,value){
        if(value == null || value === '') return [];
        switch(filter){
                case 'username':
                    if(value == null || value === '') return [];
                    return Array.of(await ServiceUsers.fetchByUsername(value));
                case 'document':
                    const params = value.split(':');
                    if(params == null || params.length !== 2) return [];
                    if(params[0].toUpperCase() !== 'CPF' && params[0].toUpperCase() !== 'CNPJ') return [];
                    return Array.of(await ServiceUsers.fetchByDocumentTypeAndDocument(params[0],params[1]));
                case 'role':
                    return await ServiceUsers.fetchByRole(value);
                case 'active':
                    return await ServiceUsers.fetchByActive((value.toLowerCase() === 'true'));
                default:
                    return await ServiceUsers.get();
        }
    },

    populateGrid(users) {
        if (!Array.isArray(users)) throw 'USERS is not array.';
        
        const container = document.getElementById('gridContent');
        if (!container) return;
        container.innerHTML = '';

        const listGroup = this.el('div', ['row', 'g-3']);

        users.forEach(user => {
            const col = this.el('div', ['col-12', 'col-md-6']); 
            const card = this.el('div', ['card', 'h-100', 'border-0', 'shadow-sm', 'border-start', 'border-primary', 'border-4']);
            const body = this.el('div', ['card-body', 'p-3']);

            const statusBadge = user.active 
                ? '<span class="badge bg-success text-white float-end">Ativo</span>'
                : '<span class="badge bg-danger text-white float-end">Inativo</span>';

            body.innerHTML = `
                ${statusBadge}
                <h6 class="fw-bold text-dark mb-1">${user.username}</h6>
                <p class="text-muted small mb-3">ID: ${user.id}</p>
                <div class="row small mb-3">
                    <div class="col-6">
                        <label class="text-muted d-block small">Documento</label>
                        <span>${user.document_type}: ${user.document}</span>
                    </div>
                    <div class="col-6 border-start">
                        <label class="text-muted d-block small">Perfil</label>
                        <span>${user.role}</span>
                    </div>
                </div>
            `;

            const btnEdit = this.el('button', ['btn', 'btn-sm', 'btn-outline-primary', 'w-100'], { textContent: 'Editar' });
            body.append(btnEdit);
            card.append(body);
            col.append(card);
            listGroup.append(col);
        });

        container.append(listGroup);
    }
};
