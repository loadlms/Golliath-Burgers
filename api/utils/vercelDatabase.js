// Sistema de banco de dados para Vercel com persistência em memória global
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Função para verificar se as credenciais do Supabase são válidas
function hasValidSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  // Debug das variáveis de ambiente
  console.log('🔍 Debug Supabase Credentials:');
  console.log('SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined');
  
  const isValid = supabaseUrl && 
         supabaseKey && 
         supabaseUrl !== 'your-supabase-url' && 
         supabaseKey !== 'your-supabase-anon-key' &&
         supabaseUrl.includes('supabase.co');
  
  console.log('✅ Supabase credentials valid:', isValid);
  return isValid;
}

// Importação estática do módulo Supabase
const supabaseModule = hasValidSupabaseCredentials() ? require('./supabase') : null;

const addCardapioItemInSupabase = supabaseModule?.addCardapioItemInSupabase || null;
const getCardapioFromSupabase = supabaseModule?.getCardapioFromSupabase || null;
const updateCardapioItemInSupabase = supabaseModule?.updateCardapioItemInSupabase || null;
const deleteCardapioItemInSupabase = supabaseModule?.deleteCardapioItemInSupabase || null;
const seedCardapioInSupabase = supabaseModule?.seedCardapioInSupabase || null;
const isSupabaseAvailable = supabaseModule?.isSupabaseAvailable || null;

console.log('🔍 IMPORTAÇÃO SUPABASE - Credenciais válidas:', hasValidSupabaseCredentials());
console.log('🔍 IMPORTAÇÃO SUPABASE - Módulo carregado:', !!supabaseModule);
console.log('🔍 IMPORTAÇÃO SUPABASE - addCardapioItemInSupabase disponível:', !!addCardapioItemInSupabase);
console.log('🔍 IMPORTAÇÃO SUPABASE - Tipo da função:', typeof addCardapioItemInSupabase);

// Caminho para o arquivo de dados (apenas para leitura inicial)
const DATA_FILE = path.join(process.cwd(), 'data', 'cardapio.json');

// Cache global compartilhado entre todas as instâncias
if (!global.cardapioData) {
  global.cardapioData = null;
  global.dataInitialized = false;
}

// Cache global para dados do cardápio
let cardapioCache = {
    data: null,
    lastModified: 0,
    dataHash: null
};

// Função para gerar hash dos dados
function generateDataHash(data) {
    const dataString = JSON.stringify(data.sort((a, b) => a.id - b.id));
    return crypto.createHash('md5').update(dataString).digest('hex');
}



// Função para inicializar dados do arquivo
function initializeData() {
  if (global.dataInitialized) {
    return global.cardapioData;
  }
  
  try {
    // Primeiro, tentar carregar do arquivo cardapio.json original
    const originalCardapioPath = path.join(process.cwd(), 'data', 'cardapio.json');
    console.log('🔍 Tentando carregar cardápio de:', originalCardapioPath);
    
    if (fs.existsSync(originalCardapioPath)) {
      const fileData = fs.readFileSync(originalCardapioPath, 'utf8');
      const parsedData = JSON.parse(fileData);
      
      // Validar estrutura dos dados
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        global.cardapioData = parsedData;
        console.log('📁 Dados carregados do cardápio original - Total:', parsedData.length);
        global.dataInitialized = true;
        return global.cardapioData;
      }
    }
    
    console.log('⚠️ Arquivo cardapio.json não encontrado ou inválido, usando dados padrão');
    global.cardapioData = getDefaultData();
    global.dataInitialized = true;
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error.message);
    global.cardapioData = getDefaultData();
    global.dataInitialized = true;
    console.log('🔄 Fallback para dados padrão devido ao erro');
  }
  
  return global.cardapioData;
}

