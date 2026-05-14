(async function() {
    const scriptSrc = './app.js';
    
    console.log('Inicializando deploy...');
    document.querySelectorAll(`script[src*="${scriptSrc}"]`).forEach(s => s.remove());
    console.log('- Delete script;');
    try {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = scriptSrc;

        console.log('- Build script;');
        
        const body = document.querySelector('body');
        if (body) {
            body.append(script);
            console.log('Script carregado com sucesso.');
        }
        else {
            console.log('Falha no carregamento do script.');
        }
    } catch (err) {
        console.error('Erro ao carregar o módulo:', (typeof err === 'string' ? err : JSON.stringify(err)));
    }
})();
