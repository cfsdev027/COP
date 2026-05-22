import { el } from './el-ui.js';
import { CatchError } from './catch-error.js';
import { ServiceStorage } from './service-storage.js'; // Caso precise persistir estados temporários

export const RegistryComponent = {
    container: null, // Será definido no init()
    title: "Gerenciador de Registros",
    
    // Dados em memória (Mock inicial que simula o banco de dados)
    database: [
        { id: "1", nome: "Ana Silva", funcao: "Operadora", status: "Ativo" },
        { id: "2", nome: "Bruno Costa", funcao: "Supervisor", status: "Ativo" },
        { id: "3", nome: "Carlos Souza", funcao: "Técnico", status: "Inativo" }
    ],
    
    // Lista que o grid exibe atualmente (filtrada ou cheia)
    currentRows: [],

    init(containerId, optionalTitle) {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) throw { stack: 'init', message_error: `Missing CONTAINER with id ${containerId}.` };
            
            if (optionalTitle) this.title = optionalTitle;
            
            // Inicializa os dados visíveis com o banco completo
            this.currentRows = [...this.database];
            
            this.render();
        } catch (err) {
            if (typeof CatchError === 'function') CatchError('RegistryComponent', err);
            else console.error('RegistryComponent Error:', err);
        }
    },

    render() {
        this.container.innerHTML = '';
        this.container.className = "container-fluid p-4 registry-component";

        if (typeof el !== 'function') throw { stack: 'render', message_error: 'el is not a function.' };

        // 1. TÍTULO DO COMPONENTE
        const elHeader = el('div', ['row', 'mb-4']);
        const elTitleCol = el('div', ['col-12']);
        const elTitle = el('h2', ['display-6']);
        elTitle.innerText = this.title;
        elTitleCol.append(elTitle);
        elHeader.append(elTitleCol);

        // 2. COMPONENTE DE PESQUISA (FILTRO)
        const elSearchRow = el('div', ['row', 'mb-3']);
        const elSearchCol = el('div', ['col-12', 'input-group']);
        
        const elSearchInput = el('input', ['form-control'], { 
            type: 'text', 
            placeholder: 'Filtrar ex: status:Ativo & funcao:Operadora (Pressione Enter)' 
        });
        
        // Evento de busca ao pressionar 'Enter'
        elSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleFilter(elSearchInput.value);
            }
        });

        const elSearchButton = el('button', ['btn', 'btn-primary'], { type: 'button' });
        elSearchButton.innerText = "Buscar";
        elSearchButton.addEventListener('click', () => {
            this.handleFilter(elSearchInput.value);
        });

        elSearchCol.append(elSearchInput, elSearchButton);
        elSearchRow.append(elSearchCol);

        // 3. GRID / TABELA
        const elGridRow = el('div', ['row']);
        const elGridCol = el('div', ['col-12', 'table-responsive']);
        
        const elTable = el('table', ['table', 'table-striped', 'table-bordered', 'align-middle']);
        
        // Cabeçalho da Tabela
        const elThead = el('thead', ['table-dark']);
        const elThRow = el('th', [], { style: 'width: 10%' }); elThRow.innerText = "ID";
        const elThNome = el('th', [], { style: 'width: 40%' }); elThNome.innerText = "Nome";
        const elThFuncao = el('th', [], { style: 'width: 30%' }); elThFuncao.innerText = "Função";
        const elThStatus = el('th', [], { style: 'width: 10%' }); elThStatus.innerText = "Status";
        const elThAcoes = el('th', [], { style: 'width: 10%' }); elThAcoes.innerText = "Ações";
        
        const elTheadRow = el('tr');
        elTheadRow.append(elThRow, elThNome, elThFuncao, elThStatus, elThAcoes);
        elThead.append(elTheadRow);

        // Corpo da Tabela
        const elTbody = el('tbody');

        // --- LINHA DE CADASTRO (PRIMEIRA LINHA) ---
        const elAddRow = el('tr', ['table-group-divider', 'bg-light']);
        
        const elAddTdId = el('td'); elAddTdId.innerText = "Novo";
        
        const elAddTdNome = el('td');
        const elInputNewNome = el('input', ['form-control', 'form-control-sm'], { type: 'text', placeholder: 'Nome do registro...' });
        elAddTdNome.append(elInputNewNome);

        const elAddTdFuncao = el('td');
        const elInputNewFuncao = el('input', ['form-control', 'form-control-sm'], { type: 'text', placeholder: 'Função...' });
        elAddTdFuncao.append(elInputNewFuncao);

        const elAddTdStatus = el('td');
        const elInputNewStatus = el('input', ['form-control', 'form-control-sm'], { type: 'text', placeholder: 'Ativo/Inativo' });
        elAddTdStatus.append(elInputNewStatus);

        const elAddTdAcoes = el('td', ['text-center']);
        const elBtnAdd = el('button', ['btn', 'btn-success', 'btn-sm', 'w-100']);
        elBtnAdd.innerText = "Adicionar";
        elBtnAdd.addEventListener('click', () => {
            this.handleCreateRecord(elInputNewNome.value, elInputNewFuncao.value, elInputNewStatus.value);
        });
        elAddTdAcoes.append(elBtnAdd);

        elAddRow.append(elAddTdId, elAddTdNome, elAddTdFuncao, elAddTdStatus, elAddTdAcoes);
        elTbody.append(elAddRow);

        // --- LINHAS DE CONSULTA / EDIÇÃO ---
        this.currentRows.forEach((row, index) => {
            const elRow = el('tr');

            // ID (Não editável)
            const elTdId = el('td');
            elTdId.innerText = row.id;

            // Nome (Editável)
            const elTdNome = el('td');
            const elInputNome = el('input', ['form-control', 'form-control-sm'], { type: 'text', value: row.nome });
            elInputNome.addEventListener('change', (e) => { this.currentRows[index].nome = e.target.value; });
            elTdNome.append(elInputNome);

            // Função (Editável)
            const elTdFuncao = el('td');
            const elInputFuncao = el('input', ['form-control', 'form-control-sm'], { type: 'text', value: row.funcao });
            elInputFuncao.addEventListener('change', (e) => { this.currentRows[index].funcao = e.target.value; });
            elTdFuncao.append(elInputFuncao);

            // Status (Editável)
            const elTdStatus = el('td');
            const elInputStatus = el('input', ['form-control', 'form-control-sm'], { type: 'text', value: row.status });
            elInputStatus.addEventListener('change', (e) => { this.currentRows[index].status = e.target.value; });
            elTdStatus.append(elInputStatus);

            // Ação de Commit (Salvar Linha)
            const elTdAcoes = el('td', ['text-center']);
            const elBtnCommit = el('button', ['btn', 'btn-warning', 'btn-sm', 'w-100']);
            elBtnCommit.innerText = "Commit";
            elBtnCommit.addEventListener('click', () => {
                this.handleCommitRecord(this.currentRows[index]);
            });
            elTdAcoes.append(elBtnCommit);

            elRow.append(elTdId, elTdNome, elTdFuncao, elTdStatus, elTdAcoes);
            elTbody.append(elRow);
        });

        elTable.append(elThead, elTbody);
        elGridCol.append(elTable);
        elGridRow.append(elGridCol);

        // Append final no container principal
        this.container.append(elHeader, elSearchRow, elGridRow);
    },

    // Processamento do motor de filtros baseados em String literais com operadores lógicos
    handleFilter(filterString) {
        if (!filterString || filterString.trim() === "") {
            this.currentRows = [...this.database];
            this.render();
            return;
        }

        // Regex para capturar os blocos "propriedade:valor" e os operadores "&" ou "|"
        const tokens = filterString.match(/([^\s&|]+:[^\s&|]+)|([&|])/g);
        
        if (!tokens) {
            this.currentRows = [...this.database];
            this.render();
            return;
        }

        this.currentRows = this.database.filter(item => {
            let evalExpression = "";

            tokens.forEach(token => {
                if (token === '&') {
                    evalExpression += " && ";
                } else if (token === '|') {
                    evalExpression += " || ";
                } else {
                    // É um par propriedade:valor
                    const [prop, val] = token.split(':');
                    
                    // Valida se a propriedade existe no objeto
                    if (item[prop] !== undefined) {
                        const itemValue = String(item[prop]).toLowerCase();
                        const searchValue = String(val).toLowerCase();
                        
                        // Verifica correspondência parcial ou total
                        const isMatch = itemValue.includes(searchValue);
                        evalExpression += isMatch ? "true" : "false";
                    } else {
                        evalExpression += "false";
                    }
                }
            });

            // Executa com segurança o resultado lógico da expressão montada stringificada
            try {
                return Function(`"use strict"; return (${evalExpression})`)();
            } catch {
                return false;
            }
        });

        this.render();
    },

    makeGridview() {
        // --- DENTRO DE RegistryComponent.render() ---

        // 1. Ajuste do cabeçalho (thead)
        // Ocultamos colunas densas em telas pequenas usando d-none e reexibimos a partir do tamanho 'md' (Tablets/Desktops)
        const elTheadRow = el('tr');
        const colunas = [
            { name: "Usuário", class: "" }, // Sempre visível
            { name: "Role", class: "" },    // Sempre visível
            { name: "Criado Em", class: "d-none d-md-table-cell" },
            { name: "Password", class: "d-none d-lg-table-cell" }, // Só telas grandes
            { name: "Ativo", class: "d-none d-sm-table-cell" },
            { name: "Documento", class: "d-none d-md-table-cell" },
            { name: "Ações", class: "text-center" }
        ];

        colunas.forEach(col => {
            const th = el('th', col.class ? col.class.split(' ') : []);
            th.innerText = col.name;
            elTheadRow.append(th);
        });
        
        elThead.append(elTheadRow);


        // 2. Renderização das Linhas de Usuários Existentes (tbody)
        this.currentRows.forEach((user, index) => {
            // Linha Principal (Sempre visível)
            const elRow = el('tr');
    
            // Username + Botão de Expansão para Mobile
            const elTdUser = el('td');
            // Botão que só aparece no mobile (d-md-none) para abrir os detalhes ocultos
            const elBtnExpand = el('button', ['btn', 'btn-sm', 'btn-outline-secondary', 'me-2', 'd-md-none']);
            elBtnExpand.innerHTML = '<i class="bi bi-eye"></i>';
    
            const elInUser = el('input', ['form-control', 'form-control-sm', 'd-inline-block'], { type: 'text', value: user.username, style: 'width: calc(100% - 40px);' });
            elInUser.addEventListener('change', (e) => { this.currentRows[index].username = e.target.value; });
            elTdUser.append(elBtnExpand, elInUser);

            // Role
            const elTdRole = el('td');
            const elInRole = el('select', ['form-select', 'form-select-sm']);
            // ... preencher options do Role ...
            elTdRole.append(elInRole);

            // Colunas Ocultáveis (Seguindo rigorosamente a mesma regra do thead)
            const elTdCreated = el('td', ['d-none', 'd-md-table-cell', 'small']);
            elTdCreated.innerText = user.created_at;

            const elTdPass = el('td', ['d-none', 'd-lg-table-cell']);
            // ... input do password ...

            const elTdAct = el('td', ['d-none', 'd-sm-table-cell']);
            // ... select do active ...

            const elTdDocu = el('td', ['d-none', 'd-md-table-cell']);
            // ... input do documento ...

            // Botão de Commit
            const elTdAcoes = el('td', ['text-center']);
            const elBtnCommit = el('button', ['btn', 'btn-warning', 'btn-sm', 'w-100']);
            elBtnCommit.innerText = "Commit";
            elBtnCommit.addEventListener('click', () => this.handleCommitRecord(this.currentRows[index]));
            elTdAcoes.append(elBtnCommit);

            elRow.append(elTdUser, elTdRole, elTdCreated, elTdPass, elTdAct, elTdDocu, elTdAcoes);
            elTbody.append(elRow);

            // --- LINHA DE DETALHES (MOBILE ONLY) ---
            // Uma linha extra que fica escondida e guarda as informações que sumiram do grid principal
            const elRowDetails = el('tr', ['d-none', 'bg-light']);
            const elTdDetailsContainer = el('td', [], { colspan: "7" });
    
            // Monta um sumário em blocos col-6 usando o Grid do Bootstrap
            elTdDetailsContainer.innerHTML = `
                <div class="row g-2 p-2" style="font-size: 13px;">
                    <div class="col-6"><strong>ID Completo:</strong> <br><span class="text-muted">${user.id}</span></div>
                    <div class="col-6"><strong>Criado em:</strong> <br>${user.created_at}</div>
                    <div class="col-6 d-sm-none"><strong>Status:</strong> <br>${user.active === 'true' ? 'Ativo' : 'Inativo'}</div>
                    <div class="col-6 d-lg-none"><strong>Senha oculta:</strong> <br>******</div>
                    <div class="col-12 d-md-none"><strong>${user.document_type}:</strong> ${user.document}</div>
                </div>
            `;
    
            elRowDetails.append(elTdDetailsContainer);
            elTbody.append(elRowDetails);

            // Evento de clique para expandir/recolher os detalhes no mobile
            elBtnExpand.addEventListener('click', () => {
                elRowDetails.classList.toggle('d-none');
                elBtnExpand.classList.toggle('btn-secondary');
                elBtnExpand.classList.toggle('btn-outline-secondary');
            });
        }); 
    },

    // Ação para criar um novo registro (Disparada pela linha 1)
    async handleCreateRecord(nome, funcao, status) {
        if (!nome || !funcao) {
            alert("Por favor, preencha pelo menos Nome e Função para o novo registro.");
            return;
        }

        const newId = String(this.database.length + 1);
        const newRecord = {
            id: newId,
            nome: nome,
            funcao: funcao,
            status: status || "Ativo"
        };

        // Simulação de salvamento assíncrono no banco (Commit de criação)
        console.log("Enviando novo registro para o banco de dados...", newRecord);
        
        this.database.push(newRecord);
        this.currentRows = [...this.database];
        
        alert(`Registro criado com sucesso! ID: ${newId}`);
        this.render();
    },

    // Ação de salvamento (Commit de linha individual)
    async handleCommitRecord(record) {
        if (!confirm(`Deseja salvar as alterações do registro ID: ${record.id}?`)) return;

        // Atualiza a nossa "tabela mestre" (database simulado)
        const dbIndex = this.database.findIndex(item => item.id === record.id);
        if (dbIndex !== -1) {
            this.database[dbIndex] = { ...record };
            
            // Aqui seria a chamada assíncrona real de API, exemplo:
            // await ServiceAPI.put(`/registros/${record.id}`, record);
            
            console.log(`Commit realizado com sucesso no Banco de Dados para o ID: ${record.id}`, record);
            alert(`Alterações salvas com sucesso no banco para o ID: ${record.id}!`);
        }
        
        this.render();
    }
};
