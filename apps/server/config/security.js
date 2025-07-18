// Configuración de seguridad para el servidor VML Perito

export const securityConfig = {
    // Dominios permitidos para CORS
    allowedOrigins: [
        'https://movilidadmundial.vmltechnologies.com',
        'https://qa-movilidadmundial.vmltechnologies.com',
        'https://dev-movilidadmundial.vmltechnologies.com',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://192.168.20.6:5173',
        'http://192.168.20.6:3000'
    ],

    // Configuración de Helmet
    helmetConfig: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                connectSrc: ["'self'", "ws:", "wss:"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    },

    // Configuración de Rate Limiting
    rateLimitConfig: {
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 1000, // máximo 1000 requests por ventana (más apropiado para apps empresariales)
            message: {
                error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.',
                retryAfter: 15 * 60
            },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false
        },
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 10, // máximo 10 intentos de login por ventana (más permisivo)
            message: {
                error: 'Demasiadas intentos de autenticación, intenta de nuevo en 15 minutos.',
                retryAfter: 15 * 60
            },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: true,
            skipFailedRequests: false
        },
        // Rate limiting específico para endpoints de lectura (más permisivo)
        read: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 2000, // máximo 2000 requests de lectura por ventana
            message: {
                error: 'Demasiadas solicitudes de lectura desde esta IP, intenta de nuevo en 15 minutos.',
                retryAfter: 15 * 60
            },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false
        }
    },

    // Headers de seguridad adicionales
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    },

    // Configuración de logging
    loggingConfig: {
        enabled: true,
        logRequests: true,
        logResponses: true,
        logErrors: true,
        logSecurityEvents: true
    },

    // Configuración de sanitización SQL
    sqlSanitization: {
        enabled: true,
        dangerousChars: /['";\\]/g,
        replacement: ''
    }
};

// Función para validar origen en CORS
export const validateOrigin = (origin, callback) => {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);

    if (securityConfig.allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
    } else {
        console.warn(`⚠️ Origen bloqueado por CORS: ${origin}`);
        callback(new Error('No permitido por CORS'));
    }
};

// Función para crear configuración de CORS
export const createCorsConfig = () => ({
    origin: validateOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

export default securityConfig; 