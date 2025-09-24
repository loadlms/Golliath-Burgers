// Configuração do Supabase para persistência de dados
// Usando bundle personalizado para resolver problemas de dependência no Vercel
const { createClient } = require('./supabase-bundle');
const { incrementCounter } = require('./monitoring');

// Configurações do Supabase (usando variáveis de ambiente)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Cliente Supabase
let supabase = null;

// Circuit breaker para detectar quando Supabase está indisponível
let circuitBreakerState = {
    failures: 0,
    lastFailureTime: null,
    isOpen: false,
    threshold: 3, // Número de falhas consecutivas para abrir o circuit
    timeout: 30000 // 30 segundos antes de tentar novamente
};

// Função para verificar se o circuit breaker está aberto
function isCircuitBreakerOpen() {
    if (!circuitBreakerState.isOpen) return false;
    
    const now = Date.now();
    if (now - circuitBreakerState.lastFailureTime > circuitBreakerState.timeout) {
        console.log('🔄 Circuit breaker: tentando reconectar...');
        circuitBreakerState.isOpen = false;
        circuitBreakerState.failures = 0;
        return false;
    }
    
    return true;
}

// Função para registrar falha no circuit breaker
function recordCircuitBreakerFailure() {
    circuitBreakerState.failures++;
    circuitBreakerState.lastFailureTime = Date.now();
    
    if (circuitBreakerState.failures >= circuitBreakerState.threshold) {
        circuitBreakerState.isOpen = true;
        console.log('🚫 Circuit breaker aberto - Supabase temporariamente indisponível');
    }
}

// Função para registrar sucesso no circuit breaker
function recordCircuitBreakerSuccess() {
    circuitBreakerState.failures = 0;
    circuitBreakerState.isOpen = false;
}

// Função para retry com backoff exponencial
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            recordCircuitBreakerSuccess();
            return result;
        } catch (error) {
            console.log(`🔄 Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
            
            if (attempt === maxRetries) {
                recordCircuitBreakerFailure();
                throw error;
            }
            
            // Backoff exponencial: 1s, 2s, 4s...
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Inicializar cliente Supabase
function initSupabase() {
    if (!supabase) {
        try {
            supabase = createClient(supabaseUrl, supabaseKey);
            console.log('✅ Supabase inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
        }
    }
    return supabase;
}

// Função para obter dados do cardápio
async function getCardapioFromSupabase() {
    const startTime = Date.now();
    
    try {
        // Verificar circuit breaker
        if (isCircuitBreakerOpen()) {
            console.log('🚫 Circuit breaker aberto - retornando null');
            return null;
        }

        const client = initSupabase();
        if (!client) {
            throw new Error('Cliente Supabase não inicializado');
        }

        // Operação com retry automático
        const operation = async () => {
            // Timeout de 5 segundos (reduzido para melhor responsividade)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Supabase query timeout')), 5000);
            });
            
            const queryPromise = client
                .from('cardapio')
                .select('*')
                .order('id', { ascending: true })
                .limit(100); // Limitar resultados para melhor performance

            const result = await Promise.race([queryPromise, timeoutPromise]);
            const { data, error } = result || {};

            if (error) {
                throw new Error(`Supabase error: ${error.message}`);
            }

            return data || [];
        };

        const data = await retryWithBackoff(operation, 2, 500); // 2 tentativas com delay inicial de 500ms
        
        const duration = Date.now() - startTime;
        console.log(`📊 Supabase: ${data?.length || 0} itens em ${duration}ms`);
        return data;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ getCardapioFromSupabase falhou (${duration}ms):`, error.message);
        incrementCounter('supabaseErrors');
        
        // Evitar unhandled rejection - sempre retornar null em caso de erro
        return null;
    }
}

