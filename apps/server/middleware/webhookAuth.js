import crypto from 'crypto';
import WebhookApiKey from '../models/webhookApiKey.js';
import User from '../models/user.js';

/**
 * Generar ID único para webhook
 */
const generateWebhookId = () => {
    return `wh_evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verificar firma HMAC del webhook
 */
const verifyWebhookSignature = (payload, signature, timestamp, secret) => {
    try {
        if (!signature || !timestamp || !secret) {
            console.log('❌ Datos faltantes para verificación:', { hasSignature: !!signature, hasTimestamp: !!timestamp, hasSecret: !!secret });
            return false;
        }

        const timestampInt = parseInt(timestamp);
        if (isNaN(timestampInt)) {
            console.log('❌ Timestamp inválido:', timestamp);
            return false;
        }
        
        // Verificar timestamp (máximo 5 minutos de diferencia)
        const currentTime = Math.floor(Date.now() / 1000);
        const tolerance = parseInt(process.env.WEBHOOK_TIMESTAMP_TOLERANCE) || 300; // 5 minutos por defecto
        
        if (Math.abs(currentTime - timestampInt) > tolerance) {
            console.warn('⚠️ Timestamp expirado:', { currentTime, timestamp: timestampInt, difference: Math.abs(currentTime - timestampInt) });
            return false;
        }
        
        // Calcular firma esperada
        const signaturePayload = `${timestamp}.${payload}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(signaturePayload)
            .digest('hex');
        
        console.log('🔍 Comparando firmas:');
        console.log('   Recibida:', signature);
        console.log('   Esperada:', expectedSignature);
        console.log('   Payload:', signaturePayload);
        
        // Comparación segura
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
        
        console.log('✅ Resultado verificación:', isValid);
        return isValid;
    } catch (error) {
        console.error('❌ Error verificando firma HMAC:', error);
        return false;
    }
};

/**
 * Middleware de autenticación para webhooks
 */
export const authenticateWebhook = async (req, res, next) => {
    console.log(`🔐 Iniciando autenticación de webhook...`);
    console.log(`📋 Headers recibidos:`, JSON.stringify(req.headers, null, 2));
    
    try {
        // 1. Extraer API Key
        const authHeader = req.headers.authorization;
        console.log(`🔑 Auth header:`, authHeader);
        
        if (!authHeader?.startsWith('Bearer ')) {
            console.log(`❌ Header de autorización inválido`);
            return res.status(401).json({
                success: false,
                error: { 
                    code: 'MISSING_API_KEY', 
                    message: 'API Key requerida en header Authorization: Bearer <token>' 
                }
            });
        }
        
        const apiKey = authHeader.split(' ')[1];
        console.log(`🔑 API Key extraída:`, apiKey);
        
        // 2. Validar API Key
        console.log(`🔍 Buscando API Key en base de datos...`);
        const webhookKey = await WebhookApiKey.findOne({
            where: { api_key: apiKey, is_active: true },
            include: [{ model: User, as: 'creator' }]
        });
        
        if (!webhookKey) {
            console.log(`❌ API Key no encontrada o inactiva`);
            return res.status(401).json({
                success: false,
                error: { 
                    code: 'INVALID_API_KEY', 
                    message: 'API Key inválida o inactiva' 
                }
            });
        }
        
        console.log(`✅ API Key encontrada:`, webhookKey.application_name);
        
        // 3. Verificar expiración
        if (webhookKey.expires_at && new Date() > webhookKey.expires_at) {
            return res.status(401).json({
                success: false,
                error: { 
                    code: 'EXPIRED_API_KEY', 
                    message: 'API Key expirada' 
                }
            });
        }
        
        // 4. Verificar IP (si está configurada)
        if (webhookKey.allowed_ips?.length > 0) {
            const clientIP = req.ip || 
                           req.headers['x-forwarded-for']?.split(',')[0] || 
                           req.headers['x-real-ip'] || 
                           req.connection?.remoteAddress;
            
            // if (!webhookKey.allowed_ips.includes(clientIP)) {
            //     console.warn('⚠️ IP no autorizada:', { clientIP, allowedIPs: webhookKey.allowed_ips });
            //     return res.status(403).json({
            //         success: false,
            //         error: { 
            //             code: 'IP_NOT_ALLOWED', 
            //             message: `IP ${clientIP} no autorizada` 
            //         }
            //     });
            // }
        }
        
        // 5. Verificar firma HMAC (si está habilitada)
        const signatureVerificationEnabled = process.env.WEBHOOK_SIGNATURE_VERIFICATION !== 'false';
        console.log(`🔐 Verificación de firma HMAC:`, signatureVerificationEnabled ? 'HABILITADA' : 'DESHABILITADA');
        
        if (signatureVerificationEnabled) {
            const signature = req.headers['x-webhook-signature'];
            const timestamp = req.headers['x-webhook-timestamp'];
            const rawBody = req.rawBody || JSON.stringify(req.body);
            
            console.log(`🔐 Firma recibida:`, signature);
            console.log(`⏰ Timestamp recibido:`, timestamp);
            console.log(`📋 Body para verificación:`, rawBody);
            
            if (!verifyWebhookSignature(rawBody, signature, timestamp, webhookKey.api_secret)) {
                console.warn('⚠️ Firma HMAC inválida para API key:', webhookKey.id);
                return res.status(401).json({
                    success: false,
                    error: { 
                        code: 'INVALID_SIGNATURE', 
                        message: 'Firma HMAC inválida' 
                    }
                });
            }
            console.log(`✅ Firma HMAC válida`);
        } else {
            console.log(`⚠️ Verificación de firma HMAC deshabilitada - saltando verificación`);
        }
        
        // 6. Adjuntar datos al request
        req.webhookKey = webhookKey;
        req.webhookId = generateWebhookId();
        
        console.log(`🆔 Webhook ID generado:`, req.webhookId);
        
        // 7. Actualizar last_used_at
        console.log(`📝 Actualizando last_used_at...`);
        await webhookKey.update({ last_used_at: new Date() });
        
        console.log(`🔐 Webhook autenticado exitosamente: ${webhookKey.application_name} (${req.webhookId})`);
        console.log(`➡️ Pasando al siguiente middleware...`);
        next();
        
    } catch (error) {
        console.error('❌ Error en autenticación de webhook:', error);
        console.error('📍 Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: { 
                code: 'AUTH_ERROR', 
                message: 'Error interno de autenticación' 
            }
        });
    }
};

