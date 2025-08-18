const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Configuração do banco de dados inline
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const dbPath = isProduction 
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '../backend/database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: isProduction ? false : console.log,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    timeout: 20000
  },
  retry: {
    match: [/SQLITE_BUSY/],
    max: 3
  }
});

// Definir modelos inline
const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'admins',
  timestamps: true,
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        admin.password = await bcrypt.hash(admin.password, 10);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await bcrypt.hash(admin.password, 10);
      }
    }
  }
});

Admin.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'clientes',
  timestamps: true
});

const Cardapio = sequelize.define('Cardapio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cardapio',
  timestamps: true
});

const SiteInfo = sequelize.define('SiteInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chave: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'siteinfo',
  timestamps: true
});

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id'
    }
  },
  itens: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pendente'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pedidos',
  timestamps: true
});

// Definir associações
Pedido.belongsTo(Cliente, { foreignKey: 'clienteId' });
Cliente.hasMany(Pedido, { foreignKey: 'clienteId' });

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

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'golliath_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../img/produtos/'));
  },
  filename: function (req, file, cb) {
    cb(null, 'produto-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Servir arquivos específicos da área admin
app.use('/admin', express.static(path.join(__dirname, '../admin'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isValidPassword = await admin.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Conta desativada' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'golliath_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas do cardápio
app.get('/api/cardapio', async (req, res) => {
  try {
    const itens = await Cardapio.findAll({
      where: { disponivel: true },
      order: [['categoria', 'ASC'], ['nome', 'ASC']]
    });
    res.json(itens);
  } catch (error) {
    console.error('Erro ao buscar cardápio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/cardapio/admin', authenticateToken, async (req, res) => {
  try {
    const itens = await Cardapio.findAll({
      order: [['categoria', 'ASC'], ['nome', 'ASC']]
    });
    res.json(itens);
  } catch (error) {
    console.error('Erro ao buscar cardápio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/api/cardapio', authenticateToken, upload.single('imagem'), async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, disponivel } = req.body;
    const imagem = req.file ? `/img/produtos/${req.file.filename}` : null;

    const novoItem = await Cardapio.create({
      nome,
      descricao,
      preco: parseFloat(preco),
      categoria,
      imagem,
      disponivel: disponivel === 'true'
    });

    res.status(201).json(novoItem);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas de informações do site
app.get('/api/siteinfo', async (req, res) => {
  try {
    const infos = await SiteInfo.findAll();
    const siteInfo = {};
    infos.forEach(info => {
      siteInfo[info.chave] = info.valor;
    });
    res.json(siteInfo);
  } catch (error) {
    console.error('Erro ao buscar informações do site:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.put('/api/siteinfo/:chave', authenticateToken, async (req, res) => {
  try {
    const { chave } = req.params;
    const { valor } = req.body;

    const [siteInfo, created] = await SiteInfo.findOrCreate({
      where: { chave },
      defaults: { valor }
    });

    if (!created) {
      await siteInfo.update({ valor });
    }

    res.json(siteInfo);
  } catch (error) {
    console.error('Erro ao atualizar informação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas de clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      order: [['nome', 'ASC']]
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;
    
    const novoCliente = await Cliente.create({
      nome,
      telefone,
      endereco
    });

    res.status(201).json(novoCliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas de pedidos
app.get('/api/pedidos', authenticateToken, async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [{
        model: Cliente,
        attributes: ['nome', 'telefone', 'endereco']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    const { clienteId, itens, total, observacoes } = req.body;
    
    const novoPedido = await Pedido.create({
      clienteId,
      itens: JSON.stringify(itens),
      total: parseFloat(total),
      observacoes,
      status: 'pendente'
    });

    const pedidoCompleto = await Pedido.findByPk(novoPedido.id, {
      include: [{
        model: Cliente,
        attributes: ['nome', 'telefone', 'endereco']
      }]
    });

    res.status(201).json(pedidoCompleto);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.put('/api/pedidos/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    await pedido.update({ status });
    
    const pedidoAtualizado = await Pedido.findByPk(id, {
      include: [{
        model: Cliente,
        attributes: ['nome', 'telefone', 'endereco']
      }]
    });

    res.json(pedidoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Rota para página de admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Rota específica para recursos admin
app.get('/admin/*', (req, res) => {
  const filePath = req.path.replace('/admin', '');
  res.sendFile(path.join(__dirname, '../admin', filePath));
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