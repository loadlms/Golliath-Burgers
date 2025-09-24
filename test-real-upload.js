const fs = require('fs');
const path = require('path');

// Teste do upload real usando o endpoint do backend
async function testRealUpload() {
    console.log('=== TESTE DE UPLOAD REAL PARA IMAGEKIT ===\n');
    
    try {
        // 1. Fazer login para obter token
        console.log('1. Fazendo login para obter token...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
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
        
        // 2. Criar uma imagem de teste e converter para base64
        console.log('\n2. Criando imagem de teste...');
        const testImagePath = path.join(__dirname, 'test-real-image.png');
        
        // Criar um arquivo PNG simples (1x1 pixel vermelho)
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8E, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        fs.writeFileSync(testImagePath, pngData);
        console.log('✓ Imagem de teste criada:', testImagePath);
        
        // 3. Converter para base64
        const imageBuffer = fs.readFileSync(testImagePath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        console.log('✓ Imagem convertida para base64');
        
        // 4. Fazer upload via endpoint do backend
        console.log('\n3. Fazendo upload via endpoint /api/cardapio/upload...');
        
        const uploadResponse = await fetch('http://localhost:3001/api/cardapio/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                image: base64Image,
                filename: 'test-real-upload.png'
            })
        });
        
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Erro no upload: ${uploadResponse.status} - ${uploadResponse.statusText}\nResposta: ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('✓ Upload realizado com sucesso!');
        console.log('Resultado do upload:', JSON.stringify(uploadResult, null, 2));
        
        // 5. Testar se a URL retornada funciona
        if (uploadResult.success && uploadResult.url) {
            console.log('\n4. Testando se a URL da imagem funciona...');
            
            try {
                const imageTestResponse = await fetch(uploadResult.url);
                console.log(`Status da imagem: ${imageTestResponse.status}`);
                console.log(`Content-Type: ${imageTestResponse.headers.get('content-type')}`);
                
                if (imageTestResponse.ok) {
                    console.log('✅ URL da imagem está funcionando!');
                    console.log('✅ Upload para ImageKit funcionou corretamente!');
                } else {
                    console.log('❌ URL da imagem não está funcionando');
                }
            } catch (error) {
                console.log('❌ Erro ao acessar URL da imagem:', error.message);
            }
        }
        
        // 6. Limpar arquivo de teste
        console.log('\n5. Limpando arquivos de teste...');
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
            console.log('✓ Arquivo de teste removido');
        }
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Verificar se o servidor está rodando
fetch('http://localhost:3000/api/cardapio')
    .then(() => {
        console.log('Servidor detectado. Iniciando teste...\n');
        testRealUpload();
    })
    .catch(() => {
        console.log('❌ Servidor não está rodando. Execute: cd backend && node server.js');
    });