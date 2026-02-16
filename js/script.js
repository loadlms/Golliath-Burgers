// Script para animar elementos quando eles entram no viewport
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded'); // Debug log

    // Inicializar controle de atualização
    try {
        window.lastUpdateCheck = localStorage.getItem('lastUpdate') || null;
        console.log('🔧 Inicializado lastUpdateCheck:', window.lastUpdateCheck);
        console.log('🔧 localStorage disponível:', typeof Storage !== 'undefined');
        console.log('🔧 Origem atual:', window.location.origin);
        console.log('🔧 Caminho atual:', window.location.pathname);
    } catch (error) {
        console.error('❌ Erro ao acessar localStorage:', error);
        window.lastUpdateCheck = null;
    }

    // Smooth scroll para links de navegação
    const headerNavLinks = document.querySelectorAll('header nav a[href^="#"]');
    const footerLinks = document.querySelectorAll('footer .footer-links a[href^="#"]');

    const smoothScroll = function (e) {
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

    window.addEventListener('scroll', function () {
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
        heroCTA.addEventListener('click', function (e) {
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
            console.log('Carregando cardápio da API...');
            // Adicionar timestamp para evitar cache
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/cardapio?_t=${timestamp}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Resposta da API:', responseData);

            // Extrair o array do cardápio da resposta
            let cardapioData;
            console.log('🔍 Verificando formato da resposta:', {
                hasCardapio: responseData && responseData.cardapio,
                isCardapioArray: responseData && responseData.cardapio && Array.isArray(responseData.cardapio),
                isResponseArray: Array.isArray(responseData)
            });

            if (responseData && responseData.cardapio && Array.isArray(responseData.cardapio)) {
                console.log('✅ Extraindo cardápio do objeto resposta');
                cardapioData = responseData.cardapio;
            } else if (Array.isArray(responseData)) {
                console.log('✅ Usando resposta diretamente como array');
                cardapioData = responseData;
            } else {
                console.error('❌ Formato de resposta inválido:', responseData);
                throw new Error('Formato de resposta da API inválido');
            }

            console.log('Cardápio extraído com sucesso:', cardapioData);
            console.log('Tipo do cardápio:', typeof cardapioData);
            console.log('É array?', Array.isArray(cardapioData));
            console.log('Número de itens no cardápio:', cardapioData.length);

            // Aplicar overrides locais antes de exibir
            const cardapioWithOverrides = applyLocalOverrides(cardapioData);
            displayCardapioFromAPI(cardapioWithOverrides);
        } catch (error) {
            console.error('Erro ao carregar cardápio:', error);
            // Fallback para dados padrão em caso de erro
            const defaultCardapio = [
                {
                    id: 1,
                    nome: "X BACON DE GOLIATH",
                    descricao: "Burger de 90g, com American Cheese, 2 fatias de bacon, molho especial de Golliath no pão brioche tostado na manteiga.",
                    preco: 25.90,
                    categoria: "hamburguers",
                    imagem: "/img/_MG_0316.jpg",
                    disponivel: true,
                    destaque: true,
                    ordem: 1
                },
                {
                    id: 2,
                    nome: "GOLLIATH TRIPLO P.C.Q",
                    descricao: "3x mais carne, 3x mais queijo. Com 3 Burguers de 90g totalizando 270g de carne, e com fatias de American Cheese, no pão brioche tostado na manteiga.",
                    preco: 32.90,
                    categoria: "hamburguers",
                    imagem: "/img/_MG_0191.jpg",
                    disponivel: true,
                    destaque: true,
                    ordem: 2
                },
                {
                    id: 3,
                    nome: "GOLLIATH TRIPLO BACON",
                    descricao: "3x mais carne, 3x mais queijo e 3x mais bacon. Com 3 Burguers de 90g totalizando 270g de carne, com fatias de American Cheese, 2 fatias de bacon por andar, e molho especial de Golliath no pão brioche tostado na manteiga.",
                    preco: 39.90,
                    categoria: "hamburguers",
                    imagem: "/img/_MG_0309.jpg",
                    disponivel: true,
                    destaque: true,
                    ordem: 3
                },
                {
                    id: 4,
                    nome: "GOLLIATH OKLAHOMA",
                    descricao: "4 burguers de 90g ao estilo Oklahoma, totalizando 360g de blend, com 4 fatias de queijo cheddar, no pão brioche selado na manteiga.",
                    preco: 49.90,
                    categoria: "hamburguers",
                    imagem: "/img/_MG_6201.jpg",
                    disponivel: true,
                    destaque: true,
                    ordem: 4
                }
            ];
            displayCardapioFromAPI(defaultCardapio);
        }
    }

    // Exibir cardápio carregado da API
    function displayCardapioFromAPI(cardapio) {
        console.log('🔍 displayCardapioFromAPI chamada com:', {
            parametro: cardapio,
            tipo: typeof cardapio,
            isArray: Array.isArray(cardapio),
            isNull: cardapio === null,
            isUndefined: cardapio === undefined,
            constructor: cardapio?.constructor?.name
        });

        const menuGrid = document.querySelector('.menu-grid');
        if (!menuGrid) {
            console.error('❌ menuGrid não encontrado, tentando novamente em 100ms...');
            setTimeout(() => {
                displayCardapioFromAPI(cardapio);
            }, 100);
            return;
        }

        // Verificar se cardapio é um array válido
        if (!Array.isArray(cardapio)) {
            console.error('❌ Cardápio não é um array válido:', {
                valor: cardapio,
                tipo: typeof cardapio,
                constructor: cardapio?.constructor?.name
            });
            return;
        }

        // Filtrar apenas itens disponíveis e separar em destaque e normais
        // Se disponivel não estiver definido, considerar como true por padrão
        const availableItems = cardapio.filter(item => (item.disponivel !== false) && (item.isActive !== false));
        console.log('🔍 Itens disponíveis após filtro:', availableItems.length, 'de', cardapio.length);
        const destaqueItems = availableItems.filter(item => item.destaque);
        const normalItems = availableItems.filter(item => !item.destaque);

        // Limpar o grid atual (incluindo mensagem de carregamento)
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

        // Aguardar um pouco para garantir que os elementos foram renderizados
        setTimeout(() => {
            // Configurar event listeners para botões de adicionar ao carrinho
            setupCartButtons();
        }, 100);
    }

    // Criar elemento HTML para item do menu
    function createMenuItemElement(item) {
        console.log('Criando elemento para item:', item.nome);
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
                    <button class="add-to-cart-btn" data-id="${item.id}" data-nome="${item.nome.replace(/"/g, '&quot;')}" data-preco="${item.preco}" data-imagem="${item.imagem.replace(/"/g, '&quot;')}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        console.log('Elemento criado com botão:', menuItem.querySelector('.add-to-cart-btn') ? 'SIM' : 'NÃO');
        return menuItem;
    }

    // Configurar event listeners para botões de adicionar ao carrinho
    function setupCartButtons() {
        console.log('Configurando botões do carrinho...');

        // Verificar se há botões disponíveis
        const buttons = document.querySelectorAll('.add-to-cart-btn');
        console.log('Botões encontrados:', buttons.length);

        document.addEventListener('click', function (e) {
            console.log('Click detectado:', e.target);

            if (e.target.closest('.add-to-cart-btn')) {
                console.log('Click em botão do carrinho detectado');
                const button = e.target.closest('.add-to-cart-btn');

                try {
                    const id = parseInt(button.dataset.id);
                    const nome = button.dataset.nome.replace(/&quot;/g, '"');
                    const preco = parseFloat(button.dataset.preco);
                    const imagem = button.dataset.imagem.replace(/&quot;/g, '"');

                    console.log('Dados do produto:', { id, nome, preco, imagem });

                    if (typeof addToCart === 'function') {
                        addToCart(id, nome, preco, imagem);
                    } else {
                        console.error('Função addToCart não encontrada');
                    }
                } catch (error) {
                    console.error('Erro ao processar click do botão:', error);
                }
            }
        });
    }

    // Configurar botão de expandir
    function setupExpandButton() {
        const expandButton = document.getElementById('expand-menu');
        const additionalMenuItems = document.querySelectorAll('.additional-menu');

        if (expandButton && additionalMenuItems.length > 0) {
            let isExpanded = false;

            expandButton.addEventListener('click', function (e) {
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
    window.addToCart = function (id, nome, preco, imagem) {
        console.log('addToCart chamada com:', { id, nome, preco, imagem });

        try {
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity += 1;
                console.log('Item existente atualizado:', existingItem);
            } else {
                const newItem = {
                    id: id,
                    nome: nome,
                    preco: parseFloat(preco),
                    imagem: imagem,
                    quantity: 1
                };
                cart.push(newItem);
                console.log('Novo item adicionado:', newItem);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Carrinho salvo no localStorage:', cart);

            updateCartDisplay();
            showCartMessage('Item adicionado ao carrinho!');
        } catch (error) {
            console.error('Erro em addToCart:', error);
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

    // Versão do cache para forçar atualização
    const CACHE_VERSION = 'v' + Date.now();
    window.GOLLIATH_CACHE_VERSION = CACHE_VERSION;

    // Log de versão para debug
    console.log('Golliath Burgers - Cache Version:', CACHE_VERSION);

    // Carregar cardápio quando a página carregar
    loadCardapioFromAPI();

    // Carregar informações do site dinamicamente
    loadSiteInfoFromAPI();

    // Atualizar display do carrinho
    updateCartDisplay();

    // Listener para detectar mudanças no cardápio
    window.addEventListener('message', function (event) {
        console.log('📨 Mensagem recebida:', event.data);
        if (event.data.type === 'CARDAPIO_UPDATED') {
            console.log('🔄 Atualizando cardápio após notificação do admin...');
            loadCardapioFromAPI();
            loadSiteInfoFromAPI();
        }
    });

    // Listener para BroadcastChannel
    try {
        const bc = new BroadcastChannel('cardapio-updates');
        bc.addEventListener('message', function (event) {
            console.log('📡 Mensagem recebida via BroadcastChannel:', event.data);
            if (event.data && event.data.type === 'CARDAPIO_UPDATED') {
                console.log('🔄 Atualizando cardápio via BroadcastChannel');
                loadCardapioFromAPI();
                loadSiteInfoFromAPI();
            }
        });
        console.log('📡 BroadcastChannel configurado');
    } catch (error) {
        console.log('⚠️ BroadcastChannel não disponível:', error.message);
    }

    // Verificar mudanças via localStorage e sessionStorage - TEMPORARIAMENTE DESABILITADO
    /*
    setInterval(() => {
        const lastUpdate = localStorage.getItem('lastUpdate');
        const sessionUpdate = sessionStorage.getItem('lastUpdate');
        console.log('🔍 Verificando storages:', { 
            lastUpdate, 
            sessionUpdate,
            previous: window.lastUpdateCheck, 
            changed: (lastUpdate !== window.lastUpdateCheck) || (sessionUpdate !== window.lastUpdateCheck),
            timestamp: new Date().toISOString()
        });
        
        const currentUpdate = sessionUpdate || lastUpdate;
        if (currentUpdate && currentUpdate !== window.lastUpdateCheck) {
            console.log('🔄 Detectada mudança via storage:', { currentUpdate, previous: window.lastUpdateCheck });
            window.lastUpdateCheck = currentUpdate;
            loadCardapioFromAPI();
            loadSiteInfoFromAPI();
        }
    }, 3000); // Verificar a cada 3 segundos
    */

    // Botão de atualização manual
    const refreshButton = document.getElementById('refresh-menu');
    if (refreshButton) {
        refreshButton.addEventListener('click', function () {
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
            console.log('Carregando informações do site da API...');
            // Adicionar cache-busting para garantir dados atualizados
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/siteinfo?_t=${timestamp}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const siteInfo = await response.json();
            console.log('Informações do site carregadas com sucesso:', siteInfo);
            updateSiteInfo(siteInfo);
        } catch (error) {
            console.error('Erro ao carregar informações do site:', error);
            // Fallback para dados padrão em caso de erro
            const defaultSiteInfo = {
                nome: "Golliath Burgers",
                telefone: "(11) 99999-9999",
                endereco: "Avenida Graciela Flores de Piteri, 255 - Aliança - Osasco - SP",
                horario_funcionamento: "Quarta a Domingo: 18h30 às 23h",
                instagram: "@golliathburgers",
                whatsapp: "5511957548091",
                sobre_texto: "No Golliath Burgers, acreditamos que um bom hambúrguer é mais do que apenas uma refeição - é uma experiência. Desde 2020, temos o compromisso de servir hambúrgueres artesanais feitos com ingredientes frescos e de qualidade."
            };
            updateSiteInfo(defaultSiteInfo);
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
    window.openCart = function () {
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
    window.openCart = function () {
        window.location.href = 'carrinho.html';
    };

    // Funções do menu mobile
    window.toggleMobileMenu = function () {
        const nav = document.getElementById('mobile-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');

        nav.classList.toggle('active');
        toggle.classList.toggle('active');
    };

    window.closeMobileMenu = function () {
        const nav = document.getElementById('mobile-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');

        nav.classList.remove('active');
        toggle.classList.remove('active');
    };

    // Fechar menu ao clicar fora
    document.addEventListener('click', function (e) {
        const nav = document.getElementById('mobile-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');

        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

    // Fechar menu ao redimensionar janela
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            const nav = document.getElementById('mobile-nav');
            const toggle = document.querySelector('.mobile-menu-toggle');

            nav.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

    // Polling automático para verificar atualizações do cardápio
    let lastCacheKey = null;
    let lastCardapioHash = null;
    let pollingInterval = null;
    let isFirstCheck = true;

    // Função para gerar hash do cardápio
    function generateCardapioHash(cardapio) {
        if (!Array.isArray(cardapio)) {
            console.warn('⚠️ generateCardapioHash: cardapio não é array:', typeof cardapio);
            return null;
        }

        const sortedItems = cardapio.map(item => {
            // Garantir valores consistentes para o hash
            const id = item.id || 0;
            const isActive = item.isActive !== false; // true se não definido ou true
            const disponivel = item.disponivel !== false; // true se não definido ou true
            return `${id}-${isActive}-${disponivel}`;
        }).sort();

        const hash = sortedItems.join('|');
        console.log('🔧 Hash gerado:', {
            itemCount: cardapio.length,
            hash: hash.substring(0, 50) + (hash.length > 50 ? '...' : ''),
            fullHash: hash
        });

        return hash;
    }

    async function checkForUpdates() {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/cardapio?_t=${timestamp}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const currentCardapioHash = generateCardapioHash(data.cardapio);

                console.log('🔍 Verificação de atualização:', {
                    isFirstCheck,
                    lastHash: lastCardapioHash,
                    currentHash: currentCardapioHash,
                    hashChanged: currentCardapioHash !== lastCardapioHash
                });

                // Se é a primeira verificação, apenas armazena os valores
                if (isFirstCheck) {
                    lastCacheKey = data.cacheKey;
                    lastCardapioHash = currentCardapioHash;
                    isFirstCheck = false;
                    console.log('✅ Primeira verificação concluída, hash armazenado');
                    return;
                }

                // Verificar se houve mudança real no conteúdo do cardápio
                if (currentCardapioHash !== lastCardapioHash) {
                    console.log('🔄 Atualização real detectada! Recarregando cardápio...');
                    lastCacheKey = data.cacheKey;
                    lastCardapioHash = currentCardapioHash;

                    // Aplicar overrides antes de exibir
                    const cardapioWithOverrides = applyLocalOverrides(data.cardapio);
                    displayCardapioFromAPI(cardapioWithOverrides);
                    // Remover notificação automática para evitar spam
                    // showMessage('Cardápio atualizado!', 'success');
                } else {
                    // Atualizar apenas a chave de cache sem mostrar notificação
                    lastCacheKey = data.cacheKey;
                    console.log('✅ Nenhuma mudança detectada no cardápio');
                }
            }
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
        }
    }

    // Iniciar polling apenas se estivermos na página principal
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        console.log('🔧 Iniciando sistema de polling do cardápio...');
        // Primeira verificação após 3 segundos (dar tempo para o carregamento inicial)
        setTimeout(() => {
            console.log('🔧 Executando primeira verificação de atualização...');
            checkForUpdates();
            // Depois verificar a cada 10 segundos (reduzido de 5 para evitar sobrecarga)
            pollingInterval = setInterval(() => {
                console.log('🔧 Verificação automática de atualização...');
                checkForUpdates();
            }, 10000);
        }, 3000);
    }

    // Limpar polling ao sair da página
    window.addEventListener('beforeunload', function () {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    });

    // Sistema de sincronização baseado em hash
    let currentDataHash = null;
    let syncInterval = null;

    async function checkForDataChanges() {
        try {
            const response = await fetch('/api/cardapio/sync');
            if (!response.ok) {
                console.warn('Erro ao verificar sincronização:', response.status);
                return;
            }

            const syncData = await response.json();

            if (syncData.success && syncData.hash) {
                // Se é a primeira verificação, apenas armazenar o hash
                if (currentDataHash === null) {
                    currentDataHash = syncData.hash;
                    console.log('🔧 Hash inicial do cardápio:', currentDataHash);
                    return;
                }

                // Se o hash mudou, recarregar o cardápio
                if (currentDataHash !== syncData.hash) {
                    console.log('🔄 Mudança detectada no cardápio! Recarregando...');
                    currentDataHash = syncData.hash;

                    // Recarregar dados do cardápio
                    const cardapioResponse = await fetch('/api/cardapio');
                    if (cardapioResponse.ok) {
                        const cardapioData = await cardapioResponse.json();
                        if (cardapioData.success) {
                            displayCardapioFromAPI(cardapioData.cardapio);
                            // Remover notificação automática para evitar spam
                            // showMessage('Cardápio atualizado!', 'success');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
        }
    }

    // Cache local para alterações do admin
    let localCardapioOverrides = {};

    // Carregar overrides salvos do localStorage
    try {
        const savedOverrides = localStorage.getItem('cardapioOverrides');
        if (savedOverrides) {
            localCardapioOverrides = JSON.parse(savedOverrides);
            console.log('🔧 Carregados overrides do cardápio:', localCardapioOverrides);
        }
    } catch (error) {
        console.error('Erro ao carregar overrides:', error);
    }

    // Função para aplicar overrides locais ao cardápio
    function applyLocalOverrides(cardapio) {
        if (!cardapio || Object.keys(localCardapioOverrides).length === 0) {
            return cardapio;
        }

        return cardapio.map(item => {
            const override = localCardapioOverrides[item.id];
            if (override) {
                return { ...item, ...override };
            }
            return item;
        }).filter(item => {
            // Filtrar itens desativados
            return item.isActive !== false && item.disponivel !== false;
        });
    }

    // Sistema de comunicação via localStorage
    function handleStorageChange(event) {
        console.log('🔍 Storage change detectado:', {
            key: event.key,
            newValue: event.newValue,
            oldValue: event.oldValue,
            url: event.url
        });

        if (event.key === 'cardapioUpdateNotification' && event.newValue) {
            try {
                const notification = JSON.parse(event.newValue);
                console.log('📨 Notificação recebida:', notification);

                if (notification.type === 'CARDAPIO_UPDATED' && notification.source === 'admin') {
                    console.log('🔄 Recebida notificação de atualização do admin via localStorage');

                    // Verificar se há dados de alteração específica
                    if (notification.itemChanges) {
                        // Aplicar mudanças específicas ao cache local
                        Object.assign(localCardapioOverrides, notification.itemChanges);
                        localStorage.setItem('cardapioOverrides', JSON.stringify(localCardapioOverrides));
                        console.log('📝 Aplicadas mudanças locais:', notification.itemChanges);
                    }

                    // Recarregar cardápio imediatamente
                    setTimeout(async () => {
                        try {
                            console.log('🔄 Recarregando cardápio devido a notificação do admin...');
                            const response = await fetch('/api/cardapio');
                            if (response.ok) {
                                const data = await response.json();
                                if (data.success) {
                                    const cardapioWithOverrides = applyLocalOverrides(data.cardapio);
                                    displayCardapioFromAPI(cardapioWithOverrides);
                                    showMessage('Cardápio atualizado pelo admin!', 'success');
                                }
                            }
                        } catch (error) {
                            console.error('Erro ao recarregar cardápio:', error);
                        }
                    }, 500);
                } else {
                    console.log('📨 Notificação ignorada:', notification);
                }
            } catch (error) {
                console.error('Erro ao processar notificação do localStorage:', error);
            }
        }
    }

    // Listener para mudanças no localStorage (comunicação entre abas)
    window.addEventListener('storage', handleStorageChange);

    // Polling para detectar mudanças na mesma aba (storage event não funciona na mesma aba)
    let lastNotificationCheck = localStorage.getItem('cardapioUpdateNotification');
    setInterval(() => {
        const currentNotification = localStorage.getItem('cardapioUpdateNotification');
        if (currentNotification && currentNotification !== lastNotificationCheck) {
            console.log('🔍 Detectada mudança no localStorage via polling');
            handleStorageChange({
                key: 'cardapioUpdateNotification',
                newValue: currentNotification,
                oldValue: lastNotificationCheck
            });
            lastNotificationCheck = currentNotification;
        }
    }, 5000); // Verificar a cada 5 segundos para reduzir spam

    // Listener para mensagens via postMessage
    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'CARDAPIO_UPDATED') {
            console.log('🔄 Recebida notificação de atualização via postMessage');

            setTimeout(async () => {
                try {
                    const response = await fetch('/api/cardapio');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            displayCardapioFromAPI(data.cardapio);
                            showMessage('Cardápio atualizado pelo admin!', 'success');
                        }
                    }
                } catch (error) {
                    console.error('Erro ao recarregar cardápio:', error);
                }
            }, 500);
        }
    });

    // Iniciar sincronização apenas na página principal
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Primeira verificação após 3 segundos
        setTimeout(() => {
            checkForDataChanges();
            // Depois verificar a cada 10 segundos
            // syncInterval = setInterval(checkForDataChanges, 10000); // DESABILITADO TEMPORARIAMENTE
        }, 3000);

        // Limpar sincronização ao sair da página
        window.addEventListener('beforeunload', function () {
            if (syncInterval) {
                clearInterval(syncInterval);
            }
        });
    }

});