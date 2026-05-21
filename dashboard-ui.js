import {
    SECTION_DASHBOARD_ID,
    SECTION_DASHBOARD_SIDEBAR_ID,
    SECTION_DASHBOARD_SBMC_ID
} from './config-dashboard-ui.js';

import {ENV} from './configurations.js';
import {AppRouter} from './app-router.js';
import {CatchError} from './catch-error.js';
import {ServiceAuthentication} from './service-authentication.js';

export const DashboardUI = {
    section: document.getElementById(SECTION_DASHBOARD_ID),
    auth: ServiceAuthentication.get_auth(),
    
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

        // Grid de Métricas
        const gridMetrics = document.createElement('div');
        gridMetrics.className = 'grid-metrics';
        gridMetrics.id = 'metrics-container';

        this.section.append(gridMetrics);

        (async () => {
            await this.initDataAsync();
        })();
    },

    async initMetricsAsync() {
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
    },
    
    async initDataAsync() {
        await this.initMetricsAsync();
    }
};
