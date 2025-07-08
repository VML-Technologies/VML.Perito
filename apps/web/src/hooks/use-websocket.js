import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/auth-context';
import { useNotificationContext } from '@/contexts/notification-context';

export const useWebSocket = () => {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useNotificationContext();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 segundos

    const connect = () => {
        if (!isAuthenticated || !user) {
            console.log('❌ No se puede conectar WebSocket: usuario no autenticado');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.warn('❌ No hay token disponible para WebSocket');
                return;
            }

            console.log('🔌 Conectando Socket.IO...', {
                userId: user.id,
                userName: user.name,
                url: 'http://192.168.20.6:3000'
            });

            setConnectionStatus('connecting');

            // Crear conexión Socket.IO
            socketRef.current = io('http://192.168.20.6:3000', {
                auth: {
                    token: token
                },
                query: {
                    userId: user.id
                },
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
                reconnectionDelay: reconnectDelay
            });

            // Eventos de conexión
            socketRef.current.on('connect', () => {
                console.log('✅ Socket.IO conectado exitosamente');
                console.log('🔗 Socket ID:', socketRef.current.id);
                console.log('👤 Usuario conectado:', user.name, user.id);
                setIsConnected(true);
                setConnectionStatus('connected');
                setReconnectAttempts(0);
            });

            socketRef.current.on('connected', (data) => {
                console.log('🎉 Confirmación de conexión del servidor:', data);
                console.log('👤 Usuario que se conectó:', {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles?.map(r => r.name)
                });
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('🔌 Socket.IO desconectado:', reason);
                setIsConnected(false);
                setConnectionStatus('disconnected');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('❌ Error de conexión Socket.IO:', error.message);
                setIsConnected(false);
                setConnectionStatus('error');
                setReconnectAttempts(prev => prev + 1);
            });

            socketRef.current.on('reconnect', (attemptNumber) => {
                console.log(`🔄 Socket.IO reconectado después de ${attemptNumber} intentos`);
                setReconnectAttempts(0);
            });

            socketRef.current.on('reconnect_attempt', (attemptNumber) => {
                console.log(`🔄 Intento de reconexión ${attemptNumber}/${maxReconnectAttempts}`);
                setConnectionStatus('reconnecting');
            });

            socketRef.current.on('reconnect_failed', () => {
                console.error('❌ Falló la reconexión Socket.IO');
                setConnectionStatus('failed');
            });

            // Eventos de aplicación
            socketRef.current.on('order_assigned', handleOrderAssigned);
            socketRef.current.on('order_removed', handleOrderRemoved);
            socketRef.current.on('order_updated', handleOrderUpdated);
            socketRef.current.on('notification', handleNotification);
            socketRef.current.on('test_message', handleTestMessage);



            // Evento para capturar TODOS los mensajes (debugging)
            socketRef.current.onAny((eventName, ...args) => {
                console.log(`📨 Evento WebSocket recibido: ${eventName}`, args);
                if (eventName === 'order_assigned') {
                    console.log('🎯 ¡Evento order_assigned detectado!', args);
                } else if (eventName === 'order_removed') {
                    console.log('🗑️ ¡Evento order_removed detectado!', args);
                } else if (eventName.includes('order')) {
                    console.log('📋 Evento relacionado con orden:', eventName, args);
                }
            });

            // Evento de error general
            socketRef.current.on('error', (error) => {
                console.error('❌ Error Socket.IO:', error);
                if (error.message) {
                    showToast(`Error de conexión: ${error.message}`, 'error', 5000);
                }
            });

        } catch (error) {
            console.error('❌ Error al crear conexión Socket.IO:', error);
            setConnectionStatus('error');
        }
    };

    const handleOrderAssigned = (data) => {
        console.log('🎯 Orden asignada recibida en WebSocket:', data);

        const { order, message, type } = data;

        // Determinar el tipo de notificación basado en el tipo
        let toastType = 'success';
        let toastMessage = message || 'Nueva orden asignada';

        if (type === 'reasignacion_orden') {
            toastType = 'info';
            toastMessage = message || 'Orden reasignada';
        } else if (type === 'asignacion_orden') {
            toastType = 'success';
            toastMessage = message || 'Nueva orden asignada';
        }

        // Mostrar notificación toast
        showToast(toastMessage, toastType, 5000);

        // Emitir evento personalizado para que otros componentes puedan escuchar
        window.dispatchEvent(new CustomEvent('orderAssigned', {
            detail: { order, message, type, data }
        }));

        // También mostrar en consola para debugging
        console.log('📢 Evento orderAssigned emitido:', { order, message, type, data });
    };

    const handleOrderRemoved = (data) => {
        console.log('🗑️ Orden removida recibida en WebSocket:', data);

        const { order, message, type } = data;

        // Mostrar notificación toast de advertencia
        const toastMessage = message || 'Orden removida de tu asignación';
        showToast(toastMessage, 'warning', 5000);

        // Emitir evento personalizado para que otros componentes puedan escuchar
        window.dispatchEvent(new CustomEvent('orderRemoved', {
            detail: { order, message, type, data }
        }));

        // También mostrar en consola para debugging
        console.log('📢 Evento orderRemoved emitido:', { order, message, type, data });
    };

    const handleOrderUpdated = (data) => {
        console.log('📝 Orden actualizada recibida:', data);

        // Emitir evento personalizado
        window.dispatchEvent(new CustomEvent('orderUpdated', {
            detail: data
        }));
    };

    const handleNotification = (data) => {
        console.log('🔔 Notificación recibida:', data);

        const { title, message, type = 'info' } = data;
        showToast(title || message, type, 5000);
    };

    const handleTestMessage = (data) => {
        console.log('🧪 Mensaje de prueba recibido:', data);
        showToast(`Prueba WebSocket: ${data.message}`, 'info', 3000);
    };

    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (socketRef.current) {
            console.log('🔌 Desconectando Socket.IO...');
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
        setReconnectAttempts(0);
    };

    const sendMessage = (event, data) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data);
            return true;
        }
        console.warn('❌ No se puede enviar mensaje: Socket.IO no conectado');
        return false;
    };

    // Conectar cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated && user) {
            connect();
        } else {
            disconnect();
        }

        // Cleanup al desmontar
        return () => {
            disconnect();
        };
    }, [isAuthenticated, user]);

    return {
        isConnected,
        connectionStatus,
        reconnectAttempts,
        connect,
        disconnect,
        sendMessage
    };
}; 