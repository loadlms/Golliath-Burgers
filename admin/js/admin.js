// Configurações da API
const API_BASE_URL = '/api';

// Estado global
let currentUser = null;
// Limpar tokens antigos que não sejam o novo formato
let storedToken = localStorage.getItem('authToken');
console.log('DEBUG INIT - Token do localStorage:', storedToken);
let authToken = null;

// Debug Mobile
let mobileDebug = {
    isActive: false,
    logs: [],
    elements: {}
};

// Função para adicionar logs visuais
function addMobileLog(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };
    
    mobileDebug.logs.push(logEntry);
    
    // Manter apenas os últimos 50 logs
    if (mobileDebug.logs.length > 50) {
        mobileDebug.logs.shift();
    }
    
    // Atualizar display se o painel estiver ativo
    if (mobileDebug.isActive && mobileDebug.elements.debugLogs) {
        updateDebugDisplay();
    }
    
    // Também logar no console tradicional
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
}

// Função para atualizar o display de debug
function updateDebugDisplay() {
    if (!mobileDebug.elements.debugLogs) return;
    
    const logsHtml = mobileDebug.logs.map(log => `
        <div class="debug-log-entry">
            <span class="debug-log-time">${log.timestamp}</span>
            <span class="debug-log-level ${log.level}">[${log.level.toUpperCase()}]</span>
            <span class="debug-log-message">${log.message}</span>
            ${log.data ? `<br><small style="color: #6c757d;">${JSON.stringify(log.data)}</small>` : ''}
        </div>
    `).join('');
    
    mobileDebug.elements.debugLogs.innerHTML = logsHtml;
    mobileDebug.elements.debugLogs.scrollTop = mobileDebug.elements.debugLogs.scrollHeight;
}

// Função para inicializar debug móvel
function initMobileDebug() {
    addMobileLog('info', 'Inicializando sistema de debug móvel');
    
    // Capturar elementos
    mobileDebug.elements = {
        debugToggle: document.getElementById('debugToggle'),
        debugPanel: document.getElementById('debugPanel'),
        debugLogs: document.getElementById('debugLogs'),
        debugClear: document.getElementById('debugClear'),
        debugTestLogin: document.getElementById('debugTestLogin'),
        debugFillForm: document.getElementById('debugFillForm')
    };
    
    // Verificar se elementos existem
    const missingElements = Object.entries(mobileDebug.elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
    
    if (missingElements.length > 0) {
        addMobileLog('error', 'Elementos de debug não encontrados', missingElements);
        return;
    }
    
    addMobileLog('success', 'Elementos de debug encontrados com sucesso');
    
    // Event listeners
    mobileDebug.elements.debugToggle.addEventListener('click', toggleDebugPanel);
    mobileDebug.elements.debugClear.addEventListener('click', clearDebugLogs);
    mobileDebug.elements.debugTestLogin.addEventListener('click', testLoginAPI);
    mobileDebug.elements.debugFillForm.addEventListener('click', fillLoginForm);
    
    addMobileLog('success', 'Event listeners de debug configurados');
}

// Função para alternar painel de debug
function toggleDebugPanel() {
    mobileDebug.isActive = !mobileDebug.isActive;
    
    if (mobileDebug.isActive) {
        mobileDebug.elements.debugPanel.classList.add('active');
        mobileDebug.elements.debugToggle.textContent = '🔧 Fechar Debug';
        updateDebugDisplay();
        addMobileLog('info', 'Painel de debug aberto');
    } else {
        mobileDebug.elements.debugPanel.classList.remove('active');
        mobileDebug.elements.debugToggle.textContent = '🔧 Debug';
        addMobileLog('info', 'Painel de debug fechado');
    }
}

// Função para limpar logs
function clearDebugLogs() {
    mobileDebug.logs = [];
    updateDebugDisplay();
    addMobileLog('info', 'Logs de debug limpos');
}

// Função para preencher formulário automaticamente
function fillLoginForm() {
    addMobileLog('info', 'Preenchendo formulário de login automaticamente');
    
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField && passwordField) {
        emailField.value = 'admin@golliath.com';
        passwordField.value = 'admin2023';
        addMobileLog('success', 'Formulário preenchido com credenciais de teste');
    } else {
        addMobileLog('error', 'Campos de email ou senha não encontrados');
    }
}

// Função para testar API de login diretamente
async function testLoginAPI() {
    addMobileLog('info', 'Iniciando teste direto da API de login');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@golliath.com',
                password: 'admin2023'
            })
        });
        
        addMobileLog('info', `Resposta da API recebida - Status: ${response.status}`);
        
        const data = await response.json();
        addMobileLog('info', 'Dados da resposta', data);
        
        if (response.ok && data.success) {
            addMobileLog('success', 'Login via API bem-sucedido!');
            
            // Simular login bem-sucedido
            authToken = data.token;
            currentUser = data.admin;
            localStorage.setItem('authToken', authToken);
            showAdminDashboard();
            loadDashboardData();
        } else {
            addMobileLog('error', 'Falha no login via API', data.message || 'Erro desconhecido');
        }
    } catch (error) {
        addMobileLog('error', 'Erro na requisição da API', error.message);
    }
}

