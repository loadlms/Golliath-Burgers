const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração para diferentes ambientes
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const dbPath = isProduction 
  ? '/tmp/database.sqlite' // Vercel usa sistema de arquivos temporário
  : path.join(__dirname, '../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: isProduction ? false : console.log,
  pool: {
    max: 1, // Reduzido para serverless
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Configurações específicas para SQLite
    timeout: 20000
  },
  retry: {
    match: [
      /SQLITE_BUSY/
    ],
    max: 3
  }
});

module.exports = sequelize;