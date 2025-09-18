import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

class SocketManager {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socket.id
        this.userSockets = new Map(); // socket.id -> user data
        this.rooms = new Map(); // roomName -> Set of socket.ids
        this.eventHandlers = new Map(); // eventName -> handler function

        // Registrar handlers por defecto
        this.registerDefaultHandlers();
    }

    /**
     * Inicializar Socket.IO con el servidor HTTP
     */
    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://192.168.20.6:5173",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Middleware de autenticación
        this.io.use(async (socket, next) => {
            try {
                // Verificar si es una conexión pública para cola de inspecciones
                const isPublicConnection = socket.handshake.auth.public === true;
                
                if (isPublicConnection) {
                    // Conexión pública para cola de inspecciones
                    socket.isPublic = true;
                    socket.publicHash = socket.handshake.auth.hash;
                    console.log(`🔌 Conexión pública para hash: ${socket.publicHash}`);
                    return next();
                }

                // Obtener token de múltiples fuentes posibles
                const token = socket.handshake.auth.token ||
                    socket.handshake.headers.authorization?.split(' ')[1] ||
                    socket.handshake.query.token;

                if (!token) {
                    return next(new Error('Token de autenticación requerido'));
                }

                // Verificar JWT
                const decoded = jwt.verify(token, JWT_SECRET);

                // Obtener usuario con roles y permisos
                const user = await User.findByPk(decoded.id, {
                    attributes: { exclude: ['password'] },
                    include: [{
                        model: Role,
                        as: 'roles',
                        include: [{
                            model: Permission,
                            as: 'permissions',
                            through: { attributes: [] }
                        }],
                        through: { attributes: [] }
                    }]
                });

                if (!user) {
                    return next(new Error('Usuario no válido'));
                }

                // Agregar datos del usuario al socket
                socket.user = user;
                socket.userId = user.id;
                socket.userRoles = user.roles?.map(role => role.name) || [];
                socket.userPermissions = user.roles?.flatMap(role =>
                    role.permissions?.map(perm => perm.name) || []
                ) || [];

                next();
            } catch (error) {
                next(new Error('Token inválido'));
            }
        });

        // Manejar conexiones
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        console.log('✅ Sistema de WebSockets inicializado');
        return this.io;
    }

    /**
     * Manejar nueva conexión
     */
    handleConnection(socket) {
        // Verificar si es una conexión pública
        if (socket.isPublic) {
            this.handlePublicConnection(socket);
            return;
        }

        const userId = socket.userId;
        const userName = socket.user.name;

        console.log(`🔌 Usuario conectado: ${userName} (ID: ${userId})`);

        // Asegurar que userId sea un número
        const numericUserId = parseInt(userId);

        // Verificar si el usuario ya está conectado y limpiar conexión anterior
        const existingSocketId = this.connectedUsers.get(numericUserId);
        if (existingSocketId && existingSocketId !== socket.id) {
            console.log(`🔄 Usuario ${userName} reconectado`);
            this.userSockets.delete(existingSocketId);
        }

        // Registrar usuario conectado
        this.connectedUsers.set(numericUserId, socket.id);
        this.userSockets.set(socket.id, {
            userId: numericUserId,
            user: socket.user,
            roles: socket.userRoles,
            permissions: socket.userPermissions,
            connectedAt: new Date()
        });

        // Unirse a sala personal del usuario
        socket.join(`user_${numericUserId}`);

        // Unirse a salas basadas en roles
        socket.userRoles.forEach(role => {
            socket.join(`role_${role}`);
        });

        // Notificar conexión exitosa
        socket.emit('connected', {
            message: 'Conectado exitosamente',
            userId: numericUserId,
            userName,
            timestamp: new Date().toISOString(),
            rooms: [`user_${numericUserId}`, ...socket.userRoles.map(role => `role_${role}`)]
        });

        // Manejar eventos personalizados
        this.setupEventHandlers(socket);

        // Configurar eventos específicos para coordinadores
        if (socket.userRoles.includes('coordinador_vml')) {
            this.setupCoordinatorEventHandlers(socket);
        }

        // Manejar desconexión
        socket.on('disconnect', () => {
            this.handleDisconnection(socket);
        });
    }

    /**
     * Manejar conexión pública para cola de inspecciones
     */
    handlePublicConnection(socket) {
        const hash = socket.publicHash;
        console.log(`🔌 Conexión pública para cola de inspecciones - Hash: ${hash}`);

        // Registrar conexión pública
        this.userSockets.set(socket.id, {
            isPublic: true,
            hash: hash,
            connectedAt: new Date()
        });

        // Unirse a sala específica para el hash
        const queueRoom = `inspection_queue_${hash}`;
        socket.join(queueRoom);

        // Notificar conexión exitosa
        socket.emit('connected', {
            message: 'Conectado a cola de inspecciones',
            hash: hash,
            room: queueRoom,
            timestamp: new Date().toISOString()
        });

        // Configurar eventos específicos para conexiones públicas
        this.setupPublicEventHandlers(socket);

        // Manejar desconexión
        socket.on('disconnect', () => {
            this.handlePublicDisconnection(socket);
        });
    }

    /**
     * Manejar desconexión
     */
    handleDisconnection(socket) {
        const userId = socket.userId;
        const numericUserId = parseInt(userId);
        const userName = socket.user?.name || 'Usuario desconocido';

        console.log(`🔌 Usuario desconectado: ${userName} (ID: ${userId})`);

        // Limpiar registros
        this.connectedUsers.delete(numericUserId);
        this.userSockets.delete(socket.id);

        // Limpiar salas
        this.rooms.forEach((socketIds, roomName) => {
            socketIds.delete(socket.id);
            if (socketIds.size == 0) {
                this.rooms.delete(roomName);
            }
        });
    }

    /**
     * Manejar desconexión pública
     */
    handlePublicDisconnection(socket) {
        const hash = socket.publicHash;
        console.log(`🔌 Conexión pública desconectada - Hash: ${hash}`);

        // Limpiar registros
        this.userSockets.delete(socket.id);
    }

    /**
     * Configurar eventos para conexiones públicas
     */
    setupPublicEventHandlers(socket) {
        // Evento para unirse a la cola de inspecciones
        socket.on('joinInspectionQueue', (data) => {
            const { hash } = data;
            const queueRoom = `inspection_queue_${hash}`;
            
            socket.join(queueRoom);
            console.log(`📋 Cliente público unido a cola: ${hash}`);
            
            socket.emit('queueJoined', {
                message: 'Unido a la cola de inspecciones',
                hash: hash,
                room: queueRoom
            });
        });

        // Evento para salir de la cola de inspecciones
        socket.on('leaveInspectionQueue', (data) => {
            const { hash } = data;
            const queueRoom = `inspection_queue_${hash}`;
            
            socket.leave(queueRoom);
            console.log(`📋 Cliente público salió de cola: ${hash}`);
        });

        // Evento ping para mantener conexión
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });
    }

    /**
     * Configurar eventos para coordinadores
     */
    setupCoordinatorEventHandlers(socket) {
        // Evento para unirse a la sala del coordinador
        socket.on('joinCoordinatorRoom', () => {
            socket.join('coordinador_vml');
            console.log(`👨‍💼 Coordinador unido a sala: coordinador_vml`);
            
            socket.emit('coordinatorJoined', {
                message: 'Unido como coordinador VML',
                room: 'coordinador_vml'
            });
        });

        // Evento para solicitar datos del coordinador
        socket.on('requestCoordinatorData', async (data) => {
            try {
                console.log('📊 Solicitando datos para coordinador');
                
                // Importar el servicio de memoria
                const inspectionQueueMemoryService = (await import('../services/inspectionQueueMemoryService.js')).default;
                
                // Obtener datos de la cola
                const queueData = inspectionQueueMemoryService.getQueueEntries({
                    estado: data?.filters?.estado || 'en_cola',
                    page: data?.filters?.page || 1,
                    limit: 100000//data?.filters?.limit || 10
                });
                
                // Obtener estadísticas
                const stats = inspectionQueueMemoryService.getStats();
                
                // Obtener appointments en sede para coordinador
                const { Appointment, InspectionOrder, Sede, City, InspectionModality, User, Role } = await import('../models/index.js');
                
                const sedeAppointments = await Appointment.findAll({
                    where: {
                        deleted_at: null // Solo appointments activos
                    },
                    include: [
                        {
                            model: InspectionOrder,
                            as: 'inspectionOrder',
                            where: {
                                status: [1, 2, 3] // Solo órdenes con status 1, 2, 3
                            },
                            required: true
                        },
                        {
                            model: Sede,
                            as: 'sede',
                            include: [{
                                model: City,
                                as: 'city'
                            }]
                        },
                        {
                            model: InspectionModality,
                            as: 'inspectionModality',
                            where: {
                                code: 'SEDE' // Solo modalidad SEDE
                            },
                            required: true
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email'],
                            required: false, // LEFT JOIN para incluir appointments sin inspector asignado
                            include: [{
                                model: Role,
                                as: 'roles',
                                attributes: ['id', 'name', 'description'],
                                through: { attributes: [] } // Excluir tabla intermedia
                            }]
                        }
                    ],
                    order: [['created_at', 'DESC']]
                });
                
                console.log(`🏢 Encontrados ${sedeAppointments.length} appointments en sede para coordinador`);
                
                // Enviar datos al coordinador
                socket.emit('coordinatorData', {
                    queueData,
                    stats,
                    sedeAppointments,
                    timestamp: new Date().toISOString()
                });
                
                console.log('📊 Datos enviados al coordinador');
            } catch (error) {
                console.error('❌ Error obteniendo datos para coordinador:', error);
                socket.emit('error', {
                    message: 'Error obteniendo datos de la cola',
                    error: error.message
                });
            }
        });

        // Evento para actualizar estado de la cola
        socket.on('updateQueueStatus', async (data) => {
            try {
                const { id, estado, inspector_asignado_id, observaciones } = data;
                console.log(`🔄 Actualizando estado de cola: ${id} -> ${estado}`);
                
                // Importar el servicio de memoria
                const inspectionQueueMemoryService = (await import('../services/inspectionQueueMemoryService.js')).default;
                
                // Actualizar estado
                const result = await inspectionQueueMemoryService.updateQueueStatus(
                    id, 
                    estado, 
                    inspector_asignado_id, 
                    observaciones
                );
                
                // Emitir actualización a todos los coordinadores
                this.io.to('coordinador_vml').emit('inspectionQueueStatusUpdated', {
                    queueEntry: result.data,
                    timestamp: new Date().toISOString()
                });
                
                // Emitir actualización a conexiones públicas si hay hash
                if (result.data && result.data.hash_acceso) {
                    this.emitQueueStatusUpdate(result.data.hash_acceso, result.data);
                    
                    // Si se asignó un inspector, emitir evento específico
                    if (estado === 'en_proceso' && inspector_asignado_id) {
                        const { User } = await import('../models/index.js');
                        const inspector = await User.findByPk(inspector_asignado_id, {
                            attributes: ['id', 'name', 'email']
                        });
                        
                        if (inspector) {
                            this.emitInspectorAssigned(result.data.hash_acceso, {
                                inspector: inspector,
                                status: 'en_proceso'
                            });
                        }
                    }
                }
                
                console.log('✅ Estado de cola actualizado correctamente');
            } catch (error) {
                console.error('❌ Error actualizando estado de cola:', error);
                socket.emit('error', {
                    message: 'Error actualizando estado de la cola',
                    error: error.message
                });
            }
        });

        // Evento ping para mantener conexión
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });
    }

    /**
     * Configurar manejadores de eventos personalizados
     */
    setupEventHandlers(socket) {
        // Iterar sobre todos los handlers registrados
        this.eventHandlers.forEach((handler, eventName) => {
            socket.on(eventName, async (data) => {
                try {
                    await handler(socket, data, this);
                } catch (error) {
                    console.error(`Error en evento ${eventName}:`, error);
                    socket.emit('error', {
                        event: eventName,
                        message: 'Error procesando evento',
                        error: error.message
                    });
                }
            });
        });
    }

    /**
     * Registrar un manejador de eventos personalizado
     */
    registerEventHandler(eventName, handler) {
        if (typeof handler !== 'function') {
            throw new Error('El handler debe ser una función');
        }
        this.eventHandlers.set(eventName, handler);
        console.log(`📡 Evento registrado: ${eventName}`);
    }

    /**
     * Registrar múltiples manejadores de eventos
     */
    registerEventHandlers(handlers) {
        Object.entries(handlers).forEach(([eventName, handler]) => {
            this.registerEventHandler(eventName, handler);
        });
    }

    /**
 * Enviar mensaje a un usuario específico
 */
    sendToUser(userId, event, data) {
        // Asegurar que userId sea un número
        const numericUserId = parseInt(userId);
        const socketId = this.connectedUsers.get(numericUserId);

        if (socketId) {
            console.log(`📤 Enviando evento '${event}' a usuario ${numericUserId}`);
            this.io.to(socketId).emit(event, data);

            // También enviar a la sala del usuario como respaldo
            this.io.to(`user_${numericUserId}`).emit(event, data);

            return true;
        } else {
            console.log(`❌ Usuario ${numericUserId} no encontrado, enviando a sala como respaldo`);
            // Como respaldo, intentar enviar solo a la sala del usuario
            this.io.to(`user_${numericUserId}`).emit(event, data);
            return false;
        }
    }

    /**
     * Enviar mensaje a todos los usuarios con un rol específico
     */
    sendToRole(roleName, event, data) {
        this.io.to(`role_${roleName}`).emit(event, data);
    }

    /**
     * Enviar mensaje a todos los usuarios conectados
     */
    broadcast(event, data) {
        this.io.emit(event, data);
    }

    /**
     * Enviar mensaje a una sala específica
     */
    sendToRoom(roomName, event, data) {
        this.io.to(roomName).emit(event, data);
    }

    /**
     * Unir usuario a una sala personalizada
     */
    joinRoom(userId, roomName) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                socket.join(roomName);

                // Registrar en el mapa de salas
                if (!this.rooms.has(roomName)) {
                    this.rooms.set(roomName, new Set());
                }
                this.rooms.get(roomName).add(socketId);

                return true;
            }
        }
        return false;
    }

    /**
     * Remover usuario de una sala
     */
    leaveRoom(userId, roomName) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                socket.leave(roomName);

                // Limpiar del mapa de salas
                if (this.rooms.has(roomName)) {
                    this.rooms.get(roomName).delete(socketId);
                    if (this.rooms.get(roomName).size == 0) {
                        this.rooms.delete(roomName);
                    }
                }

                return true;
            }
        }
        return false;
    }

    /**
     * Obtener usuarios conectados
     */
    getConnectedUsers() {
        return Array.from(this.userSockets.values()).map(userData => ({
            userId: userData.userId,
            name: userData.user.name,
            email: userData.user.email,
            roles: userData.roles,
            connectedAt: userData.connectedAt
        }));
    }

    /**
     * Verificar si un usuario está conectado
     */
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }

    /**
     * Obtener estadísticas de conexiones
     */
    getStats() {
        return {
            totalConnections: this.connectedUsers.size,
            totalRooms: this.rooms.size,
            registeredEvents: this.eventHandlers.size,
            connectedUsers: this.getConnectedUsers()
        };
    }

    /**
     * Registrar handlers por defecto
     */
    registerDefaultHandlers() {
        // Evento de ping para mantener conexión
        this.registerEventHandler('ping', (socket, data) => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });

        // Evento para unirse a salas personalizadas
        this.registerEventHandler('join_room', (socket, data) => {
            const { roomName } = data;
            if (roomName && typeof roomName == 'string') {
                socket.join(roomName);
                socket.emit('joined_room', { roomName, timestamp: new Date().toISOString() });
            }
        });

        // Evento para salir de salas
        this.registerEventHandler('leave_room', (socket, data) => {
            const { roomName } = data;
            if (roomName && typeof roomName == 'string') {
                socket.leave(roomName);
                socket.emit('left_room', { roomName, timestamp: new Date().toISOString() });
            }
        });

        // Evento para obtener usuarios conectados (solo admin)
        this.registerEventHandler('get_connected_users', (socket, data) => {
            if (socket.userPermissions.includes('users.read')) {
                socket.emit('connected_users', this.getConnectedUsers());
            } else {
                socket.emit('error', { message: 'Sin permisos para ver usuarios conectados' });
            }
        });
    }

    /**
     * Emitir actualización de estado de cola de inspecciones a conexiones públicas
     */
    emitQueueStatusUpdate(hash, queueData) {
        if (!this.io) {
            console.warn('⚠️ Socket.IO no inicializado');
            return;
        }

        const queueRoom = `inspection_queue_${hash}`;
        console.log(`📊 Emitiendo actualización de cola a sala: ${queueRoom}`);

        this.io.to(queueRoom).emit('queueStatusUpdate', {
            success: true,
            data: queueData,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Emitir evento de inspector asignado a conexiones públicas
     */
    emitInspectorAssigned(hash, inspectorData) {
        if (!this.io) {
            console.warn('⚠️ Socket.IO no inicializado');
            return;
        }

        const queueRoom = `inspection_queue_${hash}`;
        console.log(`👨‍🔧 Emitiendo inspector asignado a sala: ${queueRoom}`);

        this.io.to(queueRoom).emit('inspectorAssigned', {
            success: true,
            data: inspectorData,
            timestamp: new Date().toISOString()
        });
    }
}

export default new SocketManager(); 