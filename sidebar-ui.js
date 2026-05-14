import { ENV } from './configurations.js';
import { SIDEBAR_ID, SIDEBAR_NAV_ID } from './config-sidebar-ui.js';
import { CatchError } from './catch-error.js';
import { AppRouter } from './app-router.js';
import { ServiceAuthentication } from './service-authentication.js';

export const SidebarUI = {
    section: document.getElementById(SIDEBAR_ID),
    auth: ServiceAuthentication.get_auth(),
    options: [],
    
    init(options = []) {
        try {
            this.options = options;
            if (!this.section) throw { stack: 'init', message_error: 'Missing SECTION.' };
            this.render();
            setTimeout(() => this.dataInit(), 100);
        } catch (err) {
            if(typeof CatchError === 'function')
                CatchError(err);
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

    makeSidebarHeader() {
        const elSidebarHeader = this.el('div',['sidebar-header']);
        
        const elLogoIcon = this.el('i',['bi','bi-gear-fill','logo-icon']);
        const elLogoText = this.el('span',['logo-text']);
        elLogoText.innerHTML = 'OP-Control';

        elSidebarHeader.append(elLogoIcon,elLogoText);

        return elSidebarHeader;
    },

    render() {
        this.section.innerHTML = '';

        const elSidebarHeader = this.makeSidebarHeader();
        const elSideNavbar = this.el('nav', [SIDEBAR_NAV_ID], { id: SIDEBAR_NAV_ID });

        this.section.append(elSidebarHeader,elSideNavbar);

        (async () => {
            await this.dataInitAsync();
        })();
    },

    initDataSideNavbar() {
        if(this.options == null || this.options.length < 1)
            return;
        
        const elSideNavbar = document.getElementById(SIDEBAR_NAV_ID);
        this.options.ForEach(opt => {
            const elOption = this.el('button', ['nav-item'], { id: opt.id });
            elOption.onclick = () => opt.action();
            
            const elOptionText = this.el('i', ['bi', 'bi-briefcase']);
            elOptionText.innerHTML = opt.text;

            elOption.append(elOptionText);
            elSideNavbar.append(elOption);
        });
    },

    async dataInitAsync() {
        this.initDataSideNavbar();
    },
    
};
