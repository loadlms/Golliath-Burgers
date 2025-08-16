const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_pedido: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cliente_nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cliente_telefone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cliente_endereco: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  itens: {
    type: DataTypes.TEXT, // JSON string com os itens do pedido
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'em_preparo', 'pronto', 'entregue', 'cancelado'),
    defaultValue: 'pendente'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  forma_pagamento: {
    type: DataTypes.ENUM('dinheiro', 'pix', 'cartao'),
    defaultValue: 'dinheiro'
  },
  troco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'pedidos',
  timestamps: true,
  hooks: {
    beforeCreate: (pedido) => {
      // Gerar número único do pedido
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      pedido.numero_pedido = `GB${year}${month}${day}${random}`;
    }
  }
});

module.exports = Pedido;