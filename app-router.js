import {AppSectionController} from './app-section-controller.js';

import {LoginUI} from './login-ui.js';
import {SECTION_LOGIN_ID} from './config-login-ui.js';

export const AppRouter = {
    login: {
        section_id: SECTION_LOGIN_ID,
        init: function() {
            alert('Login');
            LoginUI.init();
            AppSectionController.navigateTo(SECTION_LOGIN_ID);
        }
    }
};