if (storedToken && storedToken.startsWith('eyJ')) {
    // Token JWT válido
    authToken = storedToken;
} else if (storedToken) {
    // Token inválido, remover
    localStorage.removeItem('authToken');
    authToken = null;
}

// Elementos DOM
let loginScreen, adminDashboard, loginForm, loginMessage, logoutBtn, adminName;

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - iniciando admin.js');
    
    // Inicializar sistema de debug móvel
    initMobileDebug();
    
    // Obter elementos DOM
    loginScreen = document.getElementById('loginScreen');
    adminDashboard = document.getElementById('adminDashboard');
    loginForm = document.getElementById('loginForm');
    loginMessage = document.getElementById('loginMessage');
    logoutBtn = document.getElementById('logoutBtn');
    adminName = document.getElementById('adminName');
    
    console.log('Elementos encontrados:', {
        loginScreen: !!loginScreen,
        adminDashboard: !!adminDashboard,
        loginForm: !!loginForm,
        loginMessage: !!loginMessage,
        logoutBtn: !!logoutBtn,
        adminName: !!adminName
    });
    
    // Event Listeners
    if (loginForm) {
        console.log('Adicionando event listener ao formulário de login');
        loginForm.addEventListener('submit', handleLogin);
        
        // Debug: verificar se o botão de submit existe
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        console.log('Botão de submit encontrado:', submitBtn);
        
        // Adicionar listener direto ao botão também
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                console.log('Botão de submit clicado - evento direto');
                // Forçar o submit se necessário
                if (e.type === 'click') {
                    console.log('Forçando submit do formulário');
                    e.preventDefault();
                    handleLogin(e);
                }
            });
        }
        
        // Teste adicional: verificar se o formulário está visível
        console.log('Formulário visível:', loginForm.offsetParent !== null);
        console.log('Formulário style display:', getComputedStyle(loginForm).display);
        
    } else {
        console.error('Formulário de login não encontrado no DOM!');
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Não fazer verificação automática de token ao carregar a página
    // O usuário deve fazer login manualmente ou permanecer logado se o token for válido
    if (authToken) {
        // Apenas mostrar o dashboard se há token, sem verificar no servidor
        showAdminDashboard();
        loadDashboardData();
    } else {
        // Mostrar tela de login se não há token
        showLoginScreen();
    }
});

// Funções de autenticação
async function autoLogin() {
    console.log('Fazendo login automático...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@golliath.com',
                password: 'admin2023'
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            console.log('Login automático bem-sucedido');
            showAdminDashboard();
            loadCardapio();
        } else {
            console.error('Falha no login automático:', data.message);
            showLoginScreen();
        }
    } catch (error) {
        console.error('Erro no login automático:', error);
        showLoginScreen();
    }
}

async function handleLogin(e) {
    console.log('handleLogin chamada');
    addMobileLog('info', 'Função handleLogin chamada');
    e.preventDefault();
    
    // Debug: verificar se o formulário existe
    console.log('loginForm element:', loginForm);
    if (!loginForm) {
        console.error('Formulário de login não encontrado!');
        showMessage('Erro: Formulário não encontrado', 'error');
        return;
    }
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('Dados do formulário:', { 
        email: email ? `presente: ${email}` : 'ausente', 
        password: password ? 'presente' : 'ausente' 
    });
    
    if (!email || !password) {
        console.error('Email ou senha não fornecidos');
        addMobileLog('error', 'Email ou senha não fornecidos');
        showMessage('Por favor, preencha email e senha', 'error');
        return;
    }
    
    try {
        console.log('Enviando requisição de login para:', `${API_BASE_URL}/auth/login`);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('Login bem-sucedido');
            addMobileLog('success', 'Login bem-sucedido!');
            authToken = data.token;
            currentUser = { email: 'admin@golliath.com', role: 'admin' };
            localStorage.setItem('authToken', authToken);
            console.log('Token salvo:', authToken);
            addMobileLog('info', 'Token salvo no localStorage');
            showAdminDashboard();
            loadDashboardData();
        } else {
            console.log('Login falhou:', data.message);
            addMobileLog('error', 'Login falhou', data.message);
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        console.error('Stack trace:', error.stack);
        addMobileLog('error', 'Erro no login', error.message);
        showMessage('Erro ao conectar com o servidor: ' + error.message, 'error');
    }
}

