import {AppSectionController} from './app-section-controller.js';
import {ServiceStorage} from './service-storage.js';

import {SidebarUI} from './sidebar-ui.js';

import {SectionLoginUI} from './section-login-ui.js';
import {SECTION_LOGIN_ID} from './config-login-ui.js';

import {DashboardUI} from './dashboard-ui.js';
import {SECTION_DASHBOARD_ID} from './config-dashboard-ui.js';

import {SectionUsersUI} from './section-users-ui.js';
import {USERS_SECTION_ID} from './config-users-ui.js';

const transition = function(next, id, sidebar_enable = false) {
    const current = ServiceStorage.get('COP-CURRENT-SECTION');
    if(current !== null) {
        disposeSection(current);
    }

    next.init();
    AppSectionController.navigateTo(id);
    sidebarStateControll(sidebar_enable);
    ServiceStorage.set('COP-CURRENT-SECTION', next);
};

const disposeSection = function(current) {
    const dispose = current['dispose'];
    if(typeof dispose === 'function') dispose();
};

const sidebarStateControll = function(enable) {
    const state = ServiceStorage.get('COP-SIDEBAR-STATE');
    if(state !== null) {
        sidebarStateController(state, enable);
    } else {
        sidebarStateController(false, enable);
    }

    ServiceStorage.set('COP-CURRENT-SECTION', enable);
}

const sidebarStateController = function(state, enable) {
    if(!(state) && enable) {
        SidebarUI.init();
    }

    if(state && !(enable)) {
        SidebarUI.dispose();
    }
}

export const AppRouter = {
    login: {
        section_id: SECTION_LOGIN_ID,
        init: function() {
            transition(
                SectionLoginUI, 
                SECTION_LOGIN_ID
            );
        }
    },
    dashboard: {
        section_id: SECTION_DASHBOARD_ID,
        init: function() {
            transition(
                DashboardUI, 
                SECTION_DASHBOARD_ID,
                true
            );
        }
    },
    users: {
        section_id: USERS_SECTION_ID,
        init: function() {
            transition(
                SectionUsersUI, 
                USERS_SECTION_ID,
                true
            );
        }
    },
};
