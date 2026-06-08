import {SECTION_ACTIVE_CLASSNAME } from '../config/ui/config-sections.js';

export const AppSectionController = {
    currentActiveSection: function(){
        try {
            const query = '.section-base.' + SECTION_ACTIVE_CLASSNAME;
            return document.querySelector(query);            
        } catch(err) {
            return null;
        }
    },
    navigateTo: function(targetId) {
        try {
            const nextSection = document.getElementById(targetId);
            if (!nextSection) return;

            const activeSection = this.currentActiveSection();
            if (nextSection == activeSection) return;
            
            if (activeSection) {
                activeSection.innerHTML = '';
                activeSection.classList.remove(SECTION_ACTIVE_CLASSNAME);
            }
    
            nextSection.classList.add(SECTION_ACTIVE_CLASSNAME);
        } catch(err) {
            console.log('[AppSectionController.navigateTo] ' + err.message);
        }
    }
}
