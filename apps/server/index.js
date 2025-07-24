import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sequelize from './config/database.js';
import { login, verify, logout } from './controllers/authController.js';
import userController from './controllers/userController.js';
import departmentController from './controllers/departmentController.js';
import cityController from './controllers/cityController.js';
import companyController from './controllers/companyController.js';
import sedeController from './controllers/sedeController.js';
import { requirePermission } from './middleware/rbac.js';
import { requireAuth } from './middleware/auth.js';
import permissionController from './controllers/permissionController.js';
import roleController from './controllers/roleController.js';
import webSocketSystem from './websocket/index.js';
import InspectionOrderController from './controllers/inspectionOrderController.js';
import contactAgentController from './controllers/contactAgentController.js';
import coordinadorContactoController from './controllers/coordinadorContactoController.js';
import scheduleController from './controllers/scheduleController.js';
import notificationController from './controllers/notificationController.js';
import { Op } from 'sequelize';
import { securityConfig, createCorsConfig } from './config/security.js';
import { sqlSanitizerMiddleware } from './utils/sqlSanitizer.js';

// Importar modelos para establecer relaciones
import './models/index.js';

// Cargar variables de entorno
dotenv.config();

// Crear instancia del controlador de órdenes de inspección
const inspectionOrderController = new InspectionOrderController();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Setup para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURACIÓN DE SEGURIDAD =====

// Middleware para configurar correctamente la IP del cliente (importante para rate limiting)
app.use((req, res, next) => {
    // Configurar la IP real del cliente cuando hay proxies
    req.realIP = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown';

    // Limpiar la IP (remover prefijos como ::ffff:)
    req.realIP = req.realIP.replace(/^::ffff:/, '');

    next();
});

// Configurar CORS usando configuración centralizada
app.use(cors(createCorsConfig()));

// Configurar Helmet usando configuración centralizada
app.use(helmet(securityConfig.helmetConfig));

// Rate limiting usando configuración centralizada
const limiter = rateLimit(securityConfig.rateLimitConfig.general);
const authLimiter = rateLimit(securityConfig.rateLimitConfig.auth);
const readLimiter = rateLimit(securityConfig.rateLimitConfig.read);

// Aplicar rate limiting general
app.use(limiter);

// Middleware para logging de rate limiting
app.use((req, res, next) => {
    // Interceptar respuestas de rate limiting
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode === 429) {
            console.warn(`🚫 RATE LIMIT EXCEEDED: IP ${req.realIP} - ${req.method} ${req.path} - Headers: ${JSON.stringify(res.getHeaders())}`);
        }
        originalSend.call(this, data);
    };
    next();
});

// Sanitización de datos para SQL (prevención de inyección SQL)
app.use(sqlSanitizerMiddleware);

