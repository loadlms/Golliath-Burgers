const API_BASE_URL = 'https://golliathburgers-hre2gzecp-loadlms-projects.vercel.app/api';
const SITE_BASE_URL = 'https://golliathburgers-hre2gzecp-loadlms-projects.vercel.app';

async function testProdIssues() {
    try {
        console.log('🔍 Testando problemas em produção (sem autenticação)...');

        console.log('\n📋 Buscando itens do cardápio em produção...');
        const cardapioResponse = await fetch(`${API_BASE_URL}/cardapio`);
        const cardapioData = await cardapioResponse.json();
        const itens = cardapioData.cardapio || cardapioData;
        
        console.log(`\n📊 Encontrados ${itens.length} itens no cardápio:`);
        
        // Analisar URLs das imagens
        console.log('\n🖼️ Análise das URLs das imagens:');
        itens.forEach((item, index) => {
            console.log(`\n--- Item ${index + 1}: ${item.nome} ---`);
            console.log(`ID: ${item.id}`);
            console.log(`Imagem: ${item.imagem}`);
            
            // Verificar tipo de URL
            if (item.imagem.startsWith('http')) {
                console.log('✅ URL absoluta (ImageKit ou externa)');
            } else if (item.imagem.startsWith('img/')) {
                console.log('⚠️ URL relativa - pode não carregar em produção');
                console.log(`   URL completa seria: https://golliathburgers-hre2gzecp-loadlms-projects.vercel.app/${item.imagem}`);
            } else {
                console.log('❓ Formato de URL desconhecido');
            }
        });
        
        // Testar acesso a uma imagem relativa
        const itemComImagemRelativa = itens.find(item => item.imagem.startsWith('img/'));
        if (itemComImagemRelativa) {
            console.log('\n🔍 Testando acesso à imagem relativa...');
            const imageUrl = `https://golliathburgers-hre2gzecp-loadlms-projects.vercel.app/${itemComImagemRelativa.imagem}`;
            try {
                const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
                console.log(`📸 Status da imagem ${itemComImagemRelativa.imagem}: ${imageResponse.status}`);
                if (imageResponse.status === 200) {
                    console.log('✅ Imagem acessível');
                } else {
                    console.log('❌ Imagem não acessível - isso explica por que não aparecem no frontend');
                }
            } catch (error) {
                console.log('❌ Erro ao acessar imagem:', error.message);
            }
        }
        
        // Testar se as imagens ImageKit estão acessíveis
        console.log('\n🔗 Testando URLs do ImageKit...');
        const imagensImageKit = itens.filter(item => item.imagem.startsWith('http'));
        for (const item of imagensImageKit) {
            try {
                const imageResponse = await fetch(item.imagem, { method: 'HEAD' });
                console.log(`📸 ${item.nome}: ${imageResponse.status === 200 ? '✅ OK' : '❌ ERRO'} (${imageResponse.status})`);
            } catch (error) {
                console.log(`📸 ${item.nome}: ❌ ERRO - ${error.message}`);
            }
        }
        
        // Verificar se o frontend consegue acessar as imagens
        console.log('\n🌐 Testando acesso do frontend às imagens...');
        console.log('Simulando como o frontend tentaria carregar as imagens:');
        itens.forEach(item => {
            if (item.imagem.startsWith('img/')) {
                console.log(`❌ ${item.nome}: ${SITE_BASE_URL}/${item.imagem} (URL relativa - não funciona)`);
            } else if (item.imagem.startsWith('http')) {
                console.log(`✅ ${item.nome}: ${item.imagem} (URL absoluta - deve funcionar)`);
            } else {
                console.log(`❓ ${item.nome}: ${item.imagem} (formato desconhecido)`);
            }
        });
        
        console.log('\n📝 Resumo dos problemas identificados:');
        const imagensRelativas = itens.filter(item => item.imagem.startsWith('img/'));
        if (imagensRelativas.length > 0) {
            console.log(`❌ ${imagensRelativas.length} itens com URLs de imagem relativas que não funcionam em produção`);
            console.log('   Solução: Converter para URLs absolutas do ImageKit');
        }
        
        console.log('\n✅ Teste em produção concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral no teste:', error);
    }
}

// Executar o teste
testProdIssues();