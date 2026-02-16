const { Sequelize } = require('sequelize');
// Configuração para diferentes ambientes
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const sequelize = new Sequelize(process.env.NEONDATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: isProduction ? false : console.log,
  pool: {
    max: isProduction ? 10 : 5, // Adjusted for Neon pooling if needed, or keep low for serverless
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;