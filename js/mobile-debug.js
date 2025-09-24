// Sistema de debug específico para dispositivos móveis
(function() {
    'use strict';
    
    // Detectar tipo de dispositivo
    function detectDevice() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?=.*\bMobile\b)(?!.*\bMobile\b.*\bSafari\b)|KFAPWI/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isAndroid = /Android/.test(userAgent);
        
        return {
            isMobile,
            isTablet,
            isIOS,
            isAndroid,
            userAgent
        };
    }
    
    // Detectar capacidades do navegador
    function detectCapabilities() {
        return {
            fetch: typeof fetch !== 'undefined',
            promise: typeof Promise !== 'undefined',
            localStorage: typeof localStorage !== 'undefined',
            addEventListener: typeof document.addEventListener !== 'undefined',
            querySelector: typeof document.querySelector !== 'undefined',
            closest: Element.prototype.closest !== undefined,
            find: Array.prototype.find !== undefined,
            includes: Array.prototype.includes !== undefined
        };
    }
    
    // Sistema de logging melhorado
    function createLogger() {
        const logs = [];
        
        function log(level, message, data) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                data: data || {},
                device: detectDevice(),
                capabilities: detectCapabilities()
            };
            
            logs.push(logEntry);
            
            // Log no console também
            console[level] && console[level](`[${timestamp}] ${message}`, data);
            
            // Manter apenas os últimos 100 logs
            if (logs.length > 100) {
                logs.shift();
            }
            
            // Tentar enviar logs críticos para o servidor
            if (level === 'error') {
                sendErrorToServer(logEntry);
            }
        }
        
        return {
            info: (msg, data) => log('info', msg, data),
            warn: (msg, data) => log('warn', msg, data),
            error: (msg, data) => log('error', msg, data),
            debug: (msg, data) => log('debug', msg, data),
            getLogs: () => [...logs],
            clearLogs: () => logs.length = 0
        };
    }
    
    // Enviar erros para o servidor (opcional)
    function sendErrorToServer(logEntry) {
        try {
            if (typeof fetch !== 'undefined') {
                fetch('/api/debug/error', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(logEntry)
                }).catch(() => {
                    // Falha silenciosa - não queremos quebrar o site por causa do logging
                });
            }
        } catch (e) {
            // Falha silenciosa
        }
    }
    
    // Interceptar erros globais
    function setupGlobalErrorHandling(logger) {
        window.addEventListener('error', function(event) {
            logger.error('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error ? event.error.stack : null
            });
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            logger.error('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }
    
    // Monitorar performance de fetch
    function monitorFetch(logger) {
        if (typeof fetch !== 'undefined') {
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const startTime = Date.now();
                const url = args[0];
                
                logger.debug('Fetch iniciado', { url });
                
                return originalFetch.apply(this, args)
                    .then(response => {
                        const duration = Date.now() - startTime;
                        logger.debug('Fetch concluído', {
                            url,
                            status: response.status,
                            ok: response.ok,
                            duration
                        });
                        return response;
                    })
                    .catch(error => {
                        const duration = Date.now() - startTime;
                        logger.error('Fetch falhou', {
                            url,
                            error: error.message,
                            duration
                        });
                        throw error;
                    });
            };
        }
    }
    
    // Verificar se elementos críticos existem
    function checkCriticalElements(logger) {
        const criticalSelectors = [
            '.add-to-cart-btn',
            '#menu-grid',
            '#cart-icon',
            'form[action*="login"]'
        ];
        
        criticalSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            logger.debug('Elementos críticos verificados', {
                selector,
                count: elements.length,
                found: elements.length > 0
            });
        });
    }
    
    // Inicializar sistema de debug
    function init() {
        const logger = createLogger();
        
        // Tornar o logger disponível globalmente para debug
        window.MobileDebug = {
            logger,
            device: detectDevice(),
            capabilities: detectCapabilities(),
            checkElements: () => checkCriticalElements(logger)
        };
        
        logger.info('Sistema de debug móvel inicializado', {
            device: detectDevice(),
            capabilities: detectCapabilities()
        });
        
        setupGlobalErrorHandling(logger);
        monitorFetch(logger);
        
        // Verificar elementos críticos quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => checkCriticalElements(logger), 1000);
            });
        } else {
            setTimeout(() => checkCriticalElements(logger), 1000);
        }
        
        // Verificar periodicamente se os botões ainda existem
        setInterval(() => {
            const buttons = document.querySelectorAll('.add-to-cart-btn');
            if (buttons.length === 0) {
                logger.warn('Botões de carrinho desapareceram', {
                    timestamp: new Date().toISOString()
                });
            }
        }, 5000);
    }
    
    // Inicializar quando o script carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();