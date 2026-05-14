(function() {
    const scriptSrc = './app.js';
    
    // 1. Localiza e remove instâncias existentes do módulo
    const existingScripts = document.querySelectorAll(`script[src="${scriptSrc}"]`);
    existingScripts.forEach(script => {
        script.remove();
        console.log(`Módulo antigo removido: ${scriptSrc}`);
    });

    // 2. Cria e injeta a nova instância do módulo
    const newScript = document.createElement('script');
    newScript.type = 'module';
    newScript.src = `${scriptSrc}?t=${Date.now()}`; // Query string para evitar cache
    
    document.head.appendChild(newScript);
    console.log(`Novo módulo injetado: ${scriptSrc}`);
})();
