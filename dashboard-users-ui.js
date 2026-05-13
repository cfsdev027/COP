import { SECTION_DASHBOARD_USERS_ID } from './config-dashboard-users-ui.js';
import { ENV } from './configurations.js';
import { ServiceAuthentication } from './service-authentication.js';
import { ServiceUsers } from './service-users.js';

export const DashboardUsersUI = {
    section: document.getElementById(SECTION_DASHBOARD_USERS_ID),
    auth: ServiceAuthentication.get_auth(),
    filters: [
        {v: 'none', t: 'Nenhum'},
        {v: 'username', t: 'Usuário'},
        {v: 'document', t: 'Documento'},
        {v: 'role', t: 'Role'},
        {v: 'active', t: 'Ativo'}
    ],
    
    init() {
        try {
            if (!this.section) throw "Missing SECTION";
            this.render();
            // Aumentamos levemente o tempo para garantir o fluxo do navegador
            setTimeout(() => this.dataInit(), 100);
        } catch (err) {
            console.error('[DASHBOARD_init_error]:', err);
        }
    },

    el(tag, classes = [], attrs = {}) {
        const element = document.createElement(tag);
        if (classes.length > 0) {
            classes.forEach(cls => cls && element.classList.add(cls));
        }
        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'textContent') element.textContent = val;
            else if (key === 'innerHTML') element.innerHTML = val;
            else element.setAttribute(key, val);
        }
        return element;
    },
    
    getNavbar() {
        // 'h-auto' garante que a navbar não estique verticalmente
        const navbar = this.el('nav', 
            ['navbar', 'navbar-light', 'bg-white', 'shadow-sm', 'rounded', 'p-3', 'mb-4', 'border', 'h-auto']
        );
        
        const container = this.el('div', ['container-fluid', 'p-0']);
        
        const navbarBrand = this.el('a',['navbar-brand']);
        navbarBrand.innerHTML = 'USUÁRIOS';
        
        const row = this.el('div', ['row', 'g-2', 'w-100', 'm-0', 'align-items-center']);

        const colSelect = this.el('div', ['col-12', 'col-md-3']);
        const select = this.el('select', ['form-select'], { id: 'navbar-filter-select' });
        this.filters.forEach(f => select.append(this.el('option', [], { value: f.v, textContent: f.t })));
        colSelect.append(select);

        const colInput = this.el('div', ['col-12', 'col-md-7']);
        const input = this.el('input', ['form-control'], { 
            id: 'navbar-filter-input', 
            placeholder: 'Pesquisar valor...' 
        });
        
        colInput.append(input);

        const colBtnSearch = this.el('div', ['col-12', 'col-md-2', 'd-grid']);
        const btnSearch = this.el('button', ['btn', 'btn-primary'], { 
            id: 'btnExecuteSearch', 
            textContent: 'Pesquisar' 
        });

        const colBtnAdd = this.el('div', ['col-12', 'col-md-2', 'd-grid']);
        const btnAdd = this.el('button', ['btn', 'btn-primary'], { 
            id: 'btn-user-add', 
            textContent: 'Novo Usuário' 
        });
        
        colBtnSearch.append(btnSearch);
        colBtnAdd.append(btnAdd);
        row.append(colSelect, colInput, colBtnSearch, colBtnAdd);
        container.append(navbarBrand, row);
        navbar.append(container);
        
        return navbar;
    },

    render() {
        this.section.innerHTML = '';
        // Usamos 'd-flex flex-column' para empilhar os elementos corretamente
        const main = this.el('div', ['container-fluid', 'py-4', 'px-3', 'bg-light', 'min-vh-100', 'd-flex', 'flex-column']);

        const navbar = this.getNavbar();
        const gridContent = this.el('div', ['w-100'], { id: 'gridContent' });

        main.append(navbar, gridContent);
        this.section.append(main);
    },

    async dataInit() {
        const btn = document.getElementById('btnExecuteSearch');
        if (!btn) return;

        btn.onclick = async () => {
            const filter = document.getElementById('navbar-filter-select').value;
            const val = document.getElementById('navbar-filter-input').value;
            const users = await this.populateGridWithFilter(filter,val);
            this.populateGrid(users);
        };

        this.populateGrid(await ServiceUsers.get());
    },

    async populateGridWithFilter(filter,value){
        switch(filter){
                case 'username':
                    if(value == null || value === '') return [];
                    return Array.of(await ServiceUsers.fetchByUsername(value));
                case 'document':
                    const params = value.split(':');
                    if(params == null || params.length !== 2) return [];
                    if(params[0].toUpperCase() !== 'CPF' && params[0].toUpperCase() !== 'CNPJ') return [];
                    return Array.of(await ServiceUsers.fetchByDocumentTypeAndDocument(params[0],params[1]));
                case 'role':
                    return await ServiceUsers.fetchByRole(value);
                case 'active':
                    return await ServiceUsers.fetchByActive((value.toLowerCase() === 'true'));
                default:
                    return await ServiceUsers.get();
        }
    },

    populateGrid(users) {
        if (!Array.isArray(users)) throw 'USERS is not array.';
        
        const container = document.getElementById('gridContent');
        if (!container) return;
        container.innerHTML = '';

        const listGroup = this.el('div', ['row', 'g-0']);

        users.forEach(user => {
            const hash = this.simpleHash(user.id);
            
            const col = this.el('div', ['col-12', 'px-0'], { id: 'user-' + hash }); 
            const card = this.el('div', ['card', 'w-100', 'border-0', 'shadow-sm', 'border-start', 'border-primary', 'border-4']);
            const body = this.el('div', ['card-body', 'px-0', 'py-2']);

            const cardInfo = this.getUserCardInfo(user,hash);
            
            const btnEdit = this.el('button', ['btn', 'btn-sm', 'btn-outline-primary', 'w-100'], { textContent: 'Editar' });
            
            body.append(cardInfo,btnEdit);
            card.append(body);
            col.append(card);
            listGroup.append(col);
        });

        container.append(listGroup);
    },

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Converte para um inteiro de 32 bits
        }
        
        // Retorna em base 36 (números + letras minúsculas)
        return Math.abs(hash).toString(36);
    },

    getUserCardInfo(user,hash) {
        const elListGroup = this.el('ul', ['list-group', 'list-group-flush']);

        const elActive = user.active 
            ? this.el('span', ['badge','bg-success','text-white','float-end'])
            : this.el('span', ['badge','bg-danger','text-white','float-end']);

        elActive.id = 'active_' + hash;
        elActive.innerHTML = user.active ? 'ATIVO' : 'INATIVO';

        const itemClasses = ['list-group-item', 'p-1', 'border-0', 'small']; 
        
        const elId = this.el('li', itemClasses);
        
        const elIdLabel = this.el('label');
        elIdLabel.innerHTML = 'ID:&nbsp';
        
        const elIdValue = this.el('span',[], { id: 'id_' + hash, style: 'word-break: break-all;' });
        elIdValue.innerHTML = user.id;
        
        elId.append(elIdLabel, elIdValue);
        
        const elUsername = this.el('li',itemClasses);
        
        const elUsernameLabel = this.el('label');
        elUsernameLabel.innerHTML = 'Username:&nbsp';

        const elUsernameValue = this.el('span', [], { id: 'username_' + hash });
        elUsernameValue.innerHTML = user.username;

        elUsername.append(elActive, elUsernameLabel, elUsernameValue);
        
        const elDocument = this.el('li',itemClasses);
        
        const elDocumentType = this.el('span', [], { id: 'document_type_' + hash });
        elDocumentType.innerHTML = user.document_type;

        const elDocumentSeparator = this.el('span');
        elDocumentSeparator.innerHTML = ':&nbsp';
        
        const elDocumentValue = this.el('span', [], { id: 'document_' + hash});
        elDocumentValue.innerHTML = user.document;

        elDocument.append(elDocumentType, elDocumentSeparator,elDocumentValue);

        const elRole = this.el('li', itemClasses);

        const elRoleLabel = this.el('label');
        elRoleLabel.innerHTML = 'Role:&nbsp';

        const elRoleValue = this.el('span', [], { id: 'role_' + hash });
        elRoleValue.innerHTML = user.role;

        elRole.append(elRoleLabel, elRoleValue);

        elListGroup.append(elUsername,elId,elDocument,elRole);

        return elListGroup;
    }
};
