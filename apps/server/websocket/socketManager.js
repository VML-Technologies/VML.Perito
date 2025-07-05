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
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Middleware de autenticación
        this.io.use(async (socket, next) => {
            try {
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

        // Manejar desconexión
        socket.on('disconnect', () => {
            this.handleDisconnection(socket);
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
            if (socketIds.size === 0) {
                this.rooms.delete(roomName);
            }
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
                    if (this.rooms.get(roomName).size === 0) {
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
            if (roomName && typeof roomName === 'string') {
                socket.join(roomName);
                socket.emit('joined_room', { roomName, timestamp: new Date().toISOString() });
            }
        });

        // Evento para salir de salas
        this.registerEventHandler('leave_room', (socket, data) => {
            const { roomName } = data;
            if (roomName && typeof roomName === 'string') {
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
}

export default new SocketManager(); 