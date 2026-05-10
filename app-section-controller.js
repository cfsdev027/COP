import {SECTION_ACTIVE_CLASSNAME } from './config-sections.js';

export const AppSectionController = {
    currentActiveSection: document.querySelector('.section-base.' + SECTION_ACTIVE_CLASSNAME),
    navigateTo: function(targetId) {
        try {
            const nextSection = document.getElementById(targetId);
            if (!nextSection || nextSection === currentActiveSection) return;
            
            if (currentActiveSection) {
                currentActiveSection.classList.remove(SECTION_ACTIVE_CLASSNAME);
            }
    
            nextSection.classList.add(SECTION_ACTIVE_CLASSNAME);
            currentActiveSection = nextSection;
        } catch(err) {
                console.log('[AppSectionController.navigateTo] ' + err.message);
        }
    }
}