// Função para ler dados (com fallback para Supabase)
async function readData() {
    const startTime = Date.now();
    
    try {
        // Verificar se temos dados em cache válidos
        if (cardapioCache.data && 
            cardapioCache.lastModified > Date.now() - 30000) { // Cache válido por 30 segundos
            console.log('📋 Retornando dados do cache local');
            return cardapioCache.data;
        }

        console.log('🔄 Cache expirado, buscando dados...');
        
        // Timeout para operações de banco
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database timeout')), 10000);
        });
        
        // Tentar buscar do Supabase primeiro com timeout
        if (getCardapioFromSupabase) {
            try {
                console.log('🔍 Buscando dados do Supabase...');
                const result = await Promise.race([
                    getCardapioFromSupabase(),
                    timeoutPromise
                ]);
                const supabaseData = result;
                
                if (supabaseData && Array.isArray(supabaseData) && supabaseData.length > 0) {
                    console.log(`✅ Supabase: ${supabaseData.length} itens em ${Date.now() - startTime}ms`);
                    
                    // Atualizar cache
                    cardapioCache.data = supabaseData;
                    cardapioCache.lastModified = Date.now();
                    cardapioCache.dataHash = generateDataHash(supabaseData);
                    
                    return supabaseData;
                }
            } catch (supabaseError) {
                console.error('⚠️ Erro no Supabase:', supabaseError.message);
            }
        }
        
        // Fallback para dados locais
        console.log('🔄 Fallback para dados locais...');
        const localData = initializeData();
        
        if (localData && Array.isArray(localData)) {
            cardapioCache.data = localData;
            cardapioCache.lastModified = Date.now();
            cardapioCache.dataHash = generateDataHash(localData);
            
            console.log(`📁 Dados locais: ${localData.length} itens`);
            return localData;
        }
        
        // Último recurso: dados padrão
        console.log('🆘 Usando dados padrão');
        const defaultData = getDefaultData();
        cardapioCache.data = defaultData;
        cardapioCache.lastModified = Date.now();
        
        return defaultData;
        
    } catch (error) {
        console.error('❌ Erro crítico ao ler dados:', error.message);
        
        // Retornar cache antigo se disponível
        if (cardapioCache.data) {
            console.log('🔄 Retornando cache antigo devido ao erro');
            return cardapioCache.data;
        }
        
        // Último recurso
        const defaultData = getDefaultData();
        cardapioCache.data = defaultData;
        return defaultData;
    }
}

// Função para escrever dados (cache global e Supabase)
async function writeData(data) {
  try {
    // Tentar salvar no Supabase primeiro
    const supabaseAvailable = await isSupabaseAvailable();
    
    if (supabaseAvailable) {
      console.log('🌐 Salvando dados no Supabase...');
      // Nota: Esta função é para salvar dados completos, mas o Supabase
      // será atualizado item por item através da função updateCardapioItemInSupabase
      // Esta função manterá o cache atualizado
    }
    
    // Atualizar cache global
    global.cardapioData = data;
    global.dataInitialized = true;
    
    // Atualizar cache local com hash
    cardapioCache.data = data;
    cardapioCache.lastModified = Date.now();
    cardapioCache.dataHash = generateDataHash(data);
    
    console.log('💾 Dados salvos no cache global (Vercel)');
    console.log('📊 Itens no cache:', data.length);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar dados no cache:', error);
    return false;
  }
}

// Função para obter dados padrão
function getDefaultData() {
  return [
    {
      "id": 1,
      "nome": "X BACON DE GOLIATH",
      "descricao": "Burger de 90g, com American Cheese, 2 fatias de bacon, molho especial de Golliath no pão brioche tostado na manteiga.",
      "preco": 24.90,
      "categoria": "hamburguers",
      "imagem": "https://ik.imagekit.io/golliathburgers/produtos/x-bacon-goliath.jpg",
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
      "imagem": "https://ik.imagekit.io/golliathburgers/produtos/triplo-pcq.jpg",
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
      "imagem": "https://ik.imagekit.io/golliathburgers/produtos/triplo-bacon.jpg",
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
      "imagem": "https://ik.imagekit.io/golliathburgers/produtos/oklahoma.jpg",
      "disponivel": true,
      "destaque": true,
      "ordem": 4,
      "isActive": true,
      "createdAt": "2025-01-20T12:00:00.000Z",
      "updatedAt": "2025-01-20T12:00:00.000Z"
    }
  ];
}

