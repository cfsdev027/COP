import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';
import { ServiceStorage } from '../services/service-storage.js';

import {
    GRIDVIEW_HEADER_ID,
    GRIDVIEW_HEADER_TITLE_ID,
    GRIDVIEW_FOOTER_ID,
    GRIDVIEW_PAGINATION_CONTAINER_ID,
    GRIDVIEW_PAGINATION_INFO_ID,
    GRIDVIEW_PAGINATION_INFO_DETAILS_ID,
    GRIDVIEW_PAGINATION_CURREND_PAGE_ID,
    GRIDVIEW_PAGINATION_TOTAL_PAGES_ID,
    GRIDVIEW_PAGINATION_COUNT_ID,
    GRIDVIEW_TR_NEW_ID 
} from '../config/ui/config-registry-component-ui.js';

export const RegistryComponent = {
    container: null,
    title: null,
    model: null,
    schema: null,
    service: null,
    data: null,
    limit: 10,

    //#region DATA

    async setDataAsync(value) {
        this.data = value;
        await this.onSetDataAsync();
    },

    //#endregion

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

            this.render();

            const data = await this.service.get();
            await this.setDataAsync(data);
            
        } catch (err) {
            if (typeof CatchError === 'function') CatchError('RegistryComponent', err);
            else console.error('RegistryComponent Error:', err);
        }
    },

    render() {
        this.container.innerHTML = '';
        this.container.className = "datagrid-wrapper registry-component";

        // Bloco de cabeçalho superior unificado (Título + Busca)
        const elHeaderBlock = el('div', ['datagrid-top-bar'], { id: GRIDVIEW_HEADER_ID});
        
        const elTitle = el('h5', ['datagrid-title'], { id: GRIDVIEW_HEADER_TITLE_ID});
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
        const elTr = document.getElementById(GRIDVIEW_TR_NEW_ID);
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

    async filter(expression) {
        try {
            if(expression) {
                await this.setDataAsync(await this.service.fetchByExpression(expression));
                return;
            }

            await this.setDataAsync(await this.service.get());
        } catch(err) {
            await this.setDataAsync(null);
        }
    },

    async onSetDataAsync() {
        this.makeGridviewWithData();
    },

    pagination(target) {
        const currentPageController = e.currentTarget;
        const activePageController = document.querySelector('.pagination-controller.active');
        if(currentPageController === activePageController) return;

        activePageController.classList.remove('active');
        currentPageController.classList.add('active');

        const index = currentPageController.getAttribute('data-page-index');
        const offset = (index - 1) * this.limit;
        
        this.makeGridviewContentWithData(offset, this.limit);
    },

    //#endregion

    //#region MAKE

    makeGridviewFooter() {
        const elFooter = el('div', ['datagrid-footer', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'gap-3'], { id: GRIDVIEW_FOOTER_ID });
        
        const elPagination = this.makeGridviewFooterPaginationContainer();
        const elInfo = this.makeGridviewFooterPaginationInfo();

        elFooter.append(elPagination, elInfo);
        
        return elFooter;
    },

    makeGridviewFooterWithData(limit = 0) {
        if(limit < 1) limit = this.limit;
        const numberOfPages = this.calculateNumberOfPages(limit);
        
        this.makeGridviewFooterPaginationContainerWithData(numberOfPages, limit);
        this.makeGridviewFooterPaginationInfoWithData(numberOfPages, limit);
        
        return elFooter;
    },

    makeGridviewFooterPaginationContainer() {
        const elPagination = el('div', ['pagination-container', 'd-flex', 'w-100', 'gap-1'], { id: GRIDVIEW_PAGINATION_CONTAINER_ID });

        return elPagination;
    },

    makeGridviewFooterPaginationContainerWithData(numberOfPages, limit) {
        let elPagination = document.getElementById(GRIDVIEW_PAGINATION_CONTAINER_ID);
        if(!elPagination || elPagination === null) return;

        elPagination.innerHTML = '';

        const btnPrev = el('button', ['btn-page'], { disabled: true }); 
        btnPrev.innerText = 'Previous';
        
        elPagination.append(btnPrev);

        const paginationControllers = this.makeGridviewFooterPaginationControllers(numberOfPages);
        paginationControllers.forEach(elPCtr => {
            elPagination.append(elPCtr);
        });

        const btnNext = el('button', ['btn-page']); 
        btnNext.innerText = 'Next';
        
        elPagination.append(btnNext);
    },

    makeGridviewFooterPaginationInfo() {
        const elInfo = el('div', ['pagination-info', 'd-flex', 'align-items-center', 'w-100', 'gap-3', 'text-muted', 'font-size-sm'], { id: GRIDVIEW_PAGINATION_INFO_ID});

        return elInfo;
    },

    makeGridviewFooterPaginationInfoWithData(numberOfPages, limit) {
        const elInfo = document.getElementById(GRIDVIEW_PAGINATION_INFO_ID);
        if(!elInfo || elInfo === null) return;

        elInfo.innerHTML = '';

        const elInfoDetails = el('div', ['gridview-pagination-info-details'], { id: GRIDVIEW_PAGINATION_INFO_DETAILS_ID});
        elInfoDetails.innerHTML = `Showing <span id='${GRIDVIEW_PAGINATION_CURREND_PAGE_ID}'>1</span> to <span id='${GRIDVIEW_PAGINATION_TOTAL_PAGES_ID}'>${numberOfPages}</span> of <span id='${GRIDVIEW_PAGINATION_COUNT_ID}'>${this.data.lenght}</span> entries`;
        
        elInfo.append(elInfoDetails);
    },

    makeGridviewFooterPaginationControllers(numberOfPages) {
        const paginationControllers = [];
        if(numberOfPages === 1) {
            const elPageController = el('button', ['btn-page', 'pagination-controller', 'active']);
            elPageController.setAttribute('data-page-index', 1);
            elPageController.innerText = 1;
            elPageController.disabled = true;
            
            paginationControllers.push(elPageController);
        }
        else {
            for (let i = 1; i <= numberOfPages; i++) {
                const elPageController = el('button', ['btn-page', 'pagination-controller']);
                elPageController.setAttribute('data-page-index', i);
                elPageController.innerText = i;
                
                elPageController.addEventListener('click', (e) => {
                    this.pagination(e);
                });
            
                paginationControllers.push(elPageController);
            }
        }

        return paginationControllers;
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

    makeGridviewWithData() {
        this.makeGridviewContentWithData();
        this.makeGridviewFooterWithData();
    },

    makeGridviewContent() {
        const elTbody = el('tbody', [], { id: 'gridview-tbody' });
        this.appendGridviewContentRows(elTbody);

        return elTbody;
    },

    makeGridviewContentWithData(offset = 0, limit = 0) {
        const elTbody = document.getElementById('gridview-tbody');
        if(!elTbody || elTbody === null) return;
        
        elTbody.innerHTML = '';

        const elGridviewContentNew = this.makeGridviewContentNew();
        elTbody.append(elGridviewContentNew);

        if(limit < 1) limit = this.limit;
        
        const rows = this.makeGridviewContentRows(offset, limit);
        if (rows && rows.length > 0) {
            rows.forEach(elRow => elTbody.append(elRow));
        }
    },

    makeGridviewContentNew() {
        const elRow = el('tr', [], { id: GRIDVIEW_TR_NEW_ID });
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

    makeGridviewContentRows(offset = 0, limit = 10) {
        const rows = [];
        if(!this.data || this.data === null) return rows;

        this.data.slice(offset, limit).forEach((entry) => {
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
            placeholder: `ex: 'column:value' || {column1:value1||column2:value2} ...` 
        });

        const elReload = el('button', ['btn', 'btn-secondary'], { id: 'gridview-reload', role: 'button' });
        const elReloadSpan = el('span', ['d-inline-flex', 'align-items-center', 'gap-1']);
        const elReloadI = el('i', ['bi', 'bi-arrow-clockwise']);

        elReloadSpan.append(elReloadI);
        elReload.append(elReloadSpan);

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

    appendGridviewContentRows(container, offset = 0, limit = 10) {
        const elGridviewContentNew = this.makeGridviewContentNew();
        container.append(elGridviewContentNew);
        
        const rows = this.makeGridviewContentRows(offset, limit);
        if (rows && rows.length > 0) {
            rows.forEach(elRow => container.append(elRow));
        }
    },

    appendGridviewFooterPaginationControllers(elPagination, numberOfPages) {
        const btnPrev = el('button', ['btn-page'], { disabled: true }); 
        btnPrev.innerText = 'Previous';
        
        elPagination.append(btnPrev);

        const paginationControllers = this.makeGridviewFooterPaginationControllers(numberOfPages);
        paginationControllers.forEach(elPCtr => {
            elPagination.append(elPCtr);
        });

        const btnNext = el('button', ['btn-page']); 
        btnNext.innerText = 'Next';
        
        elPagination.append(btnNext);
    },

    calculateNumberOfPages(limit) {
        if (limit < 1) return 1; 
        if(!this.data || this.data === null || this.data.lenght < limit) return 1;
    
        return Math.ceil(this.data.lenght / limit);
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

    reloadGridviewContent(offset = 0, limit = 10) {
        const elTbody = document.getElementById('gridview-tbody');
        if (!elTbody) return;
        elTbody.innerHTML = '';
        
        this.appendGridviewContentRows(elTbody, offset, limit);
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
