const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function addSenhaColumn() {
  try {
    // Verificar se a coluna senha já existe
    const columns = await sequelize.query(
      "PRAGMA table_info(clientes);",
      { type: QueryTypes.SELECT }
    );
    
    const senhaColumnExists = columns.some(column => column.name === 'senha');
    
    if (!senhaColumnExists) {
      // Adicionar a coluna senha à tabela clientes
      await sequelize.query(
        "ALTER TABLE clientes ADD COLUMN senha VARCHAR(255);",
        { type: QueryTypes.RAW }
      );
      
      console.log('✅ Coluna senha adicionada com sucesso à tabela clientes');
      
      // Verificar a estrutura atualizada
      const updatedColumns = await sequelize.query(
        "PRAGMA table_info(clientes);",
        { type: QueryTypes.SELECT }
      );
      
      console.log('Estrutura atualizada da tabela clientes:');
      updatedColumns.forEach(column => {
        console.log(`- ${column.name} (${column.type})${column.notnull ? ' NOT NULL' : ''}${column.pk ? ' PRIMARY KEY' : ''}`);
      });
    } else {
      console.log('A coluna senha já existe na tabela clientes.');
    }
    
  } catch (error) {
    console.error('Erro ao adicionar coluna senha:', error);
  } finally {
    await sequelize.close();
  }
}

addSenhaColumn();