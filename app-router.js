import {AppSectionController} from './app-section-controller.js';

import {SidebarUI} from './sidebar-ui.js';

import {LoginUI} from './login-ui.js';
import {SECTION_LOGIN_ID} from './config-login-ui.js';

import {DashboardUI} from './dashboard-ui.js';
import {SECTION_DASHBOARD_ID} from './config-dashboard-ui.js';

import {DashboardUsersUI} from './dashboard-users-ui.js';
import {SECTION_DASHBOARD_USERS_ID} from './config-dashboard-users-ui.js';

import {SrpUI} from './srp-ui.js';
import {SECTION_SRP_ID} from './config-srp-ui.js';

export const AppRouter = {
    login: {
        section_id: SECTION_LOGIN_ID,
        init: function() {
            SidebarUI.dispose();
            LoginUI.init();
            AppSectionController.navigateTo(SECTION_LOGIN_ID);
        }
    },
    dashboard: {
        section_id: SECTION_DASHBOARD_ID,
        init: function() {
            SidebarUI.init();
            DashboardUI.init();
            AppSectionController.navigateTo(SECTION_DASHBOARD_ID);
        }
    },
    dashboard_users: {
        section_id: SECTION_DASHBOARD_USERS_ID,
        init: function() {
            DashboardUsersUI.init();
            AppSectionController.navigateTo(SECTION_DASHBOARD_USERS_ID);
        }
    },
    srp: {
        section_id: SECTION_SRP_ID,
        init: function() {
            SrpUI.init();
            AppSectionController.navigateTo(SECTION_SRP_ID);
        }
    }
};
