import {LoginUI} from './login-ui.js';

export const AppSectionController = {
    enable: function(section) {
        switch(section){
            case 'login':
              LoginUI.init();
              break;
            case 'srp':
              break;
          default:
              throw 'Invalid section';
        }
    }
}
