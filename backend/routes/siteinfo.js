const express = require('express');
const SiteInfo = require('../models/SiteInfo');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar todas as informações do site (público)
router.get('/', async (req, res) => {
  try {
    const siteInfo = await SiteInfo.findAll({
      order: [['chave', 'ASC']]
    });

    // Converter para objeto para facilitar o uso no frontend
    const infoObject = {};
    siteInfo.forEach(info => {
      infoObject[info.chave] = info.valor;
    });

    res.json({
      success: true,
      siteInfo: infoObject
    });

  } catch (error) {
    console.error('Erro ao listar informações do site:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar informação específica por chave (público)
router.get('/:chave', async (req, res) => {
  try {
    const info = await SiteInfo.findOne({
      where: { chave: req.params.chave }
    });

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Informação não encontrada'
      });
    }

    res.json({
      success: true,
      info
    });

  } catch (error) {
    console.error('Erro ao buscar informação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar ou atualizar informação do site (apenas admin)
router.post('/', auth, async (req, res) => {
  try {
    const { chave, valor, descricao, tipo } = req.body;

    if (!chave || !valor) {
      return res.status(400).json({
        success: false,
        message: 'Chave e valor são obrigatórios'
      });
    }

    // Verificar se já existe
    const infoExistente = await SiteInfo.findOne({ where: { chave } });

    if (infoExistente) {
      // Atualizar
      await infoExistente.update({
        valor,
        descricao: descricao || infoExistente.descricao,
        tipo: tipo || infoExistente.tipo
      });

      res.json({
        success: true,
        message: 'Informação atualizada com sucesso',
        info: infoExistente
      });
    } else {
      // Criar novo
      const novaInfo = await SiteInfo.create({
        chave,
        valor,
        descricao: descricao || '',
        tipo: tipo || 'texto'
      });

      res.status(201).json({
        success: true,
        message: 'Informação criada com sucesso',
        info: novaInfo
      });
    }

  } catch (error) {
    console.error('Erro ao salvar informação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar informação específica (apenas admin)
router.put('/:chave', auth, async (req, res) => {
  try {
    const info = await SiteInfo.findOne({
      where: { chave: req.params.chave }
    });

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Informação não encontrada'
      });
    }

    await info.update(req.body);

    res.json({
      success: true,
      message: 'Informação atualizada com sucesso',
      info
    });

  } catch (error) {
    console.error('Erro ao atualizar informação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Deletar informação (apenas admin)
router.delete('/:chave', auth, async (req, res) => {
  try {
    const info = await SiteInfo.findOne({
      where: { chave: req.params.chave }
    });

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Informação não encontrada'
      });
    }

    await info.destroy();

    res.json({
      success: true,
      message: 'Informação removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover informação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 