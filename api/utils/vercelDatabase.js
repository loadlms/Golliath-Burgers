// Sistema de banco de dados para Vercel usando Neon (PostgreSQL)
const db = require('./database');
const crypto = require('crypto');

// Cache global para dados do cardápio (Memory Cache)
// Útil para reduzir chamadas ao banco em execuções "quentes" do serverless
let cardapioCache = {
  data: null,
  lastModified: 0,
  dataHash: null
};

// Função para gerar hash dos dados
function generateDataHash(data) {
  if (!data) return null;
  const dataString = JSON.stringify(data.sort((a, b) => a.id - b.id));
  return crypto.createHash('md5').update(dataString).digest('hex');
}

// Função para obter dados do cardápio (Neon)
async function getCardapioData() {
  const startTime = Date.now();

  try {
    console.log('🔄 Buscando dados do Neon...');

    // Timeout para operações de banco (5s)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });

    const queryPromise = db.query('SELECT * FROM cardapio ORDER BY ordem ASC, id ASC');

    const result = await Promise.race([queryPromise, timeoutPromise]);

    const data = result.rows;

    if (data) {
      console.log(`✅ Neon: ${data.length} itens em ${Date.now() - startTime}ms`);

      // Atualizar cache
      cardapioCache.data = data;
      cardapioCache.lastModified = Date.now();
      cardapioCache.dataHash = generateDataHash(data);

      return data;
    }
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar dados do Neon:', error.message);

    // Fallback para cache se existir
    if (cardapioCache.data) {
      console.log('⚠️ Retornando cache devido a erro no banco');
      return cardapioCache.data;
    }

    // Retornar array vazio em último caso para não quebrar a UI
    return [];
  }
}

// Compatibilidade: obter item individual
async function getCardapioItem(id) {
  try {
    const result = await db.query('SELECT * FROM cardapio WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return { success: true, item: result.rows[0] };
    }
    return { success: false, message: 'Item não encontrado' };
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return { success: false, error: error.message };
  }
}

// Função para adicionar item (Neon)
async function addCardapioItem(itemData) {
  try {
    // Remover ID se vier no objeto (será gerado pelo banco)
    const { id, ...data } = itemData;

    // Valores padrão
    const disponivel = data.disponivel !== undefined ? data.disponivel : true;
    const destaque = data.destaque !== undefined ? data.destaque : false;
    const ordem = data.ordem || 999;
    const isActive = data.isActive !== undefined ? data.isActive : true;

    const query = `
            INSERT INTO cardapio (
                nome, descricao, preco, categoria, imagem, 
                disponivel, destaque, ordem, "isActive", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *
        `;

    const values = [
      data.nome,
      data.descricao,
      data.preco,
      data.categoria,
      data.imagem || '/img/default.jpg',
      disponivel,
      destaque,
      ordem,
      isActive
    ];

    const result = await db.query(query, values);
    const newItem = result.rows[0];

    console.log('✅ Item adicionado no Neon:', newItem.id);

    // Invalidar cache
    cardapioCache.data = null;

    return { success: true, message: 'Item adicionado com sucesso', data: newItem, item: newItem };
  } catch (error) {
    console.error('❌ Erro ao adicionar item:', error);
    return { success: false, error: error.message };
  }
}

// Função para atualizar item (Neon)
async function updateCardapioItem(id, updates) {
  try {
    // Construir query dinâmica
    const keys = Object.keys(updates).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt');

    if (keys.length === 0) {
      return { success: false, message: 'Nenhum dado para atualizar' };
    }

    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [id, ...keys.map(key => updates[key])];

    // Adicionar updatedAt
    const query = `
            UPDATE cardapio 
            SET ${setClause}, "updatedAt" = NOW()
            WHERE id = $1
            RETURNING *
        `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return { success: false, message: 'Item não encontrado' };
    }

    const updatedItem = result.rows[0];
    console.log(`✅ Item ${id} atualizado no Neon`);

    // Invalidar cache
    cardapioCache.data = null;

    return { success: true, message: 'Item atualizado com sucesso', data: updatedItem, item: updatedItem };
  } catch (error) {
    console.error(`❌ Erro ao atualizar item ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// Alias para compatibilidade anterior
const updateItem = updateCardapioItem;
const updateItemAsync = updateCardapioItem;

// Função para deletar item (soft delete - marcar como inativo)
async function deleteCardapioItem(id) {
  return updateCardapioItem(id, { isActive: false });
}

// Função para deletar item permanentemente
async function deleteCardapioItemPermanently(id) {
  try {
    const result = await db.query('DELETE FROM cardapio WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return { success: false, message: 'Item não encontrado' };
    }

    console.log(`✅ Item ${id} deletado permanentemente do Neon`);

    // Invalidar cache
    cardapioCache.data = null;

    return { success: true, message: 'Item deletado permanentemente', deletedItem: result.rows[0] };
  } catch (error) {
    console.error(`❌ Erro ao deletar item ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// Funções legadas/auxiliares mantidas para compatibilidade de interface, mas usando Neon ou defaults
async function getLocalCardapioData() {
  return getCardapioData(); // Agora busca do Neon, que é a fonte da verdade
}

// Funções não mais necessárias mas mantidas 'dummy' para evitar quebra de imports se houver
function getDefaultData() { return []; }
function resetData() { return true; }
function getCurrentDataHash() { return cardapioCache.dataHash; }

// Funções de leitura/escrita genéricas
const readData = getCardapioData;
const writeData = async () => true; // No-op, pois persistência é no banco

module.exports = {
  readData,
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