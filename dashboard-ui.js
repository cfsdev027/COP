import {
    SECTION_DASHBOARD_ID,
    SECTION_DASHBOARD_SIDEBAR_ID
} from './config-dashboard-ui.js';
import {ENV} from './configurations.js';
import {ServiceAuthentication} from './service-authentication.js';

export const DashboardUI = {
    section: document.getElementById(SECTION_DASHBOARD_ID),
    auth: ServiceAuthentication.get_auth(),
    is_auth() {
        return (this.auth !== null && this.auth !== undefined);
    },
    init() {
        try {
            if (this.section) {
                this.render();
            } else {
                throw 'Missing dashboard section.';
            }
        } catch(err) {
            if(ENV === 'dev') alert('[DASHBOARD_init_error]: ' + JSON.stringify(err));
        }
    },

    render() {
        this.section.innerHTML = '';

        if(ENV === 'dev') alert('[DASHBOARD_render]: rendering(sidebar).');

        // 1. Criar o Sidebar (Aside)
        const aside = document.createElement('aside');
        aside.id = SECTION_DASHBOARD_SIDEBAR_ID;

        const brand = document.createElement('div');
        brand.style.cssText = 'padding: 0 20px 20px; font-weight: bold; color: var(--accent);';
        brand.textContent = 'PROJETO COP';

        const nav = document.createElement('nav');
        nav.id = SECTION_DASHBOARD_SBMC_ID;

        aside.append(brand, nav);

        if(ENV === 'dev') alert('[DASHBOARD_render]: rendering(dashboard-container).');

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

        if(ENV === 'dev') alert('[DASHBOARD_render]: rendering(metrics).');

        // Grid de Métricas
        const gridMetrics = document.createElement('div');
        gridMetrics.className = 'grid-metrics';
        gridMetrics.id = 'metrics-container';

        dashDiv.append(dashHeader, gridMetrics);

        // 3. Injetar no Container Principal
         this.section.append(aside, dashDiv);

        // Inicializa o conteúdo baseado na role inicial
        this.initDashboard();
    },
    /**
     * Inicializa e atualiza os componentes do Dashboard baseado no perfil do usuário.
     * @param {string} role - O nível de acesso ('admin' ou 'default')
     */
    initDashboard() {
        if(ENV === 'dev') alert('[DASHBOARD_init_dashboard]: rendering.');

        if (this.auth == null) throw 'Missing authentication.';
        if (this.auth.role == null) throw 'Missing authentication role.';
        
        // 1. Definição das configurações de UI por perfil
        const uiConfig = {
            admin: {
                menu: [{
                        label: 'Cadastro Usuários',
                        icon: '👤'
                    },
                    {
                        label: 'Ordens de Produção',
                        icon: '🏭'
                    },
                    {
                        label: 'Auditoria de Ordens',
                        icon: '🔍'
                    },
                    {
                        label: 'Relatórios do Sistema',
                        icon: '📈'
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
            default: {
                menu: [{
                        label: 'Jornada de Trabalho',
                        icon: '⏱️'
                    },
                    {
                        label: 'Espelho de Ponto',
                        icon: '📅'
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

        if(ENV === 'dev') alert('[DASHBOARD_init_dashboard]: rendering(config).');
        
        const config = uiConfig[this.auth.role] || uiConfig['default'];
        if (config == null) throw 'Missing configuration for role: ' + this.auth.role;
        if (config.menu == null) throw 'Missing configuration menu for role: ' + this.auth.role;
        if (config.metrics == null) throw 'Missing configuration metrics for role: ' + this.auth.role;
        
        // 2. Atualizar o Menu Lateral
        if(ENV === 'dev') alert('[DASHBOARD_init_dashboard]: rendering(update-sidemenu).');
        const menuContainer = document.getElementById(SECTION_DASHBOARD_SBMC_ID);
        if (menuContainer) {
            menuContainer.innerHTML = ''; // Limpa o menu atual
            config.menu.forEach(item => {
                const navItem = document.createElement('div');
                navItem.className = 'nav-item';
                navItem.style.cssText = 'padding: 15px 20px; cursor: pointer; border-bottom: 1px solid #333; color: #ccc;';
                navItem.innerHTML = `<span>${item.icon}</span> <span style="margin-left: 10px;">${item.label}</span>`;

                // Exemplo de feedback visual ao clicar
                navItem.onclick = () => console.log(`Acessando: ${item.label}`);

                menuContainer.appendChild(navItem);
            });
        }

        // 3. Atualizar os Cards de Métricas (Grid)
        if(ENV === 'dev') alert('[DASHBOARD_init_dashboard]: rendering(update-metrics).');
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
        if(ENV === 'dev') alert('[DASHBOARD_init_dashboard]: rendering(update-title).');
        const greeting = document.getElementById('user-greeting');
        if (greeting) {
            greeting.textContent = role === 'admin' ? 'Painel Administrativo' : 'Área do Colaborador';
        }
    }
};
