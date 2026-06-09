import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';
import { ServiceStorage } from '../services/service-storage.js';

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
        this.container.className = "datagrid-wrapper registry-component";

        // Bloco de cabeçalho superior unificado (Título + Busca)
        const elHeaderBlock = el('div', ['datagrid-top-bar']);
        
        const elTitle = el('h5', ['datagrid-title']);
        elTitle.innerText = this.title;
        
        const elSearch = this.makeSearch();
        elHeaderBlock.append(elTitle, elSearch);

        // Bloco do Grid principal (Card + Tabela interna)
        const elGrid = this.makeGridview();

        this.container.append(elHeaderBlock, elGrid);
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
        const elTr = document.getElementById(id);
        if(!elTr || elTr === null) return;

        const params = this.extractData(elTr);
        if (!params || params === null) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic || dynamic === null) return;

        this.handleCommitRecord(dynamic);
    },

    extractData(elTr) {
        const dadosExtraidos = [];
        const celulas = elTr.querySelectorAll('td[data-column-name][data-input-id]');
  
        celulas.forEach(td => {
            const propriedade = td.getAttribute('data-column-name');
            const inputId = td.getAttribute('data-input-id');
            const inputElement = document.getElementById(inputId);
    
            if (inputElement) {
                dadosExtraidos.push({ propriedade, valor: inputElement.value });
            }
        });
  
        return dadosExtraidos;
    },

    filter(expression) {
        if (!this.data || this.data === null || this.data.length < 1 || !expression || expression.trim() === "") {
            this.reloadGridviewContent();
            return;
        }
        this.data = this.data.filter(this.makeFilter(expression));
        this.reloadGridviewContent();
    },

    getHash() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    getType(valor) {
        if (typeof valor === 'boolean' || valor === 'true' || valor === 'false') return 'checkbox';
        return 'text';
    },

    async handleCreateRecord(data) {
        if (!data || data === null) throw { stack: 'handleCreateRecord', message_error: `Invalid "data" eq. null.` };
        this.data.push(data);
        this.render();
    },

    async handleCommitRecord(record) {
        if (!confirm(`Deseja salvar as alterações do registro ID: ${record.id || ''}?`)) return;
    },

    makeDynamic(params) {
        const result = {};
        params.forEach(item => { result[item.propriedade] = item.valor; });
        return result;
    },

    makeFilter(expression) {
        return (objeto) => true; 
    },

    makeGridviewHeader() {
        const elThead = el('thead', ['datagrid-header']);
        const elTheadRow = el('tr', []);
        
        if(!this.data || this.data.length === 0) return elThead;

        Object.entries(this.data[0]).forEach(([p, val]) => {
            const elTh = el('th', []);
            elTh.innerHTML = `${p} <span class="sort-icons">⇅</span>`;
            elTheadRow.append(elTh);
        });

        const elTheadActions = el('th', []);
        elTheadActions.innerText = 'Action';
        elTheadRow.append(elTheadActions);
        
        elThead.append(elTheadRow);
        return elThead;
    },

    makeSearch() {
        const elSearchWrapper = el('div', ['datagrid-search-wrapper']);
        const elSearchGroup = el('div', ['input-group', 'datagrid-search-group']);
        const elSearchInput = el('input', ['form-control', 'datagrid-search-input'], {
            id: 'datagrid-search-input',
            type: 'text', 
            placeholder: 'Search by Keywords...' 
        });
        
        elSearchInput.addEventListener('input', () => {
            this.filter(elSearchInput.value);
        });

        const elReload = el('button', ['btn', 'btn-secondary'], { id: 'gridview-reload', role: 'button' });
        elReload.innerHTML = `
            <span class="d-inline-flex align-items-center gap-1">
                <i class="bi bi-arrow-clockwise"></i>
            </span>
        `;

        elReload.addEventListener('click', () => {
            const elInput = document.getElementById('datagrid-search-input');
            if(!elInput || elInput === null) return;
            
            this.filter(elInput.value);
        });

        elSearchGroup.append(elSearchInput, elReload);
        elSearchWrapper.append(elSearchGroup);
        
        return elSearchWrapper;
    },

    makeGridview() {
        const elCard = el('div', ['card', 'datagrid-card']);
        const elTableResponsive = el('div', ['table-responsive']);
        const elTable = el('table', ['table', 'datagrid-table', 'align-middle', 'm-0']);
        
        const elThead = this.makeGridviewHeader();
        const elTbody = this.makeGridviewContent();
        
        elTable.append(elThead, elTbody);
        elTableResponsive.append(elTable);
        
        const elFooter = this.makeGridviewFooter();
        elCard.append(elTableResponsive, elFooter);
        return elCard;
    },

    makeGridviewContent() {
        const elTbody = el('tbody', [], { id: 'gridview-tbody' });
        if(!this.data) return elTbody;

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

        Object.entries(entry).forEach(([p, val]) => {
            const columnType = this.getType(val);
            const tdId = `reg-td-${hash}`;
            const inputId = `reg-input-${hash}`;
            
            const elTd = el('td', [], { id: tdId });
            elTd.setAttribute('data-column-type', columnType);
            elTd.setAttribute('data-column-name', p);
            elTd.setAttribute('data-input-id', inputId);

            const elInput = el('input', ['datagrid-cell-input'], { id: inputId, type: columnType });
            elInput.value = val;
            
            elTd.append(elInput);
            elRow.append(elTd);
        });

        const elTdActions = el('td', ['text-nowrap', 'datagrid-actions-cell']);
        const elActionGroup = el('div', ['d-flex', 'gap-1']);
        
        const btnView = el('button', ['btn-action', 'btn-action-view'], { title: 'Visualizar' });
        btnView.innerHTML = '🔍';
        
        const btnEdit = el('button', ['btn-action', 'btn-action-edit'], { title: 'Salvar' });
        btnEdit.innerHTML = '✏️';
        btnEdit.addEventListener('click', () => this.commit(rowId));
        
        const btnDelete = el('button', ['btn-action', 'btn-action-delete'], { title: 'Excluir' });
        btnDelete.innerHTML = '🗑️';

        elActionGroup.append(btnView, btnEdit, btnDelete);
        elTdActions.append(elActionGroup);
        elRow.append(elTdActions);

        return elRow;
    },

    makeGridviewFooter() {
        const elFooter = el('div', ['datagrid-footer', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'gap-3']);
        
        const elPagination = el('div', ['pagination-container', 'd-flex', 'gap-1']);
        const btnPrev = el('button', ['btn-page'], { disabled: true }); btnPrev.innerText = 'Previous';
        const btnP1 = el('button', ['btn-page']); btnP1.innerText = '1';
        const btnP2 = el('button', ['btn-page', 'active']); btnP2.innerText = '2';
        const btnP3 = el('button', ['btn-page']); btnP3.innerText = '3';
        const btnNext = el('button', ['btn-page']); btnNext.innerText = 'Next';
        elPagination.append(btnPrev, btnP1, btnP2, btnP3, btnNext);

        const elInfo = el('div', ['d-flex', 'align-items-center', 'gap-3', 'text-muted', 'font-size-sm']);
        elInfo.innerHTML = `<div>Showing 1 to 2 of 2 entries</div>`;

        elFooter.append(elPagination, elInfo);
        return elFooter;
    },

    reloadGridviewContent() {
        const elTbody = document.getElementById('gridview-tbody');
        if (!elTbody) return;
        elTbody.innerHTML = '';
        if(!this.data) return;

        this.data.forEach((entry) => {
            const elRow = this.makeGridviewContentRow(entry);
            elTbody.append(elRow);
        });
    }
};
