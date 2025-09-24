# 🍔 Golliath Burgers - Sistema Completo de E-commerce

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://golliathburgers.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)

> **🌐 Site ao vivo:** [https://golliathburgers.vercel.app](https://golliathburgers.vercel.app)

Sistema completo de e-commerce para hamburgueria com site público responsivo, carrinho de compras, sistema de pedidos via WhatsApp e painel administrativo avançado. Desenvolvido com arquitetura serverless e banco de dados em nuvem.

## 🚀 Funcionalidades Principais

### 🌐 Frontend (Site Público)
- ✅ **Design responsivo e moderno** com tema personalizado
- ✅ **Cardápio dinâmico** carregado da API em tempo real
- ✅ **Sistema de carrinho de compras** completo com localStorage
- ✅ **Checkout integrado** com formulário de entrega
- ✅ **Integração WhatsApp** para finalização de pedidos
- ✅ **Atualização automática** do cardápio (polling inteligente)
- ✅ **Seção "Sobre Nós"** com informações da empresa
- ✅ **Feed do Instagram** com galeria de fotos
- ✅ **Informações de contato** e localização dinâmicas
- ✅ **Footer com redes sociais** (Instagram e iFood)
- ✅ **PWA Ready** com favicon e meta tags otimizadas
- ✅ **Smooth scrolling** e efeitos visuais avançados
- ✅ **Responsividade completa** para todos os dispositivos
- ✅ **Cache inteligente** com versionamento automático

### 🛒 Sistema de E-commerce
- ✅ **Carrinho persistente** com localStorage
- ✅ **Adição/remoção de itens** com feedback visual
- ✅ **Controle de quantidade** por item
- ✅ **Cálculo automático** de subtotal e total
- ✅ **Página dedicada do carrinho** (carrinho.html)
- ✅ **Formulário de checkout** com validação completa
- ✅ **Múltiplas formas de pagamento** (Dinheiro, PIX, Cartão)
- ✅ **Campo para troco** quando pagamento em dinheiro
- ✅ **Observações do pedido** personalizáveis
- ✅ **Geração automática** de número do pedido
- ✅ **Redirecionamento automático** para WhatsApp com detalhes formatados

### 🔧 Backend (API Serverless)
- ✅ **Arquitetura serverless** otimizada para Vercel
- ✅ **Autenticação JWT** segura para administradores
- ✅ **CRUD completo do cardápio** com upload de imagens
- ✅ **Sistema híbrido** Supabase + cache local
- ✅ **Circuit breaker** para alta disponibilidade
- ✅ **Monitoramento avançado** com métricas em tempo real
- ✅ **Upload de imagens** via ImageKit
- ✅ **Fallback inteligente** para SQLite local
- ✅ **Tratamento robusto de erros** e logging
- ✅ **CORS configurado** para produção
- ✅ **Compressão automática** de respostas
- ✅ **Rate limiting** e proteção contra ataques

### 🎛️ Painel Administrativo
- ✅ **Login seguro** com autenticação JWT
- ✅ **Dashboard intuitivo** com navegação por abas
- ✅ **Gerenciamento completo do cardápio:**
  - Adicionar/editar/remover itens
  - Upload de imagens com preview
  - Controle de ordem e destaque
  - Ativação/desativação de itens
  - Categorização automática
- ✅ **Interface responsiva** para mobile e desktop
- ✅ **Feedback visual** para todas as ações
- ✅ **Validação de formulários** em tempo real

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** com semântica moderna
- **CSS3** com variáveis CSS e Flexbox/Grid
- **JavaScript ES6+** vanilla com módulos
- **Font Awesome 6.4.0** para ícones
- **Google Fonts** (Oswald + Roboto)
- **PWA** com service worker

### Backend
- **Node.js 22.x** com ES6+ features
- **Express.js 4.19.2** framework web
- **Supabase 2.57.4** banco de dados principal
- **SQLite 5.1.7** fallback local
- **Sequelize 6.37.3** ORM
- **JWT 9.0.2** autenticação
- **bcryptjs 2.4.3** criptografia
- **Multer 2.0.0** upload de arquivos
- **ImageKit 5.2.0** upload e processamento de imagens
- **CORS 2.8.5** controle de acesso

### Deploy & DevOps
- **Vercel** plataforma serverless
- **GitHub** controle de versão
- **dotenv 16.4.5** variáveis de ambiente
- **Nodemon 3.0.1** desenvolvimento

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- Conta no Vercel (para deploy)
- Conta no Supabase (banco de dados)
- Conta no ImageKit (upload de imagens)

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/golliath-burgers.git
cd golliath-burgers
```

### 2. Instale as dependências
```bash
# Dependências principais
npm install

# Dependências da API
cd api
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Environment
NODE_ENV=development
```

### 4. Configure o banco de dados Supabase

Execute o SQL no painel do Supabase:

```sql
-- Criar tabela cardapio
CREATE TABLE cardapio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100),
  imagem TEXT,
  disponivel BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO cardapio (nome, descricao, preco, categoria, disponivel, destaque, ordem) VALUES
