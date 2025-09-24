const API_BASE_URL = 'https://golliathburgers-hre2gzecp-loadlms-projects.vercel.app/api';
const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/loadlm';

// Mapeamento de imagens locais para URLs do ImageKit
const IMAGE_MAPPING = {
    '_MG_0191.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_0191.jpg',
    '_MG_0309.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_0309.jpg',
    '_MG_6201.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_6201.jpg',
    'logoGB.PNG': 'https://ik.imagekit.io/loadlm/produtos/logoGB.PNG',
    '_MG_0164.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_0164.jpg',
    '_MG_0193.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_0193.jpg',
    '_MG_0282.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_0282.jpg',
    '_MG_0316.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_0316.jpg',
    '_MG_5743.jpg': 'https://ik.imagekit.io/loadlm/produtos/_MG_5743.jpg'
};

function extractImageName(imagePath) {
    // Extrair apenas o nome do arquivo de diferentes formatos de URL
    if (imagePath.startsWith('/img/')) {
        return imagePath.replace('/img/', '');
    } else if (imagePath.startsWith('img/')) {
        return imagePath.replace('img/', '');
    } else if (imagePath.includes('/')) {
        return imagePath.split('/').pop();
    } else {
        return imagePath;
    }
}

function getImageKitUrl(imagePath) {
    const imageName = extractImageName(imagePath);
    
    // Se já é uma URL do ImageKit, manter
    if (imagePath.startsWith('https://ik.imagekit.io/')) {
        return imagePath;
    }
    
    // Se existe no mapeamento, usar a URL mapeada
    if (IMAGE_MAPPING[imageName]) {
        return IMAGE_MAPPING[imageName];
    }
    
    // Se é um arquivo de produto gerado automaticamente, criar URL do ImageKit
    if (imageName.startsWith('produto-')) {
        return `${IMAGEKIT_BASE_URL}/produtos/${imageName}`;
    }
    
    // Para outros casos, assumir que está na pasta produtos
    return `${IMAGEKIT_BASE_URL}/produtos/${imageName}`;
}

async function fixProdImages() {
    try {
        console.log('🔧 Iniciando correção das URLs das imagens em produção...');
        
        // Buscar todos os itens do cardápio
        console.log('📋 Buscando itens do cardápio...');
        const cardapioResponse = await fetch(`${API_BASE_URL}/cardapio`);
        const cardapioData = await cardapioResponse.json();
        const itens = cardapioData.cardapio || cardapioData;
        
        console.log(`Encontrados ${itens.length} itens para verificar`);
        
        // Analisar quais itens precisam de correção
        const itensParaCorrigir = [];
        
        itens.forEach(item => {
            const imagemAtual = item.imagem;
            const imagemCorrigida = getImageKitUrl(imagemAtual);
            
            if (imagemAtual !== imagemCorrigida) {
                itensParaCorrigir.push({
                    id: item.id,
                    nome: item.nome,
                    imagemAtual,
                    imagemCorrigida
                });
            }
        });
        
        console.log(`\n📊 Análise concluída:`);
        console.log(`✅ ${itens.length - itensParaCorrigir.length} itens já têm URLs corretas`);
        console.log(`🔧 ${itensParaCorrigir.length} itens precisam de correção`);
        
        if (itensParaCorrigir.length === 0) {
            console.log('\n🎉 Todas as URLs já estão corretas!');
            return;
        }
        
        console.log('\n📝 Itens que serão corrigidos:');
        itensParaCorrigir.forEach((item, index) => {
            console.log(`${index + 1}. ${item.nome}`);
            console.log(`   De: ${item.imagemAtual}`);
            console.log(`   Para: ${item.imagemCorrigida}`);
            console.log('');
        });
        
        console.log('\n⚠️  ATENÇÃO: Este script mostra as correções necessárias.');
        console.log('Para aplicar as correções, você precisará:');
        console.log('1. Fazer login no painel administrativo');
        console.log('2. Editar cada item manualmente');
        console.log('3. Ou implementar um endpoint de correção em massa');
        
        console.log('\n🔗 URLs corretas para copiar:');
        itensParaCorrigir.forEach(item => {
            console.log(`ID ${item.id}: ${item.imagemCorrigida}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao corrigir imagens:', error);
    }
}

// Executar a correção
fixProdImages();