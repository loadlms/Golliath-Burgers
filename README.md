# 🍔 Golliath Burgers - Sistema de Gerenciamento Completo

Sistema completo de e-commerce para hamburgueria com site público, carrinho de compras, sistema de pedidos e painel administrativo avançado.

## 🚀 Funcionalidades Principais

### 🌐 Frontend (Site Público)
- ✅ **Design responsivo e moderno** com tema personalizado
- ✅ **Cardápio dinâmico** carregado da API em tempo real
- ✅ **Sistema de carrinho de compras** completo
- ✅ **Checkout integrado** com formulário de entrega
- ✅ **Integração WhatsApp** para finalização de pedidos
- ✅ **Atualização automática** do cardápio (polling a cada 2s)
- ✅ **Seção "Sobre Nós"** com informações da empresa
- ✅ **Feed do Instagram** com galeria de fotos
- ✅ **Informações de contato** e localização dinâmicas
- ✅ **Footer com redes sociais** (Instagram e iFood)
- ✅ **Favicon personalizado** em todas as páginas
- ✅ **Smooth scrolling** e efeitos visuais
- ✅ **Responsividade completa** para mobile e desktop

### 🛒 Sistema de E-commerce
- ✅ **Carrinho persistente** (localStorage)
- ✅ **Adição/remoção de itens** com feedback visual
- ✅ **Controle de quantidade** por item
- ✅ **Cálculo automático** de subtotal e total
- ✅ **Página dedicada do carrinho** (carrinho.html)
- ✅ **Formulário de checkout** com validação
- ✅ **Múltiplas formas de pagamento** (Dinheiro, PIX)
- ✅ **Campo para troco** quando pagamento em dinheiro
- ✅ **Observações do pedido** personalizáveis
- ✅ **Geração automática** de número do pedido
- ✅ **Redirecionamento automático** para WhatsApp com detalhes

### 🔧 Backend (API Node.js + Express)
- ✅ **Autenticação JWT** para administradores
- ✅ **CRUD completo do cardápio** com upload de imagens
- ✅ **Sistema de pedidos** com status tracking
- ✅ **Gerenciamento de clientes** (futuro)
- ✅ **Configurações dinâmicas** do site
- ✅ **Banco de dados SQLite** com Sequelize ORM
- ✅ **Middleware de autenticação** e validação
- ✅ **Upload de imagens** com Multer
- ✅ **Relacionamentos** entre modelos
- ✅ **Inicialização automática** de dados padrão
- ✅ **Tratamento de erros** robusto
- ✅ **CORS configurado** para desenvolvimento

### 🎛️ Painel Administrativo
- ✅ **Login seguro** com e-mail e senha criptografada
- ✅ **Dashboard intuitivo** com navegação por abas
- ✅ **Gerenciamento completo do cardápio:**
  - Adicionar/editar/remover itens
  - Upload de imagens dos produtos
  - Controle de ordem e destaque
  - Ativação/desativação de itens

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- Navegador web moderno
- **Banco de dados:** SQLite (incluído, não requer instalação)

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/loadlms/Golliath-Burgers
cd golliath-burgers
```

### 2. Instale as dependências do backend
```bash
cd backend
npm install
```

### 3. Configure o ambiente (opcional)
O sistema usa **SQLite** que é criado automaticamente. Se necessário, edite o arquivo `backend/config.env`:
```env
JWT_SECRET=sua_chave_secreta_aqui
ADMIN_EMAIL=admin@golliath.com
ADMIN_PASSWORD=
PORT=3000
```

### 4. Inicie o servidor
```bash
cd backend
node server.js
```

O servidor estará rodando em `http://localhost:3000`

## 🔐 Acesso ao Painel Administrativo

### Credenciais padrão:
- **URL:** `http://localhost:3000/admin`
- **E-mail:** `admin@golliath.com`
- **Senha:** Compartilhada apenas com o admin!

## 📁 Estrutura do Projeto

```
golliath-burgers/
├── backend/                    # Servidor Node.js + Express
│   ├── config/
│   │   └── database.js        # Configuração do banco SQLite
│   ├── models/                # Modelos Sequelize
│   │   ├── Admin.js          # Modelo de administradores
│   │   ├── Cliente.js        # Modelo de clientes
│   │   ├── Cardapio.js       # Modelo do cardápio
│   │   ├── Pedido.js         # Modelo de pedidos
│   │   └── SiteInfo.js       # Configurações do site
│   ├── routes/               # Rotas da API
│   │   ├── auth.js          # Autenticação JWT
│   │   ├── clientes.js      # CRUD de clientes
│   │   ├── cardapio.js      # CRUD do cardápio
│   │   ├── pedidos.js       # Sistema de pedidos
│   │   └── siteInfo.js      # Configurações dinâmicas
│   ├── middleware/
│   │   └── auth.js          # Middleware de autenticação
│   ├── uploads/             # Arquivos enviados
│   ├── server.js            # Servidor principal
│   ├── package.json         # Dependências do backend
│   └── config.env           # Variáveis de ambiente
├── admin/                   # Painel administrativo
│   ├── index.html          # Interface do admin
│   ├── admin.js            # Lógica do painel
│   └── admin.css           # Estilos do admin
├── css/
│   └── style.css           # Estilos do site público
├── js/
│   ├── script.js           # Lógica da página principal
│   └── carrinho.js         # Sistema de carrinho e checkout
├── img/
│   ├── produtos/           # Imagens dos produtos
│   ├── logo.png            # Logo da empresa
│   ├── favicon.ico         # Favicon do site
│   └── [outras imagens]    # Assets visuais
├── index.html              # Página principal
├── carrinho.html           # Página do carrinho
├── database.sqlite         # Banco de dados SQLite
└── README.md               # Documentação
```

