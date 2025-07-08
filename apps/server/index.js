import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import sequelize from './config/database.js';
import { login, verify, logout } from './controllers/authController.js';
import userController from './controllers/userController.js';
import departmentController from './controllers/departmentController.js';
import cityController from './controllers/cityController.js';
import companyController from './controllers/companyController.js';
import sedeController from './controllers/sedeController.js';
import { requirePermission } from './middleware/rbac.js';
import permissionController from './controllers/permissionController.js';
import roleController from './controllers/roleController.js';
import webSocketSystem from './websocket/index.js';
import inspectionOrderController from './controllers/inspectionOrderController.js';
import contactAgentController from './controllers/contactAgentController.js';
import coordinadorContactoController from './controllers/coordinadorContactoController.js';
import scheduleController from './controllers/scheduleController.js';

// Importar modelos para establecer relaciones
import './models/index.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://192.168.20.6:5173', credentials: true }));
app.use(express.json());

// Rutas de autenticación
app.post('/api/auth/login', login);
app.get('/api/auth/verify', verify);
app.post('/api/auth/logout', logout);

// Rutas RBAC
app.get('/api/permissions', requirePermission('permissions.read'), permissionController.index);
app.get('/api/permissions/registered', requirePermission('permissions.read'), permissionController.registered);
app.get('/api/roles', requirePermission('roles.read'), roleController.index);
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
app.get('/api/departments', departmentController.index);
app.get('/api/departments/:id', departmentController.show);
app.post('/api/departments', departmentController.store);
app.put('/api/departments/:id', departmentController.update);
app.delete('/api/departments/:id', departmentController.destroy);
app.delete('/api/departments/:id/force', departmentController.forceDestroy);
app.post('/api/departments/:id/restore', departmentController.restore);

// Rutas de ciudades
app.get('/api/cities', cityController.index);
app.get('/api/cities/:id', cityController.show);
app.get('/api/departments/:departmentId/cities', cityController.getByDepartment);
app.post('/api/cities', cityController.store);
app.put('/api/cities/:id', cityController.update);
app.delete('/api/cities/:id', cityController.destroy);
app.delete('/api/cities/:id/force', cityController.forceDestroy);
app.post('/api/cities/:id/restore', cityController.restore);

// Rutas de empresas
app.get('/api/companies', companyController.index);
app.get('/api/companies/:id', companyController.show);
app.post('/api/companies', companyController.store);
app.put('/api/companies/:id', companyController.update);
app.delete('/api/companies/:id', companyController.destroy);
app.delete('/api/companies/:id/force', companyController.forceDestroy);
app.post('/api/companies/:id/restore', companyController.restore);

// Rutas de sedes
app.get('/api/sedes', sedeController.index);
app.get('/api/sedes/:id', sedeController.show);
app.get('/api/companies/:companyId/sedes', sedeController.getByCompany);
app.post('/api/sedes', sedeController.store);
app.put('/api/sedes/:id', sedeController.update);
app.delete('/api/sedes/:id', sedeController.destroy);
app.delete('/api/sedes/:id/force', sedeController.forceDestroy);
app.post('/api/sedes/:id/restore', sedeController.restore);

// ===== NUEVAS RUTAS - ÓRDENES DE INSPECCIÓN =====

// Rutas para Comercial Mundial (crear/gestionar órdenes)
app.get('/api/inspection-orders', requirePermission('inspection_orders.read'), inspectionOrderController.index);
app.get('/api/inspection-orders/stats', requirePermission('inspection_orders.read'), inspectionOrderController.getStats);
app.get('/api/inspection-orders/search', requirePermission('inspection_orders.read'), inspectionOrderController.search);
app.get('/api/inspection-orders/:id', requirePermission('inspection_orders.read'), inspectionOrderController.show);
app.post('/api/inspection-orders', requirePermission('inspection_orders.create'), inspectionOrderController.store);
app.put('/api/inspection-orders/:id', requirePermission('inspection_orders.update'), inspectionOrderController.update);
app.delete('/api/inspection-orders/:id', requirePermission('inspection_orders.delete'), inspectionOrderController.destroy);

// ===== NUEVAS RUTAS - Agente de Contact =====

// Rutas para Agente de Contact
app.get('/api/contact-agent/orders', requirePermission('contact_agent.read'), contactAgentController.getOrders);
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

// ===== NUEVAS RUTAS - SISTEMA DE HORARIOS AVANZADO =====

// Rutas para gestión de horarios y disponibilidad
app.get('/api/schedules/available', scheduleController.getAvailableSchedules);
app.get('/api/schedules/available', requirePermission('contact_agent.read'), scheduleController.getAvailableSchedules);
app.get('/api/sedes/:sedeId/vehicle-types', requirePermission('contact_agent.read'), scheduleController.getSedeVehicleTypes);
app.post('/api/schedules/appointments', requirePermission('contact_agent.create_appointment'), scheduleController.createScheduledAppointment);

// ===== NUEVAS RUTAS - Coordinador de Contact Center =====

// Rutas para Coordinador de Contact Center
app.get('/api/coordinador-contacto/orders', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getOrders);
app.get('/api/coordinador-contacto/orders/:id', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getOrderDetails);
app.get('/api/coordinador-contacto/stats', requirePermission('coordinador_contacto.stats'), coordinadorContactoController.getStats);
app.get('/api/coordinador-contacto/agents', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getAgents);
app.post('/api/coordinador-contacto/assign', requirePermission('coordinador_contacto.assign'), coordinadorContactoController.assignAgent);

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
app.get('/api/users/trashed/all', userController.indexWithTrashed);
app.get('/api/users/trashed/only', userController.onlyTrashed);
app.get('/api/users', userController.index);
app.get('/api/users/:id', userController.show);
app.post('/api/users', userController.store);
app.put('/api/users/:id', userController.update);
app.delete('/api/users/:id', userController.destroy);
app.delete('/api/users/:id/force', userController.forceDestroy);
app.post('/api/users/:id/restore', userController.restore);

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
app.get('/api', (req, res) => {
    res.json({ message: '¡Hola desde el servidor Express!' });
});

// Agregar endpoint de prueba simple
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Endpoint para verificar usuarios conectados (sin autenticación para debugging)
app.get('/api/websocket/debug', (req, res) => {
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
app.get('/api/inspection-orders-test', async (req, res) => {
    try {
        const { InspectionOrder } = await import('./models/index.js');
        const count = await InspectionOrder.count();
        res.json({ message: 'Tabla accessible', count });
    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Endpoint de prueba para inspection orders sin autenticación
app.get('/api/inspection-orders-simple', async (req, res) => {
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
            console.log(`🚀 Servidor Express escuchando en http://192.168.20.6:${port}`);
            console.log(`📊 Base de datos: ${process.env.DATABASE_DRIVER || 'mysql'}`);
            console.log(`🔌 WebSockets disponibles en ws://192.168.20.6:${port}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

startServer();

