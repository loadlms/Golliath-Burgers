// API Serverless Consolidada para Vercel - Golliath Burgers
// Carregar variáveis de ambiente
require('dotenv').config();

// Handlers globais para evitar crashes e melhorar debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection detectada:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('Stack:', reason?.stack || 'No stack trace available');
  
  // Log para monitoramento
  try {
    const { incrementCounter } = require('./utils/monitoring');
    incrementCounter('unhandledRejections');
  } catch (e) {
    console.error('Erro ao incrementar contador:', e.message);
  }
  
  // Não encerrar o processo em ambiente serverless
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception detectada:');
  console.error('Error:', error);
  console.error('Stack:', error?.stack || 'No stack trace available');
  
  // Log para monitoramento
  try {
    const { incrementCounter } = require('./utils/monitoring');
    incrementCounter('uncaughtExceptions');
  } catch (e) {
    console.error('Erro ao incrementar contador:', e.message);
  }
  
  // Não encerrar o processo em ambiente serverless
});

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
  getCardapioData, 
  updateCardapioItem, 
  addCardapioItem, 
  deleteCardapioItem, 
  deleteCardapioItemPermanently,
  getCardapioItem 
} = require('./utils/vercelDatabase');
const { logCriticalError, monitoringMiddleware, getHealthStatus, checkMemoryUsage, incrementCounter } = require('./utils/monitoring');

// Sistema de armazenamento editável implementado em vercelDatabase.js com persistência Supabase

// Dados estáticos de informações do site
const siteInfo = {
  nome: "Golliath Burgers",
  telefone: "+55 (11) 95754-8091",
  endereco: "Avenida Graciela Flores de Piteri, 255 - Aliança - Osasco - SP",
  horario_funcionamento: "Quarta a Domingo: 18h30 às 23h",
  instagram: "@golliathburgers",
  whatsapp: "5511957548091"
};

// Credenciais de admin (em produção, usar variáveis de ambiente)
const adminCredentials = {
  email: 'admin@golliath.com',
  password: 'admin2023'
};

// Função para verificar token JWT
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024_vercel';
    const decoded = jwt.verify(token, secret);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Função para gerar token JWT
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024_vercel';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// Função para calcular hash do cardápio (para sincronização)
async function calculateCardapioHash() {
  const cardapio = await getCardapioData();
  const cardapioString = JSON.stringify(cardapio);
  return bcrypt.hashSync(cardapioString, 5);
}

