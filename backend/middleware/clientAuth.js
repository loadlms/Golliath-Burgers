const jwt = require('jsonwebtoken');
const Cliente = require('../models/Cliente');

const clientAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso não fornecido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024');
    const cliente = await Cliente.findOne({ 
      where: { 
        id: decoded.id, 
        isActive: true 
      } 
    });

    if (!cliente) {
      return res.status(401).json({ 
        success: false, 
        message: 'Cliente não encontrado ou inativo' 
      });
    }

    req.cliente = cliente;
    next();
  } catch (error) {
    console.error('Erro na autenticação do cliente:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

module.exports = clientAuth;