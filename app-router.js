import {AppSectionController} from './app-section-controller.js';

import {LoginUI} from './login-ui.js';
import {SECTION_LOGIN_ID} from './config-login-ui.js';

export const Router = {
    login: {
        section_id: SECTION_LOGIN_ID,
        init: function() => {
            LoginUI.init();
            AppSectionController.navigateTo(SECTION_LOGIN_ID);
        }
    }
};
