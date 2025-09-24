// Script final para verificar se as correções das imagens foram aplicadas em produção

const API_BASE_URL = 'https://golliath-burgers.vercel.app/api';

// Função para verificar URLs das imagens em produção
async function verificarImagensProd() {
    try {
        console.log('🔍 Verificando URLs das imagens em produção...');
        console.log('🌐 Endpoint:', `${API_BASE_URL}/cardapio`);
        
        const response = await fetch(`${API_BASE_URL}/cardapio`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            console.log('❌ Erro na requisição:', response.statusText);
            const errorText = await response.text();
            console.log('📄 Resposta de erro:', errorText.substring(0, 200));
            return;
        }
        
        const data = await response.json();
        const itens = data.cardapio || data;
        
        if (!Array.isArray(itens)) {
            console.log('❌ Dados recebidos não são um array:', typeof itens);
            console.log('📄 Dados:', JSON.stringify(data, null, 2).substring(0, 500));
            return;
        }
        
        console.log(`\n📊 Total de itens encontrados: ${itens.length}`);
        console.log('\n📋 Análise das URLs das imagens:');
        
        let urlsCorretas = 0;
        let urlsIncorretas = 0;
        let urlsProblematicas = [];
        
        itens.forEach(item => {
            const isImageKitUrl = item.imagem && item.imagem.startsWith('https://ik.imagekit.io/');
            const status = isImageKitUrl ? '✅' : '❌';
            
            console.log(`${status} ID ${item.id}: ${item.nome}`);
            console.log(`   URL: ${item.imagem || 'NENHUMA'}`);
            
            if (isImageKitUrl) {
                urlsCorretas++;
            } else {
                urlsIncorretas++;
                urlsProblematicas.push({
                    id: item.id,
                    nome: item.nome,
                    url: item.imagem
                });
            }
        });
        
        console.log(`\n📈 RESUMO FINAL:`);
        console.log(`✅ URLs corretas (ImageKit): ${urlsCorretas}`);
        console.log(`❌ URLs incorretas: ${urlsIncorretas}`);
        
        if (urlsIncorretas === 0) {
            console.log('\n🎉 SUCESSO! Todas as URLs estão corretas!');
            console.log('🌐 As imagens devem aparecer corretamente no site!');
            console.log('\n🔧 PROBLEMAS RESOLVIDOS:');
            console.log('   ✅ URLs relativas convertidas para absolutas');
            console.log('   ✅ URLs do ImageKit configuradas corretamente');
            console.log('   ✅ Banco de dados atualizado em produção');
        } else {
            console.log('\n⚠️  AINDA HÁ PROBLEMAS:');
            console.log(`   ${urlsIncorretas} URLs ainda precisam ser corrigidas`);
            
            console.log('\n🔍 URLs problemáticas:');
            urlsProblematicas.forEach(item => {
                console.log(`   - ID ${item.id}: ${item.nome}`);
                console.log(`     URL: ${item.url}`);
            });
            
            console.log('\n💡 PRÓXIMOS PASSOS:');
            console.log('   1. Verificar se as correções foram aplicadas no Supabase');
            console.log('   2. Verificar se há cache no servidor');
            console.log('   3. Aplicar correções manualmente se necessário');
        }
        
        // Testar acesso a uma imagem específica
        if (urlsCorretas > 0) {
            const itemComImagemCorreta = itens.find(item => 
                item.imagem && item.imagem.startsWith('https://ik.imagekit.io/')
            );
            
            if (itemComImagemCorreta) {
                console.log('\n🧪 Testando acesso a uma imagem correta...');
                try {
                    const imageResponse = await fetch(itemComImagemCorreta.imagem, {
                        method: 'HEAD'
                    });
                    
                    if (imageResponse.ok) {
                        console.log('✅ Imagem acessível:', itemComImagemCorreta.imagem);
                    } else {
                        console.log('❌ Imagem não acessível:', imageResponse.status);
                    }
                } catch (error) {
                    console.log('❌ Erro ao acessar imagem:', error.message);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Erro durante verificação:', error.message);
        console.error('🔍 Stack trace:', error.stack);
    }
}

// Função para verificar se o site está funcionando
async function verificarSitePrincipal() {
    try {
        console.log('\n🌐 Verificando site principal...');
        
        const response = await fetch('https://golliath-burgers.vercel.app/', {
            method: 'HEAD'
        });
        
        if (response.ok) {
            console.log('✅ Site principal está online');
        } else {
            console.log('❌ Site principal com problemas:', response.status);
        }
        
    } catch (error) {
        console.log('❌ Erro ao verificar site principal:', error.message);
    }
}

// Função principal
async function main() {
    console.log('🚀 VERIFICAÇÃO FINAL - CORREÇÃO DAS IMAGENS EM PRODUÇÃO');
    console.log('=' .repeat(60));
    
    await verificarSitePrincipal();
    await verificarImagensProd();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificação concluída!');
}

// Executar verificação
main();