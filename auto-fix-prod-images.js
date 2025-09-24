const API_BASE_URL = 'https://golliathburgers-hre2gzecp-loadlms-projects.vercel.app/api';

// Credenciais de admin (do arquivo admin.js)
const ADMIN_CREDENTIALS = {
    email: 'admin@golliath.com',
    password: 'admin2023'
};

// URLs corretas identificadas pelo script anterior
const CORRECTIONS = {
    1: 'https://ik.imagekit.io/loadlm/produtos/produto-1758139657627-bc6d10af_lBLRUevobz.jpg',
    2: 'https://ik.imagekit.io/loadlm/produtos/_MG_0191.jpg',
    3: 'https://ik.imagekit.io/loadlm/produtos/_MG_0309.jpg',
    4: 'https://ik.imagekit.io/loadlm/produtos/_MG_6201.jpg',
    12: 'https://ik.imagekit.io/loadlm/produtos/logoGB.PNG'
};

async function loginAdmin() {
    try {
        console.log('🔐 Fazendo login como administrador...');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Login realizado com sucesso!');
            if (data.admin) {
                console.log(`   Admin: ${data.admin.name || 'N/A'} (${data.admin.email || 'N/A'})`);
            }
            return data.token;
        } else {
            console.log('❌ Erro no login:', data.message);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error.message);
        return null;
    }
}

async function autoFixProdImages() {
    try {
        console.log('🚀 Iniciando correção automática das URLs das imagens em produção...');
        
        // Fazer login primeiro
        const token = await loginAdmin();
        if (!token) {
            console.log('❌ Não foi possível obter token de autenticação. Abortando.');
            return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        console.log('\n🔧 Aplicando correções...');
        
        for (const [itemId, novaUrl] of Object.entries(CORRECTIONS)) {
            try {
                console.log(`\n📝 Corrigindo item ID ${itemId}...`);
                console.log(`   Nova URL: ${novaUrl}`);
                
                // Fazer a requisição PUT para atualizar o item
                const response = await fetch(`${API_BASE_URL}/cardapio/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        imagem: novaUrl
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`   ✅ Item ${itemId} corrigido com sucesso!`);
                    successCount++;
                } else {
                    const errorText = await response.text();
                    console.log(`   ❌ Erro ao corrigir item ${itemId}: ${response.status} - ${errorText}`);
                    errorCount++;
                }
                
                // Pequena pausa entre requisições
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.log(`   ❌ Erro ao corrigir item ${itemId}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n📊 Resultado da correção:');
        console.log(`✅ ${successCount} itens corrigidos com sucesso`);
        console.log(`❌ ${errorCount} itens com erro`);
        
        if (successCount > 0) {
            console.log('\n🔍 Verificando se as correções foram aplicadas...');
            await verificarCorrecoes();
        }
        
    } catch (error) {
        console.error('❌ Erro geral na correção:', error);
    }
}

async function verificarCorrecoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        const data = await response.json();
        const itens = data.cardapio || data;
        
        console.log('\n📋 Status atual das URLs:');
        
        itens.forEach(item => {
            const isImageKitUrl = item.imagem.startsWith('https://ik.imagekit.io/');
            const status = isImageKitUrl ? '✅' : '❌';
            console.log(`${status} ID ${item.id}: ${item.nome}`);
            console.log(`   URL: ${item.imagem}`);
        });
        
        const urlsCorretas = itens.filter(item => item.imagem.startsWith('https://ik.imagekit.io/')).length;
        const urlsIncorretas = itens.length - urlsCorretas;
        
        console.log(`\n📈 Resumo final:`);
        console.log(`✅ ${urlsCorretas} URLs corretas (ImageKit)`);
        console.log(`❌ ${urlsIncorretas} URLs ainda incorretas`);
        
        if (urlsIncorretas === 0) {
            console.log('\n🎉 Todas as URLs foram corrigidas com sucesso!');
            console.log('🌐 As imagens agora devem aparecer corretamente no site!');
        } else {
            console.log('\n⚠️  Ainda há URLs que precisam ser corrigidas manualmente.');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar correções:', error);
    }
}

// Executar a correção automática
autoFixProdImages();