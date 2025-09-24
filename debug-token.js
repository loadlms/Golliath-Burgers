const jwt = require('jsonwebtoken');

// Token recebido do teste
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBnb2xsaWF0aC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Mzc2NjE5NzIsImV4cCI6MTczNzc0ODM3Mn0.YourTokenSignatureHere';

// Secrets para testar
const secrets = [
    'golliath_burgers_secret_key_2024_vercel',
    'golliath-secret-2023',
    process.env.JWT_SECRET || 'default'
];

console.log('🔍 Testando decodificação do token...');
console.log('Token:', token.substring(0, 50) + '...');

secrets.forEach((secret, index) => {
    try {
        const decoded = jwt.verify(token, secret);
        console.log(`\n✅ Secret ${index + 1} (${secret}): VÁLIDO`);
        console.log('Payload:', decoded);
    } catch (error) {
        console.log(`\n❌ Secret ${index + 1} (${secret}): INVÁLIDO`);
        console.log('Erro:', error.message);
    }
});

// Tentar decodificar sem verificar assinatura
try {
    const decoded = jwt.decode(token);
    console.log('\n🔍 Payload sem verificação:', decoded);
} catch (error) {
    console.log('\n❌ Erro ao decodificar:', error.message);
}