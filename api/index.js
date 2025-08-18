const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../backend/config.env' });

// Importar modelos
const Admin = require('../backend/models/Admin');
const Cliente = require('../backend/models/Cliente');
const Cardapio = require('../backend/models/Cardapio');
const SiteInfo = require('../backend/models/SiteInfo');
const Pedido = require('../backend/models/Pedido');

// Importar rotas
const authRoutes = require('../backend/routes/auth');
const clientesRoutes = require('../backend/routes/clientes');
const cardapioRoutes = require('../backend/routes/cardapio');
const siteInfoRoutes = require('../backend/routes/siteinfo');
const pedidosRoutes = require('../backend/routes/pedidos');

// Importar configuração do banco
const sequelize = require('../backend/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers para Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cardapio', cardapioRoutes);
app.use('/api/siteinfo', siteInfoRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Rota para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Rota para página de admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Função para inicializar dados padrão
async function initializeDefaultData() {
  try {
    // Criar admin padrão se não existir
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@golliath.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const adminExists = await Admin.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      const newAdmin = await Admin.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Administrador Golliath'
      });
      console.log('✅ Admin padrão criado:', adminEmail);
      console.log('✅ Senha do admin:', adminPassword);
    } else {
      console.log('✅ Admin já existe:', adminEmail);
    }

    // Criar informações padrão do site
    const defaultSiteInfo = [
      { chave: 'horario_funcionamento', valor: 'Quarta a Domingo: 18h30 às 23h', descricao: 'Horário de funcionamento' },
      { chave: 'endereco', valor: 'Avenida Graciela Flores de Piteri, 255 - Aliança - Osasco - SP', descricao: 'Endereço da loja' },
      { chave: 'telefone', valor: '+55 (11) 95754-8091', descricao: 'Telefone de contato' },
      { chave: 'whatsapp', valor: '5511957548091', descricao: 'WhatsApp para pedidos' },
      { chave: 'instagram', valor: '@golliathburgers', descricao: 'Instagram da loja' },
      { chave: 'sobre_texto', valor: 'Nascemos da paixão por hambúrgueres artesanais e da vontade de oferecer uma experiência gastronômica única. O Golliath Burgers traz o conceito de hambúrgueres grandiosos em tamanho e sabor.', descricao: 'Texto sobre a empresa' }
    ];

    for (const info of defaultSiteInfo) {
      const exists = await SiteInfo.findOne({ where: { chave: info.chave } });
      if (!exists) {
        await SiteInfo.create(info);
      }
    }
    console.log('✅ Informações padrão do site criadas');

    // Criar itens padrão do cardápio
    const defaultCardapio = [
      {
        nome: 'X BACON DE GOLIATH',
        descricao: 'Burger de 90g, com American Cheese, 2 fatias de bacon, molho especial de Golliath no pão brioche tostado na manteiga.',
        preco: 25.90,
        imagem: 'img/_MG_0316.jpg',
        ordem: 1,
        destaque: true
      },
      {
        nome: 'GOLLIATH TRIPLO P.C.Q',
        descricao: '3x mais carne, 3x mais queijo. Com 3 Burguers de 90g totalizando 270g de carne, e com fatias de American Cheese, no pão brioche tostado na manteiga.',
        preco: 32.90,
        imagem: 'img/_MG_0191.jpg',
        ordem: 2,
        destaque: true
      },
      {
        nome: 'GOLLIATH TRIPLO BACON',
        descricao: '3x mais carne, 3x mais queijo e 3x mais bacon. Com 3 Burguers de 90g totalizando 270g de carne, com fatias de American Cheese, 2 fatias de bacon por andar, e molho especial de Golliath no pão brioche tostado na manteiga.',
        preco: 39.90,
        imagem: 'img/_MG_0309.jpg',
        ordem: 3,
        destaque: true
      },
      {
        nome: 'GOLLIATH OKLAHOMA',
        descricao: '4 burguers de 90g ao estilo Oklahoma, totalizando 360g de blend, com 4 fatias de queijo cheddar, no pão brioche selado na manteiga.',
        preco: 49.90,
        imagem: 'img/_MG_6201.jpg',
        ordem: 4,
        destaque: true
      }
    ];

    for (const item of defaultCardapio) {
      const exists = await Cardapio.findOne({ where: { nome: item.nome } });
      if (!exists) {
        await Cardapio.create(item);
      }
    }
    console.log('✅ Cardápio padrão criado');

  } catch (error) {
    console.error('❌ Erro ao inicializar dados padrão:', error);
  }
}

// Configurar relacionamentos entre modelos
function setupAssociations() {
  // Cliente tem muitos Pedidos
  Cliente.hasMany(Pedido, { foreignKey: 'cliente_id', as: 'pedidos' });
  Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
}

// Variável para controlar se o banco já foi inicializado
let isInitialized = false;

// Inicializar banco de dados
async function initializeDatabase() {
  if (isInitialized) return;
  
  try {
    // Configurar relacionamentos
    setupAssociations();
    
    // Testar conexão primeiro
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Sincronizar modelos com o banco
    await sequelize.sync({ alter: true });
    console.log('✅ Banco de dados sincronizado');

    // Inicializar dados padrão
    await initializeDefaultData();
    console.log('✅ Dados padrão inicializados');
    
    isInitialized = true;

  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    // Em caso de erro, permitir nova tentativa
    isInitialized = false;
  }
}

// Middleware para garantir que o banco esteja inicializado
app.use(async (req, res, next) => {
  if (!isInitialized) {
    await initializeDatabase();
  }
  next();
});

// Inicializar banco quando o módulo for carregado (para desenvolvimento)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  initializeDatabase();
}

// Exportar o app para Vercel
module.exports = app;