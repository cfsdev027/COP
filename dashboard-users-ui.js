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
                setTimeout(() => this.dataInit(), 0);
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
    
    // Função 'el' robusta para garantir aplicação de classes e atributos
    el(tag, classes = [], attrs = {}) {
        const element = document.createElement(tag);
        
        // Garante que classes sejam adicionadas individualmente
        if (classes.length > 0) {
            classes.forEach(cls => {
                if (cls) element.classList.add(cls);
            });
        }

        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'textContent') element.textContent = val;
            else if (key === 'innerHTML') element.innerHTML = val;
            else element.setAttribute(key, val);
        }
        return element;
    },

    render() {
        this.section.innerHTML = '';
        
        // Container mestre com reset de box-sizing para evitar extrapolação
        const main = this.el('div', ['container-fluid', 'p-3', 'p-md-4', 'bg-light', 'w-100'], {
            style: 'overflow-x: hidden; min-height: 100vh;'
        });

        // --- NAVBAR DE BUSCA (Ajustada conforme imagem 1000033229) ---
        const nav = this.el('nav', ['navbar', 'navbar-light', 'bg-white', 'shadow-sm', 'rounded', 'p-3', 'mb-4', 'border']);
        const filterForm = this.el('div', ['d-flex', 'flex-column', 'flex-md-row', 'gap-2', 'w-100']);

        // Select de Filtro
        const select = this.el('select', ['form-select'], { id: 'filterType' });
        const options = [
            { v: 'none', t: 'Nenhum' },
            { v: 'username', t: 'Username' },
            { v: 'document', t: 'Documento' },
            { v: 'role', t: 'Perfil' },
            { v: 'active', t: 'Status' }
        ];
        options.forEach(opt => {
            const o = this.el('option', [], { value: opt.v, textContent: opt.t });
            select.append(o);
        });

        // Input de busca
        const input = this.el('input', ['form-control'], { 
            id: 'filterValue', 
            type: 'text', 
            placeholder: 'Digite o valor para pesquisar...' 
        });

        // Botão Pesquisar
        const btn = this.el('button', ['btn', 'btn-primary', 'px-4'], { 
            id: 'btnExecuteSearch', 
            type: 'button', 
            textContent: 'Pesquisar' 
        });

        filterForm.append(select, input, btn);
        nav.append(filterForm);

        // --- GRID CONTAINER (Cards Mobile / Table Desktop) ---
        const gridContent = this.el('div', ['w-100'], { id: 'gridContent' });

        main.append(nav, gridContent);
        this.section.append(main);
    },

    async dataInit() {
        const btn = document.getElementById('btnExecuteSearch');
        
        // Verificação de segurança para o erro de 'null'
        if (!btn) {
            console.warn('Botão de busca não encontrado no DOM. Tentando novamente...');
            return;
        }

        btn.onclick = async () => {
            const type = document.getElementById('filterType').value;
            const val = document.getElementById('filterValue').value;
            
            // Aqui entra sua lógica de ServiceUsers
            console.log('Executando busca:', type, val);
            const users = await ServiceUsers.get(); // Exemplo: recarregando todos
            this.populateGrid(users);
        };

        // Carga inicial de dados
        const initialUsers = await ServiceUsers.get();
        this.populateGrid(initialUsers);
    },

    populateGrid(users) {
        const container = document.getElementById('gridContent');
        if (!container) return;
        container.innerHTML = '';

        // Versão Mobile: Lista de Cards (conforme imagem 1000033229)
        const mobileList = this.el('div', ['d-md-none', 'd-flex', 'flex-column', 'gap-3']);
        
        users.forEach(user => {
            const card = this.el('div', ['card', 'border-0', 'shadow-sm']);
            const body = this.el('div', ['card-body', 'p-3']);
            
            body.innerHTML = `
                <div class="mb-1"><strong>${user.username}</strong> <span class="text-muted small">ID: ${user.id}</span></div>
                <div class="small"><strong>Documento:</strong> ${user.document_type} - ${user.document}</div>
                <div class="small mb-2"><strong>Perfil:</strong> ${user.role} | <strong>Status:</strong> ${user.active ? 'Ativo' : 'Inativo'}</div>
            `;
            
            const btnEdit = this.el('button', ['btn', 'btn-sm', 'btn-outline-secondary', 'w-100'], { textContent: 'Editar' });
            body.append(btnEdit);
            card.append(body);
            mobileList.append(card);
        });

        container.append(mobileList);
        // (Adicione aqui a lógica análoga para a tabela Desktop se desejar)
    }
};