async function verifyToken() {
    try {
        console.log('Verificando token:', authToken);
        console.log('URL de verificação:', `${API_BASE_URL}/auth/verify`);
        
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            console.warn('Token verification failed:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            currentUser = { email: 'admin@golliath.com', role: 'admin' };
            showAdminDashboard();
            loadDashboardData();
        } else {
            console.warn('Token inválido:', data.message);
        }
    } catch (error) {
        console.warn('Erro ao verificar token:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showLoginScreen();
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
    loginForm.reset();
    loginMessage.textContent = '';
}

function showAdminDashboard() {
    console.log('=== showAdminDashboard() chamada ===');
    addMobileLog('info', 'showAdminDashboard() executada');
    
    // Verificar se os elementos existem
    console.log('Elementos disponíveis:', {
        loginScreen: !!loginScreen,
        adminDashboard: !!adminDashboard,
        currentUser: !!currentUser
    });
    
    if (!loginScreen) {
        console.error('loginScreen não encontrado!');
        addMobileLog('error', 'loginScreen não encontrado');
        return;
    }
    
    if (!adminDashboard) {
        console.error('adminDashboard não encontrado!');
        addMobileLog('error', 'adminDashboard não encontrado');
        return;
    }
    
    if (!currentUser) {
        console.error('currentUser não definido!');
        addMobileLog('error', 'currentUser não definido');
        return;
    }
    
    console.log('Ocultando tela de login...');
    loginScreen.style.display = 'none';
    addMobileLog('info', 'Tela de login ocultada');
    
    console.log('Exibindo dashboard...');
    adminDashboard.style.display = 'flex';
    addMobileLog('info', 'Dashboard exibido');
    
    // Verificar estilos computados no mobile
    const loginScreenStyles = window.getComputedStyle(loginScreen);
    const dashboardStyles = window.getComputedStyle(adminDashboard);
    
    console.log('Estilos da tela de login:', {
        display: loginScreenStyles.display,
        visibility: loginScreenStyles.visibility,
        opacity: loginScreenStyles.opacity,
        zIndex: loginScreenStyles.zIndex,
        position: loginScreenStyles.position
    });
    
    console.log('Estilos do dashboard:', {
        display: dashboardStyles.display,
        visibility: dashboardStyles.visibility,
        opacity: dashboardStyles.opacity,
        zIndex: dashboardStyles.zIndex,
        position: dashboardStyles.position
    });
    
    addMobileLog('info', `Login display: ${loginScreenStyles.display}, Dashboard display: ${dashboardStyles.display}`);
    
    // Forçar estilos para garantir que funcionem no mobile
    loginScreen.style.display = 'none';
    loginScreen.style.visibility = 'hidden';
    adminDashboard.style.display = 'flex';
    adminDashboard.style.visibility = 'visible';
    adminDashboard.style.opacity = '1';
    adminDashboard.style.zIndex = '1000';
    
    addMobileLog('info', 'Estilos forçados aplicados');
    
    if (adminName) {
        adminName.textContent = currentUser.name;
        console.log('Nome do admin definido:', currentUser.name);
        addMobileLog('info', `Nome do admin definido: ${currentUser.name}`);
    } else {
        console.warn('Elemento adminName não encontrado');
        addMobileLog('warning', 'Elemento adminName não encontrado');
    }
    
    console.log('=== showAdminDashboard() concluída ===');
    addMobileLog('success', 'Dashboard carregado com sucesso');
}

function showMessage(message, type = 'success') {
    loginMessage.textContent = message;
    loginMessage.className = `message ${type}`;
}

// Navegação entre abas
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Remover classe active de todos os botões e conteúdos
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Adicionar classe active ao botão clicado e conteúdo correspondente
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Carregar dados da aba
    switch(tabName) {
        case 'cardapio':
            loadCardapio();
            break;
        case 'pedidos':
            loadPedidos();
            break;
        case 'clientes':
            loadClientes();
            break;
        case 'siteinfo':
            loadSiteInfo();
            break;
    }
}

    // Carregar dados iniciais do dashboard
    async function loadDashboardData() {
        await loadCardapio();
    }

    // Gerenciamento de Pedidos
    async function loadPedidos() {
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                displayPedidos(data.pedidos);
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    function displayPedidos(pedidos) {
        const pedidosList = document.getElementById('pedidosList');
        
        if (pedidos.length === 0) {
            pedidosList.innerHTML = '<p>Nenhum pedido encontrado.</p>';
            return;
        }
        
        pedidosList.innerHTML = pedidos.map(pedido => `
            <div class="pedido-item">
                <div class="pedido-header">
                    <div class="pedido-info">
                        <h4>Pedido #${pedido.numero_pedido}</h4>
                        <p><strong>Cliente:</strong> ${pedido.cliente.nome}</p>
                        <p><strong>Total:</strong> R$ ${parseFloat(pedido.total).toFixed(2)}</p>
                        <p><strong>Data:</strong> ${new Date(pedido.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="pedido-status">
                        <select onchange="updatePedidoStatus(${pedido.id}, this.value)" class="status-select">
                            <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                            <option value="em_preparo" ${pedido.status === 'em_preparo' ? 'selected' : ''}>Em Preparo</option>
                            <option value="pronto" ${pedido.status === 'pronto' ? 'selected' : ''}>Pronto</option>
                            <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                            <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                </div>
                <div class="pedido-details">
                    <div class="pedido-items">
                        <h5>Itens do Pedido:</h5>
                        ${pedido.itens.map(item => `
                            <div class="pedido-item-detail">
                                <span>${item.nome} x${item.quantity}</span>
                                <span>R$ ${(item.preco * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pedido-actions">
                        <button class="action-btn view-btn" onclick="viewPedido(${pedido.id})">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePedido(${pedido.id})">
                            <i class="fas fa-trash"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async function updatePedidoStatus(pedidoId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Status do pedido atualizado com sucesso!', 'success');
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showMessage('Erro ao atualizar status do pedido', 'error');
        }
    }

    async function viewPedido(pedidoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                showPedidoDetails(data.pedido);
            }
        } catch (error) {
            console.error('Erro ao carregar pedido:', error);
        }
    }

    function showPedidoDetails(pedido) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Pedido #${pedido.numero_pedido}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="pedido-details-full">
                        <div class="cliente-info">
                            <h4>Informações do Cliente</h4>
                            <p><strong>Nome:</strong> ${pedido.cliente.nome}</p>
                            <p><strong>E-mail:</strong> ${pedido.cliente.email}</p>
                            <p><strong>Telefone:</strong> ${pedido.cliente.telefone}</p>
                            <p><strong>Endereço:</strong> ${pedido.cliente.endereco}, ${pedido.cliente.bairro}</p>
                            <p><strong>Cidade:</strong> ${pedido.cliente.cidade} - ${pedido.cliente.estado}</p>
                        </div>
                        
                        <div class="pedido-info">
                            <h4>Informações do Pedido</h4>
                            <p><strong>Status:</strong> ${pedido.status}</p>
                            <p><strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}</p>
                            ${pedido.troco ? `<p><strong>Troco para:</strong> R$ ${pedido.troco}</p>` : ''}
                            ${pedido.observacoes ? `<p><strong>Observações:</strong> ${pedido.observacoes}</p>` : ''}
                            <p><strong>Data:</strong> ${new Date(pedido.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                        
                        <div class="itens-info">
                            <h4>Itens do Pedido</h4>
                            ${pedido.itens.map(item => `
                                <div class="item-detail">
                                    <span>${item.nome} x${item.quantity}</span>
                                    <span>R$ ${(item.preco * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="total-info">
                                <strong>Total: R$ ${parseFloat(pedido.total).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async function deletePedido(pedidoId) {
        if (!confirm('Tem certeza que deseja cancelar este pedido?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                loadPedidos();
                showMessage(data.message, 'success');
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao cancelar pedido:', error);
            showMessage('Erro ao cancelar pedido', 'error');
        }
    }

// Gerenciamento do Cardápio
async function loadCardapio() {
    try {
        console.log('🔄 loadCardapio() chamada');
        console.log('Token atual:', authToken);
        
        if (!authToken) {
            console.error('Token não encontrado');
            showLoginScreen();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/cardapio/admin?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            console.warn('Erro ao carregar cardápio:', response.status);
            // Não fazer logout automático - apenas logar o erro
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Response data:', data);
        console.log('📋 Cardápio recebido:', data.cardapio);
        
        if (data.success) {
            console.log('✅ Chamando displayCardapio com', data.cardapio.length, 'itens');
            displayCardapio(data.cardapio);
        } else {
            console.error('Erro na resposta:', data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        showMessage('Erro ao carregar cardápio: ' + error.message, 'error');
    }
}

function displayCardapio(cardapio) {
    console.log('🎨 displayCardapio() chamada com', cardapio.length, 'itens');
    console.log('📋 Dados completos do cardápio:', JSON.stringify(cardapio, null, 2));
    console.log('🆔 IDs dos itens:', cardapio.map(item => item.id));
    console.log('📝 Nomes dos itens:', cardapio.map(item => item.nome));
    
    const cardapioList = document.getElementById('cardapioList');
    
    if (cardapio.length === 0) {
        console.log('⚠️ Nenhum item encontrado para exibir');
        cardapioList.innerHTML = '<p>Nenhum item no cardápio encontrado.</p>';
        return;
    }
    
    console.log('🔨 Construindo HTML para', cardapio.length, 'itens...');
    
    cardapioList.innerHTML = cardapio.map(item => {
        // Verificar se é uma URL do ImageKit ou caminho local
        const imageSrc = (item.imagem && (item.imagem.startsWith('http') || item.imagem.includes('imagekit.io'))) 
            ? item.imagem 
            : `../${item.imagem}`;
        
        return `
        <div class="cardapio-item ${!item.isActive ? 'inactive' : ''}">
            <img src="${imageSrc}" alt="${item.nome}" onerror="this.src='../img/logoGB.PNG'">
            <div class="cardapio-info">
                <h4>${item.nome} ${!item.isActive ? '<span class="status-badge inactive">Inativo</span>' : '<span class="status-badge active">Ativo</span>'}</h4>
                <p>${item.descricao}</p>
                <div class="cardapio-price">R$ ${parseFloat(item.preco).toFixed(2)}</div>
            </div>
            <div class="cardapio-actions">
                <button class="action-btn edit-btn" onclick="editItem(${item.id})" ${!item.isActive ? 'disabled' : ''}>
                    <i class="fas fa-edit"></i>
                </button>
                ${item.isActive ? 
                    `<button class="action-btn deactivate-btn" onclick="deactivateItem(${item.id})" title="Desativar item">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteItemPermanently(${item.id})" title="Remover permanentemente">
                        <i class="fas fa-trash"></i>
                    </button>` :
                    `<button class="action-btn reactivate-btn" onclick="reactivateItem(${item.id})" title="Reativar item">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn permanent-delete-btn" onclick="deleteItemPermanently(${item.id})" title="Remover permanentemente">
                        <i class="fas fa-trash-alt"></i>
                    </button>`
                }
            </div>
        </div>
        `;
    }).join('');
}

// Modal do Cardápio
let editingItemId = null;

document.getElementById('addItemBtn').addEventListener('click', () => {
    openItemModal();
});

document.getElementById('itemForm').addEventListener('submit', handleItemSubmit);

// Configurar o upload de imagem
document.getElementById('selectImageBtn').addEventListener('click', () => {
    document.getElementById('itemImagemFile').click();
});

document.getElementById('itemImagemFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Mostrar preview da imagem imediatamente
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
    }
    reader.readAsDataURL(file);
    
    // Fazer upload da imagem
    try {
        // Mostrar indicador de carregamento
        showMessage('Enviando imagem...', 'info');
        
        // Converter imagem para base64
        const imageReader = new FileReader();
        imageReader.onload = async function(e) {
            try {
                const response = await fetch(`${API_BASE_URL}/cardapio/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        image: e.target.result
                    })
                });
        
                const data = await response.json();
                
                if (data.success) {
                    // Salvar a URL completa do ImageKit no campo oculto
                    document.getElementById('itemImagem').value = data.url;
                    showMessage('Imagem enviada com sucesso!', 'success');
                    
                    // Atualizar o preview com a imagem do servidor
                    const imagePreview = document.getElementById('imagePreview');
                    imagePreview.src = data.url;
                } else {
                    showMessage(data.message || 'Erro ao enviar imagem', 'error');
                    // Reverter preview em caso de erro
                    document.getElementById('imagePreview').src = '../img/logoGB.PNG';
                }
            } catch (error) {
                console.error('Erro ao fazer upload da imagem:', error);
                showMessage('Erro ao enviar imagem. Tente novamente.', 'error');
                // Reverter preview em caso de erro
                document.getElementById('imagePreview').src = '../img/logoGB.PNG';
            }
        };
        
        // Ler o arquivo como base64
        imageReader.readAsDataURL(file);
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        showMessage('Erro ao processar imagem', 'error');
        // Reverter preview em caso de erro
        document.getElementById('imagePreview').src = '../img/logoGB.PNG';
    }
});

