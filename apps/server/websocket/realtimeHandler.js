import socketManager from './socketManager.js';

class RealtimeHandler {
    constructor() {
        this.subscriptions = new Map(); // userId -> Set of subscriptions
        this.dataChannels = new Map(); // channelName -> Set of userIds
        this.registerSocketEvents();
    }

    /**
     * Registrar eventos de tiempo real en el socket manager
     */
    registerSocketEvents() {
        const events = {
            // Suscribirse a actualizaciones de datos
            'subscribe_to_data': async (socket, data) => {
                const { channels } = data;
                if (Array.isArray(channels)) {
                    channels.forEach(channel => {
                        this.subscribeUserToChannel(socket.userId, channel);
                    });
                    socket.emit('subscribed_to_data', { channels, timestamp: new Date().toISOString() });
                }
            },

            // Desuscribirse de actualizaciones
            'unsubscribe_from_data': async (socket, data) => {
                const { channels } = data;
                if (Array.isArray(channels)) {
                    channels.forEach(channel => {
                        this.unsubscribeUserFromChannel(socket.userId, channel);
                    });
                    socket.emit('unsubscribed_from_data', { channels, timestamp: new Date().toISOString() });
                }
            },

            // Obtener datos en tiempo real
            'get_realtime_data': async (socket, data) => {
                const { channel, filters } = data;

                // Verificar permisos para el canal
                if (this.hasChannelPermission(socket, channel)) {
                    const realtimeData = await this.getChannelData(channel, filters);
                    socket.emit('realtime_data', { channel, data: realtimeData });
                } else {
                    socket.emit('error', { message: `Sin permisos para acceder al canal: ${channel}` });
                }
            },

            // Enviar actualización de datos
            'send_data_update': async (socket, data) => {
                const { channel, updateData, targetUsers } = data;

                // Verificar permisos para enviar actualizaciones
                if (this.hasUpdatePermission(socket, channel)) {
                    if (targetUsers && Array.isArray(targetUsers)) {
                        // Enviar a usuarios específicos
                        targetUsers.forEach(userId => {
                            this.sendDataUpdate(userId, channel, updateData);
                        });
                    } else {
                        // Enviar a todos los suscriptores del canal
                        this.broadcastDataUpdate(channel, updateData);
                    }
                    socket.emit('data_update_sent', { channel, timestamp: new Date().toISOString() });
                } else {
                    socket.emit('error', { message: `Sin permisos para actualizar el canal: ${channel}` });
                }
            },

            // Sincronizar datos
            'sync_data': async (socket, data) => {
                const { channels, lastSyncTime } = data;

                const syncData = {};
                for (const channel of channels) {
                    if (this.hasChannelPermission(socket, channel)) {
                        syncData[channel] = await this.getSyncData(channel, lastSyncTime);
                    }
                }

                socket.emit('data_synced', {
                    syncData,
                    syncTime: new Date().toISOString()
                });
            }
        };

        socketManager.registerEventHandlers(events);
    }

    /**
     * Suscribir usuario a un canal de datos
     */
    subscribeUserToChannel(userId, channel) {
        // Agregar a suscripciones del usuario
        if (!this.subscriptions.has(userId)) {
            this.subscriptions.set(userId, new Set());
        }
        this.subscriptions.get(userId).add(channel);

        // Agregar a canal de datos
        if (!this.dataChannels.has(channel)) {
            this.dataChannels.set(channel, new Set());
        }
        this.dataChannels.get(channel).add(userId);

        console.log(`📊 Usuario ${userId} suscrito al canal: ${channel}`);
    }

    /**
     * Desuscribir usuario de un canal
     */
    unsubscribeUserFromChannel(userId, channel) {
        // Remover de suscripciones del usuario
        if (this.subscriptions.has(userId)) {
            this.subscriptions.get(userId).delete(channel);
            if (this.subscriptions.get(userId).size == 0) {
                this.subscriptions.delete(userId);
            }
        }

        // Remover de canal de datos
        if (this.dataChannels.has(channel)) {
            this.dataChannels.get(channel).delete(userId);
            if (this.dataChannels.get(channel).size == 0) {
                this.dataChannels.delete(channel);
            }
        }

        console.log(`📊 Usuario ${userId} desuscrito del canal: ${channel}`);
    }

    /**
     * Verificar si el usuario tiene permisos para un canal
     */
    hasChannelPermission(socket, channel) {
        const channelPermissions = {
            'users': ['users.read'],
            'roles': ['roles.read'],
            'permissions': ['permissions.read'],
            'documents': ['documents.read'],
            'system': ['system.read'],
            'admin': ['admin.read']
        };

        const requiredPermissions = channelPermissions[channel] || [];
        return requiredPermissions.every(permission =>
            socket.userPermissions.includes(permission)
        );
    }

