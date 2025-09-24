// Teste para verificar se a correção da função updateCardapioItem funciona
const { updateCardapioItem } = require('./api/utils/vercelDatabase');

async function testUpdateFix() {
  console.log('🧪 Testando correção da função updateCardapioItem...');
  
  // Simular tentativa de atualizar item que só existe no Supabase
  const testId = 12; // ID que existe no Supabase mas não no cache local
  const updates = {
    nome: 'Item Teste Atualizado',
    preco: 25.90
  };
  
  console.log(`\n🔍 Tentando atualizar item ${testId}...`);
  
  try {
    const result = await updateCardapioItem(testId, updates);
    
    console.log('\n📊 Resultado do teste:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.success) {
      console.log('✅ TESTE PASSOU: Item foi encontrado e atualizado!');
      console.log('Item atualizado:', result.item);
    } else {
      console.log('❌ TESTE FALHOU: Item não foi encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testUpdateFix();
}

module.exports = { testUpdateFix };