function openItemModal(item = null) {
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('itemForm');
    const imagePreview = document.getElementById('imagePreview');
    
    if (item) {
        modalTitle.textContent = 'Editar Item';
        editingItemId = item.id;
        form.nome.value = item.nome;
        form.descricao.value = item.descricao;
        form.preco.value = item.preco;
        form.imagem.value = item.imagem;
        form.ordem.value = item.ordem;
        form.destaque.checked = item.destaque;
        
        // Atualizar preview da imagem
        // Verificar se é uma URL do ImageKit ou caminho local
        if (item.imagem && (item.imagem.startsWith('http') || item.imagem.includes('imagekit.io'))) {
            imagePreview.src = item.imagem;
        } else {
            imagePreview.src = `../${item.imagem}`;
        }
    } else {
        modalTitle.textContent = 'Adicionar Item';
        editingItemId = null;
        form.reset();
        imagePreview.src = '../img/logoGB.PNG';
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
    editingItemId = null;
}

async function handleItemSubmit(e) {
    e.preventDefault();
    console.log('🔄 handleItemSubmit iniciado');
    
    const formData = new FormData(e.target);
    const itemData = {
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        preco: parseFloat(formData.get('preco')),
        imagem: formData.get('imagem'),
        categoria: 'hamburguers',
        ordem: parseInt(formData.get('ordem')) || 0,
        destaque: formData.get('destaque') === 'on',
        disponivel: true
    };
    
    console.log('📝 Dados do formulário:', itemData);
    console.log('🖼️ Valor do campo imagem:', formData.get('imagem'));
    console.log('🆔 editingItemId:', editingItemId);
    
    try {
        let url, method;
        
        if (editingItemId) {
            // Editar item existente
            url = `${API_BASE_URL}/cardapio/${editingItemId}`;
            method = 'PUT';
        } else {
            // Criar novo item
            url = `${API_BASE_URL}/cardapio`;
            method = 'POST';
        }
        
        console.log('🌐 Fazendo requisição:', { url, method, itemData });
        console.log('🔑 Token de autenticação:', authToken ? 'Presente' : 'Ausente');
        console.log('📦 Dados sendo enviados:', JSON.stringify(itemData, null, 2));
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(itemData)
        });
        
        console.log('📡 Resposta recebida:', response.status, response.statusText);
        console.log('📡 Response OK:', response.ok);
        console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📊 Dados completos da resposta:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.success) {
            closeModal();
            loadCardapio();
            showMessage(data.message || (editingItemId ? 'Item editado com sucesso' : 'Item criado com sucesso'), 'success');
            
            // Notificar o frontend principal sobre a mudança com dados específicos
            const itemChanges = {};
            if (editingItemId) {
                // Para edição, passar os dados atualizados
                itemChanges[editingItemId] = itemData;
            } else if (data.data && data.data.id) {
                // Para criação, usar o ID retornado pela API
                itemChanges[data.data.id] = itemData;
            }
            notifyFrontendUpdate(itemChanges);
        } else {
            console.error('❌ Erro na resposta:', { status: response.status, data });
            showMessage(data.message || 'Erro ao salvar item', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar item:', error);
        showMessage('Erro ao salvar item', 'error');
    }
}

