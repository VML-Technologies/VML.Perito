/**
 * Middleware de autenticación con token quemado para API externa
 * TODO: Implementar modelo de tokens para llamados de API
 */

// Token quemado temporal - en producción debería venir de base de datos
const HARDCODED_API_TOKEN = 'VML_0WwgzvQ54T2JyzR2tyxu25KH95d06oPCo4NDmu63yBU7FFSxPhGa8qwjonZAJ42Vg37FxVfnlc6RZJpGNJAoZSffClRTJdizMwFNV5fmYJXK7OFhB8dMasNGAvFJ8lhWaHOY4wbFV8aZF0Lv1AnRpZcAiV2Crt1kvuKMcNHSJgg412wiaJEl9Hl19edRW6h4rvMpZSXhZfNQqBp09U0ck6vlCNQ05w5nN7qInTuugNLah2oFNGoAZ5OOG5Zf';

/**
 * Middleware para autenticar llamadas de API externa con token
 * Valida el token en el header Authorization
 */
export const authenticateApiToken = (req, res, next) => {
    console.log('🔐 Iniciando autenticación con token API...');
    console.log('📋 Headers recibidos:', JSON.stringify(req.headers, null, 2));
    
    try {
        // 1. Extraer token del header Authorization
        const authHeader = req.headers.authorization;
        console.log('🔑 Auth header:', authHeader);
        
        if (!authHeader?.startsWith('Bearer ')) {
            console.log('❌ Header de autorización inválido');
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido en header Authorization: Bearer <token>'
            });
        }
        
        const token = authHeader.split(' ')[1];
        console.log('🔑 Token extraído:', token ? '***' + token.slice(-4) : 'NO_PROVIDED');
        
        // 2. Validar token quemado
        if (token !== HARDCODED_API_TOKEN) {
            console.log('❌ Token inválido');
            return res.status(401).json({
                success: false,
                message: 'Token de autorización inválido'
            });
        }
        
        console.log('✅ Token válido - autenticación exitosa');
        
        // 3. Adjuntar información al request
        req.apiToken = token;
        req.apiSource = 'VML_INSPECTYA';
        
        // TODO: Cuando se implemente el modelo de tokens, aquí se debería:
        // - Buscar el token en la base de datos
        // - Validar expiración
        // - Verificar IP permitida
        // - Actualizar last_used_at
        // - Registrar logs de acceso
        
        next();
        
    } catch (error) {
        console.error('❌ Error en autenticación de token API:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno de autenticación'
        });
    }
};

/**
 * Middleware de rate limiting para API externa
 * Limita a 100 requests por minuto por IP
 */
export const apiRateLimit = (req, res, next) => {
    const rateLimitEnabled = process.env.API_RATE_LIMIT_ENABLED !== 'false';
    
    if (!rateLimitEnabled) {
        return next();
    }
    
    const clientIP = req.ip || 
                   req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress;
    
    const key = `api_rate_limit:${clientIP}`;
    const limit = 100; // 100 requests por minuto
    const window = 60; // 1 minuto
    
    // Implementación simple de rate limiting en memoria
    // TODO: En producción, usar Redis para escalabilidad
    if (!global.apiRateLimitStore) {
        global.apiRateLimitStore = new Map();
    }
    
    const now = Date.now();
    const windowStart = now - (window * 1000);
    
    // Obtener registros existentes
    const records = global.apiRateLimitStore.get(key) || [];
    
    // Filtrar registros dentro de la ventana de tiempo
    const validRecords = records.filter(timestamp => timestamp > windowStart);
    
    // Verificar límite
    if (validRecords.length >= limit) {
        console.warn('⚠️ Rate limit excedido para IP:', clientIP);
        return res.status(429).json({
            success: false,
            message: `Límite de ${limit} requests por minuto excedido`,
            retryAfter: Math.ceil((validRecords[0] + (window * 1000) - now) / 1000)
        });
    }
    
    // Agregar registro actual
    validRecords.push(now);
    global.apiRateLimitStore.set(key, validRecords);
    
    // Limpiar registros antiguos (cada 100 requests)
    if (Math.random() < 0.01) {
        for (const [storeKey, storeRecords] of global.apiRateLimitStore.entries()) {
            const filteredRecords = storeRecords.filter(timestamp => timestamp > windowStart);
            if (filteredRecords.length === 0) {
                global.apiRateLimitStore.delete(storeKey);
            } else {
                global.apiRateLimitStore.set(storeKey, filteredRecords);
            }
        }
    }
    
    next();
};
