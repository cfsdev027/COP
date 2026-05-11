import {
    SECTION_LOGIN_ID,
    SECTION_LOGIN_TITLE_ID,
    SECTION_LOGIN_TITLE,
    SECTION_LOGIN_FORM_ID,
    SECTION_LOGIN_FORM_SUBMIT_ID
} from './config-login-ui.js';
import {ServiceAuthentication} from './service-authentication.js';

export const LoginUI = {
    // Referência da Section mapeada no seu HTML
    section: document.getElementById(SECTION_LOGIN_ID),

    init() {
        if (this.section) {
            this.render();
        }
    },

    render() {
        // Limpa a section caso haja conteúdo prévio
        this.section.innerHTML = '';

        // 1. Título
        const headerDiv = document.createElement('div');
        headerDiv.className = 'text-center';
        const h2 = document.createElement('h2');
        h2.id = SECTION_LOGIN_TITLE_ID;
        h2.className = 'login-title';
        h2.textContent = SECTION_LOGIN_TITLE;
        headerDiv.appendChild(h2);

        // 2. Alerta de Erro (Criado em memória para manipulação fácil)
        const alertDiv = this.createAlert();

        // 3. Formulário e seus inputs
        const form = document.createElement('form');
        form.id = SECTION_LOGIN_FORM_ID;
        form.noValidate = true;
        form.className = 'd-grid gap-4';

        const userInput = this.createInputGroup('text', 'username-input', 'Usuário', 'bi-person');
        const passInput = this.createInputGroup('password', 'password-input', 'Senha', 'bi-lock', true);
        
        const btnSubmit = document.createElement('button');
        btnSubmit.id = SECTION_LOGIN_FORM_SUBMIT_ID;
        btnSubmit.type = 'submit';
        btnSubmit.className = 'btn btn-authenticate shadow';
        btnSubmit.textContent = 'Autenticar';

        // --- VINCULANDO EVENTOS ---
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(alertDiv);
        });

        // Montagem final
        form.append(userInput, passInput, btnSubmit);
        this.section.append(headerDiv, alertDiv, form);
    },

    createAlert() {
        const div = document.createElement('div');
        div.id = 'login-erro';
        div.className = 'alert alert-danger rounded-4 mb-4';
        div.role = 'alert';
        div.hidden = true; // Começa escondido
        
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>Usuário ou senha incorretos!</div>
            </div>
        `;
        return div;
    },

    createInputGroup(type, id, placeholder, iconClass, reverse = false) {
        const wrapper = document.createElement('div');
        wrapper.className = `grupo-input-custom ${reverse ? 'flex-row-reverse' : ''}`;

        const iconCapsule = document.createElement('div');
        iconCapsule.className = 'icone-capsula';
        iconCapsule.innerHTML = `<i class="bi ${iconClass}"></i>`;

        const input = document.createElement('input');
        input.type = type;
        input.className = 'input-invisivel';
        input.id = id;
        input.placeholder = placeholder;
        input.required = true;

        wrapper.append(iconCapsule, input);
        return wrapper;
    },

    handleLogin(errorElement) {
        const user = document.getElementById('username-input').value;
        const pass = document.getElementById('password-input').value;

        // Exemplo de lógica de validação
        if (!user || !pass) {
            errorElement.hidden = false;
            return;
        }

        errorElement.hidden = true;

        (async () => {
            let isAuthenticated = await ServiceAuthentication.authenticate(user,pass);
            if(!isAuthenticated) {
                errorElement.hidden = false;
                return;
            }

            window.location.reload();
        })();
    }
};
