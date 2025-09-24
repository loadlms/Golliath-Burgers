const jwt = require('jsonwebtoken');

// Credenciais de admin (em produção, usar variáveis de ambiente)
const adminCredentials = {
  email: 'admin@golliath.com',
  password: 'admin2023'
};

// Função para gerar token JWT
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'golliath_burgers_secret_key_2024_vercel';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// Handler para login
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Método não permitido'
    });
    return;
  }

  try {
    const { email, password } = req.body;
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
      const token = generateToken({ email, role: 'admin' });
      
      res.status(200).json({
        success: true,
        token,
        message: 'Login realizado com sucesso'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};