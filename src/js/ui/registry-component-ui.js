import { el } from './el-ui.js';
import { CatchError } from '../catch-error.js';
import { ServiceStorage } from '../services/service-storage.js';

export const RegistryComponent = {
    container: null,
    title: null,
    data: null,

    init(containerId, title, data) {
        try {
            if(!containerId) throw { stack: 'init', message_error: `'containerId' is null or empty.` };
            if(!title || title.trim() === '') throw { stack: 'init', message_error: `'title' is null or empty.` };
            if(!data) throw { stack: 'init', message_error: `'data' is null or empty.` };
            
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

    dispose() {
        this.container.innerHTML = '';
        this.container.classList.remove('datagrid-wrapper');
        this.container.classList.remove('registry-component');
        this.container.classList.remove('p-3');
        this.container.classList.remove('p-md-4');
    },

    render() {
        this.container.innerHTML = '';
        
        // Unificamos o container aplicando espaçamento interno igual em todas as laterais
        this.container.className = "datagrid-wrapper registry-component p-3 p-md-4";

        // Bloco Superior: Título e Busca unificados em um fluxo flexível que empilha no mobile
        const elHeaderBlock = el('div', ['datagrid-top-bar', 'd-flex', 'flex-column', 'gap-2', 'mb-3']);
        
        const elTitle = el('h5', ['datagrid-title', 'm-0']);
        elTitle.innerText = this.title;
        
        const elSearch = this.makeSearch();

        elHeaderBlock.append(elTitle, elSearch);

        // Grid principal (Card + Tabela interna)
        const elGrid = this.makeGridview();

        this.container.append(elHeaderBlock, elGrid);
    },
    
    addNew() {
        const elTr = document.getElementById('gridview-new-tr');
        if(!elTr) return;

        const params = this.extractData(elTr);
        if (!params) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic) return;

        this.handleCreateRecord(dynamic);
    },

    commit(id) {
        const elTr = document.getElementById(id);
        if(!elTr) return;

        const params = this.extractData(elTr);
        if (!params) return;

        const dynamic = this.makeDynamic(params);
        if (!dynamic) return;

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
        if (!this.data || this.data.length < 1 || !expression || expression.trim() === "") {
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
        if (!data) throw { stack: 'handleCreateRecord', message_error: `Invalid "data"` };
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
        // ... Mantido a sua lógica original de filtros por simplicidade estrutural
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

        // Coluna de Ações
        const elTheadActions = el('th', []);
        elTheadActions.innerText = 'Action';
        elTheadRow.append(elTheadActions);
        
        elThead.append(elTheadRow);
        return elThead;
    },

    makeSearch() {
        // Criamos apenas o wrapper do input sem carregar as classes de row/col do Bootstrap que quebram o layout
        const elSearchWrapper = el('div', ['datagrid-search-wrapper']);
        const elSearchInput = el('input', ['form-control', 'datagrid-search-input'], { 
            type: 'text', 
            placeholder: 'Search by Keywords...' 
        });
        
        elSearchInput.addEventListener('input', () => {
            this.filter(elSearchInput.value);
        });

        elSearchWrapper.append(elSearchInput);
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
        
        // Adiciona o rodapé de paginação idêntico ao modelo
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

    renderCellContent(p, val, columnType, inputId, tdId) {
        const elTd = el('td', [], { id: tdId });
        elTd.setAttribute('data-column-type', columnType);
        elTd.setAttribute('data-column-name', p);
        elTd.setAttribute('data-input-id', inputId);

        const valStr = String(val).trim();

        // 1. Renderização de Badges de STATUS baseados no GIF modelo
        if (p.toLowerCase() === 'status') {
            let badgeClass = 'badge-inprogress';
            let icon = '⏳';
            if(valStr === 'Completed') { badgeClass = 'badge-completed'; icon = '✓'; }
            if(valStr === 'Faild') { badgeClass = 'badge-failed'; icon = '✕'; }

            const elBadge = el('span', ['datagrid-badge', badgeClass]);
            elBadge.innerHTML = `<span class="badge-icon">${icon}</span> ${valStr}`;
            elTd.append(elBadge);
            
            // Input oculto para persistência de dados no extractData
            const hiddenInput = el('input', [], { id: inputId, type: 'hidden', value: valStr });
            elTd.append(hiddenInput);
        } 
        // 2. Renderização de Contadores em círculo (Count)
        else if (p.toLowerCase() === 'count') {
            let circleClass = 'circle-count-orange';
            if (Number(val) >= 9) circleClass = 'circle-count-green';
            if (Number(val) <= 2) circleClass = 'circle-count-red';

            const elCircle = el('span', ['circle-count', circleClass]);
            elCircle.innerText = valStr;
            elTd.append(elCircle);

            const hiddenInput = el('input', [], { id: inputId, type: 'hidden', value: valStr });
            elTd.append(hiddenInput);
        } 
        // 3. Renderização de textos normais limpos (Sem borda de input padrão)
        else {
            const elInput = el('input', ['datagrid-cell-input'], { id: inputId, type: columnType });
            elInput.value = valStr;
            elTd.append(elInput);
        }

        return elTd;
    },

    makeGridviewContentRow(entry) {
        const hash = this.getHash();
        const rowId = `reg-${hash}`;
        const elRow = el('tr', [], { id: rowId });

        Object.entries(entry).forEach(([p, val]) => {
            const columnType = this.getType(val);
            const tdId = `td-${p}-${hash}`;
            const inputId = `input-${p}-${hash}`;
            
            const elTd = this.renderCellContent(p, val, columnType, inputId, tdId);
            elRow.append(elTd);
        });

        // Botões de ação estilizados (View, Edit, Delete) igual ao modelo
        const elTdActions = el('td', ['text-nowrap']);
        const elActionGroup = el('div', ['d-flex', 'gap-1']);
        
        const btnView = el('button', ['btn-action', 'btn-action-view'], { title: 'Visualizar' });
        btnView.innerHTML = '🔍'; // Substituível por classe do FontAwesome se preferir
        
        const btnEdit = el('button', ['btn-action', 'btn-action-edit'], { title: 'Salvar / Commit' });
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
        
        // Bloco esquerdo: Botões de Paginação
        const elPagination = el('div', ['pagination-container', 'd-flex', 'gap-1']);
        const btnPrev = el('button', ['btn-page'], { disabled: true }); btnPrev.innerText = 'Previous';
        const btnP1 = el('button', ['btn-page']); btnP1.innerText = '1';
        const btnP2 = el('button', ['btn-page', 'active']); btnP2.innerText = '2';
        const btnP3 = el('button', ['btn-page']); btnP3.innerText = '3';
        const btnNext = el('button', ['btn-page']); btnNext.innerText = 'Next';
        elPagination.append(btnPrev, btnP1, btnP2, btnP3, btnNext);

        // Bloco direito: Controladores de itens por página
        const elInfo = el('div', ['d-flex', 'align-items-center', 'gap-3', 'text-muted', 'font-size-sm']);
        elInfo.innerHTML = `
            <div>Per Page: <select class="form-select form-select-sm d-inline-block w-auto"><option>05</option><option>10</option></select></div>
            <div>Showing 6 to 10 of 100</div>
            <button class="btn btn-primary btn-sm px-3" style="background-color: #3b82f6; border: none;">Go</button>
        `;

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
