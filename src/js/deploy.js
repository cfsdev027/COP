(async function() {
    const src = './src/app.js';
    try {
        const current = document.querySelector('script[src="./src/app.js"][type="module"]');
        if (current) current.remove();
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = src;

        console.log('- Build script;');
        
        const body = document.querySelector('body');
        if (body) {
            body.append(script);
        }
        else {
            console.log('Falha no carregamento do script.');
        }
    } catch (err) {
        console.error('Erro ao carregar o módulo:', (typeof err === 'string' ? err : JSON.stringify(err)));
    }
})();