// Função para adicionar item no cardápio
async function addCardapioItemInSupabase(itemData) {
    const startTime = Date.now();
    
    try {
        // Verificar circuit breaker
        if (isCircuitBreakerOpen()) {
            console.log('🚫 Circuit breaker aberto - operação de inserção cancelada');
            return { success: false, error: 'Supabase temporariamente indisponível' };
        }

        const client = initSupabase();
        if (!client) {
            throw new Error('Cliente Supabase não inicializado');
        }

        // Remover o ID dos dados para evitar conflito com SERIAL PRIMARY KEY
        const { id, ...dataWithoutId } = itemData;
        
        // Adicionar campos obrigatórios com valores padrão se não existirem
        const itemToInsert = {
            ...dataWithoutId,
            imagem: dataWithoutId.imagem || '/img/default.jpg',
            disponivel: dataWithoutId.disponivel !== undefined ? dataWithoutId.disponivel : true,
            destaque: dataWithoutId.destaque !== undefined ? dataWithoutId.destaque : false,
            ordem: dataWithoutId.ordem || 999,
            isActive: dataWithoutId.isActive !== undefined ? dataWithoutId.isActive : true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Operação com retry automático
        const operation = async () => {
            // Timeout de 8 segundos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Insert timeout')), 8000);
            });
            
            const insertPromise = client
                .from('cardapio')
                .insert(itemToInsert)
                .select();

            const result = await Promise.race([insertPromise, timeoutPromise]);
            const { data, error } = result || {};

            if (error) {
                throw new Error(`Insert error: ${error.message}`);
            }

            return data[0];
        };

        const data = await retryWithBackoff(operation, 2, 1000); // 2 tentativas com delay inicial de 1s
        
        const duration = Date.now() - startTime;
        console.log(`✅ Item adicionado no Supabase em ${duration}ms:`, data?.id);
        return { success: true, data };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ addCardapioItemInSupabase falhou (${duration}ms):`, error.message);
        incrementCounter('supabaseErrors');
        
        // Sempre retornar objeto estruturado para evitar unhandled rejection
        return { success: false, error: error.message };
    }
}

// Função para atualizar item no cardápio
async function updateCardapioItemInSupabase(id, updates) {
    try {
        const client = initSupabase();
        if (!client) {
            throw new Error('Cliente Supabase não inicializado');
        }

        // Usar nossa implementação customizada do supabase-bundle
        const result = await client
            .from('cardapio')
            .update({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .execute();

        if (result.error) {
            console.error('Erro ao atualizar item no Supabase:', result.error);
            return { success: false, error: result.error };
        }

        console.log(`✅ Item ${id} atualizado no Supabase:`, updates);
        return { success: true, data: result.data && result.data[0] ? result.data[0] : { id, ...updates } };
    } catch (error) {
        console.error('Erro na função updateCardapioItemInSupabase:', error);
        incrementCounter('supabaseErrors');
        return { success: false, error: error.message };
    }
}

// Função para deletar item do cardápio
async function deleteCardapioItemInSupabase(id) {
    try {
        const client = initSupabase();
        if (!client) {
            throw new Error('Cliente Supabase não inicializado');
        }

        const { data, error } = await client
            .from('cardapio')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erro ao deletar item no Supabase:', error);
            return { success: false, error: error.message };
        }

        console.log(`✅ Item ${id} deletado do Supabase`);
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Erro na função deleteCardapioItemInSupabase:', error);
        incrementCounter('supabaseErrors');
        return { success: false, error: error.message };
    }
}

// Função para inserir dados iniciais do cardápio
async function seedCardapioInSupabase(cardapioData) {
    try {
        const client = initSupabase();
        if (!client) {
            throw new Error('Cliente Supabase não inicializado');
        }

        // Verificar se já existem dados
        const { data: existingData } = await client
            .from('cardapio')
            .select('id')
            .limit(1);

        if (existingData && existingData.length > 0) {
            console.log('📊 Dados do cardápio já existem no Supabase');
            return { success: true, message: 'Dados já existem' };
        }

        // Inserir dados iniciais - remover ID para evitar conflito com SERIAL PRIMARY KEY
        const { data, error } = await client
            .from('cardapio')
            .insert(cardapioData.map(item => {
                const { id, ...itemWithoutId } = item;
                return {
                    ...itemWithoutId,
                    "createdAt": new Date().toISOString(),
                    "updatedAt": new Date().toISOString()
                };
            }));

        if (error) {
            console.error('Erro ao inserir dados iniciais no Supabase:', error);
            return { success: false, error: error.message };
        }

        console.log(`✅ ${cardapioData.length} itens inseridos no Supabase`);
        return { success: true, data };
    } catch (error) {
        console.error('Erro na função seedCardapioInSupabase:', error);
        return { success: false, error: error.message };
    }
}

// Função para verificar se o Supabase está disponível
async function isSupabaseAvailable() {
    try {
        const client = initSupabase();
        if (!client) {
            return false;
        }

        // Teste simples de conectividade
        const { error } = await client
            .from('cardapio')
            .select('id')
            .limit(1);

        return !error;
    } catch (error) {
        console.error('Supabase não disponível:', error);
        return false;
    }
}

module.exports = {
    initSupabase,
    getCardapioFromSupabase,
    addCardapioItemInSupabase,
    updateCardapioItemInSupabase,
    deleteCardapioItemInSupabase,
    seedCardapioInSupabase,
    isSupabaseAvailable
};