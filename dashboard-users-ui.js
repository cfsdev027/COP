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
    render() {
        this.section.innerHTML = `
            <div class="container-fluid py-4 animate__animated animate__fadeIn">
                <!-- SEÇÃO DE FILTROS -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white py-3">
                        <h6 class="m-0 font-weight-bold text-primary"><i class="bi bi-funnel"></i> Filtros de Consulta</h6>
                    </div>
                    <div class="card-body">
                        <form id="filterForm" class="row g-3">
                            <div class="col-12 col-md-3">
                                <input type="text" id="f_username" class="form-control form-control-sm" placeholder="Username">
                            </div>
                            <div class="col-6 col-md-2">
                                <select id="f_docType" class="form-select form-select-sm">
                                    <option value="">Tipo Doc.</option>
                                    <option value="CPF">CPF</option>
                                    <option value="CNPJ">CNPJ</option>
                                </select>
                            </div>
                            <div class="col-6 col-md-2">
                                <input type="text" id="f_doc" class="form-control form-control-sm" placeholder="Documento">
                            </div>
                            <div class="col-6 col-md-2">
                                <select id="f_role" class="form-select form-select-sm">
                                    <option value="">Role (Todos)</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                            <div class="col-6 col-md-1">
                                <select id="f_active" class="form-select form-select-sm">
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                </select>
                            </div>
                            <div class="col-12 col-md-2 d-grid">
                                <button type="button" id="btnFilter" class="btn btn-primary btn-sm">
                                    Pesquisar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- GRIDVIEW -->
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="ps-3">ID</th>
                                        <th>Criado em</th>
                                        <th>Username</th>
                                        <th>Doc. Tipo</th>
                                        <th>Documento</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th class="text-end pe-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="userGridBody">
                                    <!-- Dinâmico -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL DE EDIÇÃO -->
            <div class="modal fade" id="editUserModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Usuário</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="modalEditBody">
                            <!-- Form de edição dinâmico -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async dataInit() {
        // Carga inicial
        const users = await ServiceUsers.get();
        this.populateGrid(users);

        // Listener de Filtros
        document.getElementById('btnFilter').addEventListener('click', async () => {
            const filters = {
                username: document.getElementById('f_username').value,
                docType: document.getElementById('f_docType').value,
                doc: document.getElementById('f_doc').value,
                role: document.getElementById('f_role').value,
                active: document.getElementById('f_active').value
            };
            
            // Lógica de escolha do fetch baseado no filtro preenchido
            let result;
            if(filters.username) result = await ServiceUsers.fetchByUsernameAndPassword(filters.username, "");
            else if(filters.doc) result = await ServiceUsers.fetchByDocumentTypeAndDocument(filters.docType, filters.doc);
            else if(filters.role) result = await ServiceUsers.fetchByRole(filters.role);
            else result = await ServiceUsers.fetchByActive(filters.active === 'true');

            this.populateGrid(Array.isArray(result) ? result : [result]);
        });
    },

    populateGrid(users) {
        const tbody = document.getElementById('userGridBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="ps-3 text-muted">#${user.id}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td class="fw-bold">${user.username}</td>
                <td><span class="badge bg-light text-dark border">${user.document_type}</span></td>
                <td>${user.document}</td>
                <td><span class="badge bg-info-subtle text-info text-uppercase">${user.role}</span></td>
                <td>
                    <span class="dot ${user.active ? 'bg-success' : 'bg-danger'}"></span>
                    ${user.active ? 'Ativo' : 'Inativo'}
                </td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-primary border-0" onclick="DashboardUsersUI.openEdit(${user.id})">
                        Editar
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async openEdit(id) {
        const user = await ServiceUsers.fetch(id);
        const modalBody = document.getElementById('modalEditBody');
        
        modalBody.innerHTML = `
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label small fw-bold">Username</label>
                    <input type="text" id="edit_username" class="form-control" value="${user.username}">
                </div>
                <div class="col-12">
                    <label class="form-label small fw-bold">Senha</label>
                    <input type="password" id="edit_password" class="form-control" value="${user.password}">
                </div>
                <div class="col-6">
                    <label class="form-label small fw-bold">Tipo Doc</label>
                    <select id="edit_docType" class="form-select">
                        <option value="CPF" ${user.document_type === 'CPF' ? 'selected' : ''}>CPF</option>
                        <option value="CNPJ" ${user.document_type === 'CNPJ' ? 'selected' : ''}>CNPJ</option>
                    </select>
                </div>
                <div class="col-6">
                    <label class="form-label small fw-bold">Documento</label>
                    <input type="text" id="edit_doc" class="form-control" value="${user.document}">
                </div>
                <div class="col-12">
                    <button class="btn btn-primary w-100" onclick="DashboardUsersUI.saveUpdate(${user.id})">Salvar Alterações</button>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    },

    async saveUpdate(id) {
        const data = [
            id,
            document.getElementById('edit_username').value,
            document.getElementById('edit_password').value,
            document.getElementById('edit_docType').value,
            document.getElementById('edit_doc').value,
            'user', // ou pegar de um select
            true    // ou pegar de um select
        ];

        await ServiceUsers.update(...data);
        alert('Usuário atualizado com sucesso!');
        location.reload(); 
    }
};
