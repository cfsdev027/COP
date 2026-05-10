import {LoginUI} from './login-ui.js';

export const AppSectionController = {
    currentActiveSection = function() {
        try {
            return document.querySelector('.section-base.active');
        } catch(err) {
            console.log('[AppSectionController.currentActiveSection] ' + err.message);
            return null;
        }
    },
    navigateTo: function(targetId, callback) {
        try {
            const nextSection = document.getElementById(targetId);
            if (!nextSection || nextSection === currentActiveSection) return;
    
            if (currentActiveSection) {
                currentActiveSection.classList.remove('active');
            }
    
            nextSection.classList.add('active');
            currentActiveSection = nextSection;

            if(typeof callbac === 'function')
                callback();
        } catch(err) {
                console.log('[AppSectionController.navigateTo] ' + err.message);
        }
    }
}
