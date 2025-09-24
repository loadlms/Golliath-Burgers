// Sistema simples de armazenamento para Vercel
// Usa variáveis globais que persistem durante a execução da função

// Cache global para dados do cardápio
if (!global.editableCardapioData) {
  global.editableCardapioData = [
    {
      "id": 1,
      "nome": "X BACON DE GOLIATH",
      "descricao": "Burger de 90g, com American Cheese, 2 fatias de bacon, molho especial de Golliath no pão brioche tostado na manteiga.",
      "preco": 24.90,
      "categoria": "hamburguers",
      "imagem": "/img/_MG_0164.jpg",
      "disponivel": true,
      "destaque": true,
      "ordem": 1,
      "isActive": true,
      "createdAt": "2025-01-20T12:00:00.000Z",
      "updatedAt": "2025-01-20T12:00:00.000Z"
    },
    {
      "id": 2,
      "nome": "GOLLIATH TRIPLO P.C.Q",
      "descricao": "3x mais carne, 3x mais queijo. Com 3 Burguers de 90g totalizando 270g de carne, e com fatias de American Cheese, no pão brioche tostado na manteiga.",
      "preco": 32.90,
      "categoria": "hamburguers",
      "imagem": "/img/_MG_0191.jpg",
      "disponivel": true,
      "destaque": true,
      "ordem": 2,
      "isActive": true,
      "createdAt": "2025-01-20T12:00:00.000Z",
      "updatedAt": "2025-01-20T12:00:00.000Z"
    },
    {
      "id": 3,
      "nome": "GOLLIATH TRIPLO BACON",
      "descricao": "3x mais carne, 3x mais queijo e 3x mais bacon. Com 3 Burguers de 90g totalizando 270g de carne, com fatias de American Cheese, 2 fatias de bacon por andar, e molho especial de Golliath no pão brioche tostado na manteiga.",
      "preco": 39.90,
      "categoria": "hamburguers",
      "imagem": "/img/_MG_0309.jpg",
      "disponivel": true,
      "destaque": true,
      "ordem": 3,
      "isActive": true,
      "createdAt": "2025-01-20T12:00:00.000Z",
      "updatedAt": "2025-01-20T12:00:00.000Z"
    },
    {
      "id": 4,
      "nome": "GOLLIATH OKLAHOMA",
      "descricao": "4 burguers de 90g ao estilo Oklahoma, totalizando 360g de blend, com 4 fatias de queijo cheddar, no pão brioche selado na manteiga.",
      "preco": 49.90,
      "categoria": "hamburguers",
      "imagem": "/img/_MG_6201.jpg",
      "disponivel": true,
      "destaque": true,
      "ordem": 4,
      "isActive": true,
      "createdAt": "2025-01-20T12:00:00.000Z",
      "updatedAt": "2025-01-20T12:00:00.000Z"
    }
  ];
}

// Função para obter todos os dados do cardápio
function getCardapioData() {
  console.log('📊 getCardapioData chamada, retornando', global.editableCardapioData.length, 'itens');
  console.log('📊 Primeiros 2 itens:', global.editableCardapioData.slice(0, 2).map(item => ({ id: item.id, nome: item.nome, updatedAt: item.updatedAt })));
  return global.editableCardapioData;
}

