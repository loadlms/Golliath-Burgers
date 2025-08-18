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

    // Carregar cardápio dinamicamente da API
    async function loadCardapioFromAPI() {
        try {
            const response = await fetch('/api/cardapio');
            const data = await response.json();
            
            if (data.success) {
                displayCardapioFromAPI(data.cardapio);
            } else {
                console.error('Erro ao carregar cardápio:', data.message);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            // Se não conseguir carregar da API, mantém o cardápio estático
        }
    }

    // Exibir cardápio carregado da API
    function displayCardapioFromAPI(cardapio) {
        const menuGrid = document.querySelector('.menu-grid');
        if (!menuGrid) return;

        // Separar itens em destaque e normais
        const destaqueItems = cardapio.filter(item => item.destaque);
        const normalItems = cardapio.filter(item => !item.destaque);

        // Limpar o grid atual
        menuGrid.innerHTML = '';

        // Adicionar itens em destaque primeiro
        destaqueItems.forEach(item => {
            const menuItem = createMenuItemElement(item);
            menuGrid.appendChild(menuItem);
        });

        // Adicionar itens normais (serão mostrados quando expandir)
        normalItems.forEach(item => {
            const menuItem = createMenuItemElement(item);
            menuItem.classList.add('additional-menu');
            menuItem.style.display = 'none';
            menuGrid.appendChild(menuItem);
        });

        // Atualizar funcionalidade do botão expandir
        setupExpandButton();
    }

    // Criar elemento HTML para item do menu
    function createMenuItemElement(item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-img">
                <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='img/logoGB.PNG'">
            </div>
            <div class="menu-info">
                <h3>${item.nome}</h3>
                <p>${item.descricao}</p>
                <div class="menu-actions">
                    <span class="price">R$ ${parseFloat(item.preco).toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id}, '${item.nome}', ${item.preco}, '${item.imagem}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        return menuItem;
    }

    // Configurar botão de expandir
    function setupExpandButton() {
        const expandButton = document.getElementById('expand-menu');
        const additionalMenuItems = document.querySelectorAll('.additional-menu');
        
        if (expandButton && additionalMenuItems.length > 0) {
            let isExpanded = false;

            expandButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                isExpanded = !isExpanded;
                
                additionalMenuItems.forEach(item => {
                    if (isExpanded) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.add('show');
                        }, 100 * Array.from(additionalMenuItems).indexOf(item));
                        expandButton.textContent = 'Mostrar Menos';
                    } else {
                        item.classList.remove('show');
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 500);
                        expandButton.textContent = 'Cardápio Completo';
                    }
                });

                if (isExpanded) {
                    const menuSection = document.getElementById('menu');
                    menuSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        } else if (expandButton) {
            // Se não há itens adicionais, esconde o botão
            expandButton.style.display = 'none';
        }
    }

    // Sistema de Carrinho
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Função para adicionar item ao carrinho
    window.addToCart = function(id, nome, preco, imagem) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                nome: nome,
                preco: parseFloat(preco),
                imagem: imagem,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showCartMessage('Item adicionado ao carrinho!');
    };

    // Função para remover item do carrinho
    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    };

    // Função para atualizar quantidade
    window.updateQuantity = function(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            }
        }
    };

    // Função para calcular total do carrinho
    function getCartTotal() {
        return cart.reduce((total, item) => total + (item.preco * item.quantity), 0);
    }

    // Função para atualizar display do carrinho
    function updateCartDisplay() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartIcon = document.getElementById('cart-icon');
        const cartCountMobile = document.querySelector('.cart-count-mobile');
        
        if (cartIcon) {
            cartIcon.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">${cartCount}</span>
            `;
        }
        
        if (cartCountMobile) {
            cartCountMobile.textContent = cartCount;
        }
    }

    // Função para mostrar mensagem do carrinho
    function showCartMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'cart-message';
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '100px';
        messageEl.style.right = '20px';
        messageEl.style.background = '#25d366';
        messageEl.style.color = 'white';
        messageEl.style.padding = '10px 20px';
        messageEl.style.borderRadius = '5px';
        messageEl.style.zIndex = '1000';
        messageEl.style.animation = 'slideIn 0.3s ease';
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 2000);
    }

    // Carregar cardápio quando a página carregar
    loadCardapioFromAPI();
    
    // Carregar informações do site dinamicamente
    loadSiteInfoFromAPI();
    
    // Atualizar display do carrinho
    updateCartDisplay();

    // Listener para detectar mudanças no cardápio
    window.addEventListener('message', function(event) {
        if (event.data.type === 'CARDAPIO_UPDATED') {
            loadCardapioFromAPI();
            loadSiteInfoFromAPI();
        }
    });

    // Verificar mudanças via localStorage
    setInterval(() => {
        const lastUpdate = localStorage.getItem('lastUpdate');
        if (lastUpdate && lastUpdate !== window.lastUpdateCheck) {
            window.lastUpdateCheck = lastUpdate;
            loadCardapioFromAPI();
            loadSiteInfoFromAPI();
        }
    }, 2000); // Verificar a cada 2 segundos

    // Botão de atualização manual
    const refreshButton = document.getElementById('refresh-menu');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            this.style.transform = 'rotate(360deg)';
            loadCardapioFromAPI();
            loadSiteInfoFromAPI();
            
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 1000);
        });
    }

    // Função para carregar informações do site da API
    async function loadSiteInfoFromAPI() {
        try {
            const response = await fetch('/api/siteinfo');
            const data = await response.json();
            
            if (data.success) {
                updateSiteInfo(data.siteInfo);
            }
        } catch (error) {
            console.error('Erro ao carregar informações do site:', error);
        }
    }

    // Atualizar informações do site na página
    function updateSiteInfo(siteInfo) {
        // Atualizar horário de funcionamento
        const horarioElement = document.querySelector('.info-item:nth-child(2) p');
        if (horarioElement && siteInfo.horario_funcionamento) {
            horarioElement.textContent = siteInfo.horario_funcionamento;
        }

        // Atualizar endereço
        const enderecoElement = document.querySelector('.info-item:nth-child(1) p');
        if (enderecoElement && siteInfo.endereco) {
            enderecoElement.textContent = siteInfo.endereco;
        }

        // Atualizar telefone
        const telefoneElement = document.querySelector('.info-item:nth-child(3) p');
        if (telefoneElement && siteInfo.telefone) {
            telefoneElement.textContent = siteInfo.telefone;
        }

        // Atualizar texto sobre nós
        const sobreElement = document.querySelector('.about-text p:first-child');
        if (sobreElement && siteInfo.sobre_texto) {
            sobreElement.textContent = siteInfo.sobre_texto;
        }

        // Atualizar WhatsApp se necessário
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        if (siteInfo.whatsapp) {
            whatsappLinks.forEach(link => {
                link.href = `https://wa.me/${siteInfo.whatsapp}`;
            });
        }
    }



    // Função para abrir carrinho (chamada do header)
    window.openCart = function() {
        window.location.href = 'carrinho.html';
    };











    // Função para mostrar mensagens
    function showMessage(message, type) {
        // Criar elemento de mensagem se não existir
        let messageElement = document.getElementById('global-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'global-message';
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        messageElement.style.display = 'block';

        // Remover mensagem após 5 segundos
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    // Função para abrir carrinho
    window.openCart = function() {
        window.location.href = 'carrinho.html';
    };

    // Funções do menu mobile
    window.toggleMobileMenu = function() {
        const nav = document.getElementById('mobile-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
    };

    window.closeMobileMenu = function() {
        const nav = document.getElementById('mobile-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        nav.classList.remove('active');
        toggle.classList.remove('active');
    };

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        const nav = document.getElementById('mobile-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

    // Fechar menu ao redimensionar janela
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const nav = document.getElementById('mobile-nav');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            nav.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

});