('Golliath Classic', 'Hambúrguer artesanal com blend especial, queijo, alface, tomate e molho da casa', 25.90, 'Hambúrgueres', true, true, 1),
('Bacon Lovers', 'Hambúrguer com muito bacon, queijo cheddar, cebola caramelizada e molho barbecue', 28.90, 'Hambúrgueres', true, false, 2);
```

### 5. Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Configurar variáveis de ambiente no painel do Vercel
```

## 🔐 Acesso ao Sistema

### Site Público
- **URL:** [https://golliathburgers.vercel.app](https://golliathburgers.vercel.app)
- Navegue pelo cardápio, adicione itens ao carrinho e finalize via WhatsApp

### Painel Administrativo
- **URL:** [https://golliathburgers.vercel.app/admin](https://golliathburgers.vercel.app/admin)
- **E-mail:** `admin@golliath.com`
- **Senha:** Configurada no sistema

## 📁 Estrutura do Projeto

```
golliath-burgers/
├── 📁 api/                     # API Serverless
│   ├── 📁 auth/               # Autenticação
│   ├── 📁 utils/              # Utilitários
│   │   ├── vercelDatabase.js  # Gerenciador híbrido de BD
│   │   ├── supabase.js        # Cliente Supabase
│   │   ├── monitoring.js      # Monitoramento
│   │   └── imageUpload.js     # Upload de imagens
│   ├── index.js               # API principal
│   └── package.json           # Dependências da API
├── 📁 admin/                  # Painel administrativo
│   ├── index.html            # Interface do admin
│   ├── 📁 css/               # Estilos do admin
│   └── 📁 js/                # Scripts do admin
├── 📁 backend/               # Backend local (desenvolvimento)
│   ├── 📁 models/            # Modelos Sequelize
│   ├── 📁 routes/            # Rotas Express
│   ├── 📁 middleware/        # Middlewares
│   └── server.js             # Servidor local
├── 📁 css/                   # Estilos do frontend
├── 📁 js/                    # Scripts do frontend
├── 📁 img/                   # Imagens estáticas
├── index.html                # Página principal
├── carrinho.html             # Página do carrinho
├── vercel.json               # Configuração Vercel
└── package.json              # Dependências principais
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento local
npm run dev

# Produção local
npm start

# Deploy no Vercel
vercel --prod

# Verificar status de produção
node check-prod-final.js

# Sincronizar dados com Supabase
node force-sync-prod.js
```

## 🌟 Funcionalidades Avançadas

### Sistema Híbrido de Banco de Dados
- **Supabase** como banco principal em produção
- **SQLite** como fallback para desenvolvimento
- **Circuit breaker** para alta disponibilidade
- **Sincronização automática** entre ambientes

### Monitoramento e Performance
- **Métricas em tempo real** de uso da API
- **Logging avançado** de erros e performance
- **Cache inteligente** com invalidação automática
- **Compressão** de respostas para otimização

### Segurança
- **Autenticação JWT** com refresh tokens
- **Validação** de entrada em todas as rotas
- **Rate limiting** para prevenir ataques
- **CORS** configurado adequadamente
- **Sanitização** de dados de entrada

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

**Golliath Burgers**
- 📱 WhatsApp: +55 (11) 95754-8091
- 📍 Endereço: Avenida Graciela Flores de Piteri, 255 - Aliança - Osasco - SP
- 📷 Instagram: [@golliathburgers](https://instagram.com/golliathburgers)
- 🌐 Site: [https://golliathburgers.vercel.app](https://golliathburgers.vercel.app)

---

⭐ **Desenvolvido com ❤️ para a melhor experiência em delivery de hambúrgueres artesanais!**
