import {
    SECTION_DASHBOARD_ID,
    SECTION_DASHBOARD_SIDEBAR_ID,
    SECTION_DASHBOARD_SBMC_ID
} from '../config/ui/config-dashboard-ui.js';

import {el} from './el-ui.js';
import {ENV} from '../config/configurations.js';
import {AppRouter} from '../app-router.js';
import {CatchError} from '../catch-error.js';
import {ServiceAuthentication} from '../services/service-authentication.js';

export const DashboardUI = {
    section: document.getElementById(SECTION_DASHBOARD_ID),
    auth: ServiceAuthentication.get_auth(),
    config: {
        ops: [
            {
                color: '#8FB31D', // Citron Green
                label: 'concluídas/Finalizadas:',
                value: 193
            },
            {
                color: '#B83C08', // Ginger Red
                label: 'Em Atraso:',
                value: 12
            },
            {
                color: '#FFEF00', // Canary yellow
                label: 'Em Produção:',
                value: 56
            },
            {
                color: '#3B2F2F', // Dark Coffe
                label: 'Inativas:',
                value: 1
            }
        ],
        steps: [
            {
                order: 1,
                color: '#FF0000', // Vermelho
                label: 'Fabricação',
                description: 'Calandragem e confecção do corpo do tanque.',
                value: 5
            },
            {
                order: 2,
                color: '#CC2244', // Carmim
                label: 'Montagem/Fabricação - 1',
                description: 'Construção do corpo do tanque com quebra-ondas e anteparos (tanque vertical).',
                value: 7
            },
            {
                order: 3,
                color: '#883388', // Roxo
                label: 'Solda - 1',
                description: 'Solda do corpo do tanque com quebra-ondas e anteparos (tanque horizontal).',
                value: 11
            },
            {
                order: 4,
                color: '#4444CC', // Azul escuro
                label: 'Montagem/Fabricação - 2',
                description: 'Fabricação e instalação de berço, chapa de reforço, sobrechassis, escada, corrimão, fundo do tanque e itens auxiliares.',
                value: 1
            },
            {
                order: 5,
                color: '#0066FF', // Azul Royal
                label: 'Solda - 2',
                description: 'Solda dos componentes do tanque (berço, chapa de reforço, sobrechassis, escada, corrimão, fundo do tanque e itens auxiliares).',
                value: 3
            },
            {
                order: 6,
                color: '#0099FF', // Azul céu
                label: 'Teste/Ensaio - 1',
                description: 'Relatório de ensaio de pressão (Pneumático).',
                value: 11
            },
            {
                order: 7,
                color: '#00BBCC', // Ciano
                label: 'Pintura',
                description: 'Preparação e pintura geral.',
                value: 13
            },
            {
                order: 8,
                color: '#00CC88', // Verde menta
                label: 'Instalação',
                description: 'Montagem do tanque no veículo.',
                value: 1
            },
            {
                order: 9,
                color: '#00AA44', // Verde bandeira
                label: 'Teste/Ensaio - 2',
                description: 'Relatório de ensaio de estanqueidade.',
                value: 11
            },
            {
                order: 10,
                color: '#00FF00', // Verde lima
                label: 'Checklist (checkout)',
                description: 'Validação e conferência para checkout da OP.',
                value: 9
            },
        ]
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
            CatchError('DashboardUI', err);
        }
    },
    
    render() {
        this.section.innerHTML = '';

        const gridOpStatus = el('div', ['grid-metrics', 'grid-op-status'], { id: 'grid-op-status' });
        const gridEtapasDispatch = el('div', ['grid-metrics', 'grid-etapas-dispatch'], { id: 'grid-etapas-dispatch' });

        this.section.append(gridOpStatus);
        this.section.append(gridEtapasDispatch);

        (async () => {
            await this.initDataAsync();
        })();
    },

    async initDataOpStatusAsync() {
        const metricsContainer = document.getElementById('grid-op-status');
        if (metricsContainer) {
            metricsContainer.innerHTML = '';

            const elMetricsHeader = el('div', ['d-flex', 'w-100']);
            const elMetricsHeaderTitle = el('h2', ['m-3']);
            elMetricsHeaderTitle.innerHTML = 'LINHA DE PRODUÇÃO (OPs)';

            elMetricsHeader.append(elMetricsHeaderTitle);
            metricsContainer.append(elMetricsHeader);
            
            this.config.ops.forEach(m => {
                const card = document.createElement('div');
                card.className = 'card card-op-status';
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
                     <div style="color: ${m.color}; font-size: 1.5rem; font-weight: bold; text-transform: uppercase;">${m.label}</div>
                     <div style="font-size: 1.8rem; font-weight: bold; margin-top: 10px; color: #333;">${m.value}</div>
                `;
                
                metricsContainer.appendChild(card);
            });
        }
    },

    async initDataEtapasDispatcherAsync() {
        const metricsContainer = document.getElementById('grid-etapas-dispatch');
        if (metricsContainer) {
            metricsContainer.innerHTML = '';

            const elMetricsHeader = el('div', ['d-flex', 'w-100']);
            const elMetricsHeaderTitle = el('h3', ['m-3']);
            elMetricsHeaderTitle.innerHTML = 'LINHA DE PRODUÇÃO (ETAPAS)';

            elMetricsHeader.append(elMetricsHeaderTitle);
            metricsContainer.append(elMetricsHeader);
            
            this.config.steps.forEach(m => {
                const card = document.createElement('div');
                card.className = 'card card-etapas-dispatch';
                // Estilização dinâmica baseada no modelo da imagem (faixa de cor no topo)
                card.style.cssText = `
                background: white; 
                padding: 20px; 
                border-radius: 4px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                border-top: 5px solid ${m.color};
                min-width: 180px;
                max-width: 378px;
                overflow-wrap: break-word;
                word-brake: break-word;
            `;

                card.innerHTML = `
                     <div style="color: ${m.color}; font-size: 1.25rem; font-weight: bold; text-transform: uppercase;">${m.order}.&nbsp${m.label}</div>
                     <div style="font-size: 1rem; margin-top: 10px; color: #777;"><strong>Descrição:</strong>&nbsp${m.description}</div>
                     <div style="font-size: 1.25rem; font-weight: bold; margin-top: 10px; color: #333;">OPs (em produção):&nbsp${m.value}</div>
                `;
                
                metricsContainer.appendChild(card);
            });
        }
    },
    
    async initDataAsync() {
        await this.initDataOpStatusAsync();
        await this.initDataEtapasDispatcherAsync();
    },
};
