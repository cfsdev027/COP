import { SECTION_DASHBOARD_USERS_ID } from './config-dashboard-users-ui.js';
import { ENV } from './configurations.js';
import { ServiceAuthentication } from './service-authentication.js';
import { ServiceUsers } from './service-users.js';

export const DashboardUsersUI = {
    section: document.getElementById(SECTION_DASHBOARD_USERS_ID),
    auth: ServiceAuthentication.get_auth(),

    init() {
        try {
            if (!this.section) throw "Missing SECTION";
            this.render();
            // O setTimeout garante que o navegador terminou de pintar o HTML antes do JS buscar os IDs
            setTimeout(() => this.dataInit(), 50);
        } catch (err) {
            console.error('[DASHBOARD_init_error]:', err);
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

    getNavbar() {
        const navbar = this.el('nav',['navbar','bg-light']);
        navbar.innerHTML =`
                <div class="container-fluid">
                    <form class="d-flex" role="search">
                        <select class="form-select" aria-label="Default select example">
                            <option selected>Filtro</option>
                            <option value="none">Nenhum</option>
                            <option value="username">Usuário</option>
                            <option value="document">Documento</option>
                            <option value="role">Role</option>
                            <option value="active">Status</option>
                        </select>
                        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>`;

        return navbar;
    },

    render() {
        this.section.innerHTML = '';
        
        // Container mestre com fundo sutil para destacar os cards brancos
        const main = this.el('div', ['container-fluid', 'py-4', 'px-3', 'bg-light', 'min-vh-100']);

        // --- NAVBAR DE BUSCA (ESTILO MODERNO) ---
        const navbar = this.getNavbar();

        // --- GRID CONTAINER ---
        const gridContent = this.el('div', ['w-100'], { id: 'gridContent' });

        main.append(navbar, gridContent);
        this.section.append(main);
    },

    async dataInit() {
        const btn = document.getElementById('btnExecuteSearch');
        if (!btn) return;

        btn.onclick = async () => {
            const type = document.getElementById('filterType').value;
            const val = document.getElementById('filterValue').value;
            console.log('Pesquisando...', type, val);
            // Aqui você chamaria ServiceUsers.fetch...
            const users = await ServiceUsers.get(); 
            this.populateGrid(users);
        };

        const initialUsers = await ServiceUsers.get();
        this.populateGrid(initialUsers);
    },

    populateGrid(users) {
        const container = document.getElementById('gridContent');
        if (!container) return;
        container.innerHTML = '';

        // Layout Responsivo: Cards que parecem itens de lista profissionais
        const listGroup = this.el('div', ['row', 'g-3']);

        users.forEach(user => {
            const col = this.el('div', ['col-12', 'col-lg-6']); // 1 por linha mobile, 2 no desktop
            const card = this.el('div', ['card', 'h-100', 'border-0', 'shadow-sm', 'border-start', 'border-primary', 'border-4']);
            const body = this.el('div', ['card-body', 'p-3']);

            const statusBadge = user.active 
                ? '<span class="badge bg-success-subtle text-success float-end">Ativo</span>'
                : '<span class="badge bg-danger-subtle text-danger float-end">Inativo</span>';

            body.innerHTML = `
                ${statusBadge}
                <h6 class="card-title mb-1 text-uppercase fw-bold text-dark">${user.username}</h6>
                <p class="text-muted small mb-2">ID: <span class="user-select-all">${user.id}</span></p>
                
                <div class="row small mb-3">
                    <div class="col-6">
                        <label class="text-muted d-block small">Documento</label>
                        <span class="fw-medium">${user.document_type}: ${user.document}</span>
                    </div>
                    <div class="col-6 border-start">
                        <label class="text-muted d-block small">Perfil</label>
                        <span class="fw-medium">${user.role}</span>
                    </div>
                </div>
            `;

            const footer = this.el('div', ['d-flex', 'gap-2']);
            const btnEdit = this.el('button', ['btn', 'btn-sm', 'btn-outline-primary', 'flex-grow-1'], { textContent: 'Editar Registro' });
            
            footer.append(btnEdit);
            body.append(footer);
            card.append(body);
            col.append(card);
            listGroup.append(col);
        });

        container.append(listGroup);
    }
};