// Handler principal
const handler = async (req, res) => {
  // Timeout de 25 segundos para evitar problemas no Vercel
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.writeHead(408, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Timeout da requisição',
        message: 'A operação demorou mais que o esperado'
      }));
    }
  }, 25000); // 25s timeout (menor que o limite do Vercel)

  try {
    console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    
    // Aplicar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Aplicar monitoramento
    monitoringMiddleware(req, res, () => {});
    
    // Responder a requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      clearTimeout(timeout);
      res.writeHead(200);
      res.end();
      return;
    }

    const url = req.url;
    const method = req.method;
    
    // Parse URL para extrair pathname (ignorando query parameters)
    const urlObj = new URL(url, `http://${req.headers.host}`);
    const pathname = urlObj.pathname;

    // ===== ROTAS DE AUTENTICAÇÃO =====

    // Login do admin
    if (pathname === '/api/auth/login' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { email, password } = JSON.parse(body);
          
          if (email === adminCredentials.email && password === adminCredentials.password) {
            const token = generateToken({ email, role: 'admin' });
            
            clearTimeout(timeout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              token,
              message: 'Login realizado com sucesso'
            }));
          } else {
            clearTimeout(timeout);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Credenciais inválidas'
            }));
          }
        } catch (error) {
          clearTimeout(timeout);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Dados inválidos'
          }));
        }
      });
      return;
    }

    // Verificar token
    if (pathname === '/api/auth/verify' && method === 'POST') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      clearTimeout(timeout);
      if (verification.valid) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Token válido',
          admin: verification.decoded
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
      }
      return;
    }

    // ===== ROTAS DO CARDÁPIO =====

    // Listar itens ativos do cardápio (público)
    if (pathname === '/api/cardapio' && method === 'GET') {
      try {
        console.log('📥 GET /api/cardapio' + (urlObj.search || '') + ' - ' + new Date().toISOString());
        console.log('📊 getCardapioData chamada');
        
        // Usar Promise.resolve para garantir tratamento adequado
        const cardapioPromise = Promise.resolve(getCardapioData())
          .catch(error => {
            console.error('❌ Erro capturado em getCardapioData:', error.message);
            return null; // Retornar null em caso de erro
          });
        
        const cardapio = await cardapioPromise;
        
        if (!cardapio) {
          console.log('📋 Retornando dados do cache local');
          // Fallback para dados locais se Supabase falhar
          const { getLocalCardapioData } = require('./utils/vercelDatabase');
          const localCardapio = await getLocalCardapioData();
          const itensAtivos = localCardapio.filter(item => item.ativo !== false);
          
          console.log(`📊 Retornando ${itensAtivos.length} itens`);
          
          clearTimeout(timeout);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            cardapio: itensAtivos,
            siteInfo,
            source: 'local' // Indicar que veio do cache local
          }));
          return;
        }
        
        const itensAtivos = cardapio.filter(item => item.ativo !== false);
        console.log(`📊 Retornando ${itensAtivos.length} itens`);
        
        clearTimeout(timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          cardapio: itensAtivos,
          siteInfo,
          source: 'supabase' // Indicar que veio do Supabase
        }));
      } catch (error) {
        console.error('❌ Erro crítico ao buscar cardápio:', error.message);
        console.error('Stack:', error.stack);
        
        // Tentar fallback para dados locais mesmo em caso de erro crítico
        try {
          const { getLocalCardapioData } = require('./utils/vercelDatabase');
          const localCardapio = await getLocalCardapioData();
          const itensAtivos = localCardapio.filter(item => item.ativo !== false);
          
          console.log('🔄 Fallback bem-sucedido - retornando dados locais');
          
          clearTimeout(timeout);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            cardapio: itensAtivos,
            siteInfo,
            source: 'local_fallback'
          }));
        } catch (fallbackError) {
          console.error('❌ Fallback também falhou:', fallbackError.message);
          
          clearTimeout(timeout);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Erro ao carregar cardápio',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          }));
        }
      }
      return;
    }

    // Sincronização do cardápio (hash)
    if (pathname === '/api/cardapio/sync' && method === 'GET') {
      try {
        const hash = await calculateCardapioHash();
        
        clearTimeout(timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          hash,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Erro na sincronização:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro na sincronização'
        }));
      }
      return;
    }

    // Listar todos os itens (admin)
    if (pathname === '/api/cardapio/admin' && method === 'GET') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      try {
        const cardapio = await getCardapioData();
        
        clearTimeout(timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          cardapio
        }));
      } catch (error) {
        console.error('Erro ao buscar cardápio admin:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao carregar cardápio'
        }));
      }
      return;
    }

    // Adicionar item ao cardápio (admin)
    if (pathname === '/api/cardapio' && method === 'POST') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const itemData = JSON.parse(body);
          
          // Validar dados obrigatórios
          if (!itemData.nome || !itemData.descricao || !itemData.preco || !itemData.categoria) {
            clearTimeout(timeout);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Dados obrigatórios não fornecidos'
            }));
            return;
          }

          const novoItem = await addCardapioItem(itemData);
          
          clearTimeout(timeout);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Item adicionado com sucesso',
            item: novoItem
          }));
        } catch (error) {
          console.error('Erro ao adicionar item:', error);
          clearTimeout(timeout);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Erro ao adicionar item'
          }));
        }
      });
      return;
    }

    // Editar item do cardápio (admin)
    if (pathname.startsWith('/api/cardapio/') && method === 'PUT') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      const itemId = pathname.split('/').pop();
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const itemData = JSON.parse(body);
          
          const updatedItem = await updateCardapioItem(itemId, itemData);
          
          if (updatedItem) {
            clearTimeout(timeout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              message: 'Item atualizado com sucesso',
              data: { id: itemId, ...itemData }
            }));
          } else {
            clearTimeout(timeout);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Item não encontrado'
            }));
          }
        } catch (error) {
          console.error('Erro ao atualizar item:', error);
          clearTimeout(timeout);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Erro ao atualizar item'
          }));
        }
      });
      return;
    }

    // Deletar item do cardápio permanentemente (admin)
    if (pathname.startsWith('/api/cardapio/') && pathname.endsWith('/permanent') && method === 'DELETE') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      // Extrair ID do item da URL (/api/cardapio/226/permanent)
      const pathParts = pathname.split('/');
      const itemId = pathParts[pathParts.length - 2]; // Pega o ID antes de "/permanent"
      
      try {
        console.log(`🗑️ Deletando item permanentemente: ${itemId}`);
        
        const deletedItem = await deleteCardapioItemPermanently(itemId);
        
        if (deletedItem) {
          clearTimeout(timeout);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Item deletado permanentemente com sucesso',
            data: deletedItem
          }));
        } else {
          clearTimeout(timeout);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Item não encontrado'
          }));
        }
      } catch (error) {
        console.error('Erro ao deletar item permanentemente:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao deletar item permanentemente'
        }));
      }
      return;
    }

    // Upload de imagem (admin) - Sistema Local
    if (pathname === '/api/cardapio/upload' && method === 'POST') {
      // Verificar autenticação via query parameter ou header
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const tokenFromQuery = urlObj.searchParams.get('token');
      const authHeader = req.headers.authorization;
      
      let token = null;
      if (tokenFromQuery) {
        token = tokenFromQuery;
      } else if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      if (!token) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const verification = verifyToken(token);
      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      try {
        // Importar utilitários de upload local
        const { saveImageToImageKit, validateImageData } = require('./utils/imageUpload');

        // Parse do corpo da requisição para obter a imagem em base64
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            
            if (!data.image) {
              clearTimeout(timeout);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: 'Imagem não fornecida'
              }));
              return;
            }

            // Validar dados da imagem
            if (!validateImageData(data.image)) {
              clearTimeout(timeout);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: 'Formato de imagem inválido'
              }));
              return;
            }

            // Upload local
            const uploadResult = await saveImageToImageKit(data.image, data.filename);

            const uploadResponse = {
              success: true,
              message: 'Upload realizado com sucesso',
              filename: uploadResult.filename,
              url: uploadResult.url,
              size: uploadResult.size
            };
            
            clearTimeout(timeout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(uploadResponse));
          } catch (parseError) {
            console.error('Erro ao processar upload:', parseError);
            clearTimeout(timeout);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Erro ao processar upload da imagem: ' + parseError.message
            }));
          }
        });
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao fazer upload da imagem: ' + error.message
        }));
      }
      return;
    }

    // Listar imagens locais (admin)
    if (pathname === '/api/cardapio/images' && method === 'GET') {
      // Verificar autenticação
      const authHeader = req.headers.authorization;
      let token = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      if (!token) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const verification = verifyToken(token);
      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      try {
        const { listImageKitImages } = require('./utils/imageUpload');
        const images = await listImageKitImages();
        
        const imageList = images.map(image => ({
          filename: image.name,
          url: image.url,
          fileId: image.fileId,
          size: image.size
        }));

        clearTimeout(timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          images: imageList,
          count: imageList.length
        }));
      } catch (error) {
        console.error('Erro ao listar imagens:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao listar imagens: ' + error.message
        }));
      }
      return;
    }

    // Deletar imagem local (admin)
    if (pathname === '/api/cardapio/delete-image' && method === 'DELETE') {
      // Verificar autenticação
      const authHeader = req.headers.authorization;
      let token = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      if (!token) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const verification = verifyToken(token);
      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      try {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            
            if (!data.filename) {
              clearTimeout(timeout);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: 'Nome do arquivo não fornecido'
              }));
              return;
            }

            const { deleteImageLocally } = require('./utils/imageUpload');
            const deleted = await deleteImageLocally(data.filename);

            if (deleted) {
              clearTimeout(timeout);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                message: 'Imagem deletada com sucesso',
                filename: data.filename
              }));
            } else {
              clearTimeout(timeout);
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: 'Imagem não encontrada'
              }));
            }
          } catch (parseError) {
            console.error('Erro ao processar deleção:', parseError);
            clearTimeout(timeout);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Erro ao processar deleção: ' + parseError.message
            }));
          }
        });
      } catch (error) {
        console.error('Erro ao deletar imagem:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao deletar imagem: ' + error.message
        }));
      }
      return;
    }

    // ===== ROTAS DE PEDIDOS =====

    // Criar novo pedido (público)
    if (pathname === '/api/pedidos' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const pedidoData = JSON.parse(body);
          
          // Validar dados obrigatórios
          if (!pedidoData.nome || !pedidoData.telefone || !pedidoData.itens || !Array.isArray(pedidoData.itens) || pedidoData.itens.length === 0) {
            clearTimeout(timeout);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Dados obrigatórios não fornecidos (nome, telefone, itens)'
            }));
            return;
          }

          // Gerar ID único para o pedido
          const pedidoId = Date.now() + Math.random().toString(36).substr(2, 9);
          
          // Criar objeto do pedido
          const novoPedido = {
            id: pedidoId,
            nome: pedidoData.nome,
            telefone: pedidoData.telefone,
            endereco: pedidoData.endereco || '',
            itens: pedidoData.itens,
            total: pedidoData.total || pedidoData.itens.reduce((total, item) => total + (item.preco * item.quantity), 0),
            observacoes: pedidoData.observacoes || '',
            forma_pagamento: pedidoData.forma_pagamento || 'dinheiro',
            troco: pedidoData.troco || null,
            status: 'pendente',
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString()
          };

          console.log('📝 Novo pedido criado:', pedidoId);
          
          // Simular salvamento (em produção, salvar no banco de dados)
          // Por enquanto, apenas retornar sucesso
          
          clearTimeout(timeout);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Pedido criado com sucesso',
            pedido: novoPedido
          }));
        } catch (error) {
          console.error('Erro ao criar pedido:', error);
          clearTimeout(timeout);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Erro ao processar pedido'
          }));
        }
      });
      return;
    }

    // Listar pedidos (admin)
    if (pathname === '/api/pedidos' && method === 'GET') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      try {
        // Por enquanto, retornar lista vazia
        // Em produção, buscar do banco de dados
        const pedidos = [];
        
        clearTimeout(timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          pedidos
        }));
      } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao carregar pedidos'
        }));
      }
      return;
    }

    // Atualizar status do pedido (admin)
    if (pathname.startsWith('/api/pedidos/') && pathname.endsWith('/status') && method === 'PUT') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      const pedidoId = pathname.split('/')[3]; // Extrair ID do pedido da URL
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { status } = JSON.parse(body);
          
          if (!status) {
            clearTimeout(timeout);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Status não fornecido'
            }));
            return;
          }

          console.log(`📝 Atualizando status do pedido ${pedidoId} para: ${status}`);
          
          // Simular atualização (em produção, atualizar no banco de dados)
          
          clearTimeout(timeout);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Status atualizado com sucesso',
            pedidoId,
            novoStatus: status
          }));
        } catch (error) {
          console.error('Erro ao atualizar status do pedido:', error);
          clearTimeout(timeout);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Erro ao atualizar status'
          }));
        }
      });
      return;
    }

    // Deletar pedido (admin)
    if (pathname.startsWith('/api/pedidos/') && !pathname.endsWith('/status') && method === 'DELETE') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token não fornecido'
        }));
        return;
      }

      const token = authHeader.substring(7);
      const verification = verifyToken(token);

      if (!verification.valid) {
        clearTimeout(timeout);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Token inválido'
        }));
        return;
      }

      const pedidoId = pathname.split('/')[3]; // Extrair ID do pedido da URL
      
      try {
        console.log(`🗑️ Deletando pedido: ${pedidoId}`);
        
        // Simular deleção (em produção, deletar do banco de dados)
        
        clearTimeout(timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Pedido deletado com sucesso',
          pedidoId
        }));
      } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        clearTimeout(timeout);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro ao deletar pedido'
        }));
      }
      return;
    }

    // Rota de teste
    if (pathname === '/api/test') {
      clearTimeout(timeout);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'API funcionando!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }));
      return;
    }
    
    // Rota de informações do site
    if (pathname === '/api/siteinfo' && method === 'GET') {
      clearTimeout(timeout);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        siteInfo
      }));
      return;
    }
    
    // Rota de health check
    if (pathname === '/api/health') {
      const healthStatus = getHealthStatus();
      const memoryUsage = checkMemoryUsage();
      
      clearTimeout(timeout);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        ...healthStatus,
        memory: memoryUsage
      }));
      return;
    }

    // Rota não encontrada
    clearTimeout(timeout);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Rota não encontrada',
      url: url,
      method: method
    }));
    
  } catch (error) {
    // Log crítico com contexto completo
    logCriticalError(error, {
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });
    
    clearTimeout(timeout);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: process.env.NODE_ENV === 'production' 
          ? 'Erro interno do servidor' 
          : error.message 
      }));
    }
  }
};

// Exportação para Vercel
module.exports = handler;