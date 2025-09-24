const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Teste completo do processo de upload
async function testCompleteUploadProcess() {
    console.log('=== TESTE COMPLETO DO PROCESSO DE UPLOAD ===\n');
    
    try {
        // 1. Fazer login para obter token
        console.log('1. Fazendo login para obter token...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@golliath.com',
                password: 'admin2023'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Erro no login: ${loginResponse.status} - ${loginResponse.statusText}`);
        }
        
        const loginData = await loginResponse.json();
        if (!loginData.success || !loginData.token) {
            throw new Error('Login falhou: ' + loginData.message);
        }
        
        const authToken = loginData.token;
        console.log('✓ Login realizado com sucesso!');
        
        // 2. Criar uma imagem de teste simples
        console.log('\n2. Criando imagem de teste...');
        const testImagePath = path.join(__dirname, 'test-image.png');
        
        // Criar um arquivo PNG simples (1x1 pixel transparente)
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
            0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        fs.writeFileSync(testImagePath, pngData);
        console.log('✓ Imagem de teste criada:', testImagePath);
        
        // 3. Fazer upload via API do backend
        console.log('\n3. Fazendo upload via API do backend...');
        
        const itemData = {
            nome: 'Produto Teste Upload',
            descricao: 'Teste de upload completo',
            preco: '25.99',
            categoria: 'Hambúrgueres',
            disponivel: true,
            imagem: 'https://ik.imagekit.io/golliathburgers/test-image.png' // URL de teste
        };
        
        const response = await fetch('http://localhost:3000/api/cardapio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}\nResposta: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✓ Upload realizado com sucesso!');
        console.log('Resposta da API:', JSON.stringify(result, null, 2));
        
        // 4. Verificar se foi salvo no banco
        console.log('\n4. Verificando se foi salvo no banco...');
        
        const dbResponse = await fetch('http://localhost:3000/api/cardapio');
        const cardapioData = await dbResponse.json();
        
        // A resposta pode ser um array ou um objeto com propriedade cardapio
        const cardapio = Array.isArray(cardapioData) ? cardapioData : cardapioData.cardapio || [];
        
        const itemAdicionado = cardapio.find(item => item.nome === 'Produto Teste Upload');
        
        if (itemAdicionado) {
            console.log('✓ Item encontrado no banco:');
            console.log(`  ID: ${itemAdicionado.id}`);
            console.log(`  Nome: ${itemAdicionado.nome}`);
            console.log(`  Imagem: ${itemAdicionado.imagem}`);
            console.log(`  Disponível: ${itemAdicionado.disponivel}`);
            
            // 5. Testar se a URL da imagem funciona
            console.log('\n5. Testando se a URL da imagem funciona...');
            
            try {
                const imageResponse = await fetch(itemAdicionado.imagem);
                console.log(`Status da imagem: ${imageResponse.status}`);
                console.log(`Content-Type: ${imageResponse.headers.get('content-type')}`);
                
                if (imageResponse.ok) {
                    console.log('✓ URL da imagem está funcionando!');
                } else {
                    console.log('✗ URL da imagem não está funcionando');
                }
            } catch (error) {
                console.log('✗ Erro ao acessar URL da imagem:', error.message);
            }
            
        } else {
            console.log('✗ Item não encontrado no banco');
        }
        
        // 6. Limpar arquivo de teste
        console.log('\n6. Limpando arquivos de teste...');
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
            console.log('✓ Arquivo de teste removido');
        }
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro durante o teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Verificar se o servidor está rodando antes de executar
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000/api/cardapio');
        return response.ok;
    } catch {
        return false;
    }
}

// Executar teste
checkServer().then(isRunning => {
    if (isRunning) {
        console.log('Servidor detectado. Iniciando teste...\n');
        testCompleteUploadProcess();
    } else {
        console.log('Erro: Servidor não está rodando em http://localhost:3000');
        console.log('Inicie o servidor com: cd backend && node server.js');
    }
});