// Função para atualizar um item específico (síncrona - apenas cache)
function updateItem(itemId, updates) {
  const data = readData();
  const itemIndex = data.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    console.log(`Item com ID ${itemId} não encontrado`);
    return false;
  }
  
  // Atualizar item
  data[itemIndex] = {
    ...data[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  console.log(`Item ${itemId} atualizado:`, updates);
  return writeData(data);
}

// Função para obter todos os dados
async function getAllData() {
  return await readData();
}

// Função para resetar dados (útil para desenvolvimento)
function resetData() {
  global.cardapioData = getDefaultData();
  global.dataInitialized = true;
  console.log('Dados resetados para valores padrão');
  return true;
}

// Função para obter hash atual dos dados
function getCurrentDataHash() {
    if (cardapioCache.dataHash) {
        return cardapioCache.dataHash;
    }
    
    // Se não temos hash em cache, gerar a partir dos dados atuais
    const data = readData();
    if (data && data.length > 0) {
        cardapioCache.dataHash = generateDataHash(data);
        return cardapioCache.dataHash;
    }
    
    return null;
}

// Função para atualizar item específico (integração com Supabase)
async function updateItemAsync(id, updates) {
    // Só tentar usar Supabase se as credenciais forem válidas
    if (!hasValidSupabaseCredentials()) {
        console.log('⚠️ Credenciais do Supabase não configuradas, usando apenas cache local');
        
        // Fallback: atualizar apenas no cache local
        if (cardapioCache.data) {
            const itemIndex = cardapioCache.data.findIndex(item => item.id === parseInt(id));
            if (itemIndex !== -1) {
                cardapioCache.data[itemIndex] = { ...cardapioCache.data[itemIndex], ...updates };
                cardapioCache.lastModified = Date.now();
                cardapioCache.dataHash = generateDataHash(cardapioCache.data);
                
                console.log(`💾 Item ${id} atualizado no cache local`);
                return { success: true, data: cardapioCache.data[itemIndex] };
            }
        }
        
        return { success: true, message: 'Atualizado apenas no cache local' };
    }
    
    try {
        // Tentar atualizar no Supabase primeiro
        const supabaseAvailable = await isSupabaseAvailable();
        
        if (supabaseAvailable) {
            console.log(`🌐 Atualizando item ${id} no Supabase...`);
            const result = await updateCardapioItemInSupabase(id, updates);
            
            if (result.success) {
                console.log(`✅ Item ${id} atualizado no Supabase`);
                
                // Invalidar cache para forçar reload na próxima consulta
                cardapioCache.data = null;
                cardapioCache.lastModified = null;
                cardapioCache.dataHash = null;
                
                return { success: true, data: result.data };
            } else {
                console.error(`❌ Erro ao atualizar item ${id} no Supabase:`, result.error);
            }
        }
        
        // Fallback: atualizar apenas no cache local
        if (cardapioCache.data) {
            const itemIndex = cardapioCache.data.findIndex(item => item.id === parseInt(id));
            if (itemIndex !== -1) {
                cardapioCache.data[itemIndex] = { ...cardapioCache.data[itemIndex], ...updates };
                cardapioCache.lastModified = Date.now();
                cardapioCache.dataHash = generateDataHash(cardapioCache.data);
                
                console.log(`💾 Item ${id} atualizado no cache local`);
                return { success: true, data: cardapioCache.data[itemIndex] };
            }
        }
        
        return { success: false, error: 'Item não encontrado' };
    } catch (error) {
        console.error(`❌ Erro ao atualizar item ${id}:`, error);
        return { success: false, error: error.message };
    }
}

// Função para obter dados do cardápio (compatibilidade com API)
async function getCardapioData() {
  console.log('📊 getCardapioData chamada');
  const data = await readData();
  console.log('📊 Retornando', data.length, 'itens');
  return data;
}

// Função para obter dados locais do cardápio (fallback)
async function getLocalCardapioData() {
  console.log('📋 getLocalCardapioData chamada - retornando dados do cache/arquivo local');
  
  try {
    // Primeiro tentar cache em memória
    if (global.cardapioData && global.dataInitialized) {
      console.log('📊 Retornando dados do cache global:', global.cardapioData.length, 'itens');
      return global.cardapioData;
    }
    
    // Se não tem cache, tentar inicializar dados locais
    const localData = initializeData();
    if (localData && Array.isArray(localData)) {
      console.log('📊 Retornando dados inicializados:', localData.length, 'itens');
      return localData;
    }
    
    // Último recurso: dados padrão
    console.log('🆘 Retornando dados padrão');
    return getDefaultData();
    
  } catch (error) {
    console.error('❌ Erro ao obter dados locais:', error.message);
    // Retornar dados padrão em caso de erro
    return getDefaultData();
  }
}

// Função para atualizar item do cardápio (compatibilidade com API)
async function updateCardapioItem(id, updates) {
  console.log('🔄 updateCardapioItem chamada:', { id, updates });
  
  if (!global.cardapioData || !global.dataInitialized) {
    initializeData();
  }
  
  let itemIndex = global.cardapioData.findIndex(item => item.id === parseInt(id));
  
  // Se item não encontrado no cache local, tentar buscar do Supabase
  if (itemIndex === -1 && hasValidSupabaseCredentials() && getCardapioFromSupabase) {
    console.log('🔍 Item não encontrado no cache local, buscando do Supabase:', id);
    try {
      const supabaseData = await getCardapioFromSupabase();
      if (supabaseData && supabaseData.length > 0) {
        console.log('📊 Dados do Supabase carregados:', supabaseData.length, 'itens');
        // Atualizar cache global com dados do Supabase
        global.cardapioData = supabaseData;
        cardapioCache.data = supabaseData;
        cardapioCache.lastModified = Date.now();
        cardapioCache.dataHash = generateDataHash(supabaseData);
        
        // Tentar encontrar o item novamente
        itemIndex = global.cardapioData.findIndex(item => item.id === parseInt(id));
        console.log('🔍 Item encontrado após sincronização:', itemIndex !== -1);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do Supabase:', error.message);
    }
  }
  
  if (itemIndex === -1) {
    console.log('❌ Item não encontrado nem no cache local nem no Supabase:', id);
    return { success: false, message: 'Item não encontrado' };
  }
  
  const itemAntes = { ...global.cardapioData[itemIndex] };
  
  // Tentar usar Supabase primeiro
  console.log('🔍 Verificando Supabase:', {
    hasCredentials: hasValidSupabaseCredentials(),
    hasFunction: !!updateCardapioItemInSupabase
  });
  
  if (hasValidSupabaseCredentials() && updateCardapioItemInSupabase) {
    try {
      console.log('🚀 Tentando atualizar no Supabase:', { id, updates });
      const result = await updateCardapioItemInSupabase(id, updates);
      console.log('📊 Resultado do Supabase:', result);
      
      if (result.success) {
        // Atualizar cache local também
        global.cardapioData[itemIndex] = {
          ...global.cardapioData[itemIndex],
          ...result.data,
          updatedAt: new Date().toISOString()
        };
        console.log('✅ Item atualizado no Supabase e cache local');
        return { 
          success: true, 
          message: 'Item atualizado com sucesso',
          item: global.cardapioData[itemIndex]
        };
      } else {
        console.log('❌ Falha no Supabase:', result.error);
      }
    } catch (error) {
      console.log('⚠️ Erro no Supabase, usando cache local:', error.message);
    }
  } else {
    console.log('⚠️ Supabase não disponível, usando apenas cache local');
  }
  
  // Fallback para cache local
  global.cardapioData[itemIndex] = {
    ...global.cardapioData[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  const itemDepois = { ...global.cardapioData[itemIndex] };
  console.log('✅ Item atualizado no cache local:', { antes: itemAntes, depois: itemDepois });
  
  // NOTA: Vercel é serverless - arquivos não persistem entre execuções
  console.log('⚠️ Ambiente serverless: dados salvos apenas em memória durante esta execução');
  
  // Tentar salvar no arquivo JSON (funciona apenas localmente)
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(global.cardapioData, null, 2));
    console.log('💾 Dados salvos no arquivo JSON (apenas local)');
  } catch (error) {
    console.log('⚠️ Não foi possível salvar no arquivo JSON:', error.message);
  }
  
  return { 
    success: true, 
    message: 'Item atualizado com sucesso',
    item: global.cardapioData[itemIndex]
  };
}

// Função para adicionar item do cardápio (compatibilidade com API)
async function addCardapioItem(itemData) {
  console.log('🆕 addCardapioItem chamada com dados:', itemData);
  
  if (!global.cardapioData || !global.dataInitialized) {
    console.log('🔄 Inicializando dados...');
    initializeData();
  }
  
  console.log('📊 Estado atual do cardápio:', global.cardapioData.length, 'itens');
  
  // Tentar usar Supabase primeiro
  console.log('🔍 Verificando condições para usar Supabase:');
  console.log('  - hasValidSupabaseCredentials():', hasValidSupabaseCredentials());
  console.log('  - addCardapioItemInSupabase disponível:', typeof addCardapioItemInSupabase);
  
  if (hasValidSupabaseCredentials() && addCardapioItemInSupabase) {
    try {
      console.log('🚀 Tentando salvar no Supabase com dados:', JSON.stringify(itemData, null, 2));
      const result = await addCardapioItemInSupabase(itemData);
      console.log('📊 Resultado completo do Supabase:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        // Atualizar cache local também
        global.cardapioData.push(result.data);
        console.log('✅ Item adicionado no Supabase e cache local');
        console.log('📋 Novo estado do cardápio:', global.cardapioData.length, 'itens');
        console.log('🆔 ID do novo item:', result.data.id);
        return { success: true, message: 'Item adicionado com sucesso', data: { id: result.data.id, ...itemData } };
      } else {
        console.log('❌ Falha no Supabase:', result.error);
      }
    } catch (error) {
      console.log('⚠️ Erro no Supabase, usando cache local:', error.message);
      console.log('📋 Stack trace:', error.stack);
    }
  } else {
    console.log('⚠️ Condições não atendidas para usar Supabase, usando cache local');
  }
  
  // Fallback para cache local
  const newId = Math.max(...global.cardapioData.map(item => item.id)) + 1;
  
  const newItem = {
    id: newId,
    ...itemData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  global.cardapioData.push(newItem);
  console.log('✅ Novo item adicionado no cache local:', newItem);
  
  // NOTA: Vercel é serverless - arquivos não persistem entre execuções
  console.log('⚠️ Ambiente serverless: dados salvos apenas em memória durante esta execução');
  
  // Tentar salvar no arquivo JSON (funciona apenas localmente)
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(global.cardapioData, null, 2));
    console.log('💾 Dados salvos no arquivo JSON (apenas local)');
  } catch (error) {
    console.log('⚠️ Não foi possível salvar no arquivo JSON:', error.message);
  }
  
  return { success: true, message: 'Item adicionado com sucesso', item: newItem };
}

// Função para obter item específico (compatibilidade com API)
function getCardapioItem(id) {
  if (!global.cardapioData || !global.dataInitialized) {
    initializeData();
  }
  
  const item = global.cardapioData.find(item => item.id === parseInt(id));
  
  if (!item) {
    return { success: false, message: 'Item não encontrado' };
  }
  
  return { success: true, item };
}

// Função para deletar item (compatibilidade com API)
async function deleteCardapioItem(id) {
  if (!global.cardapioData || !global.dataInitialized) {
    initializeData();
  }
  
  // Tentar usar Supabase primeiro
  if (hasValidSupabaseCredentials() && deleteCardapioItemInSupabase) {
    try {
      const result = await deleteCardapioItemInSupabase(id);
      if (result.success) {
        // Atualizar cache local também
        const itemIndex = global.cardapioData.findIndex(item => item.id === parseInt(id));
        if (itemIndex !== -1) {
          global.cardapioData.splice(itemIndex, 1);
        }
        console.log('✅ Item deletado do Supabase e cache local');
        return { success: true, message: 'Item deletado com sucesso' };
      }
    } catch (error) {
      console.log('⚠️ Erro no Supabase, usando cache local:', error.message);
    }
  }
  
  // Fallback para cache local
  const itemIndex = global.cardapioData.findIndex(item => item.id === parseInt(id));
  
  if (itemIndex === -1) {
    return { success: false, message: 'Item não encontrado' };
  }
  
  // Marcar como inativo em vez de deletar
  global.cardapioData[itemIndex].isActive = false;
  global.cardapioData[itemIndex].updatedAt = new Date().toISOString();
  
  console.log('✅ Item marcado como inativo no cache local:', global.cardapioData[itemIndex]);
  
  return { success: true, message: 'Item deletado com sucesso' };
}

// Função para deletar item permanentemente (compatibilidade com API)
async function deleteCardapioItemPermanently(id) {
  console.log(`🗑️ deleteCardapioItemPermanently chamada para ID: ${id}`);
  
  // Forçar sincronização com Supabase primeiro
  console.log('🔄 Forçando sincronização com Supabase...');
  cardapioCache.lastModified = 0; // Força atualização do cache
  
  try {
    const freshData = await readData();
    global.cardapioData = freshData;
    global.dataInitialized = true;
    console.log(`📊 Dados sincronizados: ${freshData.length} itens`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar dados:', error);
    // Continua com dados locais se a sincronização falhar
    if (!global.cardapioData || !global.dataInitialized) {
      console.log('📁 Inicializando dados locais...');
      initializeData();
    }
  }
  
  console.log(`📊 Total de itens no cache: ${global.cardapioData?.length || 0}`);
  console.log(`🔍 Procurando item com ID: ${id} (tipo: ${typeof id})`);
  
  const itemIndex = global.cardapioData.findIndex(item => {
    console.log(`🔍 Comparando: item.id=${item.id} (tipo: ${typeof item.id}) com id=${id} (tipo: ${typeof id})`);
    return item.id === parseInt(id);
  });
  
  console.log(`📍 Item encontrado no índice: ${itemIndex}`);
  
  if (itemIndex === -1) {
    console.log('❌ Item não encontrado no cache local após sincronização');
    return { success: false, message: 'Item não encontrado' };
  }
  
  const itemToDelete = global.cardapioData[itemIndex];
  console.log(`🎯 Item a ser deletado:`, itemToDelete);
  
  // Tentar deletar do Supabase primeiro
  console.log(`🔍 Verificando função deleteCardapioItemInSupabase: ${!!deleteCardapioItemInSupabase}`);
  if (deleteCardapioItemInSupabase) {
    try {
      console.log(`🚀 Chamando deleteCardapioItemInSupabase para ID: ${id}`);
      const supabaseResult = await deleteCardapioItemInSupabase(id);
      console.log(`📊 Resultado do Supabase:`, supabaseResult);
      
      if (!supabaseResult.success) {
        console.error('❌ Erro ao deletar item do Supabase:', supabaseResult.error);
        // Continua com a exclusão local mesmo se o Supabase falhar
      } else {
        console.log('✅ Item deletado do Supabase com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar item do Supabase:', error);
      // Continua com a exclusão local mesmo se o Supabase falhar
    }
  } else {
    console.log('⚠️ Função deleteCardapioItemInSupabase não disponível');
  }
  
  const deletedItem = global.cardapioData.splice(itemIndex, 1)[0];
  console.log('✅ Item deletado permanentemente do cache local:', deletedItem);
  console.log(`📊 Total de itens restantes no cache: ${global.cardapioData.length}`);
  
  return { success: true, message: 'Item deletado permanentemente', deletedItem };
}

module.exports = {
  readData: getAllData,
  writeData,
  updateItem,
  updateItemAsync,
  getDefaultData,
  resetData,
  getCurrentDataHash,
  getCardapioData,
  getLocalCardapioData,
  updateCardapioItem,
  addCardapioItem,
  getCardapioItem,
  deleteCardapioItem,
  deleteCardapioItemPermanently
};