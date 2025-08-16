// Sistema de Carrinho
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPedido = null;

// Constantes
const API_BASE_URL = 'http://localhost:3000/api';

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartDisplay();
    setupEventListeners();
});











// Configurar event listeners
function setupEventListeners() {
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Formulário de cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Forma de pagamento
    const formaPagamento = document.getElementById('forma-pagamento');
    if (formaPagamento) {
        formaPagamento.addEventListener('change', handleFormaPagamentoChange);
    }

    // Máscaras para campos
    setupMasks();
}

// Configurar máscaras
function setupMasks() {
    // Máscara para telefone
    const telefoneInput = document.getElementById('reg-telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                e.target.value = value;
            }
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('reg-cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                e.target.value = value;
            }
        });
    }
}

// Aplicar máscaras para campos de perfil
function aplicarMascaras() {
    // Máscara para telefone
    const telefoneInput = document.getElementById('perfil-telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                e.target.value = value;
            }
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('perfil-cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                e.target.value = value;
            }
        });
    }
}

// Carregar carrinho
function loadCart() {
    const cartItems = document.getElementById('carrinho-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Seu carrinho está vazio</h3>
                <p>Adicione alguns itens deliciosos do nosso cardápio!</p>
                <button class="btn-continue" onclick="window.location.href='index.html#menu'">
                    <i class="fas fa-utensils"></i> Ver Cardápio
                </button>
            </div>
        `;
        document.getElementById('btn-checkout').disabled = true;
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="carrinho-item">
            <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='img/logoGB.PNG'">
            <div class="carrinho-item-info">
                <h4>${item.nome}</h4>
                <div class="price">R$ ${item.preco.toFixed(2)}</div>
            </div>
            <div class="carrinho-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    updateResumo();
}

// Atualizar quantidade
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCart();
            updateCartDisplay();
        }
    }
}

// Remover item do carrinho
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartDisplay();
}

// Atualizar display do carrinho
function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartIcon = document.getElementById('cart-icon');
    
    if (cartIcon) {
        cartIcon.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">${cartCount}</span>
        `;
    }
}

// Atualizar resumo
function updateResumo() {
    const subtotal = cart.reduce((total, item) => total + (item.preco * item.quantity), 0);
    const total = subtotal;

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

// Proceder para checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho primeiro!');
        return;
    }

    document.getElementById('checkout-modal').style.display = 'flex';
}

// Fechar modal de checkout
function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
    resetCheckoutForms();
}

// Resetar formulários
function resetCheckoutForms() {
    // Limpar campos de informações de entrega
    document.getElementById('customer-nome').value = '';
    document.getElementById('customer-telefone').value = '';
    document.getElementById('customer-endereco').value = '';
    document.getElementById('order-observacoes').value = '';
    document.getElementById('forma-pagamento').value = 'dinheiro';
    document.getElementById('troco').value = '';
    document.getElementById('troco-group').style.display = 'none';
}







// Mostrar informações do pedido
function showOrderInfo() {
    // A seção de informações do pedido já está visível no HTML simplificado
    console.log('Informações do pedido prontas para preenchimento');
}







// Handle forma de pagamento
function handleFormaPagamentoChange() {
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const trocoGroup = document.getElementById('troco-group');
    
    if (formaPagamento === 'dinheiro') {
        trocoGroup.style.display = 'block';
    } else {
        trocoGroup.style.display = 'none';
    }
}

