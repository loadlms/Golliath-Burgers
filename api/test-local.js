const http = require('http');
const handler = require('./index.js');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Adicionar headers CORS para desenvolvimento
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Responder a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Chamar o handler do Vercel
  handler(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor local rodando em http://localhost:${PORT}`);
  console.log(`📁 Teste de upload: http://localhost:${PORT}/test-upload.html`);
  console.log(`🔧 API Base URL: http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});