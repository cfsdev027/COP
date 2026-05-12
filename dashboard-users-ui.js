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

    // Helper para facilitar a criação de elementos
    el(tag, classes = [], attrs = {}) {
        const element = document.createElement(tag);
        if (classes.length) element.classList.add(...classes.filter(c => c));
        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'dataset') {
                Object.assign(element.dataset, val);
            } else {
                element[key] = val;
            }
        }
        return element;
    },

    render() {
        this.section.innerHTML = '';
        const mainContainer = this.el('div', ['container-fluid', 'p-3', 'bg-light', 'min-vh-100']);

        // --- BARRA SUPERIOR (Ações e Busca Rápida) ---
        const topBar = this.el('div', ['d-flex', 'justify-content-between', 'align-items-center', 'mb-3', 'gap-2']);
        
        const searchGroup = this.el('div', ['input-group', 'w-50']);
        const searchInput = this.el('input', ['form-control'], { id: 'f_username', placeholder: 'Busca rápida (Username)...' });
        const btnSearch = this.el('button', ['btn', 'btn-outline-secondary'], { id: 'btnSearch', innerHTML: '🔍' });
        searchGroup.append(searchInput, btnSearch);

        const actionsGroup = this.el('div', ['d-flex', 'gap-2']);
        const btnNew = this.el('button', ['btn', 'btn-success'], { id: 'btnNew', textContent: 'Novo' });
        const btnExit = this.el('button', ['btn', 'btn-secondary'], { textContent: 'Sair' });
        actionsGroup.append(btnNew, btnExit);

        topBar.append(searchGroup, actionsGroup);

        // --- GRID TABLE ---
        const tableContainer = this.el('div', ['card', 'shadow-sm', 'border-0']);
        const table = this.el('table', ['table', 'table-bordered', 'table-sm', 'align-middle', 'm-0']);
        
        // Header conforme imagem 1000033227.jpg
        const thead = this.el('thead', ['table-secondary', 'text-secondary', 'small']);
        const trH = this.el('tr');
        ['Ações', 'Id', 'Username', 'Tipo Doc', 'Documento', 'Role', 'Status'].forEach(text => {
            const th = this.el('th', ['p-2'], { textContent: text });
            trH.append(th);
        });
        thead.append(trH);

        const tbody = this.el('tbody', [], { id: 'userGridBody' });
        table.append(thead, tbody);
        tableContainer.append(table);

        mainContainer.append(topBar, tableContainer);
        this.section.append(mainContainer);
    },

    async dataInit() {
        const users = await ServiceUsers.get();
        this.populateGrid(users);

        document.getElementById('btnSearch').onclick = async () => {
            const query = document.getElementById('f_username').value;
            const res = await ServiceUsers.fetchByUsernameAndPassword(query, "");
            this.populateGrid(Array.isArray(res) ? res : [res]);
        };

        document.getElementById('btnNew').onclick = () => this.addNewRow();
    },

    populateGrid(users) {
        const tbody = document.getElementById('userGridBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = this.el('tr', ['user-row']);
            tr.dataset.userId = user.id;

            // Coluna de Ações
            const tdActions = this.el('td', ['text-center', 'p-1']);
            const btnEdit = this.el('button', ['btn', 'btn-sm', 'text-primary', 'p-0', 'me-2'], { innerHTML: '✏️', title: 'Editar' });
            const btnDel = this.el('button', ['btn', 'btn-sm', 'text-danger', 'p-0'], { innerHTML: '🗑️', title: 'Excluir' });
            
            btnEdit.onclick = () => this.toggleEditRow(tr, user);
            tdActions.append(btnEdit, btnDel);

            tr.append(
                tdActions,
                this.el('td', ['text-muted', 'small'], { textContent: user.id }),
                this.el('td', [], { textContent: user.username }),
                this.el('td', [], { textContent: user.document_type }),
                this.el('td', [], { textContent: user.document }),
                this.el('td', [], { textContent: user.role }),
                this.el('td', [], { textContent: user.active ? 'Ativo' : 'Inativo' })
            );
            tbody.append(tr);
        });
    },

    toggleEditRow(tr, user) {
        // Transforma a linha em inputs (Editable Inline)
        const cells = tr.cells;
        
        // Ações mudam para Confirmar/Cancelar
        cells[0].innerHTML = '';
        const btnSave = this.el('button', ['btn', 'btn-sm', 'text-success', 'me-2'], { innerHTML: '✅' });
        const btnCancel = this.el('button', ['btn', 'btn-sm', 'text-secondary'], { innerHTML: '❌' });
        
        btnSave.onclick = () => this.saveRowUpdate(tr, user.id);
        btnCancel.onclick = () => this.populateGrid([user]); // Simplificado: recarrega a linha
        cells[0].append(btnSave, btnCancel);

        // Transformação dos campos em inputs
        cells[2].innerHTML = `<input type="text" class="form-control form-control-sm" value="${user.username}" id="edit_name_${user.id}">`;
        cells[3].innerHTML = `<select class="form-select form-select-sm" id="edit_type_${user.id}">
                                <option ${user.document_type === 'CPF' ? 'selected' : ''}>CPF</option>
                                <option ${user.document_type === 'CNPJ' ? 'selected' : ''}>CNPJ</option>
                              </select>`;
        cells[4].innerHTML = `<input type="text" class="form-control form-control-sm" value="${user.document}" id="edit_doc_${user.id}">`;
    },

    async saveRowUpdate(tr, id) {
        const username = document.getElementById(`edit_name_${id}`).value;
        const docType = document.getElementById(`edit_type_${id}`).value;
        const doc = document.getElementById(`edit_doc_${id}`).value;

        // Chamada ao seu serviço existente
        await ServiceUsers.update(id, username, '******', docType, doc, 'user', true);
        alert('Registro atualizado!');
        const users = await ServiceUsers.get();
        this.populateGrid(users);
    },

    addNewRow() {
        const tbody = document.getElementById('userGridBody');
        const tr = this.el('tr', ['table-info']);
        
        tr.innerHTML = `
            <td class="text-center"><button class="btn btn-sm text-success">💾</button></td>
            <td class="text-muted small">NEW</td>
            <td><input type="text" class="form-control form-control-sm" placeholder="Username"></td>
            <td><select class="form-select form-select-sm"><option>CPF</option><option>CNPJ</option></select></td>
            <td><input type="text" class="form-control form-control-sm" placeholder="000.000..."></td>
            <td><input type="text" class="form-control form-control-sm" value="user"></td>
            <td>Ativo</td>
        `;
        tbody.prepend(tr); // Adiciona no topo como na imagem
    }
};
