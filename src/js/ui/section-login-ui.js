import { SECTION_LOGIN_ID } from './config-login-ui.js';
import { CatchError } from './catch-error.js';
import { el } from './el-ui.js';
import { ServiceAuthentication } from './service-authentication.js';

export const SectionLoginUI = {
    container: document.getElementById(SECTION_LOGIN_ID),

    /**
     * Remove o conteúdo da seção de login
     */
    dispose() {
        if (this.container) {
            this.container.classList.add('d-none');
            this.container.classList.remove('d-flex');
            this.container.classList.remove('justify-content-center');
            this.container.classList.remove('align-items-center');
            this.container.classList.remove('vh-100');
            this.container.innerHTML = '';
        }
    },

    /**
     * Inicializa a renderização do componente
     */
    init() {
        try {
            if (!this.container) throw { stack: 'init', message_error: 'Missing CONTAINER.' };
            this.render();
        } catch (err) {
            if (typeof CatchError === 'function')
                CatchError('SectionLoginUI', err);
        }
    },

    /**
     * Gera o cabeçalho com logo e nome do sistema (Igual à imagem)
     */
    makeHeader() {
        const header = el('div', ['text-center', 'mb-4']);
        
        const logoWrapper = el('div', ['d-flex', 'align-items-center', 'justify-content-center', 'gap-2']);
        const logoIcon = el('i', ['bi', 'bi-gear-fill', 'logo-icon-login'], { style: 'font-size: 2.5rem; color: #1e293b;' });
        const logoText = el('span', ['logo-text-login'], { style: 'font-size: 2.2rem; font-weight: 800; color: #1e293b;' });
        logoText.innerHTML = 'OP-Control';

        logoWrapper.append(logoIcon, logoText);
        header.append(logoWrapper);
        
        return header;
    },

    /**
     * Gera um grupo de input com label e ícone interno (Conforme referência)
     */
    makeInputGroup(label, id, type, placeholder, iconClass) {
        const group = el('div', ['mb-3', 'text-start']);
        
        const labelEl = el('label', ['form-label', 'fw-bold', 'mb-1'], { for: id });
        labelEl.style.color = '#1e293b';
        labelEl.textContent = label;

        const wrapper = el('div', ['input-group', 'border', 'rounded-3', 'overflow-hidden']);
        wrapper.style.backgroundColor = '#f1f5f9';

        const iconSpan = el('span', ['input-group-text', 'border-0', 'bg-transparent', 'text-muted']);
        iconSpan.innerHTML = `<i class="bi ${iconClass}"></i>`;

        const input = el('input', ['form-control', 'border-0', 'bg-transparent', 'py-2'], {
            id: id,
            type: type,
            placeholder: placeholder,
            required: true
        });
        input.style.boxShadow = 'none';

        wrapper.append(iconSpan, input);
        group.append(labelEl, wrapper);
        
        return group;
    },

    /**
     * Renderiza o Card de Login completo
     */
    render() {
        this.container.innerHTML = '';
        this.container.classList.remove('d-none');
        this.container.classList.add('d-flex');
        this.container.classList.add('justify-content-center');
        this.container.classList.add('align-items-center');
        this.container.classList.add('vh-100');

        // Cria o Card branco central
        const card = el('div', ['card', 'border-0', 'shadow-lg', 'p-4', 'p-md-5']);
        card.style.width = '100%';
        card.style.borderRadius = '16px';

        const form = el('form', ['d-grid']);
        
        const userInput = this.makeInputGroup('Usuário', 'username-input', 'text', 'Seu usuário', 'bi-person');
        const passInput = this.makeInputGroup('Senha', 'password-input', 'password', '••••••••', 'bi-lock');

        const btnSubmit = el('button', ['btn', 'fw-bold', 'text-uppercase', 'py-3', 'mt-3'], { type: 'submit' });
        btnSubmit.style.backgroundColor = '#1e293b';
        btnSubmit.style.color = '#ffffff';
        btnSubmit.style.borderRadius = '8px';
        btnSubmit.innerHTML = 'Entrar <i class="bi bi-arrow-right-short"></i>';

        const forgotPass = el('div', ['text-end', 'mt-3']);
        const forgotLink = el('a', ['text-decoration-underline', 'text-muted', 'small'], { href: '#' });
        forgotLink.textContent = 'Esqueci a Senha?';
        forgotPass.append(forgotLink);

        // Evento de submissão
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleLogin();
        };

        form.append(userInput, passInput, btnSubmit, forgotPass);
        card.append(this.makeHeader(), form);
        
        this.container.append(card);
    },

    /**
     * Lógica de autenticação
     */
    async handleLogin() {
        const user = document.getElementById('username-input').value;
        const pass = document.getElementById('password-input').value;

        try {
            const success = await ServiceAuthentication.authenticate(user, pass);
            if (success) {
                window.location.reload();
            } else {
                alert('Usuário ou senha inválidos.');
            }
        } catch (err) {
            CatchError('SectionLoginUI.handleLogin', err);
        }
    }
};