// Middleware para parsear JSON con límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers de seguridad adicionales usando configuración centralizada
app.use((req, res, next) => {
    Object.entries(securityConfig.securityHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    next();
});

// Middleware de logging para monitoreo de seguridad
app.use((req, res, next) => {
    const start = Date.now();

    // Log de la solicitud con IP real
    console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.path} - IP Real: ${req.realIP} - User-Agent: ${req.get('User-Agent')}`);

    // Interceptar la respuesta para logging
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        const status = res.statusCode;

        // Log de respuesta con colores según el status
        let logMessage = `📤 [${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.realIP} - Status: ${status} - Duration: ${duration}ms`;

        if (status >= 400) {
            console.error(`❌ ${logMessage}`);
        } else if (status >= 300) {
            console.warn(`⚠️ ${logMessage}`);
        } else {
            console.log(`✅ ${logMessage}`);
        }

        originalSend.call(this, data);
    };

    next();
});

// Servir archivos estáticos de la carpeta dist/web
const staticPath = path.join(__dirname, '../web/dist');

// Rutas de autenticación con rate limiting específico
app.post('/api/auth/login', authLimiter, login);
app.get('/api/auth/verify', authLimiter, verify);
app.post('/api/auth/logout', authLimiter, logout);

// Rutas RBAC
app.get('/api/permissions', readLimiter, requirePermission('permissions.read'), permissionController.index);
app.get('/api/permissions/registered', readLimiter, requirePermission('permissions.read'), permissionController.registered);
app.get('/api/roles', readLimiter, requirePermission('roles.read'), roleController.index);
app.post('/api/roles', requirePermission('roles.create'), roleController.store);
app.put('/api/roles/:id', requirePermission('roles.update'), roleController.update);
app.delete('/api/roles/:id', requirePermission('roles.delete'), roleController.destroy);
app.post('/api/permissions', requirePermission('permissions.create'), permissionController.store);
app.put('/api/permissions/:id', requirePermission('permissions.update'), permissionController.update);
app.delete('/api/permissions/:id', requirePermission('permissions.delete'), permissionController.destroy);
app.post('/api/roles/:id/permissions', requirePermission('roles.update'), roleController.assignPermissions);
app.get('/api/roles/:id/permissions', requirePermission('roles.read'), roleController.getPermissions);
app.post('/api/users/:userId/roles', requirePermission('users.update'), roleController.assignUserRoles);
app.get('/api/users/:userId/roles', requirePermission('users.read'), roleController.getUserRoles);
app.get('/api/users/with-roles', requirePermission('users.read'), roleController.getUsersWithRoles);
app.post('/api/rbac/bulk-assignments', requirePermission('roles.update'), roleController.updateBulkAssignments);

// Rutas de departamentos
app.get('/api/departments', readLimiter, requirePermission('departments.read'), departmentController.index);
app.get('/api/departments/:id', readLimiter, requirePermission('departments.read'), departmentController.show);
app.post('/api/departments', requirePermission('departments.create'), departmentController.store);
app.put('/api/departments/:id', requirePermission('departments.update'), departmentController.update);
app.delete('/api/departments/:id', requirePermission('departments.delete'), departmentController.destroy);
app.delete('/api/departments/:id/force', requirePermission('departments.delete'), departmentController.forceDestroy);
app.post('/api/departments/:id/restore', requirePermission('departments.update'), departmentController.restore);

// Rutas de ciudades
app.get('/api/cities', readLimiter, requirePermission('cities.read'), cityController.index);
app.get('/api/cities/:id', readLimiter, requirePermission('cities.read'), cityController.show);
app.get('/api/departments/:departmentId/cities', readLimiter, requirePermission('cities.read'), cityController.getByDepartment);
app.post('/api/cities', requirePermission('cities.create'), cityController.store);
app.put('/api/cities/:id', requirePermission('cities.update'), cityController.update);
app.delete('/api/cities/:id', requirePermission('cities.delete'), cityController.destroy);
app.delete('/api/cities/:id/force', requirePermission('cities.delete'), cityController.forceDestroy);
app.post('/api/cities/:id/restore', requirePermission('cities.update'), cityController.restore);

// Rutas de empresas
app.get('/api/companies', readLimiter, requirePermission('companies.read'), companyController.index);
app.get('/api/companies/:id', readLimiter, requirePermission('companies.read'), companyController.show);
app.post('/api/companies', requirePermission('companies.create'), companyController.store);
app.put('/api/companies/:id', requirePermission('companies.update'), companyController.update);
app.delete('/api/companies/:id', requirePermission('companies.delete'), companyController.destroy);
app.delete('/api/companies/:id/force', requirePermission('companies.delete'), companyController.forceDestroy);
app.post('/api/companies/:id/restore', requirePermission('companies.update'), companyController.restore);

// Rutas de sedes
app.get('/api/sedes', readLimiter, requirePermission('sedes.read'), sedeController.index);
app.get('/api/sedes/:id', readLimiter, requirePermission('sedes.read'), sedeController.show);
app.get('/api/companies/:companyId/sedes', readLimiter, requirePermission('sedes.read'), sedeController.getByCompany);
app.post('/api/sedes', requirePermission('sedes.create'), sedeController.store);
app.put('/api/sedes/:id', requirePermission('sedes.update'), sedeController.update);
app.delete('/api/sedes/:id', requirePermission('sedes.delete'), sedeController.destroy);
app.delete('/api/sedes/:id/force', requirePermission('sedes.delete'), sedeController.forceDestroy);
app.post('/api/sedes/:id/restore', requirePermission('sedes.update'), sedeController.restore);

// ===== NUEVAS RUTAS - ÓRDENES DE INSPECCIÓN UNIFICADAS =====

// Endpoint unificado para órdenes de inspección
app.get('/api/inspection-orders', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.getOrders);
app.get('/api/inspection-orders/stats', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.getStats);
app.get('/api/inspection-orders/search', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.search);
app.get('/api/inspection-orders/:id', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.show);
app.post('/api/inspection-orders', requirePermission('inspection_orders.create'), inspectionOrderController.store);
app.put('/api/inspection-orders/:id', requirePermission('inspection_orders.update'), inspectionOrderController.update);
app.delete('/api/inspection-orders/:id', requirePermission('inspection_orders.delete'), inspectionOrderController.destroy);

// ===== NUEVAS RUTAS - Agente de Contact =====

// Rutas para Agente de Contact (mantener endpoints específicos para funcionalidad adicional)
app.get('/api/contact-agent/orders/:id', requirePermission('contact_agent.read'), contactAgentController.getOrderDetails);

// Gestión de llamadas
app.post('/api/contact-agent/call-logs', requirePermission('contact_agent.create_call'), contactAgentController.createCallLog);
app.get('/api/contact-agent/call-statuses', requirePermission('contact_agent.read'), contactAgentController.getCallStatuses);

// Gestión de agendamientos
app.post('/api/contact-agent/appointments', requirePermission('contact_agent.create_appointment'), contactAgentController.createAppointment);

// Rutas geográficas para agendamientos
app.get('/api/contact-agent/departments', requirePermission('contact_agent.read'), contactAgentController.getDepartments);
app.get('/api/contact-agent/cities/:departmentId', requirePermission('contact_agent.read'), contactAgentController.getCities);
app.get('/api/contact-agent/sedes/:cityId', requirePermission('contact_agent.read'), contactAgentController.getSedes);

// Nuevas rutas para modalidades de agendamiento
app.get('/api/contact-agent/modalities', requirePermission('contact_agent.read'), contactAgentController.getAvailableModalities);
app.get('/api/contact-agent/available-sedes', requirePermission('contact_agent.read'), contactAgentController.getAvailableSedes);

// Nuevas rutas para el flujo mejorado de agendamiento
app.get('/api/contact-agent/all-modalities', requirePermission('contact_agent.read'), contactAgentController.getAllAvailableModalities);
app.get('/api/contact-agent/sedes-by-modality', requirePermission('contact_agent.read'), contactAgentController.getSedesByModality);

// ===== NUEVAS RUTAS - SISTEMA DE HORARIOS AVANZADO =====

// Rutas para gestión de horarios y disponibilidad
app.get('/api/schedules/available', requirePermission('contact_agent.read'), scheduleController.getAvailableSchedules);
app.get('/api/sedes/:sedeId/vehicle-types', requirePermission('contact_agent.read'), scheduleController.getSedeVehicleTypes);
app.post('/api/schedules/appointments', requirePermission('contact_agent.create_appointment'), scheduleController.createScheduledAppointment);

// ===== NUEVAS RUTAS - Coordinador de Contact Center =====

// Rutas para Coordinador de Contact Center (mantener endpoints específicos para funcionalidad adicional)
app.get('/api/coordinador-contacto/orders/:id', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getOrderDetails);
app.get('/api/coordinador-contacto/stats', requirePermission('coordinador_contacto.stats'), coordinadorContactoController.getStats);
app.get('/api/coordinador-contacto/agents', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getAgents);
app.post('/api/coordinador-contacto/assign', requirePermission('coordinador_contacto.assign'), coordinadorContactoController.assignAgent);

// ===== RUTAS DE NOTIFICACIONES =====

// Rutas para gestión de notificaciones (requieren autenticación)
app.get('/api/notifications/user', requireAuth, notificationController.getUserNotifications);
app.put('/api/notifications/mark-all-read', requireAuth, notificationController.markAllAsRead);
app.get('/api/notifications/stats', requireAuth, notificationController.getStats);
app.put('/api/notifications/:id', requireAuth, notificationController.markAsRead);

// Rutas de usuarios - IMPORTANTE: Las rutas específicas deben ir ANTES que las rutas con parámetros
// Endpoint de perfil sin restricciones de permisos (solo requiere autenticación)
app.get('/api/users/profile', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

        const token = authHeader.split(' ')[1];
        const jwt = (await import('jsonwebtoken')).default;
        const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Token inválido' });

            try {
                const { User, Role } = await import('./models/index.js');
                const user = await User.findByPk(decoded.id, {
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            through: { attributes: [] },
                            attributes: ['id', 'name', 'description']
                        }
                    ]
                });

                if (!user || !user.is_active) {
                    return res.status(401).json({ message: 'Usuario no válido' });
                }

                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    sede_id: user.sede_id,
                    phone: user.phone,
                    roles: user.roles || []
                });
            } catch (err) {
                res.status(500).json({ message: 'Error en el servidor', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});
app.get('/api/users/trashed/all', readLimiter, requirePermission('users.read'), userController.indexWithTrashed);
app.get('/api/users/trashed/only', readLimiter, requirePermission('users.read'), userController.onlyTrashed);
app.get('/api/users', readLimiter, requirePermission('users.read'), userController.index);
app.get('/api/users/:id', readLimiter, requirePermission('users.read'), userController.show);
app.post('/api/users', requirePermission('users.create'), userController.store);
app.put('/api/users/:id', requirePermission('users.update'), userController.update);
app.delete('/api/users/:id', requirePermission('users.delete'), userController.destroy);
app.delete('/api/users/:id/force', requirePermission('users.delete'), userController.forceDestroy);
app.post('/api/users/:id/restore', requirePermission('users.update'), userController.restore);

// Ejemplo de endpoint protegido
app.get('/api/users/protected', requirePermission('users.read'), (req, res) => {
    res.json({ message: 'Tienes permiso para ver usuarios', user: req.user });
});

// Rutas WebSocket para pruebas y administración
app.get('/api/websocket/stats', requirePermission('system.read'), (req, res) => {
    if (webSocketSystem.isInitialized()) {
        res.json(webSocketSystem.getFullStats());
    } else {
        res.status(503).json({ message: 'Sistema de WebSockets no inicializado' });
    }
});

app.get('/api/websocket/connected-users', requirePermission('users.read'), (req, res) => {
    if (webSocketSystem.isInitialized()) {
        res.json(webSocketSystem.getConnectedUsers());
    } else {
        res.status(503).json({ message: 'Sistema de WebSockets no inicializado' });
    }
});

// Ruta de prueba
app.get('/api', requirePermission('system.read'), (req, res) => {
    res.json({ message: '¡Hola desde el servidor Express!' });
});

// Endpoint de prueba para rate limiting
app.get('/api/test-rate-limit', (req, res) => {
    res.json({
        message: 'Rate limiting funcionando correctamente',
        ip: req.realIP,
        timestamp: new Date().toISOString(),
        rateLimit: req.rateLimit,
        headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip'],
            'remote-address': req.connection?.remoteAddress
        }
    });
});

// Agregar endpoint de prueba simple
app.get('/api/test', requirePermission('system.read'), (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Endpoint para verificar usuarios conectados (requiere permisos de sistema)
app.get('/api/websocket/debug', requirePermission('system.read'), (req, res) => {
    if (webSocketSystem.isInitialized()) {
        const stats = webSocketSystem.getFullStats();
        res.json({
            connectedUsers: webSocketSystem.getConnectedUsers(),
            totalConnections: stats.websocket.totalConnections,
            socketManagerStats: stats.websocket
        });
    } else {
        res.status(503).json({ message: 'Sistema de WebSockets no inicializado' });
    }
});

// Verificar que la tabla de inspection_orders existe
app.get('/api/inspection-orders-test', requirePermission('inspection_orders.read'), async (req, res) => {
    try {
        const { InspectionOrder } = await import('./models/index.js');
        const count = await InspectionOrder.count();
        res.json({ message: 'Tabla accessible', count });
    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Endpoint de prueba para inspection orders (requiere permisos de lectura)
app.get('/api/inspection-orders-simple', requirePermission('inspection_orders.read'), async (req, res) => {
    try {
        const { InspectionOrder } = await import('./models/index.js');
        const orders = await InspectionOrder.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        res.json({ message: 'Consulta exitosa', count: orders.length, orders });
    } catch (error) {
        console.error('Error en consulta simple:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Temp Path to return SMS to send (requiere permisos de sistema)
app.get('/sms', requirePermission('system.read'), async (req, res) => {
    try {
        const { Appointment, InspectionOrder, InspectionModality, Sede } = await import('./models/index.js');
        const appointments = await Appointment.findAll({
            where: {
                session_id: { [Op.ne]: null }
            },
            attributes: ['session_id', 'scheduled_date', 'scheduled_time'],
            include: [
                {
                    model: InspectionOrder,
                    as: 'inspectionOrder',
                    attributes: ['celular_contacto', 'placa', 'nombre_contacto']
                },
                {
                    model: InspectionModality,
                    as: 'inspectionModality',
                    attributes: ['code']
                },
                {
                    model: Sede,
                    as: 'sede',
                    attributes: ['name', 'address']
                }
            ],
            limit: 100
        });

        // Generar el cuerpo del mensaje según la modalidad
        const resultado = appointments.map(a => {
            const id = a.session_id;
            const to = a.inspectionOrder?.celular_contacto || '';
            const nombreContacto = a.inspectionOrder?.nombre_contacto || '';
            const primerNombre = nombreContacto.split(' ')[0] || '';
            const placa = a.inspectionOrder?.placa || '';
            const scheduled_date = a.scheduled_date;
            const scheduled_time = a.scheduled_time;
            const code = a.inspectionModality?.code || '';
            const sede_nombre = a.sede?.name || '';
            let body = '';
            if (code === 'DOMICILIO') {
                body = `Hola ${primerNombre}, la inspección de tu vehículo ${placa} es el ${scheduled_date} a las ${scheduled_time}`;
            } else if (code === 'SEDE') {
                body = `Hola ${primerNombre}, la inspección de tu vehículo ${placa}, es en ${sede_nombre} el ${scheduled_date} a las ${scheduled_time}`;
            } else if (code === 'VIRTUAL') {
                body = `Hola ${primerNombre}, la inspección de tu vehículo ${placa} será en este enlace: https://qa-inspectya.vmltechnologies.com:8017/inspection/${id}`;
            } else {
                body = `Hola ${primerNombre}, la inspección de tu vehículo ${placa} está programada para el ${scheduled_date} a las ${scheduled_time}`;
            }
            return {
                id,
                // to: '3223778157',
                to,
                body
            };
        });

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en la consulta', error: error.message });
    }
});

