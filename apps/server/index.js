import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import sequelize from './config/database.js';
import { login, verify, logout, changeTemporaryPassword, changePassword, requestPasswordReset, verifyResetToken, resetPassword } from './controllers/authController.js';
import userController from './controllers/userController.js';
import roleController from './controllers/roleController.js';
import permissionController from './controllers/permissionController.js';
import templateController from './controllers/templateController.js';
import notificationController from './controllers/notificationController.js';
import eventController from './controllers/eventController.js';
import appointmentController from './controllers/appointmentController.js';
import InspectionOrderController from './controllers/inspectionOrderController.js';
import companyController from './controllers/companyController.js';
import sedeController from './controllers/sedeController.js';
import departmentController from './controllers/departmentController.js';
import cityController from './controllers/cityController.js';
import channelController from './controllers/channelController.js';
import { requirePermission } from './middleware/rbac.js';
import { requireAuth } from './middleware/auth.js';
import { authenticateWebhook, webhookRateLimit, captureRawBody } from './middleware/webhookAuth.js';
import { authenticateApiToken, apiRateLimit } from './middleware/apiTokenAuth.js';
import contactAgentController from './controllers/contactAgentController.js';
import coordinadorContactoController from './controllers/coordinadorContactoController.js';
import scheduleController from './controllers/scheduleController.js';
import webhookController from './controllers/webhookController.js';
import plateQueryController from './controllers/plateQueryController.js';
import contactHistoryController from './controllers/contactHistoryController.js';
import commentHistoryController from './controllers/commentHistoryController.js';
import inspectionQueueController from './controllers/inspectionQueueController.js';
import inspectionModalityController from './controllers/inspectionModalityController.js';
import inspectorAliadoController from './controllers/inspectorAliadoController.js';
import scheduledTasksController from './controllers/scheduledTasksController.js';
import peritajesController from './controllers/peritajesController.js';
import InspectionOrderStatusController from './controllers/inspectionOrderStatusController.js';
import { getVigentesMovilidadAsistencia } from './controllers/vigentesMovilidadAsistenciaController.js';

// Los servicios se importarán e inicializarán después de crear las tablas

import { Op } from 'sequelize';
import { securityConfig, createCorsConfig } from './config/security.js';
import { sqlSanitizerMiddleware } from './utils/sqlSanitizer.js';

// Cargar variables de entorno
dotenv.config();

// Importar modelos para establecer relaciones - DEBE SER DESPUÉS DE CARGAR VARIABLES DE ENTORNO
import './models/index.js';

// Importar servicios (pero NO inicializarlos automáticamente)
import channelConfigService from './services/channelConfigService.js';
import notificationService from './services/notificationService.js';
import templateService from './services/templateService.js';
import eventService from './services/eventService.js';
import automatedEventTriggers from './services/automatedEventTriggers.js';
import webSocketSystem from './websocket/index.js';
import inspectionQueueMemoryService from './services/inspectionQueueMemoryService.js';
import scheduledTasksService from './services/scheduledTasksService.js';
import { read } from 'fs';
import listController from './controllers/listController.js';

// Crear instancia del controlador de órdenes de inspección
const inspectionOrderController = new InspectionOrderController();

// Crear instancia del controlador de estados de órdenes de inspección
const inspectionOrderStatusController = new InspectionOrderStatusController();

// Crear instancia del controlador de Inspector Aliado
const inspectorAliadoControllerInstance = new inspectorAliadoController();

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

app.use(compression());
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
app.use(morgan('combined'));

