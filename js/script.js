// Script para animar elementos quando eles entram no viewport
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 90, // Ajuste para o header fixo
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header com efeito ao rolar
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.padding = '10px 5%';
            header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '15px 5%';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Animação de efeito de queijo derretendo (apenas para demonstração visual)
    const cheeseElement = document.querySelector('.cheese-animation');
    if (cheeseElement) {
        // A animação é controlada pelo CSS, mas poderíamos adicionar efeitos extras aqui
    }
}); 