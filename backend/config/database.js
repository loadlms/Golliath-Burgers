const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração para diferentes ambientes
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction 
  ? '/tmp/database.sqlite' // Vercel usa sistema de arquivos temporário
  : path.join(__dirname, '../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;