const express = require('express');
const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const auth = require('../middleware/auth'); // Middleware para admin
const clientAuth = require('../middleware/clientAuth'); // Middleware para cliente

const router = express.Router();

// Criar novo pedido (público)
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      telefone,
      endereco,
      itens,
      total,
      observacoes,
      forma_pagamento,
      troco
    } = req.body;

    if (!nome || !telefone || !endereco || !itens || !total) {
      return res.status(400).json({
        success: false,
        message: 'Nome, telefone, endereço, itens e total são obrigatórios'
      });
    }

    // Gerar número único do pedido
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const numero_pedido = `GB${year}${month}${day}${random}`;

    const pedido = await Pedido.create({
      numero_pedido,
      cliente_nome: nome,
      cliente_telefone: telefone,
      cliente_endereco: endereco,
      itens: JSON.stringify(itens),
      total,
      observacoes,
      forma_pagamento: forma_pagamento || 'dinheiro',
      troco: troco || null
    });

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      pedido: {
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        total: pedido.total,
        status: pedido.status,
        itens: pedido.itens // Incluindo os itens na resposta
      }
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar todos os pedidos (apenas admin)
router.get('/', auth, async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { isActive: true },
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['nome', 'email', 'telefone']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Parsear itens JSON
    const pedidosFormatados = pedidos.map(pedido => ({
      ...pedido.toJSON(),
      itens: JSON.parse(pedido.itens)
    }));

    res.json({
      success: true,
      pedidos: pedidosFormatados
    });

  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar pedido por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['nome', 'email', 'telefone', 'endereco', 'bairro', 'cidade', 'estado']
      }]
    });

    if (!pedido || !pedido.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Parsear itens JSON
    const pedidoFormatado = {
      ...pedido.toJSON(),
      itens: JSON.parse(pedido.itens)
    };

    res.json({
      success: true,
      pedido: pedidoFormatado
    });

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar pedido por número (público)
router.get('/numero/:numero', async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      where: { 
        numero_pedido: req.params.numero,
        isActive: true 
      },
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['nome', 'email', 'telefone', 'endereco', 'bairro', 'cidade', 'estado']
      }]
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Parsear itens JSON
    const pedidoFormatado = {
      ...pedido.toJSON(),
      itens: JSON.parse(pedido.itens)
    };

    res.json({
      success: true,
      pedido: pedidoFormatado
    });

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar status do pedido (apenas admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status é obrigatório'
      });
    }

    const pedido = await Pedido.findByPk(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    await pedido.update({ status });

    res.json({
      success: true,
      message: 'Status do pedido atualizado com sucesso',
      pedido: {
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        status: pedido.status
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Cancelar pedido (apenas admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    await pedido.update({ 
      status: 'cancelado',
      isActive: false 
    });

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar pedidos do cliente autenticado
router.get('/meus-pedidos', clientAuth, async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { 
        cliente_id: req.cliente.id,
        isActive: true 
      },
      order: [['createdAt', 'DESC']]
    });

    // Parsear itens JSON
    const pedidosFormatados = pedidos.map(pedido => ({
      ...pedido.toJSON(),
      itens: JSON.parse(pedido.itens)
    }));

    res.json({
      success: true,
      pedidos: pedidosFormatados
    });

  } catch (error) {
    console.error('Erro ao listar pedidos do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;