import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const INSPECTYA_BASE_URL = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;

export const useInspectionQueueWebSocket = (hash = null) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [queueStatus, setQueueStatus] = useState(null);
    const [error, setError] = useState(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    // Función para conectar WebSocket
    const connect = useCallback(() => {
        if (socket) {
            socket.disconnect();
        }

        // Configuración para conexión pública sin autenticación
        const newSocket = io(WS_BASE_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 20000,
            // No incluir auth para conexión pública
            auth: {
                public: true,
                hash: hash
            }
        });

        newSocket.on('connect', () => {
            console.log('🔌 WebSocket conectado para cola de inspecciones');
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;

            // Unirse a la sala específica si hay hash
            if (hash) {
                newSocket.emit('joinInspectionQueue', { hash });
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 WebSocket desconectado:', reason);
            setIsConnected(false);

            // Intentar reconectar si no fue una desconexión intencional
            if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                console.log(`🔄 Intento de reconexión ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 2000);
            }
        });

        newSocket.on('queueStatusUpdate', (data) => {
            console.log('📊 Actualización de estado de cola recibida:', data);
            if (data.data) {
                setQueueStatus(data.data);
            }
        });

        newSocket.on('inspectorAssigned', (data) => {
            console.log('👨‍🔧 Inspector asignado recibido:', data);
            if (data.data) {
                // Actualizar el estado con la información del inspector
                const newStatus = {
                    ...data.data,
                    inspector: data.data.inspector,
                    estado: data.data.status
                };
                console.log('🔄 Actualizando estado con inspector:', newStatus);
                setQueueStatus(newStatus);
            }
        });

        newSocket.on('error', (error) => {
            console.error('❌ Error en WebSocket de cola de inspecciones:', error);
            setError(error.message || 'Error de conexión');
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error);
            setError('Error al conectar con el servidor');
        });

        setSocket(newSocket);
    }, [hash]);

    // Función para desconectar WebSocket
    const disconnect = useCallback(() => {
        if (socket) {
            if (hash) {
                socket.emit('leaveInspectionQueue', { hash });
            }
            socket.disconnect();
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
    }, [socket, hash]);

    // Función para unirse a una sala específica
    const joinQueue = useCallback((queueHash) => {
        if (socket && socket.connected) {
            socket.emit('joinInspectionQueue', { hash: queueHash });
        }
    }, [socket]);

    // Función para salir de una sala específica
    const leaveQueue = useCallback((queueHash) => {
        if (socket && socket.connected) {
            socket.emit('leaveInspectionQueue', { hash: queueHash });
        }
    }, [socket]);

    // Función para enviar ping
    const ping = useCallback(() => {
        if (socket && socket.connected) {
            socket.emit('ping');
        }
    }, [socket]);

    // Efecto para conectar/desconectar
    useEffect(() => {
        if (hash) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [hash]); // Solo depender del hash, no de las funciones

    // Efecto de limpieza al desmontar
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        socket,
        isConnected,
        queueStatus,
        error,
        connect,
        disconnect,
        joinQueue,
        leaveQueue,
        ping
    };
};

export const useCoordinatorWebSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [coordinatorData, setCoordinatorData] = useState(null);
    const [error, setError] = useState(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    // Función para conectar WebSocket
    const connect = useCallback(() => {
        if (socket) {
            socket.disconnect();
        }

        const newSocket = io(WS_BASE_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 20000,
            auth: {
                token: localStorage.getItem('authToken')
            }
        });

        newSocket.on('connect', () => {
            console.log('🔌 WebSocket conectado como coordinador');
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;

            // Unirse a la sala del coordinador
            newSocket.emit('joinCoordinatorRoom');
            
            // Solicitar datos iniciales
            setTimeout(() => {
                newSocket.emit('requestCoordinatorData', { 
                    filters: { estado: 'en_cola' },
                    includeStats: true 
                });
            }, 1000);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 WebSocket desconectado:', reason);
            setIsConnected(false);

            // Intentar reconectar si no fue una desconexión intencional
            if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                console.log(`🔄 Intento de reconexión ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 2000);
            }
        });

        newSocket.on('coordinatorData', (data) => {
            console.log('📊 Datos del coordinador recibidos:', data);
            setCoordinatorData(data);
        });

        newSocket.on('newQueueEntry', (data) => {
            console.log('🆕 Nueva entrada en cola:', data);
            // Solicitar datos actualizados
            newSocket.emit('requestCoordinatorData', { 
                filters: { estado: 'en_cola' },
                includeStats: true 
            });
        });

        newSocket.on('queueStatusUpdated', (data) => {
            console.log('🔄 Estado de cola actualizado:', data);
            // Solicitar datos actualizados
            newSocket.emit('requestCoordinatorData', { 
                filters: { estado: 'en_cola' },
                includeStats: true 
            });
        });

        // Evento de inicio de inspección
        newSocket.on('inspectionStarted', (data) => {
            console.log('🚀 Inspección iniciada:', data);
            const sessionId = data?.session_id || data?.sessionId;
            if (sessionId) {
                const url = `${INSPECTYA_BASE_URL}/inspection/${sessionId}`;
                window.location.href = url;
            } else if (data?.redirect_url) {
                window.location.href = data.redirect_url;
            }
        });

        newSocket.on('inspectionAddedToQueue', (data) => {
            console.log('🆕 Inspección agregada a cola:', data);
            // Solicitar datos actualizados
            newSocket.emit('requestCoordinatorData', { 
                filters: { estado: 'en_cola' },
                includeStats: true 
            });
        });

        // Evento de agendamiento en sede creado
        newSocket.on('sedeAppointmentCreated', (data) => {
            console.log('🏢 Nuevo agendamiento en sede creado:', data);
            // Actualizar los datos del coordinador con los nuevos agendamientos
            if (data.allSedeAppointments) {
                setCoordinatorData(prevData => ({
                    ...prevData,
                    sedeAppointments: data.allSedeAppointments
                }));
            }
        });

        newSocket.on('inspectionQueueStatusUpdated', (data) => {
            console.log('🔄 Estado de inspección actualizado:', data);
            // Solicitar datos actualizados
            newSocket.emit('requestCoordinatorData', { 
                filters: { estado: 'en_cola' },
                includeStats: true 
            });
        });

        newSocket.on('queueStats', (data) => {
            console.log('📊 Estadísticas actualizadas:', data);
        });

        // Evento para recibir lista de inspectores
        newSocket.on('inspectorsList', (data) => {
            console.log('👥 Lista de inspectores recibida:', data);
            // Este evento se manejará en el componente que lo necesite
        });

        // Evento para recibir lista de sedes CDA
        newSocket.on('sedesCDAList', (data) => {
            console.log('🏢 Lista de sedes CDA recibida:', data);
            // Este evento se manejará en el componente que lo necesite
        });

        newSocket.on('error', (error) => {
            console.error('❌ Error en WebSocket del coordinador:', error);
            setError(error.message || 'Error de conexión');
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error);
            setError('Error al conectar con el servidor');
        });

        setSocket(newSocket);
    }, []);

    // Función para desconectar WebSocket
    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
    }, [socket]);

    // Función para solicitar datos actualizados
    const requestData = useCallback((filters = {}) => {
        if (socket && socket.connected) {
            socket.emit('requestCoordinatorData', { filters });
        }
    }, [socket]);

    // Función para actualizar estado de la cola
    const updateQueueStatus = useCallback((id, estado, inspectorId = null, observaciones = null) => {
        if (socket && socket.connected) {
            socket.emit('updateQueueStatus', {
                id,
                estado,
                inspector_asignado_id: inspectorId,
                observaciones
            });
        }
    }, [socket]);

    // Función para solicitar estadísticas
    const requestStats = useCallback(() => {
        if (socket && socket.connected) {
            socket.emit('requestQueueStats');
        }
    }, [socket]);

    // Función para solicitar lista de inspectores
    const requestInspectors = useCallback(() => {
        if (socket && socket.connected) {
            socket.emit('getInspectors');
        }
    }, [socket]);

    // Función para solicitar lista de sedes CDA
    const requestSedesCDA = useCallback(() => {
        if (socket && socket.connected) {
            socket.emit('getSedesCDA');
        }
    }, [socket]);

    // Efecto para conectar/desconectar
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, []); // Solo ejecutar una vez al montar el componente

    // Efecto de limpieza al desmontar
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []); // Solo ejecutar una vez al montar el componente

    return {
        socket,
        isConnected,
        coordinatorData,
        error,
        connect,
        disconnect,
        requestData,
        updateQueueStatus,
        requestStats,
        requestInspectors,
        requestSedesCDA
    };
};
