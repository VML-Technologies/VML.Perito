/**
 * Utilitario de sanitización SQL para MySQL/SQL Server
 * Previene inyección SQL removiendo caracteres peligrosos
 */

// Caracteres peligrosos para SQL
const DANGEROUS_CHARS = /['";\\]/g;

/**
 * Sanitiza un valor string removiendo caracteres peligrosos para SQL
 * @param {string} value - Valor a sanitizar
 * @returns {string} - Valor sanitizado
 */
export const sanitizeString = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    // Remover caracteres peligrosos
    return value.replace(DANGEROUS_CHARS, '');
};

/**
 * Sanitiza un objeto completo de forma recursiva
 * @param {object} obj - Objeto a sanitizar
 * @returns {object} - Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = sanitizeString(value);
        }
    }

    return sanitized;
};

/**
 * Sanitiza parámetros de query string
 * @param {object} query - Objeto query de Express
 * @returns {object} - Query sanitizado
 */
export const sanitizeQuery = (query) => {
    if (!query) return {};

    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
        sanitized[key] = sanitizeString(value);
    }

    return sanitized;
};

/**
 * Middleware de Express para sanitización automática
 * Compatible con Express 5.x
 * 
 * Este middleware crea propiedades sanitizadas en el request:
 * - req.sanitizedQuery: Query parameters sanitizados
 * - req.sanitizedBody: Body sanitizado
 * - req.sanitizedParams: Params sanitizados
 * 
 * Uso en controladores:
 * const { sanitizedQuery, sanitizedBody, sanitizedParams } = req;
 * 
 * @param {object} req - Request de Express
 * @param {object} res - Response de Express
 * @param {function} next - Next function
 */
export const sqlSanitizerMiddleware = (req, res, next) => {
    try {
        // Crear propiedades sanitizadas en el request
        req.sanitizedQuery = req.query ? sanitizeQuery(req.query) : {};
        req.sanitizedBody = req.body ? sanitizeObject(req.body) : {};
        req.sanitizedParams = req.params ? sanitizeObject(req.params) : {};

        // Log de posibles intentos de inyección SQL
        const checkForInjection = (obj, source) => {
            Object.values(obj).forEach(value => {
                if (typeof value === 'string' && hasDangerousChars(value)) {
                    logSqlInjectionAttempt(value, source, req.ip);
                }
            });
        };

        if (req.query) checkForInjection(req.query, 'query');
        if (req.body) checkForInjection(req.body, 'body');
        if (req.params) checkForInjection(req.params, 'params');

        next();
    } catch (error) {
        console.error('🚨 Error en sanitización SQL:', error);
        next(); // Continuar sin sanitización en caso de error
    }
};

/**
 * Valida si un string contiene caracteres peligrosos
 * @param {string} value - Valor a validar
 * @returns {boolean} - true si contiene caracteres peligrosos
 */
export const hasDangerousChars = (value) => {
    if (typeof value !== 'string') {
        return false;
    }

    return DANGEROUS_CHARS.test(value);
};

/**
 * Log de intentos de inyección SQL
 * @param {string} value - Valor sospechoso
 * @param {string} source - Fuente del valor (query, body, params)
 * @param {string} ip - IP del cliente
 */
export const logSqlInjectionAttempt = (value, source, ip) => {
    console.error(`🚨 Posible intento de inyección SQL detectado:`);
    console.error(`   Valor: ${value}`);
    console.error(`   Fuente: ${source}`);
    console.error(`   IP: ${ip}`);
    console.error(`   Timestamp: ${new Date().toISOString()}`);
};

export default {
    sanitizeString,
    sanitizeObject,
    sanitizeQuery,
    sqlSanitizerMiddleware,
    hasDangerousChars,
    logSqlInjectionAttempt
};

/**
 * EJEMPLO DE USO EN CONTROLADORES:
 * 
 * // En tu controlador
 * export const createUser = async (req, res) => {
 *     // Usar datos sanitizados
 *     const { sanitizedBody } = req;
 *     
 *     try {
 *         const user = await User.create(sanitizedBody);
 *         res.json(user);
 *     } catch (error) {
 *         res.status(500).json({ error: 'Error al crear usuario' });
 *     }
 * };
 * 
 * // Para queries
 * export const searchUsers = async (req, res) => {
 *     const { sanitizedQuery } = req;
 *     
 *     try {
 *         const users = await User.findAll({
 *             where: sanitizedQuery
 *         });
 *         res.json(users);
 *     } catch (error) {
 *         res.status(500).json({ error: 'Error en búsqueda' });
 *     }
 * };
 */ 