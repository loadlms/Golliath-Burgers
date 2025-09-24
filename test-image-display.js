const API_BASE_URL = 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
    email: 'admin@golliath.com',
    password: 'admin123'
};

async function testImageDisplay() {
    try {
        console.log('🔐 Fazendo login...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login realizado com sucesso');

        console.log('\n📋 Buscando itens do cardápio...');
        const cardapioResponse = await fetch(`${API_BASE_URL}/api/cardapio`);
        const cardapioData = await cardapioResponse.json();
        const itens = cardapioData.cardapio || cardapioData;
        
        console.log(`\n📊 Encontrados ${itens.length} itens no cardápio:`);
        
        itens.forEach((item, index) => {
            console.log(`\n--- Item ${index + 1} ---`);
            console.log(`ID: ${item.id}`);
            console.log(`Nome: ${item.nome}`);
            console.log(`Imagem: ${item.imagem}`);
            
            // Analisar o tipo de URL da imagem
            if (item.imagem.startsWith('http')) {
                console.log('✅ URL absoluta (ImageKit)');
            } else if (item.imagem.startsWith('/')) {
                console.log('⚠️ URL relativa com barra inicial');
            } else if (item.imagem.startsWith('img/')) {
                console.log('⚠️ URL relativa local');
            } else {
                console.log('❓ Formato de URL desconhecido');
            }
            
            // Simular como seria exibido na página principal
            console.log(`Página principal usaria: ${item.imagem}`);
            
            // Simular como seria exibido no painel admin
            console.log(`Painel admin usaria: ../${item.imagem}`);
        });
        
        console.log('\n🔍 Análise de problemas potenciais:');
        
        const imagensLocais = itens.filter(item => 
            !item.imagem.startsWith('http') && 
            (item.imagem.startsWith('img/') || item.imagem.startsWith('/img/'))
        );
        
        if (imagensLocais.length > 0) {
            console.log(`❌ ${imagensLocais.length} itens com URLs locais que podem não funcionar:`);
            imagensLocais.forEach(item => {
                console.log(`   - ${item.nome}: ${item.imagem}`);
            });
        }
        
        const imagensImageKit = itens.filter(item => item.imagem.startsWith('http'));
        if (imagensImageKit.length > 0) {
            console.log(`✅ ${imagensImageKit.length} itens com URLs do ImageKit:`);
            imagensImageKit.forEach(item => {
                console.log(`   - ${item.nome}: ${item.imagem}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        if (error.response) {
            console.error('Resposta do servidor:', error.response.data);
        }
    }
}

testImageDisplay();