async function editItem(id) {
    try {
        // Buscar o item nos dados já carregados
        const cardapioItems = document.querySelectorAll('.cardapio-item');
        let itemData = null;
        
        cardapioItems.forEach(item => {
            const itemId = item.querySelector('.edit-btn').getAttribute('onclick').match(/\d+/)[0];
            if (itemId == id) {
                const nomeElement = item.querySelector('h4');
                const descricaoElement = item.querySelector('p');
                const precoElement = item.querySelector('.cardapio-price');
                const imagemElement = item.querySelector('img');
                
                if (nomeElement && descricaoElement && precoElement && imagemElement) {
                    // Extrair apenas o nome, removendo o badge de status
                    const nomeCompleto = nomeElement.textContent;
                    const nome = nomeCompleto.replace(/\s*(Ativo|Inativo)\s*$/, '').trim();
                    const descricao = descricaoElement.textContent;
                    const preco = parseFloat(precoElement.textContent.replace('R$ ', '').replace(',', '.'));
                    // Extrair o caminho da imagem de forma mais robusta
                    let imagem = imagemElement.src;
                    if (imagem.startsWith(window.location.origin)) {
                        imagem = imagem.replace(window.location.origin + '/', '');
                    }
                    // Se a imagem já está em formato relativo, manter como está
                    if (imagem.startsWith('http')) {
                        // Se ainda é uma URL completa, extrair apenas o caminho
                        const url = new URL(imagem);
                        imagem = url.pathname.substring(1); // Remove a barra inicial
                    }
                    
                    itemData = {
                        id: parseInt(id),
                        nome,
                        descricao,
                        preco,
                        imagem,
                        categoria: 'hamburguers',
                        ordem: 1,
                        destaque: false
                    };
                }
            }
        });
        
        if (itemData) {
            openItemModal(itemData);
        } else {
            showMessage('Item não encontrado', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar item:', error);
        showMessage('Erro ao carregar item', 'error');
    }
}

async function deactivateItem(id) {
    if (!confirm('Tem certeza que deseja desativar este item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ isActive: false })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCardapio();
            showMessage(data.message || 'Item desativado com sucesso', 'success');
            
            // Notificar o frontend principal sobre a mudança com informações específicas
            const itemChanges = {};
            itemChanges[id] = { isActive: false, disponivel: false };
            notifyFrontendUpdate(itemChanges);
        } else {
            showMessage(data.message || 'Erro ao desativar item', 'error');
        }
    } catch (error) {
        console.error('Erro ao desativar item:', error);
        showMessage('Erro ao desativar item', 'error');
    }
}

async function reactivateItem(id) {
    if (!confirm('Tem certeza que deseja reativar este item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ isActive: true })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCardapio();
            showMessage(data.message || 'Item reativado com sucesso', 'success');
            
            // Notificar o frontend principal sobre a mudança com informações específicas
            const itemChanges = {};
            itemChanges[id] = { isActive: true, disponivel: true };
            notifyFrontendUpdate(itemChanges);
        } else {
            showMessage(data.message || 'Erro ao reativar item', 'error');
        }
    } catch (error) {
        console.error('Erro ao reativar item:', error);
        showMessage('Erro ao reativar item', 'error');
    }
}

async function deleteItemPermanently(id) {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá remover o item PERMANENTEMENTE do banco de dados.\n\nEsta ação NÃO PODE ser desfeita!\n\nTem certeza que deseja continuar?')) {
        return;
    }
    
    // Segunda confirmação para ações críticas
    if (!confirm('Confirme novamente: Deseja DELETAR PERMANENTEMENTE este item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${id}/permanent`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCardapio();
            showMessage(data.message || 'Item removido permanentemente', 'success');
            
            // Notificar o frontend principal sobre a mudança
            notifyFrontendUpdate();
        } else {
            showMessage(data.message || 'Erro ao remover item permanentemente', 'error');
        }
    } catch (error) {
        console.error('Erro ao remover item permanentemente:', error);
        showMessage('Erro ao remover item permanentemente', 'error');
    }
}

// Gerenciamento de Clientes
async function loadClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            displayClientes(data.clientes);
        }
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