// Middleware para logging de rate limiting
app.use((req, res, next) => {
    // Interceptar respuestas de rate limiting
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode == 429) {
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
app.post('/api/auth/change-temporary-password', authLimiter, requireAuth, changeTemporaryPassword);
app.post('/api/auth/change-password', authLimiter, requireAuth, changePassword);
app.post('/api/auth/request-password-reset', authLimiter, requestPasswordReset);
app.get('/api/auth/verify-reset-token/:token', authLimiter, verifyResetToken);
app.post('/api/auth/reset-password', authLimiter, resetPassword);

// ===== RUTAS DE CONSULTA DE PLACAS (SIN AUTENTICACIÓN) =====
app.get('/api/vigentes-movilidad-asistencia', apiRateLimit, authenticateApiToken, getVigentesMovilidadAsistencia);

// Consulta de placa sin autenticación
app.get('/api/check-plate/:placa', readLimiter, plateQueryController.checkPlate);

// Estadísticas de consultas (requiere autenticación)
app.get('/api/plate-queries/stats', readLimiter, requireAuth, plateQueryController.getStats);

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
app.get('/api/sedes/types', readLimiter, requirePermission('sedes.read'), sedeController.getSedeTypes);
app.get('/api/sedes/cda', readLimiter, requirePermission('sedes.read'), sedeController.getCDASedes);
app.get('/api/sedes/:id', readLimiter, requirePermission('sedes.read'), sedeController.show);
app.get('/api/companies/:companyId/sedes', readLimiter, requirePermission('sedes.read'), sedeController.getByCompany);
app.post('/api/sedes', requirePermission('sedes.create'), sedeController.store);
app.put('/api/sedes/:id', requirePermission('sedes.update'), sedeController.update);
app.delete('/api/sedes/:id', requirePermission('sedes.delete'), sedeController.destroy);
app.delete('/api/sedes/:id/force', requirePermission('sedes.delete'), sedeController.forceDestroy);
app.post('/api/sedes/:id/restore', requirePermission('sedes.update'), sedeController.restore);

// ===== NUEVAS RUTAS - ÓRDENES DE INSPECCIÓN UNIFICADAS =====

// Endpoint unificado para órdenes de inspección
app.get('/api/inspection-orders/full/:id', readLimiter, inspectionOrderController.getFullInspectionOrder);
app.get('/api/inspection-order-statuses', readLimiter, requirePermission('inspection_order_statuses.read'), inspectionOrderStatusController.getAll);
app.get('/api/inspection-orders', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.getOrders);
app.get('/api/inspection-orders/stats', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.getStats);
app.get('/api/inspection-orders/search', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.search);
app.get('/api/inspection-orders/search-by-plate', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.searchByPlate);
app.get('/api/inspection-orders/check-plate/:plate', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.checkPlate);
app.get('/api/inspection-orders/pdf/:id', readLimiter, inspectionOrderController.getPdfReportFilePath);
app.get('/api/inspection-orders/pdf/:id/view', readLimiter, inspectionOrderController.getPdfForInlineView);
app.get('/api/inspection-orders/:id', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.show);
app.post('/api/inspection-orders', requirePermission('inspection_orders.create'), inspectionOrderController.store);
app.put('/api/inspection-orders/:id', requirePermission('inspection_orders.update'), inspectionOrderController.update);
app.delete('/api/inspection-orders/:id', requirePermission('inspection_orders.delete'), inspectionOrderController.destroy);

// Rutas públicas para inspección de asegurabilidad
app.get('/api/inspection-orders/by-hash/:hash', readLimiter, inspectionOrderController.getByHash);
app.post('/api/inspection-orders/:id/start', inspectionOrderController.startInspection);
app.post('/api/inspection-orders/:id/start-virtual-inspection', requirePermission('inspection_orders.update'), inspectionOrderController.startVirtualInspection);

// Reporte de inspección
// Ruta antigua (mantener para compatibilidad)
app.get('/api/inspection-orders/:session_id/inspection-report', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.getInspectionReport);
// Nueva ruta con inspection_order_id y appointment_id
app.get('/api/inspection-orders/:inspectionOrderId/appointments/:appointmentId/inspection-report', inspectionOrderController.getInspectionReportByIds);

// Rutas para actualización de datos de contacto
app.put('/api/inspection-orders/:id/contact-data', requirePermission('inspection_orders.update'), inspectionOrderController.updateContactData);

// Ruta para reenviar SMS de inspección
app.post('/api/inspection-orders/:id/resend-sms', inspectionOrderController.resendInspectionSMS);

// Ruta para cambiar estado de inspección
app.put('/api/inspection-orders/:id/change-status', requirePermission('inspection_orders.change_status'), inspectionOrderController.changeStatus);

// Ruta para reenviar SMS de inspección
// app.post('/api/inspection-orders/:id/resend-sms', requirePermission('inspection_orders.update'), inspectionOrderController.resendInspectionSMS);

// Ruta para obtener historial de appointments
app.get('/api/inspection-orders/:orderId/appointments-history', readLimiter, inspectionOrderController.getAppointmentsHistory);

// Ruta para obtener URL de descarga del PDF
app.get('/api/inspection-orders/:orderId/:appointmentId/:sessionId/pdf-download-url', readLimiter, inspectionOrderController.getPdfDownloadUrl);

// app.get('/api/inspection-orders/:orderId/:appointmentId/:sessionId/pdf-download-url', readLimiter, requirePermission('inspection_orders.read'), inspectionOrderController.getPdfDownloadUrl);

// Rutas para historial de contactos
app.get('/api/inspection-orders/:orderId/contact-history', readLimiter, requirePermission('inspection_orders.read'), contactHistoryController.getContactHistory);
app.get('/api/inspection-orders/:orderId/contact-history/:historyId', readLimiter, requirePermission('inspection_orders.read'), contactHistoryController.getContactHistoryItem);
app.get('/api/inspection-orders/:orderId/contact-history-stats', readLimiter, requirePermission('inspection_orders.read'), contactHistoryController.getContactHistoryStats);

// Rutas para comentarios
app.get('/api/inspection-orders/:orderId/comments', readLimiter, commentHistoryController.getComments);
app.get('/api/inspection-orders/:orderId/comments', readLimiter, requirePermission('inspection_orders.read'), commentHistoryController.getComments);
app.post('/api/inspection-orders/:orderId/comments', requirePermission('inspection_orders.update'), commentHistoryController.createComment);
app.get('/api/inspection-orders/:orderId/comments/:commentId', readLimiter, requirePermission('inspection_orders.read'), commentHistoryController.getComment);
app.get('/api/inspection-orders/:orderId/comments-stats', readLimiter, requirePermission('inspection_orders.read'), commentHistoryController.getCommentStats);

// ===== NUEVAS RUTAS - Agente de Contact =====

// Rutas para Agente de Contact (mantener endpoints específicos para funcionalidad adicional)
app.get('/api/contact-agent/orders/:id', requirePermission('contact_agent.read'), contactAgentController.getOrderDetails);

// Gestión de llamadas
app.post('/api/contact-agent/call-logs', requirePermission('contact_agent.create_call'), contactAgentController.createCallLog);
app.get('/api/contact-agent/call-statuses', requirePermission('contact_agent.read'), contactAgentController.getCallStatuses);

// Gestión de agendamientos
app.get('/api/contact-agent/orders/:orderId/active-appointments', requirePermission('contact_agent.read'), contactAgentController.getActiveAppointments);
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
app.get('/api/schedules/available', scheduleController.getAvailableSchedules);
app.get('/api/sedes/:sedeId/vehicle-types', requirePermission('contact_agent.read'), scheduleController.getSedeVehicleTypes);
app.post('/api/schedules/appointments', requirePermission('contact_agent.create_appointment'), scheduleController.createScheduledAppointment);

// ===== NUEVAS RUTAS - Coordinador de Contact Center =====

// Rutas para Coordinador de Contact Center (mantener endpoints específicos para funcionalidad adicional)
app.get('/api/coordinador-contacto/orders/:id', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getOrderDetails);
app.get('/api/coordinador-contacto/stats', requirePermission('coordinador_contacto.stats'), coordinadorContactoController.getStats);
app.get('/api/coordinador-contacto/agent-stats', requirePermission('coordinador_contacto.stats'), coordinadorContactoController.getAgentAssignmentStats);
app.get('/api/coordinador-contacto/agents', requirePermission('coordinador_contacto.read'), coordinadorContactoController.getAgents);
app.post('/api/coordinador-contacto/assign', requirePermission('coordinador_contacto.assign'), coordinadorContactoController.assignAgent);
app.get('/api/coordinador-contacto/ordenes-recuperacion', requireAuth, coordinadorContactoController.getOrdenesRecuperacion);
app.get('/api/coordinador-contacto/ordenes-no-recuperadas', requireAuth, coordinadorContactoController.getOrdenesNoRecuperadas);
app.get('/api/coordinador-contacto/ordenes/:id/actividad', requireAuth, coordinadorContactoController.getOrdenActividad);
app.get('/api/coordinador-contacto/ordenes/:id/appointments', requireAuth, coordinadorContactoController.getOrderAppointments);
app.get('/api/coordinador-vml/reports/coordinator', requireAuth, coordinadorContactoController.getCoordinatorReport);

// ===== RUTAS DE NOTIFICACIONES =====

// Rutas para gestión de notificaciones (requieren autenticación)
app.get('/api/notifications/user', requireAuth, notificationController.getUserNotifications);
app.put('/api/notifications/mark-all-read', requireAuth, notificationController.markAllAsRead);
app.get('/api/notifications/stats', requireAuth, notificationController.getStats);
app.put('/api/notifications/:id', requireAuth, notificationController.markAsRead);

// ===== RUTAS DEL SISTEMA DE CONFIGURACIÓN DE LISTAS =====
// LISTAS
app.get('/api/lists', readLimiter, requirePermission('lists.read'), listController.index);
app.post('/api/lists', requirePermission('lists.update'), listController.addList);
app.put('/api/lists/:id', requirePermission('lists.update'), listController.updateList);
app.delete('/api/lists/:id', requirePermission('lists.update'), listController.removeList);

// ITEMS
app.get('/api/lists/:id/items', readLimiter, requirePermission('lists.read'), listController.getItems);
app.get('/api/lists/by-name/:name/items', readLimiter, requirePermission('lists.read'), listController.getItemsByName);
app.post('/api/lists/:id/items', requirePermission('lists.update'), listController.createItem);
app.put('/api/lists/:id/items/:itemId', requirePermission('lists.update'), listController.updateItem);
app.delete('/api/lists/:id/items/:itemId', requirePermission('lists.update'), listController.removeItem);

// ===== RUTAS DEL SISTEMA DE NOTIFICACIONES =====

// Rutas para plantillas de notificación
app.get('/api/templates', readLimiter, requirePermission('templates.read'), templateController.index);
app.get('/api/templates/:id', readLimiter, requirePermission('templates.read'), templateController.show);
app.post('/api/templates', requirePermission('templates.create'), templateController.store);
app.put('/api/templates/:id', requirePermission('templates.update'), templateController.update);
app.delete('/api/templates/:id', requirePermission('templates.delete'), templateController.destroy);
app.post('/api/templates/:id/duplicate', requirePermission('templates.create'), templateController.duplicate);
app.get('/api/templates/stats', readLimiter, requirePermission('templates.read'), templateController.stats);
app.get('/api/templates/variables', readLimiter, requirePermission('templates.read'), templateController.variables);
app.post('/api/templates/validate', requirePermission('templates.create'), templateController.validate);
app.post('/api/templates/render', requirePermission('templates.read'), templateController.render);
app.get('/api/templates/category/:category', readLimiter, requirePermission('templates.read'), templateController.byCategory);


// Rutas para canales de notificación
app.get('/api/channels', readLimiter, requirePermission('channels.read'), channelController.index);
app.get('/api/channels/:channelName', readLimiter, requirePermission('channels.read'), channelController.show);
app.post('/api/channels', requirePermission('channels.create'), channelController.store);
app.put('/api/channels/:channelName', requirePermission('channels.update'), channelController.update);
app.delete('/api/channels/:channelName', requirePermission('channels.delete'), channelController.destroy);
app.post('/api/channels/:channelName/test', requirePermission('channels.test'), channelController.testChannel);
app.get('/api/channels/schemas', readLimiter, requirePermission('channels.read'), channelController.getSchemas);
app.post('/api/channels/validate', requirePermission('channels.create'), channelController.validateConfig);

// ===== RUTAS DE MODALIDADES DE INSPECCIÓN =====
// app.get('/api/inspection-modalities', readLimiter, requirePermission('inspection_modalities.read'), inspectionModalityController.index);
// app.get('/api/inspection-modalities/:id', readLimiter, requirePermission('inspection_modalities.read'), inspectionModalityController.show);
// app.post('/api/inspection-modalities', requirePermission('inspection_modalities.create'), inspectionModalityController.store);
// app.put('/api/inspection-modalities/:id', requirePermission('inspection_modalities.update'), inspectionModalityController.update);
// app.delete('/api/inspection-modalities/:id', requirePermission('inspection_modalities.delete'), inspectionModalityController.destroy);
app.get('/api/channels/memory', readLimiter, requirePermission('channels.read'), channelController.getFromMemory);
app.post('/api/channels/reload', requirePermission('channels.update'), channelController.reload);

// Rutas para eventos del sistema
app.get('/api/events', readLimiter, requirePermission('events.read'), eventController.getAllEvents);
app.get('/api/events/stats', readLimiter, requirePermission('events.read'), eventController.getEventStats);
app.get('/api/events/category/:category', readLimiter, requirePermission('events.read'), eventController.getEventsByCategory);
app.post('/api/events', requirePermission('events.create'), eventController.createEvent);
app.post('/api/events/listeners', requirePermission('events.create'), eventController.createListener);
app.get('/api/events/:id', readLimiter, requirePermission('events.read'), eventController.getEventById);
app.get('/api/events/:id/listeners', readLimiter, requirePermission('events.read'), eventController.getEventListeners);
app.post('/api/events/:id/trigger', requirePermission('events.trigger'), eventController.triggerEvent);
app.put('/api/events/:id', requirePermission('events.update'), eventController.updateEvent);
app.put('/api/events/listeners/:id', requirePermission('events.update'), eventController.updateListener);
app.delete('/api/events/:id', requirePermission('events.delete'), eventController.deleteEvent);
app.delete('/api/events/listeners/:id', requirePermission('events.delete'), eventController.deleteListener);

// Rutas para citas (appointments)
app.get('/api/appointments/modalities', readLimiter, requirePermission('appointments.read'), appointmentController.getAvailableModalities);
app.get('/api/appointments/modalities/:cityId', readLimiter, requirePermission('appointments.read'), appointmentController.getInspectionModalitiesByCity);
app.get('/api/appointments/sedes', readLimiter, requirePermission('appointments.read'), appointmentController.getAvailableSedes);
app.post('/api/appointments', requirePermission('appointments.create'), appointmentController.createAppointment);
app.get('/api/appointments/time-slots', readLimiter, requirePermission('appointments.read'), appointmentController.getAvailableTimeSlots);

// ===== RUTAS DEDICADAS PARA INSPECTOR ALIADO =====
app.post('/api/inspector-aliado/appointments', requirePermission('appointments.create'), inspectorAliadoControllerInstance.createAppointment);
app.get('/api/inspector-aliado/reports/historical', requirePermission('reports.read'), inspectorAliadoControllerInstance.getHistoricalReport);

// ===== RUTAS - Queue de Inspecciones =====

// Rutas para gestión del queue de inspecciones
app.get('/api/inspection-queue', readLimiter, requirePermission('inspections.read'), inspectionQueueController.getQueue);
app.post('/api/inspection-queue', requirePermission('inspections.create'), inspectionQueueController.addToQueue);
app.put('/api/inspection-queue/:id/status', requirePermission('inspections.update'), inspectionQueueController.updateQueueStatus);
app.get('/api/inspection-queue/stats', readLimiter, requirePermission('inspections.read'), inspectionQueueController.getQueueStats);
app.get('/api/inspection-queue/inspectors', readLimiter, requirePermission('inspections.read'), inspectionQueueController.getAvailableInspectors);

// Rutas públicas para cola de inspecciones (sin autenticación)
app.post('/api/public/inspection-queue', inspectionQueueController.addToQueuePublic);
app.get('/api/public/inspection-queue/:orderId', inspectionQueueController.getQueueStatusPublic);
app.get('/api/public/inspection-queue/hash/:hash', inspectionQueueController.getQueueStatusByHashPublic);

// Rutas para gestión de agendamientos
app.get('/api/appointments', readLimiter, requirePermission('appointments.read'), appointmentController.getAppointments);
app.get('/api/appointments/sede-coordinator', readLimiter, requirePermission('appointments.read'), appointmentController.getSedeAppointmentsForCoordinator);
app.get('/api/appointments/sede-inspector-aliado', readLimiter, requirePermission('appointments.read'), appointmentController.getSedeAppointmentsForInspectorAliado);
app.get('/api/appointments/:id', readLimiter, requirePermission('appointments.read'), appointmentController.getAppointment);
app.put('/api/appointments/:id', requirePermission('appointments.update'), appointmentController.updateAppointment);
app.post('/api/appointments/:id/assign-inspector', requirePermission('appointments.update'), appointmentController.assignInspector);
app.get('/api/appointments/order/:orderId', readLimiter, requireAuth, appointmentController.getAllAppointmentsByOrder);

app.post('/api/external/appointment/validate-status', apiRateLimit, authenticateApiToken, appointmentController.validateAppointmentStatus);

// ===== ENDPOINT PÚBLICO PARA ACTUALIZAR ESTADO DE APPOINTMENT =====
app.patch('/api/appointments/:id/automated/status', appointmentController.updateStatusToIneffectiveWithRetry);


// ===== RUTAS DE ADMINISTRACIÓN DE NOTIFICACIONES =====

// Rutas para estadísticas administrativas de notificaciones
app.get('/api/notifications/admin/stats', requirePermission('notifications.admin'), notificationController.getAdminStats);

// Rutas para configuraciones de notificación
app.get('/api/notifications/configs', requirePermission('notifications.admin'), notificationController.getNotificationConfigs);
app.post('/api/notifications/configs', requirePermission('notifications.admin'), notificationController.createNotificationConfig);
app.put('/api/notifications/configs/:id', requirePermission('notifications.admin'), notificationController.updateNotificationConfig);
app.delete('/api/notifications/configs/:id', requirePermission('notifications.admin'), notificationController.deleteNotificationConfig);

// Rutas de usuarios - IMPORTANTE: Las rutas específicas deben ir ANTES que las rutas con parámetros
// Endpoint de perfil sin restricciones de permisos (solo requiere autenticación)

app.get('/api/users/profile', requireAuth, userController.profile);
app.get('/api/users/trashed/all', readLimiter, requirePermission('users.read'), userController.indexWithTrashed);
app.get('/api/users/trashed/only', readLimiter, requirePermission('users.read'), userController.onlyTrashed);
app.get('/api/users', readLimiter, requirePermission('users.read'), userController.index);
app.get('/api/users/inspectors', readLimiter, requirePermission('users.read'), userController.getInspectors);
app.get('/api/users/:id', readLimiter, requirePermission('users.read'), userController.show);
app.post('/api/users', requirePermission('users.create'), userController.store);
app.post('/api/users/create-with-email', requirePermission('users.create'), userController.createUserWithEmail);
app.get('/api/users/validate/identification', readLimiter, requirePermission('users.read'), userController.validateIdentification);
app.get('/api/users/validate/email', readLimiter, requirePermission('users.read'), userController.validateEmail);
app.put('/api/users/:id', requirePermission('users.update'), userController.update);
app.delete('/api/users/:id', requirePermission('users.delete'), userController.destroy);
app.delete('/api/users/:id/force', requirePermission('users.delete'), userController.forceDestroy);
app.post('/api/users/:id/restore', requirePermission('users.update'), userController.restore);

// ===== RUTAS DE PERITAJES =====

app.get('/api/peritajes/getPendingToSchedule', readLimiter, requirePermission('inspection_orders.read'), peritajesController.peritajesToSchedule);
app.get('/api/peritajes/agentes-contacto', readLimiter, requirePermission('inspection_orders.read'), peritajesController.getAgentesContacto);
app.get('/api/peritajes/disponibilidad-horarios', readLimiter, requirePermission('inspection_orders.read'), peritajesController.getDisponibilidadHorarios);
app.post('/api/peritajes/schedule', requirePermission('inspection_orders.update'), peritajesController.schedulePeritaje);
app.post('/api/peritajes/assign-agent', requirePermission('inspection_orders.update'), peritajesController.assignAgent);

// ===== RUTAS DE WEBHOOKS =====

// Middleware condicional para captura de body raw
const webhookBodyMiddleware = (req, res, next) => {
    const signatureVerificationEnabled = process.env.WEBHOOK_SIGNATURE_VERIFICATION !== 'false';
    console.log('🔐 Verificación de firma HMAC:', signatureVerificationEnabled ? 'HABILITADA' : 'DESHABILITADA');

    if (signatureVerificationEnabled) {
        console.log('⚠️ Verificación de firma habilitada - usando body ya parseado');
        // Para ahora, usar el body ya parseado por express.json()
        req.rawBody = JSON.stringify(req.body);
        return next();
    } else {
        console.log('✅ Verificación de firma deshabilitada - saltando captura de body raw');
        return next();
    }
};

// Endpoint principal para webhooks
app.post('/api/webhooks/events', webhookBodyMiddleware, authenticateWebhook, webhookRateLimit, webhookController.processEvent);

// Endpoint específico para agendamientos
app.post('/api/webhooks/appointment', webhookBodyMiddleware, authenticateWebhook, webhookRateLimit, webhookController.processEvent);

// Gestión de API Keys (Admin)
app.get('/api/webhooks/api-keys', requirePermission('webhooks.admin'), webhookController.getApiKeys);
app.post('/api/webhooks/api-keys', requirePermission('webhooks.admin'), webhookController.createApiKey);
app.put('/api/webhooks/api-keys/:id', requirePermission('webhooks.admin'), webhookController.updateApiKey);
app.delete('/api/webhooks/api-keys/:id', requirePermission('webhooks.admin'), webhookController.deleteApiKey);

// Logs de webhooks
app.get('/api/webhooks/logs', requirePermission('webhooks.admin'), webhookController.getLogs);

// ===== RUTAS DE TAREAS PROGRAMADAS =====

// Rutas para gestión de tareas programadas
app.get('/api/scheduled-tasks/status', readLimiter, requirePermission('system.read'), scheduledTasksController.getStatus);
app.get('/api/scheduled-tasks/available', readLimiter, requirePermission('system.read'), scheduledTasksController.getAvailableTasks);
app.get('/api/scheduled-tasks/logs', readLimiter, requirePermission('system.read'), scheduledTasksController.getLogs);
app.post('/api/scheduled-tasks/execute/:taskName', requirePermission('system.admin'), scheduledTasksController.executeTask);

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

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
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
            if (code == 'DOMICILIO') {
                body = `Hola ${primerNombre}, la inspección de tu vehículo ${placa} es el ${scheduled_date} a las ${scheduled_time}`;
            } else if (code == 'SEDE') {
                body = `Hola ${primerNombre}, la inspección de tu vehículo ${placa}, es en ${sede_nombre} el ${scheduled_date} a las ${scheduled_time}`;
            } else if (code == 'VIRTUAL') {
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
    if (err.message == 'No permitido por CORS') {
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
    if (err.status == 429) {
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
    const isDevelopment = process.env.NODE_ENV == 'development';

    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: isDevelopment ? err.message : 'Ha ocurrido un error inesperado',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Sincronizar base de datos y arrancar servidor
const startServer = async () => {
    try {
        console.log('🔄 Iniciando sincronización de base de datos...');

        // PRIMERO: Autenticar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // TERCERO: Inicializar servicios (DESPUÉS de que todas las tablas estén creadas)
        console.log('📦 Inicializando servicios...');

        // CUARTO: Inicializar servicios en orden correcto
        console.log('🎯 Inicializando ChannelConfigService...');
        await channelConfigService.initialize();

        console.log('🎯 Inicializando NotificationService...');
        await notificationService.initialize();

        console.log('🎯 Inicializando EventService...');
        const eventServiceInstance = new eventService();
        // Configurar el notificationService en el eventService
        eventServiceInstance.notificationService = notificationService;
        await eventServiceInstance.initialize();

        // QUINTO: Inicializar triggers automáticos
        console.log('🎯 Inicializando triggers automáticos...');
        automatedEventTriggers.initialize(eventServiceInstance);

        // SEXTO: Registrar eventos del sistema
        console.log('🎯 Registrando eventos del sistema...');
        await automatedEventTriggers.registerSystemEvents();

        // SÉPTIMO: Crear listeners predefinidos
        console.log('🎯 Creando listeners predefinidos...');
        await automatedEventTriggers.createDefaultListeners();

        // OCTAVO: Inicializar WebSocket
        console.log('🎯 Inicializando WebSocket...');
        await webSocketSystem.initialize(server);

        // NOVENO: Inicializar servicio de memoria para cola de inspecciones
        console.log('🎯 Inicializando servicio de memoria para cola de inspecciones...');
        await inspectionQueueMemoryService.initialize();

        // DÉCIMO: Inicializar servicio de tareas programadas
        console.log('⏰ Inicializando servicio de tareas programadas...');
        scheduledTasksService.start();

        // DÉCIMO: Hacer disponible el sistema WebSocket en la app
        app.set('webSocketSystem', webSocketSystem);

        // Middleware para incluir io en req
        app.use((req, res, next) => {
            req.io = webSocketSystem.io;
            next();
        });

        console.log('✅ Sistema completamente inicializado');

        // UNDÉCIMO: Mostrar estadísticas iniciales
        const stats = await automatedEventTriggers.getStats();

        // DUODÉCIMO: Iniciar el servidor HTTP
        server.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);

            console.log(`🔌 WebSockets disponibles en ws://localhost:${port}`);
            console.log(`🛡️ Seguridad habilitada:`);
            console.log(`   - CORS configurado para dominios permitidos`);
            console.log(`   - Helmet activado para headers de seguridad`);
            console.log(`   - Rate limiting por IP: 1000 req/15min general, 2000 req/15min lectura, 10 req/15min auth`);
            console.log(`   - Detección de IP mejorada para proxies y load balancers`);
            console.log(`   - Sanitización SQL personalizada activada`);
            console.log(`   - Logging de seguridad habilitado`);
            console.log(`   - Endpoint de prueba: /api/test-rate-limit`);
        }).on('error', (error) => {
            if (error.code == 'EADDRINUSE') {
                console.error(`❌ Error: El puerto ${port} ya está en uso.`);
                console.error(`💡 Solución: Detén el proceso que está usando el puerto ${port} o cambia el puerto en las variables de entorno.`);
                console.error(`🔍 Para ver qué proceso está usando el puerto: netstat -ano | findstr :${port}`);
                process.exit(1);
            } else {
                console.error('❌ Error iniciando el servidor:', error);
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('❌ Error durante la inicialización del servidor:', error);
        console.error('📍 Detalles del error:', error.message);
        console.error('📍 Stack trace:', error.stack);
        process.exit(1);
    }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal SIGINT. Cerrando servidor gracefully...');

    try {
        // Detener servicio de tareas programadas
        if (scheduledTasksService) {
            scheduledTasksService.stop();
        }

        // Cerrar conexión a base de datos
        await sequelize.close();
        console.log('✅ Conexión a base de datos cerrada');

        // Cerrar servidor HTTP
        if (server) {
            server.close(() => {
                console.log('✅ Servidor HTTP cerrado');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error durante el cierre graceful:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal SIGTERM. Cerrando servidor gracefully...');

    try {
        // Detener servicio de tareas programadas
        if (scheduledTasksService) {
            scheduledTasksService.stop();
        }

        // Cerrar conexión a base de datos
        await sequelize.close();
        console.log('✅ Conexión a base de datos cerrada');

        // Cerrar servidor HTTP
        if (server) {
            server.close(() => {
                console.log('✅ Servidor HTTP cerrado');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error durante el cierre graceful:', error);
        process.exit(1);
    }
});

startServer();
