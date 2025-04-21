// Script para animar elementos quando eles entram no viewport
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Debug log

    // Smooth scroll para links de navegação
    const headerNavLinks = document.querySelectorAll('header nav a[href^="#"]');
    const footerLinks = document.querySelectorAll('footer .footer-links a[href^="#"]');
    
    const smoothScroll = function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 90,
                behavior: 'smooth'
            });
        }
    };
    
    headerNavLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    footerLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
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

    // Smooth scroll for hero CTA button
    const heroCTA = document.querySelector('.hero-content .cta-button');
    if (heroCTA) {
        heroCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Menu expansion functionality
    const expandButton = document.getElementById('expand-menu');
    console.log('Expand button:', expandButton);

    if (expandButton) {
        const additionalMenuItems = document.querySelectorAll('.additional-menu');
        console.log('Additional menu items:', additionalMenuItems.length);
        
        let isExpanded = false;

        expandButton.addEventListener('click', function(e) {
            console.log('Button clicked');
            e.preventDefault();
            
            isExpanded = !isExpanded;
            
            additionalMenuItems.forEach(item => {
                if (isExpanded) {
                    item.style.display = 'block';
                    // Adiciona um pequeno delay para cada item para criar um efeito cascata
                    setTimeout(() => {
                        item.classList.add('show');
                    }, 100 * Array.from(additionalMenuItems).indexOf(item));
                    expandButton.textContent = 'Mostrar Menos';
                } else {
                    item.classList.remove('show');
                    // Espera a animação terminar antes de esconder o elemento
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 500);
                    expandButton.textContent = 'Cardápio Completo';
                }
            });

            // Smooth scroll to the expanded menu
            if (isExpanded) {
                const menuSection = document.getElementById('menu');
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    } else {
        console.error('Expand button not found!');
    }
}); 