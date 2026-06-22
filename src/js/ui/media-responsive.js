// 1. Defina as mídias e as classes que deseja gerenciar
const breakpoints = {
    // Exemplo: se a tela for menor que 768px, aplica 'is-mobile'
    mobile: {
        query: '(max-max-width: 767px)',
        className: 'is-mobile'
    },
    // Exemplo: se a tela for maior ou igual a 1024px, aplica 'is-desktop'
    desktop: {
        query: '(min-width: 1024px)',
        className: 'is-desktop'
    }
};

// 2. Função que gerencia a aplicação das classes no elemento alvo (ex: body ou um container)
export function handleMediaChange(targetElement, breakpoint) {
    const mediaQueryList = window.matchMedia(breakpoint.query);
    
    // Função interna para adicionar/remover a classe
    const updateClass = (e) => {
        if (e.matches) {
            targetElement.classList.add(breakpoint.className);
        } else {
            targetElement.classList.remove(breakpoint.className);
        }
    };

    // Executa uma vez no carregamento da página
    updateClass(mediaQueryList);

    // Adiciona o listener para mudanças de resolução (moderno + fallback para navegadores antigos)
    if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', updateClass);
    } else {
        mediaQueryList.addListener(updateClass); // Suporte para browsers antigos
    }
}

// 3. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Elemento que vai receber as classes (geralmente o body ou html)
    const target = document.body; 

    // Ativa o monitoramento para cada breakpoint configurado
    Object.values(breakpoints).forEach(bp => {
        handleMediaChange(target, bp);
    });
});
