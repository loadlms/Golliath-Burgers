// Sistema de monitoramento e health check para produção
const fs = require('fs');
const path = require('path');

// Métricas de performance
let metrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    lastError: null,
    uptime: Date.now(),
    supabaseErrors: 0,
    timeouts: 0
};

// Log de erros críticos
function logCriticalError(error, context = {}) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        context,
        metrics: { ...metrics }
    };
    
    console.error('🚨 ERRO CRÍTICO:', JSON.stringify(errorLog, null, 2));
    metrics.errors++;
    metrics.lastError = errorLog;
    
    // Em produção, você pode enviar para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
        // Exemplo: enviar para Sentry, LogRocket, etc.
    }
}

// Middleware de monitoramento
function monitoringMiddleware(req, res, next) {
    const startTime = Date.now();
    metrics.requests++;
    
    // Override do res.json para capturar tempo de resposta
    const originalJson = res.json;
    res.json = function(data) {
        const responseTime = Date.now() - startTime;
        
        // Atualizar média de tempo de resposta
        metrics.avgResponseTime = Math.round(
            (metrics.avgResponseTime + responseTime) / 2
        );
        
        // Log de requisições lentas
        if (responseTime > 5000) {
            console.warn(`⚠️ Requisição lenta: ${req.url} - ${responseTime}ms`);
        }
        
        return originalJson.call(this, data);
    };
    
    next();
}

// Health check endpoint
function getHealthStatus() {
    const uptime = Date.now() - metrics.uptime;
    const errorRate = metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0;
    
    return {
        status: errorRate < 5 ? 'healthy' : 'degraded',
        uptime: Math.round(uptime / 1000), // segundos
        metrics: {
            ...metrics,
            errorRate: Math.round(errorRate * 100) / 100
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
}

// Detectar problemas de memória
function checkMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
        
        if (usedMB > 400) { // Alerta se usar mais de 400MB
            console.warn(`⚠️ Alto uso de memória: ${usedMB}MB`);
        }
        
        return {
            heapUsed: usedMB,
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024)
        };
    }
    return null;
}

// Reset de métricas (útil para testes)
function resetMetrics() {
    metrics = {
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
        lastError: null,
        uptime: Date.now(),
        supabaseErrors: 0,
        timeouts: 0
    };
}

// Incrementar contadores específicos
function incrementCounter(type) {
    if (metrics.hasOwnProperty(type)) {
        metrics[type]++;
    }
}

module.exports = {
    logCriticalError,
    monitoringMiddleware,
    getHealthStatus,
    checkMemoryUsage,
    resetMetrics,
    incrementCounter,
    metrics
};