import {
    SECTION_DASHBOARD_ID,
    SECTION_DASHBOARD_SIDEBAR_ID,
    SECTION_DASHBOARD_SBMC_ID
} from './config-dashboard-ui.js';
import {ENV} from './configurations.js';
import {ServiceAuthentication} from './service-authentication.js';
import {AppRouter} from './app-router.js';

export const DashboardUI = {
    section: document.getElementById(SECTION_DASHBOARD_ID),
    auth: ServiceAuthentication.get_auth(),
    is_auth() {
        return (this.auth !== null && this.auth !== undefined);
    },
    init() {
        try {
            if(SECTION_DASHBOARD_ID == null) 
                throw {stack: 'DashboardUI.init()', error_message: 'Missing SECTION_DASHBOARD_ID'};
            
            if (this.section) {
                this.render();
            } else {
                throw {stack: 'DashboardUI.init()', error_message: 'Missing SECTION'};
            }
        } catch(err) {
            if(ENV !== 'dev') return;
            if(typeof err === 'string'){
                alert('[DASHBOARD_init_error]: ' + err);
            } else {
                alert('[DASHBOARD_init_error]: ' + JSON.stringify(err));
            }
        }
    },
    render() {
        this.section.innerHTML = '';
        
        const userInfoHeader = this.getUserInfoHeader();
        if(userInfoHeader != null) 
            this.section.append(userInfoHeader);

        // 2. Criar o Container do Dashboard
        const dashDiv = document.createElement('div');
        dashDiv.id = 'dashboard';
        dashDiv.className = 'dashboard'; // Corrigido de 'classe' para 'className'

        // Header do Dashboard
        const dashHeader = document.createElement('div');
        dashHeader.className = 'dashboard-header';

        const greeting = document.createElement('h1');
        greeting.id = 'user-greeting';
        greeting.textContent = 'Bem-vindo';

        dashHeader.append(greeting);

        // Grid de Métricas
        const gridMetrics = document.createElement('div');
        gridMetrics.className = 'grid-metrics';
        gridMetrics.id = 'metrics-container';

        dashDiv.append(dashHeader, gridMetrics);

        // 3. Injetar no Container Principal
        this.section.append(dashDiv);

        // Inicializa o conteúdo baseado na role inicial
        this.initDashboard();
    },
    btnLogoutOnClick() {
        if(!confirm("Deseja realmente sair?")) return;

        (async () => {
            let isLogout = await ServiceAuthentication.logout();
            if(!isLogout) {
                return;
            }

            window.location.reload();
        })();
    },
    getUserInfoHeader(){
        const userInfoHeader = document.createElement('div');
        userInfoHeader.id = 'user-info-header';
        userInfoHeader.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 10px 20px; 
            background: #f8f9fa; 
            border-bottom: 1px solid #ddd;
            font-size: 0.9rem;
        `;

        // Container para os dados textuais
        const userData = document.createElement('div');
        userData.innerHTML = `
            <span style="margin-right: 15px;"><strong>Usuário:</strong> <span id="info-username">...</span></span>
            <span style="margin-right: 15px;"><strong><span id="info-doc-type">...</span></strong>:&nbsp<span id="info-doc">...</span></span>
        `;

        // Botão de Logout
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Sair';
        logoutBtn.style.cssText = 'padding: 5px 12px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 4px;';
        logoutBtn.onclick = () => this.btnLogoutOnClick();

        userInfoHeader.append(userData, logoutBtn);

        return userInfoHeader;
    },
    setUserInfoHeader() {
        // Carregamento dos dados do usuário nos elementos do Header
        const elName = document.getElementById('info-username');
        const elDocType = document.getElementById('info-doc-type');
        const elDoc = document.getElementById('info-doc');

        if (elName) elName.textContent = this.auth.username || 'Não informado';
        if (elDocType) elDocType.textContent = this.auth.document_type || 'DOC';
        if (elDoc) elDoc.textContent = this.auth.document || '000.000.000-00';
    },
    initDashboard() {
        if (this.auth == null) throw 'Missing authentication.';
        if (this.auth.role == null) throw 'Missing authentication role.';
        
        // 1. Definição das configurações de UI por perfil
        const uiConfig = {
            ADMIN: {
                menu: [{
                        label: 'Usuários',
                        icon: '👤',
                        on_click: () => AppRouter['dashboard_users'].init()
                    },
                    {
                        label: 'Ordens de Produção (OP)',
                        icon: '🏭',
                        on_click: () => alert('Ordens de Produção (OP)')
                    },
                    {
                        label: 'Jornadas',
                        icon: '🔍',
                        on_click: () => alert('Jornadas')
                    },
                    {
                        label: 'Relatórios',
                        icon: '📈',
                        on_click: () => alert('Relatórios')
                    }
                ],
                metrics: [{
                        label: 'O.P. Pendentes',
                        value: '14',
                        color: '#f39c12'
                    },
                    {
                        label: 'Usuários Ativos',
                        value: '28',
                        color: '#3498db'
                    },
                    {
                        label: 'Alertas de Auditoria',
                        value: '2',
                        color: '#e74c3c'
                    }
                ]
            },
            DEFAULT: {
                menu: [{
                        label: 'Jornadas',
                        icon: '⏱️',
                        on_click: () => alert('Jornadas')
                    },
                    {
                        label: 'Espelho de Ponto',
                        icon: '📅',
                        on_click: () => alert('Espelho de Ponto')
                    }
                ],
                metrics: [{
                        label: 'Horas Registradas',
                        value: '06:45',
                        color: '#2ecc71'
                    },
                    {
                        label: 'Saldo Mensal',
                        value: '+2h 15m',
                        color: '#2ecc71'
                    }
                ]
            }
        };

        this.setUserInfoHeader();

        const config = uiConfig[this.auth.role] || uiConfig['DEFAULT'];
        if (config == null) throw 'Missing configuration for role: ' + this.auth.role;
        if (config.menu == null) throw 'Missing configuration menu for role: ' + this.auth.role;
        if (config.metrics == null) throw 'Missing configuration metrics for role: ' + this.auth.role;
        
        // 2. Atualizar o Menu Lateral
        const menuContainer = document.getElementById(SECTION_DASHBOARD_SBMC_ID);
        if (menuContainer) {
            menuContainer.innerHTML = ''; // Limpa o menu atual
            config.menu.forEach(item => {
                const navItem = document.createElement('div');
                navItem.className = 'nav-item';
                navItem.style.cssText = 'padding: 15px 20px; cursor: pointer; border-bottom: 1px solid #333; color: #ccc;';
                navItem.innerHTML = `<span>${item.icon}</span> <span style="margin-left: 10px;">${item.label}</span>`;

                // Exemplo de feedback visual ao clicar
                navItem.onclick = () => item.on_click();

                menuContainer.appendChild(navItem);
            });
        }

        // 3. Atualizar os Cards de Métricas (Grid)
        const metricsContainer = document.getElementById('metrics-container');
        if (metricsContainer) {
            metricsContainer.innerHTML = ''; // Limpa os cards atuais
            config.metrics.forEach(m => {
                const card = document.createElement('div');
                card.className = 'card';
                // Estilização dinâmica baseada no modelo da imagem (faixa de cor no topo)
                card.style.cssText = `
                background: white; 
                padding: 20px; 
                border-radius: 4px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                border-top: 5px solid ${m.color};
                min-width: 180px;
            `;

                card.innerHTML = `
                <div style="color: #777; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">${m.label}</div>
                <div style="font-size: 1.8rem; font-weight: bold; margin-top: 10px; color: #333;">${m.value}</div>
            `;
                metricsContainer.appendChild(card);
            });
        }

        // 4. Atualizar Título da Página
        const greeting = document.getElementById('user-greeting');
        if (greeting) {
            greeting.textContent = this.auth.role === 'admin' ? 'Painel Administrativo' : 'Área do Colaborador';
        }
    }
};
