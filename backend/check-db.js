const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function checkDatabase() {
  try {
    // Verificar se a tabela clientes existe
    const tables = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='clientes';",
      { type: QueryTypes.SELECT }
    );
    
    console.log('Tabelas encontradas:', tables);
    
    if (tables.length > 0) {
      // Verificar a estrutura da tabela clientes
      const columns = await sequelize.query(
        "PRAGMA table_info(clientes);",
        { type: QueryTypes.SELECT }
      );
      
      console.log('Estrutura da tabela clientes:');
      columns.forEach(column => {
        console.log(`- ${column.name} (${column.type})${column.notnull ? ' NOT NULL' : ''}${column.pk ? ' PRIMARY KEY' : ''}`);
      });
    } else {
      console.log('A tabela clientes não existe no banco de dados.');
    }
    
  } catch (error) {
    console.error('Erro ao verificar o banco de dados:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();