const express = require('express');
const Cliente = require('../models/Cliente');
const auth = require('../middleware/auth'); // Middleware para admin
const clientAuth = require('../middleware/clientAuth'); // Middleware para cliente
const jwt = require('jsonwebtoken');

const router = express.Router();

// Cadastrar novo cliente (público)
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      observacoes,
      senha
    } = req.body;

    // Validações básicas
    if (!nome || !email || !telefone || !endereco || !bairro || !cidade || !estado || !cep) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Verificar se e-mail já existe
    const clienteExistente = await Cliente.findOne({ where: { email } });
    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está cadastrado'
      });
    }

    const cliente = await Cliente.create({
      nome,
      email,
      telefone,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      observacoes,
      senha
    });

    // Se o cliente foi criado com senha, gerar token para login automático
    let token = null;
    if (senha) {
      token = jwt.sign(
        { id: cliente.id, email: cliente.email },
        process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso!',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep
      },
      token
    });

  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar todos os clientes (apenas admin)
router.get('/', auth, async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      clientes
    });

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar cliente por ID (apenas admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      cliente
    });

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar cliente (apenas admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    await cliente.update(req.body);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      cliente
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Desativar cliente (apenas admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    await cliente.update({ isActive: false });

    res.json({
      success: true,
      message: 'Cliente desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Login de cliente
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    const cliente = await Cliente.findOne({ where: { email, isActive: true } });

    if (!cliente || !cliente.senha) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const senhaValida = await cliente.verificarSenha(senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep
      },
      token
    });

  } catch (error) {
    console.error('Erro no login de cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter dados do próprio perfil (cliente autenticado)
router.get('/perfil', clientAuth, async (req, res) => {
  try {
    // req.cliente já contém o cliente autenticado
    res.json({
      success: true,
      cliente: {
        id: req.cliente.id,
        nome: req.cliente.nome,
        email: req.cliente.email,
        telefone: req.cliente.telefone,
        endereco: req.cliente.endereco,
        bairro: req.cliente.bairro,
        cidade: req.cliente.cidade,
        estado: req.cliente.estado,
        cep: req.cliente.cep
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar próprio perfil (cliente autenticado)
router.put('/perfil', clientAuth, async (req, res) => {
  try {
    const cliente = req.cliente;
    
    // Campos que o cliente pode atualizar
    const {
      nome,
      telefone,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      observacoes,
      senha
    } = req.body;
    
    // Atualizar apenas os campos fornecidos
    const updateData = {};
    if (nome) updateData.nome = nome;
    if (telefone) updateData.telefone = telefone;
    if (endereco) updateData.endereco = endereco;
    if (bairro) updateData.bairro = bairro;
    if (cidade) updateData.cidade = cidade;
    if (estado) updateData.estado = estado;
    if (cep) updateData.cep = cep;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (senha) updateData.senha = senha;
    
    await cliente.update(updateData);
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Verificar token de cliente
router.get('/verify', clientAuth, async (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    cliente: {
      id: req.cliente.id,
      nome: req.cliente.nome,
      email: req.cliente.email,
      telefone: req.cliente.telefone,
      endereco: req.cliente.endereco,
      bairro: req.cliente.bairro,
      cidade: req.cliente.cidade,
      estado: req.cliente.estado,
      cep: req.cliente.cep
    }
  });
});

// Atualizar informações pessoais (cliente autenticado) - usando rota /me
router.put('/me', clientAuth, async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      observacoes
    } = req.body;

    // Verificar se o novo email já existe (se foi alterado)
    if (email && email !== req.cliente.email) {
      const emailExistente = await Cliente.findOne({ 
        where: { 
          email,
          id: { [require('sequelize').Op.ne]: req.cliente.id }
        } 
      });
      
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          message: 'Este e-mail já está sendo usado por outro cliente'
        });
      }
    }

    const updateData = {
      nome,
      email,
      telefone,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      observacoes
    };

    await req.cliente.update(updateData);

    res.json({
      success: true,
      message: 'Informações atualizadas com sucesso',
      cliente: {
        id: req.cliente.id,
        nome: req.cliente.nome,
        email: req.cliente.email,
        telefone: req.cliente.telefone,
        endereco: req.cliente.endereco,
        bairro: req.cliente.bairro,
        cidade: req.cliente.cidade,
        estado: req.cliente.estado,
        cep: req.cliente.cep,
        observacoes: req.cliente.observacoes
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar informações do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Alterar senha (cliente autenticado)
router.put('/me/password', clientAuth, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    // Verificar senha atual
    const senhaValida = await req.cliente.verificarSenha(senhaAtual);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    await req.cliente.update({ senha: novaSenha });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Excluir conta (cliente autenticado)
router.delete('/me', clientAuth, async (req, res) => {
  try {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória para confirmar a exclusão'
      });
    }

    // Verificar senha
    const senhaValida = await req.cliente.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Desativar conta (soft delete)
    await req.cliente.update({ isActive: false });

    res.json({
      success: true,
      message: 'Conta excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir conta do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;