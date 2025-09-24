const express = require('express');
const Cardapio = require('../models/Cardapio');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../img/produtos');
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'produto-' + uniqueSuffix + ext);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // limite de 5MB
  }
});

const router = express.Router();

// Listar todos os itens do cardápio (público)
router.get('/', async (req, res) => {
  try {
    const cardapio = await Cardapio.findAll({
      where: { isActive: true },
      order: [['ordem', 'ASC'], ['destaque', 'DESC']]
    });

    res.json({
      success: true,
      cardapio
    });

  } catch (error) {
    console.error('Erro ao listar cardápio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar todos os itens do cardápio para admin (incluindo inativos)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const cardapio = await Cardapio.findAll({
      order: [['ordem', 'ASC'], ['destaque', 'DESC']]
    });

    res.json({
      success: true,
      cardapio
    });

  } catch (error) {
    console.error('Erro ao listar cardápio para admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar novo item no cardápio (apenas admin)
router.post('/', auth, async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      imagem,
      categoria,
      ordem,
      destaque
    } = req.body;

    if (!nome || !descricao || !preco || !imagem) {
      return res.status(400).json({
        success: false,
        message: 'Nome, descrição, preço e imagem são obrigatórios'
      });
    }

    const item = await Cardapio.create({
      nome,
      descricao,
      preco,
      imagem,
      categoria: categoria || 'burger',
      ordem: ordem || 0,
      destaque: destaque || false
    });

    res.status(201).json({
      success: true,
      message: 'Item adicionado ao cardápio com sucesso',
      item
    });

  } catch (error) {
    console.error('Erro ao criar item do cardápio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de sincronização para verificar mudanças no cardápio
router.get('/sync', async (req, res) => {
  try {
    // Obter timestamp da última modificação
    const lastModified = await Cardapio.max('updatedAt');
    const itemCount = await Cardapio.count({ where: { isActive: true } });
    
    // Gerar hash simples baseado no timestamp e quantidade de itens
    const crypto = require('crypto');
    const hashData = `${lastModified}-${itemCount}`;
    const hash = crypto.createHash('md5').update(hashData).digest('hex');
    
    res.json({
      success: true,
      hash: hash,
      timestamp: Date.now(),
      version: '1.0',
      lastModified: lastModified,
      itemCount: itemCount
    });
    
  } catch (error) {
    console.error('Erro no endpoint de sincronização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: Date.now()
    });
  }
});

// Buscar item por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const item = await Cardapio.findByPk(req.params.id);

    if (!item || !item.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    res.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar item do cardápio (apenas admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Cardapio.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    await item.update(req.body);

    res.json({
      success: true,
      message: 'Item atualizado com sucesso',
      item
    });

  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Desativar item do cardápio (apenas admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Cardapio.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    await item.update({ isActive: false });

    res.json({
      success: true,
      message: 'Item removido do cardápio com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Reativar item do cardápio (apenas admin)
router.put('/:id/reactivate', auth, async (req, res) => {
  try {
    const item = await Cardapio.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    await item.update({ isActive: true });

    res.json({
      success: true,
      message: 'Item reativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao reativar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Remover item permanentemente do cardápio (apenas admin)
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const item = await Cardapio.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    // Deletar permanentemente do banco de dados
    await item.destroy();

    res.json({
      success: true,
      message: 'Item removido permanentemente com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover item permanentemente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Middleware para autenticação via query parameter
const authByQuery = async (req, res, next) => {
  try {
    const token = req.query.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso não fornecido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024');
    const admin = await Admin.findOne({ 
      where: { 
        id: decoded.id, 
        isActive: true 
      } 
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado ou inativo' 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Rota para upload de imagem (apenas admin)
router.post('/upload', authByQuery, upload.single('imagem'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    // Caminho relativo da imagem para salvar no banco de dados
    const imagemPath = `img/produtos/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      imagem: imagemPath
    });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;