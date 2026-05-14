import { ENV } from './configurations.js';
import { SIDEBAR_ID, SIDEBAR_NAV_ID } from './config-sidebar-ui.js';
import { CatchError } from './catch-error.js';
import { el } from './el-ui.js';
import { AppRouter } from './app-router.js';
import { ServiceAuthentication } from './service-authentication.js';

export const SidebarUI = {
    container: document.getElementById(SIDEBAR_ID),
    auth: ServiceAuthentication.get_auth(),
    options: [],
    
    init(options = []) {
        try {
            this.options = options;
            if (!this.container) throw { stack: 'init', message_error: 'Missing CONTAINER.' };
            this.render();
            setTimeout(() => this.dataInit(), 100);
        } catch (err) {
            if(typeof CatchError === 'function')
                CatchError('SidebarUI', err);
        }
    },

    makeSidebarHeader() {
        const elSidebarHeader = el('div',['sidebar-header']);
        
        const elLogoIcon = el('i',['bi','bi-gear-fill','logo-icon']);
        const elLogoText = el('span',['logo-text']);
        elLogoText.innerHTML = 'OP-Control';

        elSidebarHeader.append(elLogoIcon,elLogoText);

        return elSidebarHeader;
    },

    render() {
        this.container.innerHTML = '';

        if(typeof el !== 'function') throw {
            stack: 'render',
            message_error: 'el is not a function.'
        };

        const elSidebarHeader = this.makeSidebarHeader();
        const elSideNavbar = el('nav', [SIDEBAR_NAV_ID], { id: SIDEBAR_NAV_ID });

        this.container.append(elSidebarHeader,elSideNavbar);

        (async () => {
            await this.dataInitAsync();
        })();
    },

    initDataSideNavbar() {
        if(this.options == null || this.options.length < 1)
            return;
        
        const elSideNavbar = document.getElementById(SIDEBAR_NAV_ID);
        elSideNavbar.innerHTML = '';
        
        this.options.ForEach(opt => {
            const elOption = el('button', ['nav-item'], { id: opt.id });
            elOption.onclick = () => opt.action();
            
            const elOptionText = el('i', ['bi', 'bi-briefcase']);
            elOptionText.innerHTML = opt.text;

            elOption.append(elOptionText);
            elSideNavbar.append(elOption);
        });
    },

    async dataInitAsync() {
        this.initDataSideNavbar();
    },
    
};
