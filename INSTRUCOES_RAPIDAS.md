# 🚀 Instruções Rápidas - Golliath Burgers

## ⚡ Início Rápido

### 1. Instale as dependências
```bash
cd backend
npm install
```

### 2. Configure o ambiente (opcional)
- Edite `backend/config.env` se necessário
- O sistema usa **SQLite** (não requer instalação de banco)

### 3. Inicie o servidor
```bash
cd backend
node server.js
```

### 4. Acesse o sistema
- **🌐 Site:** http://localhost:3000
- **🛒 Carrinho:** http://localhost:3000/carrinho.html
- **🎛️ Admin:** http://localhost:3000/admin
  - E-mail: `admin@golliath.com`
  - Senha: `admin123` (altere após primeiro login!)

## 🎯 Principais Funcionalidades

### 🌐 Para Clientes:
- **Navegação pelo cardápio** dinâmico e responsivo
- **Carrinho de compras** com persistência local
- **Checkout completo** com dados de entrega
- **Pagamento** via Dinheiro ou PIX
- **Finalização automática** via WhatsApp

### 👨‍💼 Para Administradores:
- **Gerenciamento de produtos** com upload de imagens
- **Acompanhamento de pedidos** em tempo real
- **Atualização de status** dos pedidos
- **Configurações do site** dinâmicas
- **Dashboard intuitivo** com navegação por abas

## 📋 O que foi criado

### ✅ Backend (Node.js + Express)
- **API REST completa** com todas as rotas
- **Autenticação JWT** segura para admins
- **Banco SQLite** com Sequelize ORM
- **Sistema de pedidos** com tracking de status
- **Upload de imagens** para produtos
- **CRUD completo** para cardápio, clientes, pedidos e configurações

### ✅ Frontend (Site Público)
- **Design responsivo** mantendo identidade visual
- **Cardápio dinâmico** carregado da API
- **Sistema de carrinho** completo com localStorage
- **Checkout integrado** com formulário de entrega
- **Integração WhatsApp** para finalização de pedidos
- **Múltiplas formas de pagamento** (Dinheiro, PIX)
- **Feed Instagram** e seção "Sobre Nós"

### ✅ Painel Administrativo
- **Login seguro** com criptografia
- **Gerenciamento completo do cardápio** (CRUD + imagens)
- **Sistema de pedidos** com atualização de status
- **Configurações dinâmicas** do site
- **Interface intuitiva** com navegação por abas

## 🔧 Próximos passos

1. **Inicie o servidor** com `node server.js`
2. **Acesse o painel admin** e altere as credenciais padrão
3. **Personalize o cardápio:**
   - Adicione seus produtos com imagens
   - Configure preços e descrições
   - Defina ordem de exibição
4. **Configure informações do site:**
   - Horário de funcionamento
   - Endereço e telefone
   - Texto "Sobre Nós"
   - Links das redes sociais
5. **Teste o sistema completo:**
   - Navegue pelo site público
   - Adicione itens ao carrinho
   - Finalize um pedido de teste
   - Acompanhe o pedido no painel admin

## 🆘 Se algo não funcionar

### ❌ Problemas comuns:
- **Servidor não inicia:** Verifique se a porta 3000 está livre
- **Banco de dados:** O SQLite é criado automaticamente (não requer configuração)
- **Imagens não carregam:** Verifique permissões da pasta `img/produtos/`
- **Carrinho não funciona:** Limpe o localStorage: `localStorage.clear()`
- **WhatsApp não abre:** Teste em dispositivo móvel
- **Login admin falha:** Use `admin@golliath.com` / `admin123`

### 📚 Mais informações:
- Leia o **README.md** completo para documentação detalhada
- Verifique as **APIs disponíveis** na documentação
- Consulte a **estrutura do projeto** para entender a organização

---

**🎉 Sistema E-commerce Completo Pronto para Uso!** 🍔🛒