function displayClientes(clientes) {
    const clientesList = document.getElementById('clientesList');
    
    if (clientes.length === 0) {
        clientesList.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
        return;
    }
    
    clientesList.innerHTML = clientes.map(cliente => `
        <div class="cliente-item">
            <div class="cliente-header">
                <div>
                    <div class="cliente-nome">${cliente.nome}</div>
                    <div class="cliente-email">${cliente.email}</div>
                </div>
                <div class="cliente-actions">
                    <button class="action-btn edit-btn" onclick="editCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCliente(${cliente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="cliente-info">
                <p><strong>Telefone:</strong> ${cliente.telefone}</p>
                <p><strong>Endereço:</strong> ${cliente.endereco}</p>
                <p><strong>Bairro:</strong> ${cliente.bairro}</p>
                <p><strong>Cidade:</strong> ${cliente.cidade} - ${cliente.estado}</p>
                <p><strong>CEP:</strong> ${cliente.cep}</p>
                ${cliente.observacoes ? `<p><strong>Observações:</strong> ${cliente.observacoes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

async function deleteCliente(id) {
    if (!confirm('Tem certeza que deseja desativar este cliente?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadClientes();
            showMessage(data.message, 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        showMessage('Erro ao deletar cliente', 'error');
    }
}

// Gerenciamento de Informações do Site
async function loadSiteInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/siteinfo`);
        const data = await response.json();
        
        if (data.success) {
            displaySiteInfoForm(data.siteInfo);
        }
    } catch (error) {
        console.error('Erro ao carregar informações do site:', error);
    }
}

function displaySiteInfoForm(siteInfo) {
    const siteinfoForm = document.getElementById('siteinfoForm');
    
    const defaultFields = [
        { key: 'horario_funcionamento', label: 'Horário de Funcionamento', type: 'text' },
        { key: 'endereco', label: 'Endereço', type: 'text' },
        { key: 'telefone', label: 'Telefone', type: 'text' },
        { key: 'whatsapp', label: 'WhatsApp', type: 'text' },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'sobre_texto', label: 'Texto Sobre Nós', type: 'textarea' }
    ];
    
    siteinfoForm.innerHTML = `
        <form id="siteInfoForm">
            ${defaultFields.map(field => `
                <div class="form-group">
                    <label for="${field.key}">${field.label}</label>
                    ${field.type === 'textarea' 
                        ? `<textarea id="${field.key}" name="${field.key}" required>${siteInfo[field.key] || ''}</textarea>`
                        : `<input type="${field.type}" id="${field.key}" name="${field.key}" value="${siteInfo[field.key] || ''}" required>`
                    }
                </div>
            `).join('')}
            <button type="submit" class="save-siteinfo-btn">
                <i class="fas fa-save"></i> Salvar Configurações
            </button>
        </form>
    `;
    
    // Adicionar event listener ao formulário
    document.getElementById('siteInfoForm').addEventListener('submit', handleSiteInfoSubmit);
}

async function handleSiteInfoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updates = [];
    
    for (const [key, value] of formData.entries()) {
        updates.push({ chave: key, valor: value });
    }
    
    try {
        const promises = updates.map(update => 
            fetch(`${API_BASE_URL}/siteinfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(update)
            })
        );
        
        await Promise.all(promises);
        showMessage('Configurações salvas com sucesso!', 'success');
        
        // Notificar o frontend principal sobre a mudança
        notifyFrontendUpdate();
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showMessage('Erro ao salvar configurações', 'error');
    }
}