app.use(express.static(staticPath));

app.get('/{*name}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// ===== MIDDLEWARE DE MANEJO DE ERRORES =====

// Middleware para capturar errores de CORS
app.use((err, req, res, next) => {
    if (err.message === 'No permitido por CORS') {
        console.error(`🚫 CORS Error: ${req.method} ${req.path} desde ${req.get('Origin')}`);
        return res.status(403).json({
            error: 'Acceso denegado por política de CORS',
            message: 'El origen de la solicitud no está permitido'
        });
    }
    next(err);
});

// Middleware para capturar errores de rate limiting
app.use((err, req, res, next) => {
    if (err.status === 429) {
        console.warn(`⏰ Rate Limit Exceeded: IP ${req.realIP} - ${req.method} ${req.path} - Retry-After: ${err.headers?.['retry-after'] || 'unknown'}`);
        return res.status(429).json({
            error: 'Demasiadas solicitudes',
            message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
            retryAfter: err.headers?.['retry-after'] || 900,
            ip: req.realIP,
            timestamp: new Date().toISOString()
        });
    }
    next(err);
});

// Middleware general de manejo de errores
app.use((err, req, res, next) => {
    console.error(`💥 Error no manejado: ${err.message}`);
    console.error(`📍 Stack: ${err.stack}`);

    // No exponer detalles del error en producción
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: isDevelopment ? err.message : 'Ha ocurrido un error inesperado',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Sincronizar base de datos y arrancar servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');

        // Inicializar sistema de WebSockets
        await webSocketSystem.initialize(server);

        // Hacer disponible el sistema WebSocket en la app
        app.set('webSocketSystem', webSocketSystem);

        server.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
            console.log(`📊 Base de datos: ${process.env.DATABASE_DRIVER || 'mysql'}`);
            console.log(`🔌 WebSockets disponibles en ws://localhost:${port}`);
            console.log(`🛡️ Seguridad habilitada:`);
            console.log(`   - CORS configurado para dominios permitidos`);
            console.log(`   - Helmet activado para headers de seguridad`);
            console.log(`   - Rate limiting por IP: 1000 req/15min general, 2000 req/15min lectura, 10 req/15min auth`);
            console.log(`   - Detección de IP mejorada para proxies y load balancers`);
            console.log(`   - Sanitización SQL personalizada activada`);
            console.log(`   - Logging de seguridad habilitado`);
            console.log(`   - Endpoint de prueba: /api/test-rate-limit`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

startServer();

