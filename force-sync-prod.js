// Script para forçar sincronização dos dados do Supabase em produção
// Usando fetch nativo do Node.js (disponível a partir da versão 18)

const API_BASE_URL = 'https://golliath-burgers.vercel.app/api';
const ADMIN_EMAIL = 'admin@golliathburgers.com';
const ADMIN_PASSWORD = 'admin123';

// Função para fazer login e obter token
async function loginAdmin() {
    try {
        console.log('🔐 Fazendo login como admin...');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
            const adminName = (data.admin && data.admin.name) || 'N/A';
            const adminEmail = (data.admin && data.admin.email) || 'N/A';
            console.log(`✅ Login realizado com sucesso! Admin: ${adminName} (${adminEmail})`);
            return data.token;
        } else {
            console.log('❌ Falha no login:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro durante login:', error.message);
        return null;
    }
}

// Função para forçar sincronização com Supabase
async function forceSyncWithSupabase() {
    try {
        console.log('🔄 Forçando sincronização com Supabase...');
        
        // Fazer uma requisição que force a sincronização
        const response = await fetch(`${API_BASE_URL}/cardapio/sync`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Sincronização realizada com sucesso!');
            console.log('📊 Hash atual:', data.hash);
            console.log('📊 Última modificação:', data.lastModified);
            console.log('📊 Total de itens:', data.itemCount);
            return true;
        } else {
            console.log('❌ Falha na sincronização:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro durante sincronização:', error.message);
        return false;
    }
}

// Função para verificar URLs das imagens após sincronização
async function verificarImagensAposSinc() {
    try {
        console.log('\n🔍 Verificando URLs das imagens após sincronização...');
        
        const response = await fetch(`${API_BASE_URL}/cardapio`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        const data = await response.json();
        const itens = data.cardapio || data;
        
        console.log('\n📋 Status atual das URLs:');
        
        let urlsCorretas = 0;
        let urlsIncorretas = 0;
        
        itens.forEach(item => {
            const isImageKitUrl = item.imagem.startsWith('https://ik.imagekit.io/');
            const status = isImageKitUrl ? '✅' : '❌';
            console.log(`${status} ID ${item.id}: ${item.nome}`);
            console.log(`   URL: ${item.imagem}`);
            
            if (isImageKitUrl) {
                urlsCorretas++;
            } else {
                urlsIncorretas++;
            }
        });
        
        console.log(`\n📈 Resumo:`);
        console.log(`✅ ${urlsCorretas} URLs corretas (ImageKit)`);
        console.log(`❌ ${urlsIncorretas} URLs ainda incorretas`);
        
        if (urlsIncorretas === 0) {
            console.log('\n🎉 Todas as URLs estão corretas!');
            console.log('🌐 As imagens devem aparecer corretamente no site!');
        } else {
            console.log('\n⚠️  Ainda há URLs que precisam ser verificadas.');
            console.log('💡 As correções podem ter sido aplicadas mas o cache ainda não foi atualizado.');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar imagens:', error.message);
    }
}

// Função principal
async function main() {
    console.log('🚀 Iniciando sincronização forçada com produção...');
    
    // Primeiro, fazer login
    const token = await loginAdmin();
    if (!token) {
        console.log('❌ Não foi possível fazer login. Abortando.');
        return;
    }
    
    // Forçar sincronização
    const syncSuccess = await forceSyncWithSupabase();
    if (!syncSuccess) {
        console.log('❌ Falha na sincronização. Continuando com verificação...');
    }
    
    // Aguardar um pouco para garantir que a sincronização foi processada
    console.log('⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar URLs das imagens
    await verificarImagensAposSinc();
    
    console.log('\n✅ Processo concluído!');
}

// Executar script
main();