// Função para mostrar mensagens no dashboard
function showMessage(message, type = 'success') {
    // Criar elemento de mensagem temporário
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.zIndex = '1000';
    messageEl.style.padding = '1rem';
    messageEl.style.borderRadius = '5px';
    messageEl.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Função para notificar o frontend principal sobre mudanças
function notifyFrontendUpdate(itemChanges = null) {
    console.log('🔄 Notificando frontend sobre atualização do cardápio...');
    
    try {
        // Usar localStorage para comunicação entre abas
        const updateNotification = {
            type: 'CARDAPIO_UPDATED',
            timestamp: Date.now(),
            source: 'admin',
            itemChanges: itemChanges
        };
        
        localStorage.setItem('cardapioUpdateNotification', JSON.stringify(updateNotification));
        console.log('📤 Notificação salva no localStorage:', updateNotification);
        
        // Remover a notificação após um tempo para evitar acúmulo
        setTimeout(() => {
            localStorage.removeItem('cardapioUpdateNotification');
        }, 5000);
        
        // Tentar enviar mensagem via postMessage se window.opener estiver disponível
        if (window.opener && !window.opener.closed) {
            console.log('📤 Enviando mensagem via postMessage para window.opener');
            window.opener.postMessage(updateNotification, '*');
        }
        
    } catch (error) {
        console.error('Erro ao notificar frontend:', error);
    }
    
    // Salvar timestamp no localStorage para comunicação alternativa
    const timestamp = Date.now();
    localStorage.setItem('lastUpdate', timestamp);
    console.log('💾 Timestamp salvo no localStorage:', timestamp);
    
    // Tentar notificar iframe oculto na página principal
    try {
        const mainWindow = window.parent !== window ? window.parent : window.top;
        if (mainWindow && mainWindow !== window) {
            mainWindow.postMessage({ 
                type: 'CARDAPIO_UPDATED', 
                timestamp,
                source: 'admin'
            }, '*');
            console.log('📤 Mensagem enviada para janela principal via postMessage');
        }
    } catch (error) {
        console.log('⚠️ Erro ao enviar para janela principal:', error.message);
    }
    
    // Tentar notificar todas as janelas abertas
    try {
        // Broadcast para todas as abas/janelas do mesmo domínio
        const bc = new BroadcastChannel('cardapio-updates');
        bc.postMessage({ type: 'CARDAPIO_UPDATED', timestamp });
        bc.close();
        console.log('📡 Mensagem enviada via BroadcastChannel');
    } catch (error) {
        console.log('⚠️ BroadcastChannel não disponível:', error.message);
    }
    
    // Forçar atualização via API polling mais frequente
    try {
        sessionStorage.setItem('forceUpdate', timestamp);
        console.log('🔄 Marcador de atualização forçada definido');
    } catch (error) {
        console.log('⚠️ SessionStorage não disponível:', error.message);
    }
}

// Funções do menu mobile do admin
function toggleAdminMobileMenu() {
    const mobileNav = document.getElementById('admin-mobile-nav');
    const toggleBtn = document.querySelector('.admin-mobile-toggle');
    
    if (mobileNav && toggleBtn) {
        mobileNav.classList.toggle('active');
        toggleBtn.classList.toggle('active');
    }
}

function closeAdminMobileMenu() {
    const mobileNav = document.getElementById('admin-mobile-nav');
    const toggleBtn = document.querySelector('.admin-mobile-toggle');
    
    if (mobileNav && toggleBtn) {
        mobileNav.classList.remove('active');
        toggleBtn.classList.remove('active');
    }
}

// Event listeners para o menu mobile do admin
document.addEventListener('DOMContentLoaded', function() {
    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('admin-mobile-nav');
        const toggleBtn = document.querySelector('.admin-mobile-toggle');
        
        if (mobileNav && toggleBtn && 
            !mobileNav.contains(e.target) && 
            !toggleBtn.contains(e.target) && 
            mobileNav.classList.contains('active')) {
            closeAdminMobileMenu();
        }
    });
    
    // Fechar menu ao redimensionar janela
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeAdminMobileMenu();
        }
    });
    
    // Sincronizar botões de logout
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }
    
    // Sincronizar nome do admin no mobile
    const adminNameMobile = document.getElementById('adminNameMobile');
    if (adminNameMobile && currentUser) {
        adminNameMobile.textContent = currentUser.nome || 'Administrador';
    }
});

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);