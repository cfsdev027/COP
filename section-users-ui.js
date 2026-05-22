import { USERS_SECTION_ID, USERS_CONTAINER_ID, USERS_DEFAULT_TITLE } from './config-users-ui.js';
import { RegistryComponent } from './registry-component-ui.js';
import { el } from './el-ui.js';
import { CatchError } from './catch-error.js';

export const SectionUsersUI = {
    container: document.getElementById(USER_SECTION_ID),
    
    // Dados iniciais baseados no modelo fornecido
    usersMockData: [
        {
            "id": "bf7406ae-e0a7-4ae8-9668-a85c57cfe43a",
            "created_at": "2026-05-11 10:35:43",
            "username": "admin",
            "password": "123mudar",
            "active": "true",
            "document": "41.714.641/0001-95",
            "document_type": "CNPJ",
            "role": "ADMIN"
        },
        {
            "id": "c5babc88-2ef3-49f3-9e44-010d92233544",
            "created_at": "2026-05-13 12:46:32",
            "username": "operador",
            "password": "123mudar",
            "active": "true",
            "document": "157.769.760-06",
            "document_type": "CPF",
            "role": "DEFAULT"
        }
    ],

    init() {
        try {
            if (!this.container) throw { stack: 'SectionUsersUI.init', message_error: 'App main wrapper content element not found.' };
            
            this.loadStyles();
            this.render();
        } catch (err) {
            CatchError('SectionUsersUI', err);
        }
    },

    loadStyles() {
        // Garante que o CSS da seção não seja duplicado se o init for chamado múltiplas vezes
        if (!document.getElementById('css-section-users')) {
            const link = el('link', [], {
                id: 'css-section-users',
                rel: 'stylesheet',
                href: './section-users-ui.css?v=' + Date.now()
            });
            document.head.appendChild(link);
        }
    },

    disposeStyles() {
        // Garante que o CSS da seção não seja duplicado se o init for chamado múltiplas vezes
        const css = document.getElementById('css-section-users');
        if (!css || css === null) return;

        css.remove();
    },

    dispose() {
        if (!this.container || this.container === null) return;

        this.container.innerHTML = '';
        this.disposeStyles();
    },

    render() {
        // Remove instâncias anteriores se houver para evitar duplicidade no DOM
        this.dispose();

        if (typeof el !== 'function') throw { stack: 'SectionUsersUI.render', message_error: 'el is not a function.' };

        // Cria a div interna que o RegistryComponent vai preencher com o título, busca e o grid
        const elRegistryContainer = el('div', [], { id: USERS_CONTAINER_ID });
        
        this.container.append(elRegistryContainer);

        // --- INTEGRAÇÃO COM O REGISTRY COMPONENT ---
        // Adaptamos as propriedades internas do RegistryComponent para bater com o modelo de Usuários antes de inicializá-lo
        RegistryComponent.title = USERS_DEFAULT_TITLE;
        RegistryComponent.database = [...this.usersMockData];
        
        // Sobrescrevemos o método de renderização interna do grid para construir as colunas baseadas nas propriedades do usuário
        RegistryComponent.render = function() {
            this.container.innerHTML = '';
            this.container.className = "container-fluid p-4";

            // 1. TÍTULO
            const elHeader = el('div', ['row', 'mb-4']);
            const elTitleCol = el('div', ['col-12']);
            const elTitle = el('h2', ['display-6', 'fw-bold']);
            elTitle.innerText = this.title;
            elTitleCol.append(elTitle);
            elHeader.append(elTitleCol);

            // 2. PESQUISA
            const elSearchRow = el('div', ['row', 'mb-4']);
            const elSearchCol = el('div', ['col-12', 'input-group']);
            const elSearchInput = el('input', ['form-control'], { 
                type: 'text', 
                placeholder: 'Filtrar usuários ex: role:ADMIN & active:true | username:operador (Pressione Enter)' 
            });
            elSearchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.handleFilter(elSearchInput.value); });
            
            const elSearchButton = el('button', ['btn', 'btn-primary'], { type: 'button' });
            elSearchButton.innerText = "Buscar";
            elSearchButton.addEventListener('click', () => this.handleFilter(elSearchInput.value));
            
            elSearchCol.append(elSearchInput, elSearchButton);
            elSearchRow.append(elSearchCol);

            // 3. GRID DA TABELA DE USUÁRIOS
            const elGridRow = el('div', ['row']);
            const elGridCol = el('div', ['col-12', 'table-responsive']);
            const elTable = el('table', ['table', 'table-striped', 'table-bordered', 'align-middle']);
            
            // Cabeçalho adaptado ao JSON do usuário
            const elThead = el('thead', ['table-dark', 'text-center']);
            const elTheadRow = el('tr');
            
            const colunas = ["ID / Criado Em", "Username", "Password", "Ativo", "Documento", "Tipo Doc.", "Role", "Ações"];
            colunas.forEach(colName => {
                const th = el('th');
                th.innerText = colName;
                elTheadRow.append(th);
            });
            elThead.append(elTheadRow);

            const elTbody = el('tbody');

            // --- PRIMEIRA LINHA: ADICIONAR NOVO USUÁRIO ---
            const elAddRow = el('tr', ['table-group-divider', 'bg-light']);
            
            elAddRow.append(el('td', ['text-muted', 'small'])); // ID auto-gerado
            
            const elAddTdUsername = el('td');
            const elInNewUsername = el('input', ['form-control', 'form-control-sm'], { type: 'text', placeholder: 'ex: jdoe' });
            elAddTdUsername.append(elInNewUsername);

            const elAddTdPassword = el('td');
            const elInNewPassword = el('input', ['form-control', 'form-control-sm'], { type: 'password', placeholder: 'Senha...' });
            elAddTdPassword.append(elInNewPassword);

            const elAddTdActive = el('td');
            const elInNewActive = el('select', ['form-select', 'form-select-sm']);
            elInNewActive.append(el('option', [], { value: 'true' }), el('option', [], { value: 'false' }));
            elInNewActive.options[0].text = "Ativo"; elInNewActive.options[1].text = "Inativo";
            elAddTdActive.append(elInNewActive);

            const elAddTdDoc = el('td');
            const elInNewDoc = el('input', ['form-control', 'form-control-sm'], { type: 'text', placeholder: 'Documento...' });
            elAddTdDoc.append(elInNewDoc);

            const elAddTdDocType = el('td');
            const elInNewDocType = el('select', ['form-select', 'form-select-sm']);
            elInNewDocType.append(el('option', [], { value: 'CPF' }), el('option', [], { value: 'CNPJ' }));
            elInNewDocType.options[0].text = "CPF"; elInNewDocType.options[1].text = "CNPJ";
            elAddTdDocType.append(elInNewDocType);

            const elAddTdRole = el('td');
            const elInNewRole = el('select', ['form-select', 'form-select-sm']);
            elInNewRole.append(el('option', [], { value: 'DEFAULT' }), el('option', [], { value: 'ADMIN' }));
            elInNewRole.options[0].text = "DEFAULT"; elInNewRole.options[1].text = "ADMIN";
            elAddTdRole.append(elInNewRole);

            const elAddTdAcoes = el('td', ['text-center']);
            const elBtnAdd = el('button', ['btn', 'btn-success', 'btn-sm', 'w-100']);
            elBtnAdd.innerText = "Criar";
            elBtnAdd.addEventListener('click', () => {
                const novoUsuario = {
                    id: crypto.randomUUID(),
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    username: elInNewUsername.value,
                    password: elInNewPassword.value,
                    active: elInNewActive.value,
                    document: elInNewDoc.value,
                    document_type: elInNewDocType.value,
                    role: elInNewRole.value
                };
                this.handleCreateRecordFromSection(novoUsuario);
            });
            elAddTdAcoes.append(elBtnAdd);

            elAddRow.append(elAddTdUsername, elAddTdPassword, elAddTdActive, elAddTdDoc, elAddTdDocType, elAddTdRole, elAddTdAcoes);
            elTbody.append(elAddRow);

            // --- LINHAS DE USUÁRIOS EXISTENTES (CONSULTA / EDIÇÃO) ---
            this.currentRows.forEach((user, index) => {
                const elRow = el('tr');

                // Coluna ID + Data de Criação agrupados
                const elTdMeta = el('td', ['small']);
                elTdMeta.innerHTML = `<span class="text-secondary">ID:</span> ${user.id.substring(0,8)}...<br><span class="text-muted" style="font-size:10px;">${user.created_at}</span>`;

                // Username
                const elTdUser = el('td');
                const elInUser = el('input', ['form-control', 'form-control-sm'], { type: 'text', value: user.username });
                elInUser.addEventListener('change', (e) => { this.currentRows[index].username = e.target.value; });
                elTdUser.append(elInUser);

                // Password
                const elTdPass = el('td');
                const elInPass = el('input', ['form-control', 'form-control-sm'], { type: 'password', value: user.password });
                elInPass.addEventListener('change', (e) => { this.currentRows[index].password = e.target.value; });
                elTdPass.append(elInPass);

                // Active (Status Select)
                const elTdAct = el('td');
                const elInAct = el('select', ['form-select', 'form-select-sm']);
                const optTrue = el('option', [], { value: 'true' }); optTrue.text = "Ativo";
                const optFalse = el('option', [], { value: 'false' }); optFalse.text = "Inativo";
                elInAct.append(optTrue, optFalse);
                elInAct.value = String(user.active);
                elInAct.addEventListener('change', (e) => { this.currentRows[index].active = e.target.value; });
                elTdAct.append(elInAct);

                // Document
                const elTdDocu = el('td');
                const elInDocu = el('input', ['form-control', 'form-control-sm'], { type: 'text', value: user.document });
                elInDocu.addEventListener('change', (e) => { this.currentRows[index].document = e.target.value; });
                elTdDocu.append(elInDocu);

                // Document Type
                const elTdDocType = el('td');
                const elInDocType = el('select', ['form-select', 'form-select-sm']);
                const optCpf = el('option', [], { value: 'CPF' }); optCpf.text = "CPF";
                const optCnpj = el('option', [], { value: 'CNPJ' }); optCnpj.text = "CNPJ";
                elInDocType.append(optCpf, optCnpj);
                elInDocType.value = user.document_type;
                elInDocType.addEventListener('change', (e) => { this.currentRows[index].document_type = e.target.value; });
                elTdDocType.append(elInDocType);

                // Role
                const elTdRole = el('td');
                const elInRole = el('select', ['form-select', 'form-select-sm']);
                const optDef = el('option', [], { value: 'DEFAULT' }); optDef.text = "DEFAULT";
                const optAdm = el('option', [], { value: 'ADMIN' }); optAdm.text = "ADMIN";
                elInRole.append(optDef, optAdm);
                elInRole.value = user.role;
                elInRole.addEventListener('change', (e) => { this.currentRows[index].role = e.target.value; });
                elTdRole.append(elInRole);

                // Botão de Commit da linha
                const elTdAcoes = el('td', ['text-center']);
                const elBtnCommit = el('button', ['btn', 'btn-warning', 'btn-sm', 'w-100']);
                elBtnCommit.innerText = "Commit";
                elBtnCommit.addEventListener('click', () => this.handleCommitRecord(this.currentRows[index]));
                elTdAcoes.append(elBtnCommit);

                elRow.append(elTdMeta, elTdUser, elTdPass, elTdAct, elTdDocu, elTdDocType, elInRole, elTdAcoes);
                elTbody.append(elRow);
            });

            elTable.append(elThead, elTbody);
            elGridCol.append(elTable);
            elGridRow.append(elGridCol);

            this.container.append(elHeader, elSearchRow, elGridRow);
        };

        // Adiciona a extensão de cadastro personalizado dentro do escopo estendido do RegistryComponent
        RegistryComponent.handleCreateRecordFromSection = function(novoUsuario) {
            if(!novoUsuario.username || !novoUsuario.password) {
                alert("Username e Password são obrigatórios!");
                return;
            }
            console.log("Executando Commit de Inserção de Usuário no Banco...", novoUsuario);
            this.database.push(novoUsuario);
            this.currentRows = [...this.database];
            this.render();
        };

        // Inicializa de fato o componente passando o ID do elemento da section que criamos acima
        RegistryComponent.init(USERS_SECTION_ID);
    }
};          
