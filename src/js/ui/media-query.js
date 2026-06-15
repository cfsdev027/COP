const mediaQuery = window.matchMedia('(max-width: 768px)');

function handleTrigger(e) {
    // e.matches será true se a tela atender ao requisito
    if (e.matches) {
        console.log("Trigger disparado: A tela atingiu 768px ou menos!");
        // Execute seu código Javascript aqui (ex: fechar um menu, mudar um layout)
    } else {
        console.log("A tela está maior que 768px.");
        // Código opcional para quando a tela aumentar
    }
}

// 1. Executa a função logo que a página carrega para verificar o estado inicial
handleTrigger(mediaQuery);

// 2. Adiciona o listener para escutar as mudanças de tamanho de tela de forma performática
mediaQuery.addEventListener('change', handleTrigger);
