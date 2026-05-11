import {
    SECTION_SRP_ID
} from './config-srp-ui.js';
import {ServiceAuthentication} from './service-authentication.js';

export const SrpUI = {
    section: document.getElementById(SECTION_SRP_ID),
    auth: ServiceAuthentication.get_auth(),
    is_auth() {
        return (this.auth !== null && this.auth !== undefined);
    },
    init() {
        if (this.section) {
            this.render();
        }
    },

    render() {
        this.section.innerHTML = '';

        const punchCard = document.createElement('div');
        punchCard.className = 'punch-card';

        // 1. HEADER DO USUÁRIO
        const userHeader = document.createElement('div');
        userHeader.className = 'user-header';

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        
        const userName = document.createElement('div');
        userName.id = 'username-view';
        userName.className = 'user-name username-view';
        userName.innerHTML = this.auth.username;

        const userDoc = document.createElement('div');
        userDoc.id = 'user-doc-view';
        userDoc.className = 'user-doc user-doc-view';

        const documentContainer = document.createElement('div');
        userDoc.className = 'document-container';
      
        const documentTypeView = document.createElement('span');
        documentTypeView.id = 'document-type-view';
        documentTypeView.className = 'document-type-view';
        documentTypeView.innerHTML = this.auth.document_type;

        const documentView = document.createElement('span');
        documentView.id = 'document-view';
        documentView.className = 'document-view';
        documentView.innerHTML = this.auth.document;

        documentContainer.append(documentTypeView, documentView);
        userDoc.append(documentContainer);

        const btnLogout = document.createElement('button');
        btnLogout.className = 'btn-logout';
        btnLogout.innerHTML = '<i class="bi bi-box-arrow-right"></i> Sair';
        btnLogout.onclick = () => this.btnLogoutOnClick();

        userInfo.append(userName, userDoc);
        userHeader.append(userInfo, btnLogout);

        // 2. BOX DE HORÁRIO (RELOGIO)
        const timeBox = document.createElement('div');
        timeBox.className = 'server-time-box';

        const serverTimeTitle = document.createElement('div');
        serverTimeTitle.className = 'server-time-title';
        serverTimeTitle.innerHTML = 'Horário Oficial do Servidor';

        const relogio = document.createElement('div');
        relogio.id = 'relogio';
        relogio.className = 'server-time-clock';

        const dataAtual = document.createElement('div');
        dataAtual.id = 'relogio';
        dataAtual.className = 'server-time-date';

        timeBox.append(serverTimeTitle, relogio, dataAtual);

        // 3. AÇÕES DE PONTO (BOTÕES)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'punch-actions';

        const btnEntrada = this.createPunchButton('btn-entrada', 'btn-entry', 'bi-play-fill', 'Entrada', false);
        btnEntrada.onclick = () => this.btnEntradaOnClick();

        const btnSaida = this.createPunchButton('btn-saida', 'btn-exit', 'bi-stop-fill', 'Saída', true);
        btnSaida.onclick = () => this.btnSaidaOnClick();

        actionsDiv.append(btnEntrada, btnSaida);

        // 4. SEÇÃO DE EVIDÊNCIAS (LOG)
        const evidenceSection = document.createElement('div');
        evidenceSection.className = 'evidence-section';

        const evidenceTitle = document.createElement('div');
        evidenceTitle.className = 'evidence-title';
        evidenceTitle.innerHTML = 'Evidência de Registro (Trilha)';

        const consolePonto = document.createElement('div');
        consolePonto.id = 'console-ponto';
        consolePonto.className = 'terminal-log';

        const placeholderLog = document.createElement('div');
        placeholderLog.id = 'placeholder-log';
        placeholderLog.className = 'placeholder-log';
        placeholderLog.innerHTML = 'Nenhum ponto registrado nesta sessão.';

        consolePonto.append(placeholderLog);
        evidenceSection.append(evidenceTitle, consolePonto);

        // Montagem Final
        punchCard.append(userHeader, timeBox, actionsDiv, evidenceSection);
        this.section.appendChild(punchCard);
        
        // Inicia o relógio após renderizar
        this.startClock();
    },

    createPunchButton(id, extraClass, icon, text, isDisabled) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.className = `btn-punch ${extraClass}`;
        btn.disabled = isDisabled;
        btn.innerHTML = `<i class="bi ${icon}"></i> ${text}`;
        return btn;
    },

    // --- MÉTODOS DE LOGICA E EVENTOS ---

    startClock() {
        const relogio = document.getElementById('relogio');
        const dataView = document.getElementById('data-atual');
        
        const atualizar = () => {
            const agora = new Date();
            if (relogio) relogio.textContent = agora.toLocaleTimeString('pt-BR');
            if (dataView) dataView.textContent = agora.toLocaleDateString('pt-BR', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
        };
        
        setInterval(atualizar, 1000);
        atualizar();
    },

    btnEntradaOnClick() {
        console.log("Registrando Entrada...");
        this.addLog("Entrada registrada às " + new Date().toLocaleTimeString());
        document.getElementById('btn-entrada').disabled = true;
        document.getElementById('btn-saida').disabled = false;
    },

    btnSaidaOnClick() {
        console.log("Registrando Saída...");
        this.addLog("Saída registrada às " + new Date().toLocaleTimeString());
        document.getElementById('btn-saida').disabled = true;
        document.getElementById('btn-entrada').disabled = false;
    },

    btnLogoutOnClick() {
        if(confirm("Deseja realmente sair?")) {
            (async () => {
                let isLogout = await ServiceAuthentication.logout();
                if(!isLogout) {
                    return;
                }

                window.location.reload();
            })();
        }
    },

    addLog(mensagem) {
        const consolePonto = document.getElementById('console-ponto');
        const placeholder = document.getElementById('placeholder-log');
        if (placeholder) placeholder.remove();

        const logEntry = document.createElement('div');
        logEntry.style.fontSize = "0.85rem";
        logEntry.style.borderBottom = "1px solid #e2e8f0";
        logEntry.style.padding = "4px 0";
        logEntry.innerHTML = `<code style="color: #2563eb;">[LOG]</code> ${mensagem}`;
        
        consolePonto.prepend(logEntry);
    }
};
