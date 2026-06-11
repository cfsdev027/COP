import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';
import { ServiceStorage } from '../services/service-storage.js';

export const RegistryComponent = {
    container: null,
    title: null,
    model: null,
    schema: null,
    service: null,
    data: null,

    //#region INIT

    async initAsync(containerId, title, model, schema, service) {
        try {
            if(!containerId || containerId === null) throw { stack: 'init', message_error: `'containerId' is null or empty.` };
            if(!title || title === null || title.trim() === '') throw { stack: 'init', message_error: `'title' is null or empty.` };
            if(!model || model === null) throw { stack: 'init', message_error: `'model' is null or empty.` };
            if(!schema || schema === null) throw { stack: 'init', message_error: `'schema' is null or empty.` };
            if(!service || service === null) throw { stack: 'init', message_error: `'service' is null or empty.` };
            
            this.container = document.getElementById(containerId);
            if (!this.container) throw { stack: 'init', message_error: `Missing CONTAINER with id ${containerId}.` };
            
            this.title = title;
            this.model = model;
            this.schema = new schema();
            this.service = service;

            this.data = await this.service.get();
            
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

    //#endregion

    //#region EVENTS

    add() {
        const elTr = document.getElementById('data-registry-row');
        if(!elTr || elTr === null) return;

        const params = this.extractData(elTr);
        if (!params || params === null) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic || dynamic === null) return;

        (async () => {
            const entry = await this.service.addEntry(dynamic);
            if(!entry || entry === null) return;

            this.data.push(entry);
            this.reloadGridviewContent();

            alert(`Registro ${entry.id} adicionado com sucesso.`);
        })(); 
    },

    commit(id) {
        const elTr = document.querySelector(`tr[data-id='${id}']`);
        if(!elTr || elTr === null) return;

        const params = this.extractData(elTr);
        if (!params || params === null) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic || dynamic === null) return;

        (async () => {
            const entry = await this.service.updateEntry(dynamic);
            
            alert(`Registro ${entry.id} atualizado com sucesso.`);
        })(); 
    },

    delete(id) {
        const elTr = document.querySelector(`tr[data-id='${id}']`);
        if(!elTr || elTr === null) return;
        if(!confirm('Deseja realmente deletar o registro?')) return;

        (async () => {
            const entry = await this.service.delete(id);
            this.updateData(entry);
            
            alert(`Registro ${entry.id} deletado com sucesso.`);
        })(); 
    },

    filter: async function(expression) {
        if(!expression || expression === null || expression.trim() === '') {
            this.data = await this.service.get();
        } else {
            this.data = await this.service.fetchByExpression(expression);
        }
        
        this.reloadGridviewContent();
    },

    //#endregion

    //#region MAKE

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

    makeInput(s, p) {
        let elInput = null;

        switch(s.type) {
            case 'select':
                elInput = el('select', ['datagrid-cell-input'], { type: s.type });
                    
                let elOpt = el('option');
                elOpt.value = '';
                elOpt.text = '';

                elInput.append(elOpt);
                    
                if(s.options){
                    s.options.forEach(opt => {
                        elOpt = el('option');
                        elOpt.value = opt.value;
                        elOpt.innerHTML = opt.text;

                        elInput.append(elOpt);
                    });
                }
                    
                break;
            default:
                elInput = el('input', ['datagrid-cell-input'], { type: s.type });
                break;
        }

        if(!s.editable) elInput.disabled = true;

        elInput.setAttribute('data-property-name', p);

        return elInput;
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
        this.appendGridviewContentRows(elTbody);

        return elTbody;
    },

    makeGridviewContentNew() {
        const elRow = el('tr', [], { id: 'data-registry-row' });
        Object.entries(new this.model()).forEach(([p, val]) => {
            const s = this.schema[this.toLowerCamelCase(p)];
            if(!s || s === null) return;

            const elTd = el('td');
            if(!s.display) elTd.style.display = 'none';
            
            elTd.setAttribute('data-column-type', s.type);
            elTd.setAttribute('data-column-name', p);

            const elInput = this.makeInput(s, p);
            
            elTd.append(elInput);
            elRow.append(elTd);
        });

        const elTdActions = el('td', ['text-nowrap', 'datagrid-actions-cell']);
        const elActionGroup = el('div', ['d-flex', 'gap-1']);
        
        const elAdd = el('button', ['btn-action'], { title: 'Adicionar novo registro.' });
        elAdd.innerHTML = '✅';

        elAdd.addEventListener('click', () => this.add());

        elActionGroup.append(elAdd);
        elTdActions.append(elActionGroup);
        elRow.append(elTdActions);

        return elRow;
    },

    makeGridviewContentRows() {
        const rows = [];
        if(!this.data || this.data === null) return rows;

        this.data.forEach((entry) => {
            const elRow = this.makeGridviewContentRow(entry);
            rows.push(elRow);
        });

        return rows;
    },

    makeGridviewContentRow(entry) {
        const elRow = el('tr', []);
        elRow.setAttribute('data-id', entry.id);

        Object.entries(entry).forEach(([p, val]) => {
            const s = this.schema[this.toLowerCamelCase(p)];
            if(!s || s === null) return;
            
            const elTd = el('td');
            elTd.setAttribute('data-column-type', s.type);
            elTd.setAttribute('data-column-name', p);
            if(!s.display) elTd.style.display = 'none';

            const elInput = this.makeInput(s, p);
            elInput.value = val;
            
            elTd.append(elInput);
            elRow.append(elTd);
        });

        const elTdActions = this.makeGridviewContentRowActions(entry);
        elRow.append(elTdActions);

        return elRow;
    },

    makeGridviewContentRowActions(entry) {
        const elTdActions = el('td', ['text-nowrap', 'datagrid-actions-cell']);
        const elActionGroup = el('div', ['d-flex', 'gap-1']);
        
        const btnView = el('button', ['btn-action', 'btn-action-view'], { title: 'Visualizar' });
        btnView.innerHTML = '🔍';
        
        const btnEdit = el('button', ['btn-action', 'btn-action-edit'], { title: 'Salvar' });
        btnEdit.innerHTML = '✏️';
        btnEdit.addEventListener('click', () => this.commit(entry.id));
        
        const btnDelete = el('button', ['btn-action', 'btn-action-delete'], { title: 'Excluir' });
        btnDelete.innerHTML = '🗑️';
        btnDelete.addEventListener('click', () => this.delete(entry.id));

        elActionGroup.append(btnView, btnEdit, btnDelete);
        elTdActions.append(elActionGroup);

        return elTdActions;
    },

    makeGridviewHeader() {
        const elThead = el('thead', ['datagrid-header']);
        const elTheadRow = el('tr', []);

        const elTheadActions = el('th', []);
        const elTheadActionsSpan = el('span', ['sort-icons']);
        elTheadActionsSpan.innerText = 'Actions';

        elTheadActions.append(elTheadActionsSpan);

        const columns = this.makeGridviewHeaderColumns();
        if(!columns || columns === null) {
            elTheadRow.append(elTheadActions);
            elThead.append(elTheadRow);

            return elThead;
        }

        columns.forEach(elColumn => {
            elTheadRow.append(elColumn);
        });
        
        elTheadRow.append(elTheadActions);
        elThead.append(elTheadRow);
        
        return elThead;
    },

    makeGridviewHeaderColumns() {
        const columns = [];
        Object.entries(new this.model()).forEach(([p, val]) => {
            const s = this.schema[this.toLowerCamelCase(p)];
            if(!s || s === null) return;
            
            const elTh = el('th', []);
            const elSpan = el('span', ['sort-icons']);
            elSpan.innerHTML = `${p} ⇅`;
            elTh.append(elSpan);
            
            if(!s.display) elTh.style.display = 'none';
            
            columns.push(elTh);
        });

        return columns;
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

    //#endregion

    //#region AUX

    appendGridviewContentRows(container) {
        container.append(this.makeGridviewContentNew());
        const rows = this.makeGridviewContentRows();
        if (rows && rows.length > 0) {
            rows.forEach(elRow => container.append(elRow));
        }
    },

    extractData(elTr) {
        const data = [];
        const columns = elTr.querySelectorAll('td[data-column-name]');
  
        columns.forEach(td => {
            const prop = td.getAttribute('data-column-name');
            const elInput = td.querySelector('input');
    
            if (elInput) {
                data.push({ property: prop, value: elInput.value });
            }
        });
  
        return data;
    },

    makeDynamic(params) {
        const result = {};
        params.forEach(item => { result[item.property] = item.value; });
        return result;
    },

    reloadGridviewContent() {
        const elTbody = document.getElementById('gridview-tbody');
        if (!elTbody) return;
        elTbody.innerHTML = '';
        
        this.appendGridviewContentRows(elTbody);
    },

    updateData(entry) {
        const elTr = document.querySelector(`tr[data-id='${entry.id}']`);
        if(!elTr || elTr === null) return;

        Object.entries(entry).forEach(([p, val]) => {
            const elTd = elTr.querySelector(`td[data-column-name=${p}]`);
            if(elTd) {
                const elInput = elTd.querySelector('input');
                if(elInput) elInput.value = val;
            }
        });
    },

    toLowerCamelCase(str) {
        if (!str) return '';

        return str
            // Garante que toda a string comece em minúsculo (caso venha algo como 'Document_type')
            .replace(/^([A-Z])/, (match) => match.toLowerCase())
            // Encontra o '_' seguido de uma letra e a transforma em maiúscula
            .replace(/_([a-z0-9])/g, (match, letter) => letter.toUpperCase());
    },

    //#endregion

};