## 🔧 Configuração do Banco de Dados

O sistema criará automaticamente as seguintes tabelas:

- **admins** - Administradores do sistema
- **clientes** - Cadastro de clientes (estrutura preparada)
- **cardapio** - Itens do menu com imagens e categorias
- **pedidos** - Sistema completo de pedidos
- **site_info** - Configurações dinâmicas do site

## 📱 Como Usar

### 👨‍💼 Para Administradores:

1. **Acesse o painel:** `http://localhost:3000/admin`
2. **Faça login** com as credenciais padrão
3. **Gerencie o cardápio:**
   - Adicione novos itens com upload de imagens
   - Edite preços, descrições e categorias
   - Controle ordem de exibição e itens em destaque
   - Ative/desative itens conforme disponibilidade

### 🍔 Para Clientes:

1. **Acesse o site:** `http://localhost:3000`
2. **Navegue pelo cardápio** dinâmico
3. **Adicione itens ao carrinho** com um clique
4. **Acesse o carrinho:** `http://localhost:3000/carrinho.html`
5. **Finalize seu pedido:**
   - Preencha dados de entrega
   - Escolha forma de pagamento (Dinheiro/PIX)
   - Adicione observações se necessário
   - Confirme e seja redirecionado para WhatsApp
6. **Acompanhe seu pedido** via WhatsApp

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados
- Proteção contra SQL injection
- CORS configurado

## 🛠️ Tecnologias Utilizadas

### Frontend:
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos responsivos e animações
- **JavaScript ES6+** - Lógica do cliente
- **LocalStorage** - Persistência do carrinho
- **Fetch API** - Comunicação com backend

### Backend:
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **SQLite** - Banco de dados leve
- **JWT** - Autenticação segura
- **bcrypt** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **CORS** - Política de origem cruzada

## 🚀 Deploy

### Para produção:

1. **Configure variáveis de ambiente:**
```env
NODE_ENV=production
JWT_SECRET=chave_secreta_muito_forte_aqui
ADMIN_EMAIL=admin@golliathburgers.com
ADMIN_PASSWORD=senha_segura_aqui
PORT=3000
```

2. **Instale PM2 (gerenciador de processos):**
```bash
npm install -g pm2
```

3. **Inicie o servidor:**
```bash
cd backend
pm2 start server.js --name golliath-burgers
```

4. **Configure proxy reverso (Nginx):**
```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 Solução de Problemas

### ❌ Erro de conexão com banco:
- O sistema usa **SQLite** (não requer instalação)
- Verifique se o arquivo `database.sqlite` foi criado
- Confirme as permissões de escrita na pasta do projeto
- Reinicie o servidor se necessário

### 🌐 Erro de CORS:
- Verifique se o frontend está acessando `http://localhost:3000`
- Confirme se o servidor backend está rodando
- Verifique se não há conflito de portas

### 🖼️ Imagens não carregam:
- Verifique se as imagens existem em `img/produtos/`
- Confirme se os caminhos estão corretos na API
- Verifique permissões de leitura da pasta `img/`

### 🛒 Carrinho não funciona:
- Verifique se o JavaScript está habilitado
- Limpe o localStorage: `localStorage.clear()`
- Confirme se a API está respondendo corretamente

### 📱 WhatsApp não abre:
- Verifique se o número está configurado corretamente
- Teste em dispositivo móvel (WhatsApp instalado)
- Confirme se a URL está sendo gerada corretamente

### 🔐 Problemas de login admin:
- Use as credenciais padrão do `.env`
- Verifique se o token JWT não expirou
- Limpe o localStorage e tente novamente

## 🔌 APIs Disponíveis

### 🔐 Autenticação (`/api/auth`)
- `POST /login` - Login de administrador
- `POST /verify` - Verificar token JWT

### 🍔 Cardápio (`/api/cardapio`)
- `GET /` - Listar itens ativos (público)
- `GET /admin/all` - Listar todos os itens (admin)
- `GET /:id` - Buscar item por ID (público)
- `POST /` - Criar novo item (admin)
- `PUT /:id` - Atualizar item (admin)
- `DELETE /:id` - Desativar item (admin)

### 📋 Pedidos (`/api/pedidos`)
- `GET /` - Listar todos os pedidos (admin)
- `POST /` - Criar novo pedido (público)
- `PUT /:id` - Atualizar status do pedido (admin)

### 👥 Clientes (`/api/clientes`)
- `GET /` - Listar clientes (admin)
- `POST /` - Cadastrar cliente (público)
- `GET /:id` - Buscar cliente por ID (admin)
- `PUT /:id` - Atualizar cliente (admin)
- `DELETE /:id` - Remover cliente (admin)

### ⚙️ Configurações (`/api/siteinfo`)
- `GET /` - Buscar configurações (público)
- `PUT /` - Atualizar configurações (admin)

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Entre em contato via e-mail

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para o Golliath Burgers**