import { el } from './el-ui.js';
import { CatchError } from './catch-error.js';
import { ServiceStorage } from './service-storage.js'; // Caso precise persistir estados temporários

export const RegistryComponent = {
    container: null,
    title: null,
    data: null,
    
    // Dados em memória (Mock inicial que simula o banco de dados)
    database: [
        { id: "1", nome: "Ana Silva", funcao: "Operadora", status: "Ativo" },
        { id: "2", nome: "Bruno Costa", funcao: "Supervisor", status: "Ativo" },
        { id: "3", nome: "Carlos Souza", funcao: "Técnico", status: "Inativo" }
    ],
    
    // Lista que o grid exibe atualmente (filtrada ou cheia)
    currentRows: [],

    init(containerId, title, data) {
        try {
            if(!containerId || containerId === null) throw { stack: 'init', message_error: `containerId is null or empty.` };
            
            this.container = document.getElementById(containerId);
            if (!this.container) throw { stack: 'init', message_error: `Missing CONTAINER with id ${containerId}.` };
            
            this.title = title;
            this.data = data;
            
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

        const elGrid = this.makeGridview();

        this.container.append(elGrid);
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

    makeSearch() {
        const elSearchRow = el('div', ['row', 'mb-4', 'justify-content-start']);
        const elSearchCol = el('div', ['col-12', 'col-md-6', 'input-group']);
        const elSearchInput = el('input', ['form-control'], { 
            type: 'text', 
            placeholder: 'Filtrar ex: role:ADMIN & active:true...' 
        });
        
        const elSearchButton = el('button', ['btn', 'btn-primary'], { type: 'button' });
        elSearchButton.innerText = "Buscar";
        elSearchButton.addEventListener('click', () => {
            this.handleFilter(elSearchInput.value);
        });

        elSearchCol.append(elSearchInput, elSearchButton);
        elSearchRow.append(elSearchCol);

        return elSearchRow;
    },

    getType(valor) {
        // 1. Identifica booleanos (tanto o tipo primitivo quanto strings "true"/"false")
        if (typeof valor === 'boolean' || valor === 'true' || valor === 'false') {
            return 'checkbox';
        }

        // 2. Identifica se o valor é uma data ou uma string conversível em data válida
        if (valor instanceof Date && !isNaN(valor)) {
            return 'data';
        }
  
        if (typeof valor === 'string') {
            // Evita que strings puramente numéricas vazias ou espaços sejam tratadas como data
            if (valor.trim() !== '') {
                const timestamp = Date.parse(valor);
                // Se Date.parse retornar um número válido e a string não for apenas um número puro
                if (!isNaN(timestamp) && isNaN(Number(valor))) {
                   return 'data';
                }
            }
        
            return 'text';
        }

        // Tratamento opcional para tipos que fujam do escopo inicial (números, objetos, etc.)
        return 'text';
    },

    getHash() {
        // Converte o timestamp atual para base 36 e remove decimais se houver
        return Date.now().toString(36);
    },

    encodeASCII(val) {
        const regex = /[^\w\sÀ-ÿ]|_/g;

        return val.replace(regex, (caracter) => {
            return `_${caracter.charCodeAt(0)}_`;
        });
    },

    decodeASCII(ascii) {
        const regex = /(?<=_)\d+(?=_)/g;
        return ascii.replace(regex, (_, codigo) => {
            return String.fromCharCode(Number(codigo));
        });
    },

    extractData(elTr) {
        const dadosExtraidos = [];
  
       // Busca todas as 'td' que contêm os mapeamentos necessários
       const celulas = trElement.querySelectorAll('td[data-column-name][data-input-id]');
  
       celulas.forEach(td => {
           const propriedade = td.getAttribute('data-column-name');
           const inputId = td.getAttribute('data-input-id');
    
           // Busca o elemento de input no DOM pelo ID especificado
           const inputElement = document.getElementById(inputId);
    
           if (inputElement) {
               // Captura o valor do input (funciona para text, number, date, etc.)
               const valor = inputElement.value; 
      
               dadosExtraidos.push({ propriedade, valor });
           }
        });
  
        return dadosExtraidos; // Retorna uma array de objetos [{propriedade, valor}, ...]
    },

    makeDynamic(params) {
        const result = {};
        params.forEach(item => {
            result[item.propriedade] = item.valor;
        });
  
        return result;
    },

    addNew() {
        const elTr = document.getElementById('gridview-new-tr');
        if(!elTr || elTr === null) return;

        const params = this.extractData(elTr);
        if (!params || params === null) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic || dynamic === null) return;

        this.handleCreateRecord(dynamic);
    },

    commit(id) {
        const elTr = document.getElementById('gridview-new-tr');
        if(!elTr || elTr === null) return;

        const params = this.extractData(elTr);
        if (!params || params === null) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic || dynamic === null) return;

        this.handleCommitRecord(dynamic);
    },

    makeGridviewHeader() {
        const elTheader = el('div', ['container-fluid'], { id: 'gridview-header' });
        const elTheadRow = el('tr', [], { id: 'gridview-header-tr' });
        const elTNewRow = el('tr', ['table-group-divider', 'bg-light'], { id: 'gridview-new-tr' });
        
        if(!this.data || this.data === null) return elTheadRow;

        Object.entries(this.data[0]).forEach(([p,val]) => {
            const columnType = this.getType(val);
            const hash = this.getHash(p);
            const tdId = `new-${hash}`;
            const inputId = `new-input-${hash}`;
            
            const elTh = el('th', [], { id: `header-tr-${ascii}` });
            elTh.innerText = p;
            elTh.setAttribute('data-column-type', columnType);
            elTh.setAttribute('data-column-name', p);
            
            elTheadRow.append(elTh);

            const elTd = el('td', [], { id: tdId });
            elTd.setAttribute('data-column-type', columnType);
            elTd.setAttribute('data-column-name', p);
            elTd.setAttribute('data-input-id', inputId);
            
            const elInput = el('input', ['form-control', 'form-control-sm'], { id: inputId, type: columnType });
            
            elTd.append(elInput);
            elTNewRow.append(elTd);
        });

        const elTheadActions = el('th', [], { id: 'h-actions' });
        elTheadRow.append(elTheadActions);
        
        const elAddTdActions = el('td', ['text-center'], { id: 'new-actions' });
        const elBtnAdd = el('button', ['btn', 'btn-success', 'btn-sm', 'w-100']);
        elBtnAdd.innerText = "Adicionar";
        elBtnAdd.addEventListener('click', this.addNew.bind(this));
        
        elAddTdActions.append(elBtnAdd);
        elTNewRow.append(elAddTdActions);
        
        elTheader.append(elTheadRow, elTNewRow);

        return elTheader;
    },

    makeGridviewContent() {
        const elTbody = el('tbody',[], { id: 'gridview-tbody' });
        if(!this.data || this.data === null) return elTbody;

        this.data.forEach((d) => {
            const hash = this.getHash();
            const rowId = `reg-${hash}`;
            const elRow = el('tr', [], { id: rowId });
            Object.entries(d).forEach(([p,val]) => {
                const columnType = this.getType(val);
                const tdId = `reg-td-${hash}`;
                const inputId = `reg-input-${hash}`;
                
                const elTd = el('td', [], { id: tdId });
                elTd.setAttribute('data-column-type', columnType);
                elTd.setAttribute('data-column-name', p);
                elTd.setAttribute('data-input-id', inputId);
            
                const elInput = el('input', ['form-control', 'form-control-sm'], { id: inputId, type: columnType });
                elInput.value = val;
                
                elTd.append(elInput);
                elRow.append(elTd);
            });

            const elTdActions = el('td', ['text-center']);
            const elBtnCommit = el('button', ['btn', 'btn-success', 'btn-sm', 'w-100']);
            elBtnCommit.innerText = "Commit";
            elBtnCommit.addEventListener('click', () => {
                RegistryComponent.commit(rowId);
            });
        
            elTdActions.append(elBtnCommit);
            elRow.append(elTdActions);
            elTbody.append(elRow);
        });

        return elTbody;
    },

    makeGridview() {
        const elGridRow = el('div', ['row']);
        const elGridCol = el('div', ['col-12', 'table-responsive']);
        const elTable = el('table', ['table', 'table-striped', 'table-bordered', 'align-middle']);
        const elThead = this.makeGridviewHeader();
        const elTbody = this.makeGridviewContent();
        
        elTable.append(elThead, elTbody);
        elGridCol.append(elTable);
        elGridRow.append(elGridCol);

        return elGridRow;
    },

    // Ação para criar um novo registro (Disparada pela linha 1)
    async handleCreateRecord(data) {
        if (!data || data === null) throw { stack: 'handleCreateRecord', message_error: `Invalid "data" eq. null.` };

        this.data.push(data);
        this.database.push(data);
        this.currentRows = [...this.database];
        
        this.render();
    },

    // Ação de salvamento (Commit de linha individual)
    async handleCommitRecord(record) {
        if (!confirm(`Deseja salvar as alterações do registro ID: ${record.id}?`)) return;
    },
}