/**
 * Middleware de rate limiting para webhooks
 */
export const webhookRateLimit = (req, res, next) => {
    const rateLimitEnabled = process.env.WEBHOOK_RATE_LIMIT_ENABLED !== 'false';
    
    if (!rateLimitEnabled) {
        return next();
    }
    
    const key = `webhook_rate_limit:${req.webhookKey.id}`;
    const limit = req.webhookKey.rate_limit_per_minute;
    const window = 60; // 1 minuto
    
    // Implementación simple de rate limiting en memoria
    // En producción, usar Redis para escalabilidad
    if (!global.webhookRateLimitStore) {
        global.webhookRateLimitStore = new Map();
    }
    
    const now = Date.now();
    const windowStart = now - (window * 1000);
    
    // Obtener registros existentes
    const records = global.webhookRateLimitStore.get(key) || [];
    
    // Filtrar registros dentro de la ventana de tiempo
    const validRecords = records.filter(timestamp => timestamp > windowStart);
    
    // Verificar límite
    if (validRecords.length >= limit) {
        return res.status(429).json({
            success: false,
            error: { 
                code: 'RATE_LIMIT_EXCEEDED', 
                message: `Límite de ${limit} requests por minuto excedido`,
                retryAfter: Math.ceil((validRecords[0] + (window * 1000) - now) / 1000)
            }
        });
    }
    
    // Agregar registro actual
    validRecords.push(now);
    global.webhookRateLimitStore.set(key, validRecords);
    
    // Limpiar registros antiguos (cada 100 requests)
    if (Math.random() < 0.01) {
        for (const [storeKey, storeRecords] of global.webhookRateLimitStore.entries()) {
            const filteredRecords = storeRecords.filter(timestamp => timestamp > windowStart);
            if (filteredRecords.length === 0) {
                global.webhookRateLimitStore.delete(storeKey);
            } else {
                global.webhookRateLimitStore.set(storeKey, filteredRecords);
            }
        }
    }
    
    next();
};

/**
 * Middleware para capturar body raw para verificación HMAC
 */
export const captureRawBody = (req, res, next) => {
    console.log('🔍 Capturando body raw para verificación HMAC...');
    
    // Si el body ya fue parseado por express.json(), usarlo directamente
    if (req.body && Object.keys(req.body).length > 0) {
        req.rawBody = JSON.stringify(req.body);
        console.log('✅ Body raw capturado desde req.body:', req.rawBody.substring(0, 100) + '...');
        return next();
    }
    
    // Si no hay body parseado, capturar el stream raw
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', chunk => {
        data += chunk;
        console.log('📦 Chunk recibido:', chunk.length, 'bytes');
    });
    
    req.on('end', () => {
        req.rawBody = data;
        console.log('✅ Body raw capturado del stream:', data.substring(0, 100) + '...');
        next();
    });
    
    req.on('error', (error) => {
        console.error('❌ Error capturando body raw:', error);
        next(error);
    });
};
