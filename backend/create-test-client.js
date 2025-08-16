const sequelize = require('./config/database');
const Cliente = require('./models/Cliente');
const bcrypt = require('bcryptjs');

async function createTestClient() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');
        
        // Verificar se já existe um cliente de teste
        const existingClient = await Cliente.findOne({ where: { email: 'teste@teste.com' } });
        
        if (existingClient) {
            console.log('✅ Cliente de teste já existe:');
            console.log('Email: teste@teste.com');
            console.log('Senha: 123456');
            return;
        }
        
        // Criar cliente de teste
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        const testClient = await Cliente.create({
            nome: 'Cliente Teste',
            email: 'teste@teste.com',
            telefone: '(11) 99999-9999',
            endereco: 'Rua Teste, 123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01000-000',
            observacoes: 'Cliente criado para testes',
            senha: hashedPassword,
            isActive: true
        });
        
        console.log('✅ Cliente de teste criado com sucesso!');
        console.log('Email: teste@teste.com');
        console.log('Senha: 123456');
        
    } catch (error) {
        console.error('❌ Erro ao criar cliente de teste:', error);
    } finally {
        await sequelize.close();
    }
}

createTestClient();