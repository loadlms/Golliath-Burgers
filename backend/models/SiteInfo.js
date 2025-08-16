const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('texto', 'numero', 'boolean', 'json'),
    defaultValue: 'texto'
  }
}, {
  tableName: 'site_info',
  timestamps: true
});

module.exports = SiteInfo; 