    /**
     * Verificar si el usuario tiene permisos para actualizar un canal
     */
    hasUpdatePermission(socket, channel) {
        const updatePermissions = {
            'users': ['users.update'],
            'roles': ['roles.update'],
            'permissions': ['permissions.update'],
            'documents': ['documents.update'],
            'system': ['system.update'],
            'admin': ['admin.update']
        };

        const requiredPermissions = updatePermissions[channel] || [];
        return requiredPermissions.every(permission =>
            socket.userPermissions.includes(permission)
        );
    }

    /**
     * Obtener datos de un canal
     */
    async getChannelData(channel, filters = {}) {
        // Aquí implementarías la lógica para obtener datos según el canal
        switch (channel) {
            case 'users':
                return this.getUsersData(filters);
            case 'roles':
                return this.getRolesData(filters);
            case 'permissions':
                return this.getPermissionsData(filters);
            case 'documents':
                return this.getDocumentsData(filters);
            case 'system':
                return this.getSystemData(filters);
            default:
                return { message: 'Canal no encontrado' };
        }
    }

    /**
     * Obtener datos de sincronización
     */
    async getSyncData(channel, lastSyncTime) {
        // Implementar lógica para obtener solo datos modificados después de lastSyncTime
        const allData = await this.getChannelData(channel);

        // Filtrar por fecha de modificación (esto depende de tu modelo de datos)
        if (lastSyncTime) {
            const syncTime = new Date(lastSyncTime);
            // Filtrar datos modificados después de syncTime
            // return allData.filter(item => new Date(item.updated_at) > syncTime);
        }

        return allData;
    }

    /**
     * Enviar actualización de datos a un usuario específico
     */
    sendDataUpdate(userId, channel, updateData) {
        const sent = socketManager.sendToUser(userId, 'data_update', {
            channel,
            data: updateData,
            timestamp: new Date().toISOString()
        });

        if (sent) {
            console.log(`📊 Actualización enviada a usuario ${userId} en canal ${channel}`);
        }
    }

    /**
     * Broadcast actualización de datos a todos los suscriptores de un canal
     */
    broadcastDataUpdate(channel, updateData) {
        const subscribers = this.dataChannels.get(channel);
        if (subscribers) {
            subscribers.forEach(userId => {
                this.sendDataUpdate(userId, channel, updateData);
            });
            console.log(`📊 Actualización broadcast a ${subscribers.size} usuarios en canal ${channel}`);
        }
    }

    /**
     * Métodos para obtener datos específicos (implementar según tu modelo)
     */
    async getUsersData(filters) {
        // Implementar consulta a BD para usuarios
        return { users: [], timestamp: new Date().toISOString() };
    }

    async getRolesData(filters) {
        // Implementar consulta a BD para roles
        return { roles: [], timestamp: new Date().toISOString() };
    }

    async getPermissionsData(filters) {
        // Implementar consulta a BD para permisos
        return { permissions: [], timestamp: new Date().toISOString() };
    }

    async getDocumentsData(filters) {
        // Implementar consulta a BD para documentos
        return { documents: [], timestamp: new Date().toISOString() };
    }

    async getSystemData(filters) {
        // Implementar datos del sistema
        return {
            stats: socketManager.getStats(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Métodos de conveniencia para tipos específicos de actualizaciones
     */

    // Notificar cambio en usuario
    async notifyUserChange(userId, changeType, userData) {
        this.broadcastDataUpdate('users', {
            type: 'user_change',
            changeType, // 'created', 'updated', 'deleted'
            userId,
            data: userData
        });
    }

    // Notificar cambio en rol
    async notifyRoleChange(roleId, changeType, roleData) {
        this.broadcastDataUpdate('roles', {
            type: 'role_change',
            changeType,
            roleId,
            data: roleData
        });
    }

    // Notificar cambio en permisos
    async notifyPermissionChange(permissionId, changeType, permissionData) {
        this.broadcastDataUpdate('permissions', {
            type: 'permission_change',
            changeType,
            permissionId,
            data: permissionData
        });
    }

    // Notificar cambio en documento
    async notifyDocumentChange(documentId, changeType, documentData) {
        this.broadcastDataUpdate('documents', {
            type: 'document_change',
            changeType,
            documentId,
            data: documentData
        });
    }

    /**
     * Limpiar suscripciones de usuario desconectado
     */
    cleanupUserSubscriptions(userId) {
        const userChannels = this.subscriptions.get(userId);
        if (userChannels) {
            userChannels.forEach(channel => {
                this.unsubscribeUserFromChannel(userId, channel);
            });
        }
    }

    /**
     * Obtener estadísticas de tiempo real
     */
    getRealtimeStats() {
        return {
            totalSubscriptions: this.subscriptions.size,
            totalChannels: this.dataChannels.size,
            channelStats: Array.from(this.dataChannels.entries()).map(([channel, users]) => ({
                channel,
                subscriberCount: users.size
            }))
        };
    }
}

export default new RealtimeHandler(); 