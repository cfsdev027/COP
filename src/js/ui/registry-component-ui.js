import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';
import { ServiceStorage } from '../services/service-storage.js'; // Caso precise persistir estados temporários

export const RegistryComponent = {
    container: null,
    title: null,
    data: null,

    init(containerId, title, data) {
        try {
            if(!containerId || containerId === null) throw { stack: 'init', message_error: `'containerId' is null or empty.` };
            if(!title || title === null || title.trim() === '') throw { stack: 'init', message_error: `'title' is null or empty.` };
            if(!data || data === null) throw { stack: 'init', message_error: `'data' is null or empty.` };
            
            this.container = document.getElementById(containerId);
            if (!this.container) throw { stack: 'init', message_error: `Missing CONTAINER with id ${containerId}.` };
            
            this.title = title;
            this.data = data;
            
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

    extractData(elTr) {
        const dadosExtraidos = [];
  
       const celulas = trElement.querySelectorAll('td[data-column-name][data-input-id]');
  
       celulas.forEach(td => {
           const propriedade = td.getAttribute('data-column-name');
           const inputId = td.getAttribute('data-input-id');
           const inputElement = document.getElementById(inputId);
    
           if (inputElement) {
               const valor = inputElement.value; 
      
               dadosExtraidos.push({ propriedade, valor });
           }
        });
  
        return dadosExtraidos;
    },

    filter(expression) {
        if (!this.data || this.data === null || this.data.length < 1) {
            this.reloadGridviewContent();
            return;
        }

        if (!expression || expression === null || expression.trim() === "") {
            this.reloadGridviewContent();
            return;
        }

        this.data = this.data.filter(this.makeFilter(expression));
        this.reloadGridviewContent();
    },

    getHash() {
        return Date.now().toString(36);
    },

    getType(valor) {
        if (typeof valor === 'boolean' || valor === 'true' || valor === 'false') {
            return 'checkbox';
        }

        if (valor instanceof Date && !isNaN(valor)) {
            return 'data';
        }
  
        if (typeof valor === 'string') {
            if (valor.trim() !== '') {
                const timestamp = Date.parse(valor);
                if (!isNaN(timestamp) && isNaN(Number(valor))) {
                   return 'data';
                }
            }
        
            return 'text';
        }

        return 'text';
    },

    async handleCreateRecord(data) {
        if (!data || data === null) throw { stack: 'handleCreateRecord', message_error: `Invalid "data" eq. null.` };
        
        this.data.push(data);
        this.render();
    },

    async handleCommitRecord(record) {
        if (!confirm(`Deseja salvar as alterações do registro ID: ${record.id}?`)) return;
    },

    makeDynamic(params) {
        const result = {};
        params.forEach(item => {
            result[item.propriedade] = item.valor;
        });
  
        return result;
    },

    makeFilter(expression) {
        if (!this.makeFilterValidateExpression(expression)) return () => true;

        const roles = expressao.split('|').map(group => {
            const regrasAnd = group.split('&').map(regra => {
                const indexSeparador = regra.indexOf(':');
                if (indexSeparador === -1) return null;

                const propriedade = regra.substring(0, indexSeparador).trim();
                const valor = regra.substring(indexSeparador + 1);

                return { propriedade, valor };
            }).filter(Boolean);

            return regrasAnd;
        }).filter(group => group.length > 0);

        return (objeto) => {
            return roles.some(groupAnd => {
                return groupAnd.every(({ propriedade, valor }) => {
                    if (!(propriedade in objeto)) return false;

                    const valorObjeto = objeto[propriedade];
                    if (typeof valorObjeto === 'number') return valorObjeto === Number(valor);
                    if (typeof valorObjeto === 'boolean') return valorObjeto === (valor === 'true');

                    return String(valorObjeto) === valor;
                });
            });
        };
    },

    makeFilterValidateExpression(expression) {
        const regexFiltro = /^[a-zA-Z_][a-zA-Z0-9_]*:[^&|]+([&|][a-zA-Z_][a-zA-Z0-9_]*:[^&|]+)*$/;
        if (!expression || typeof expression !== 'string' || expression.trim() === '') {
            return false;
        }

        return regex.test(expression);
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
            this.filter(elSearchInput.value);
        });

        elSearchCol.append(elSearchInput, elSearchButton);
        elSearchRow.append(elSearchCol);

        return elSearchRow;
    },

    makeGridview() {
        const elGridRow = el('div', ['row']);
        const elGridCol = el('div', ['col-12', 'table-responsive']);
        const elTable = el('table', ['table', 'table-striped', 'table-bordered', 'align-middle']);
        const elThead = this.makeGridviewHeader();
        const elSearch = this.makeSearch();
        const elTbody = this.makeGridviewContent();
        
        elTable.append(elThead, elSearch, elTbody);
        elGridCol.append(elTable);
        elGridRow.append(elGridCol);

        return elGridRow;
    },

    makeGridviewContent() {
        const elTbody = el('tbody',[], { id: 'gridview-tbody' });
        if(!this.data || this.data === null) return elTbody;

        this.data.forEach((entry) => {
            const elRow = this.makeGridviewContentRow(entry);
            elTbody.append(elRow);
        });

        return elTbody;
    },

    makeGridviewContentRow(entry) {
        const hash = this.getHash();
        const rowId = `reg-${hash}`;
        const elRow = el('tr', [], { id: rowId });
        Object.entries(entry).forEach(([p,val]) => {
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

        return elRow;
    },

    reloadGridviewContent() {
        const elTbody = document.getElementById('gridview-tbody');
        if (!elTbody || elTbody === null) return;

        elTbody.innerHTML = '';

        if(!this.data || this.data === null) return;

        this.data.forEach((entry) => {
            const elRow = this.makeGridviewContentRow(entry);
            elTbody.append(elRow);
        });

        return elTbody;
    },
}
