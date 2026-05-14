import { ENV } from './configurations.js';

export function CatchError(prefix, err) {
        const e = typeof err === 'string' ? err : JSON.stringify(err);
        console.log('[' + prefix + ']: ' + e);
      
        if(ENV === 'dev') {
            alert('[' + prefix + ']: ' + e);
        }
}
