const { Pool } = require('pg');

// Configuração do pool de conexões
const pool = new Pool({
    connectionString: process.env.NEONDATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1, // Vercel functions are stateless/ephemeral, keep max connections low per lambda
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
});

// Tratamento de erros no pool
pool.on('error', (err, client) => {
    console.error('❌ Erro inesperado no cliente do pool', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
