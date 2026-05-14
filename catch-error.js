import { ENV } from './configurations.js';

export function CatchError(prefix, err) {
    let e;

    if (err instanceof Error) {
        // Captura a mensagem real do erro (ex: "TypeError: ...")
        e = err.message;
    } else if (typeof err === 'object' && err !== null) {
        // Tenta converter objeto para string, lidando com possíveis falhas
        try {
            e = JSON.stringify(err, Object.getOwnPropertyNames(err));
        } catch {
            e = String(err);
        }
    } else {
        e = String(err);
    }

    console.log(`[${prefix}]:`, err); // No console, passe o objeto puro para inspecionar as propriedades

    if (ENV === 'dev') {
        alert(`[${prefix}]: ${e}`);
    }
}
