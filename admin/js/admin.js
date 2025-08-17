// Configurações da API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado global
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const adminName = document.getElementById('adminName');

// Verificar se já está logado
if (authToken) {
    verifyToken();
} else {
    showLoginScreen();
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

// Funções de autenticação
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.admin;
            localStorage.setItem('authToken', authToken);
            showAdminDashboard();
            loadDashboardData();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showMessage('Erro ao conectar com o servidor', 'error');
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.admin;
            showAdminDashboard();
            loadDashboardData();
        } else {
            localStorage.removeItem('authToken');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('authToken');
        showLoginScreen();
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
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    adminName.textContent = currentUser.name;
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
        console.log('Token atual:', authToken);
        
        if (!authToken) {
            console.error('Token não encontrado');
            showLoginScreen();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/cardapio/admin/all`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Token inválido, redirecionando para login');
                localStorage.removeItem('authToken');
                authToken = null;
                showLoginScreen();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
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
    const cardapioList = document.getElementById('cardapioList');
    
    if (cardapio.length === 0) {
        cardapioList.innerHTML = '<p>Nenhum item no cardápio encontrado.</p>';
        return;
    }
    
    cardapioList.innerHTML = cardapio.map(item => `
        <div class="cardapio-item ${!item.isActive ? 'inactive' : ''}">
            <img src="../${item.imagem}" alt="${item.nome}" onerror="this.src='../img/logoGB.PNG'">
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
                    `<button class="action-btn delete-btn" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>` :
                    `<button class="action-btn reactivate-btn" onclick="reactivateItem(${item.id})" title="Reativar item">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="action-btn permanent-delete-btn" onclick="deleteItemPermanently(${item.id})" title="Remover permanentemente">
                        <i class="fas fa-trash-alt"></i>
                    </button>`
                }
            </div>
        </div>
    `).join('');
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
    
    // Mostrar preview da imagem
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('imagePreview').src = e.target.result;
    }
    reader.readAsDataURL(file);
    
    // Fazer upload da imagem
    const formData = new FormData();
    formData.append('imagem', file);
    
    try {
        // Adicionar token de autenticação à URL para evitar problemas com cabeçalhos em FormData
        const response = await fetch(`${API_BASE_URL}/cardapio/upload?token=${authToken}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salvar o caminho da imagem no campo oculto
            document.getElementById('itemImagem').value = data.imagem;
            showMessage('Imagem enviada com sucesso!', 'success');
        } else {
            showMessage(data.message || 'Erro ao enviar imagem', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        showMessage('Erro ao enviar imagem. Tente novamente.', 'error');
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
        imagePreview.src = `../${item.imagem}`;
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
    
    const formData = new FormData(e.target);
    const itemData = {
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        preco: parseFloat(formData.get('preco')),
        imagem: formData.get('imagem'),
        ordem: parseInt(formData.get('ordem')) || 0,
        destaque: formData.get('destaque') === 'on'
    };
    
    try {
        const url = editingItemId 
            ? `${API_BASE_URL}/cardapio/${editingItemId}`
            : `${API_BASE_URL}/cardapio`;
        
        const method = editingItemId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(itemData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            loadCardapio();
            showMessage(data.message, 'success');
            
            // Notificar o frontend principal sobre a mudança
            notifyFrontendUpdate();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar item:', error);
        showMessage('Erro ao salvar item', 'error');
    }
}

async function editItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${id}`);
        const data = await response.json();
        
        if (data.success) {
            openItemModal(data.item);
        }
    } catch (error) {
        console.error('Erro ao carregar item:', error);
    }
}

async function deleteItem(id) {
    if (!confirm('Tem certeza que deseja remover este item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCardapio();
            showMessage(data.message, 'success');
            
            // Notificar o frontend principal sobre a mudança
            notifyFrontendUpdate();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        showMessage('Erro ao deletar item', 'error');
    }
}

async function reactivateItem(id) {
    if (!confirm('Tem certeza que deseja reativar este item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${id}/reactivate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCardapio();
            showMessage(data.message, 'success');
            
            // Notificar o frontend principal sobre a mudança
            notifyFrontendUpdate();
        } else {
            showMessage(data.message, 'error');
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
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCardapio();
            showMessage(data.message, 'success');
            
            // Notificar o frontend principal sobre a mudança
            notifyFrontendUpdate();
        } else {
            showMessage(data.message, 'error');
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
function notifyFrontendUpdate() {
    // Disparar um evento customizado que pode ser capturado pelo frontend
    if (window.opener) {
        window.opener.postMessage({ type: 'CARDAPIO_UPDATED' }, '*');
    }
    
    // Também pode usar localStorage para comunicação
    localStorage.setItem('lastUpdate', Date.now());
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