// Confirmar pedido
async function confirmOrder() {
    // Validar informações de entrega
    const nome = document.getElementById('customer-nome').value.trim();
    const telefone = document.getElementById('customer-telefone').value.trim();
    const endereco = document.getElementById('customer-endereco').value.trim();
    
    if (!nome || !telefone || !endereco) {
        alert('Por favor, preencha todas as informações de entrega!');
        return;
    }

    const observacoes = document.getElementById('order-observacoes').value;
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const troco = document.getElementById('troco').value;

    const pedidoData = {
        nome: nome,
        telefone: telefone,
        endereco: endereco,
        itens: cart,
        total: cart.reduce((total, item) => total + (item.preco * item.quantity), 0),
        observacoes: observacoes,
        forma_pagamento: formaPagamento,
        troco: troco ? parseFloat(troco) : null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });

        const data = await response.json();

        if (data.success) {
            currentPedido = data.pedido;
            
            // Salvar uma cópia dos itens do carrinho antes de limpar
            const cartItems = [...cart];
            
            // Limpar carrinho
            cart = [];
            localStorage.removeItem('cart');
            updateCartDisplay();
            
            // Fechar modal de checkout
            document.getElementById('checkout-modal').style.display = 'none';
            
            // Redirecionar automaticamente para o WhatsApp
            setTimeout(() => {
                sendWhatsAppWithOrderDetails(cartItems);
            }, 500);
        } else {
            alert(data.message || 'Erro ao criar pedido. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao criar pedido. Tente novamente.');
    }
}

// Função para enviar detalhes do pedido via WhatsApp
function sendWhatsAppWithOrderDetails(cartItems) {
    if (!currentPedido) return;
    
    // Usar os itens do carrinho passados como parâmetro ou o carrinho atual como fallback
    const items = cartItems || cart;
    
    // Obter informações de entrega do formulário
    const nome = document.getElementById('customer-nome').value.trim();
    const telefone = document.getElementById('customer-telefone').value.trim();
    const endereco = document.getElementById('customer-endereco').value.trim();
    
    // Formatar itens do pedido
    const itensFormatados = items.map(item => 
        `${item.quantity}x ${item.nome} - R$ ${(item.preco * item.quantity).toFixed(2)}`
    ).join('\n');
    
    // Criar mensagem detalhada
    const message = `*PEDIDO #${currentPedido.numero_pedido}*\n\n` +
        `*Cliente:* ${nome}\n` +
        `*Telefone:* ${telefone}\n` +
        `*Endereço:* ${endereco}\n\n` +
        `*ITENS DO PEDIDO:*\n${itensFormatados}\n\n` +
        `*Total:* R$ ${currentPedido.total.toFixed(2)}\n\n` +
        `*Forma de pagamento:* ${document.getElementById('forma-pagamento').value}` +
        (document.getElementById('troco').value ? `\n*Troco para:* R$ ${document.getElementById('troco').value}` : '') +
        (document.getElementById('order-observacoes').value ? `\n\n*Observações:* ${document.getElementById('order-observacoes').value}` : '');
    
    // Abrir WhatsApp com a mensagem
    const whatsappUrl = `https://wa.me/5511957548091?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Fechar o modal de checkout
    document.getElementById('checkout-modal').style.display = 'none';
}

// Mostrar modal de sucesso
function showSuccessModal() {
    document.getElementById('checkout-modal').style.display = 'none';
    document.getElementById('numero-pedido').textContent = currentPedido.numero_pedido;
    document.getElementById('success-modal').style.display = 'flex';
    
    // Limpar carrinho
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
}

// Enviar via WhatsApp (para o botão no modal de sucesso)
function sendWhatsApp() {
    if (!currentPedido) return;
    
    // Recuperar os itens do pedido a partir do objeto currentPedido
    try {
        // O campo itens do pedido é armazenado como JSON string
        const pedidoItens = JSON.parse(currentPedido.itens || '[]');
        sendWhatsAppWithOrderDetails(pedidoItens);
    } catch (error) {
        console.error('Erro ao processar itens do pedido:', error);
        // Fallback para a mensagem simples caso não consiga recuperar os itens
        const message = `Olá! Gostaria de confirmar meu pedido ${currentPedido.numero_pedido} no valor de R$ ${currentPedido.total.toFixed(2)}.`;
        const whatsappUrl = `https://wa.me/5511957548091?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Função para abrir carrinho (chamada do header)
window.openCart = function() {
    window.location.href = 'carrinho.html';
};