// Função para atualizar um item do cardápio
async function updateCardapioItem(id, updates) {
  console.log('🔄 updateCardapioItem chamada:', { id, updates });
  const { updateCardapioItem: updateInDatabase } = require('./vercelDatabase');
  
  const itemIndex = global.editableCardapioData.findIndex(item => item.id === parseInt(id));
  
  if (itemIndex === -1) {
    console.log('❌ Item não encontrado:', id);
    return { success: false, message: 'Item não encontrado' };
  }
  
  const itemAntes = { ...global.editableCardapioData[itemIndex] };
  
  // Tentar atualizar no banco de dados primeiro
  const result = await updateInDatabase(id, updates);
  
  if (result.success) {
    // Se atualizou no banco, atualizar o cache local também
    global.editableCardapioData[itemIndex] = {
      ...global.editableCardapioData[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const itemDepois = { ...global.editableCardapioData[itemIndex] };
    console.log('✅ Item atualizado no banco:', { antes: itemAntes, depois: itemDepois });
    
    return { 
      success: true, 
      message: 'Item atualizado com sucesso no banco de dados',
      item: global.editableCardapioData[itemIndex]
    };
  } else {
    // Fallback: atualizar apenas no cache local
    global.editableCardapioData[itemIndex] = {
      ...global.editableCardapioData[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const itemDepois = { ...global.editableCardapioData[itemIndex] };
    console.log('⚠️ Item atualizado apenas localmente:', { antes: itemAntes, depois: itemDepois });
    
    return { 
      success: true, 
      message: 'Item atualizado apenas localmente (erro no banco de dados)',
      item: global.editableCardapioData[itemIndex]
    };
  }
}

// Função para adicionar um novo item ao cardápio
async function addCardapioItem(itemData) {
  const { addCardapioItem: addToDatabase } = require('./vercelDatabase');
  
  // Tentar salvar no banco de dados primeiro
  const result = await addToDatabase(itemData);
  
  if (result.success) {
    // Se salvou no banco, atualizar o cache local também
    const newId = Math.max(...global.editableCardapioData.map(item => item.id)) + 1;
    
    const newItem = {
      id: newId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    global.editableCardapioData.push(newItem);
    
    return { 
      success: true, 
      message: 'Item adicionado com sucesso no banco de dados',
      item: newItem
    };
  } else {
    // Fallback: salvar apenas no cache local
    const newId = Math.max(...global.editableCardapioData.map(item => item.id)) + 1;
    
    const newItem = {
      id: newId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    global.editableCardapioData.push(newItem);
    
    return { 
      success: true, 
      message: 'Item adicionado apenas localmente (erro no banco de dados)',
      item: newItem
    };
  }
}

// Função para alternar status de um item do cardápio (ativar/desativar)
function deleteCardapioItem(id) {
  const itemIndex = global.editableCardapioData.findIndex(item => item.id === parseInt(id));
  
  if (itemIndex === -1) {
    return { success: false, message: 'Item não encontrado' };
  }
  
  // Alternar entre ativo/inativo
  const currentItem = global.editableCardapioData[itemIndex];
  const newActiveStatus = !currentItem.isActive;
  
  global.editableCardapioData[itemIndex] = {
    ...currentItem,
    isActive: newActiveStatus,
    disponivel: newActiveStatus,
    updatedAt: new Date().toISOString()
  };
  
  const message = newActiveStatus ? 'Item ativado com sucesso' : 'Item desativado com sucesso';
  
  return { 
    success: true, 
    message: message,
    item: global.editableCardapioData[itemIndex]
  };
}

// Função para deletar permanentemente um item do cardápio
function deleteCardapioItemPermanently(id) {
  const itemIndex = global.editableCardapioData.findIndex(item => item.id === parseInt(id));
  
  if (itemIndex === -1) {
    return { success: false, message: 'Item não encontrado' };
  }
  
  const deletedItem = global.editableCardapioData.splice(itemIndex, 1)[0];
  
  return { 
    success: true, 
    message: 'Item removido permanentemente',
    item: deletedItem
  };
}

// Função para obter um item específico
function getCardapioItem(id) {
  const item = global.editableCardapioData.find(item => item.id === parseInt(id));
  
  if (!item) {
    return { success: false, message: 'Item não encontrado' };
  }
  
  return { 
    success: true, 
    item: item
  };
}

module.exports = {
  getCardapioData,
  updateCardapioItem,
  addCardapioItem,
  deleteCardapioItem,
  deleteCardapioItemPermanently,
  getCardapioItem
};