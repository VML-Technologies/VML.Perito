import { useState, useCallback, useEffect } from 'react';
import { API_ROUTES } from '@/config/api';

// Tipos de notificaciones y sus acciones correspondientes
const NOTIFICATION_ACTIONS = {
    'agendamiento_confirmacion': {
        action: 'navigate_to_appointment',
        route: '/appointments',
        params: 'appointment_id',
        toastMessage: 'Navegando a la cita...'
    },
    'agendamiento_recordatorio': {
        action: 'navigate_to_appointment',
        route: '/appointments',
        params: 'appointment_id',
        toastMessage: 'Navegando a la cita...'
    },
    'inspeccion_aprobada': {
        action: 'navigate_to_inspection',
        route: '/inspections',
        params: 'inspection_order_id',
        toastMessage: 'Navegando a la inspección aprobada...'
    },
    'inspeccion_rechazada': {
        action: 'navigate_to_inspection',
        route: '/inspections',
        params: 'inspection_order_id',
        toastMessage: 'Navegando a la inspección rechazada...'
    },
    'inspeccion_en_curso': {
        action: 'navigate_to_inspection',
        route: '/inspections',
        params: 'inspection_order_id',
        toastMessage: 'Navegando a la inspección en curso...'
    },
    'inspeccion_agendada': {
        action: 'navigate_to_appointment',
        route: '/appointments',
        params: 'appointment_id',
        toastMessage: 'Navegando a la cita agendada...'
    }
};

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Cargar notificaciones desde la API
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            console.log('Cargando notificaciones');
            const token = localStorage.getItem('authToken');

            if (!token) {
                setNotifications([]);
                return;
            }

            const response = await fetch(API_ROUTES.NOTIFICATIONS.GET_USER_NOTIFICATIONS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.data.notifications || []);
                } else {
                    console.error('Error cargando notificaciones:', data.message);
                    setNotifications([]);
                }
            } else {
                console.error('Error en la respuesta:', response.status);
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Mostrar toast
    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });

        // Auto-hide después de 5 segundos
        setTimeout(() => {
            setToast(null);
        }, 5000);
    }, []);

    // Ocultar toast
    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Actualizar notificaciones cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 segundos

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Escuchar eventos de WebSocket para actualizaciones en tiempo real
    useEffect(() => {
        const handleNewNotification = (event) => {
            console.log('🔔 Nueva notificación recibida via WebSocket:', event.detail);
            // Recargar notificaciones inmediatamente
            fetchNotifications();
            showToast('Nueva notificación recibida', 'info');
        };

        const handleOrderAssigned = (event) => {
            console.log('🎯 Orden asignada - actualizando notificaciones:', event.detail);
            // Recargar notificaciones cuando se asigna una orden
            fetchNotifications();
        };

        // Registrar listeners para eventos de WebSocket
        window.addEventListener('newNotification', handleNewNotification);
        window.addEventListener('orderAssigned', handleOrderAssigned);
        window.addEventListener('orderRemoved', handleOrderAssigned);

        return () => {
            window.removeEventListener('newNotification', handleNewNotification);
            window.removeEventListener('orderAssigned', handleOrderAssigned);
            window.removeEventListener('orderRemoved', handleOrderAssigned);
        };
    }, [fetchNotifications, showToast]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Marcar notificación como leída
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.NOTIFICATIONS.MARK_AS_READ(notificationId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id == notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                );
            } else {
                console.error('Error marcando notificación como leída');
                showToast('Error al marcar notificación como leída', 'error');
            }
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            showToast('Error al marcar notificación como leída', 'error');
        }
    }, [showToast]);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.NOTIFICATIONS.MARK_ALL_AS_READ, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, read: true }))
                );
                showToast('Todas las notificaciones marcadas como leídas', 'success');
            } else {
                console.error('Error marcando todas como leídas');
                showToast('Error al marcar todas las notificaciones como leídas', 'error');
            }
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
            showToast('Error al marcar todas las notificaciones como leídas', 'error');
        }
    }, [showToast]);

    // Manejar click en notificación
    const handleNotificationClick = useCallback((notification) => {
        // Marcar como leída
        markAsRead(notification.id);

        // Obtener la acción correspondiente al tipo de notificación
        const action = NOTIFICATION_ACTIONS[notification.type];

        if (!action) {
            console.warn(`No se encontró acción para el tipo de notificación: ${notification.type}`);
            showToast(`Notificación: ${notification.title || 'Sin título'}`, 'info');
            return;
        }

        // Mostrar toast de acción
        showToast(action.toastMessage, 'info');

        // Ejecutar la acción correspondiente
        switch (action.action) {
            case 'navigate_to_appointment':
                if (notification.appointment_id) {
                    console.log(`Navegando a cita: ${notification.appointment_id}`);
                    // Aquí iría la navegación real usando React Router
                    // navigate(`${action.route}/${notification.appointment_id}`);

                    // Simular navegación exitosa
                    setTimeout(() => {
                        showToast(`Cita ${notification.appointment_id} cargada correctamente`, 'success');
                    }, 1000);
                } else {
                    showToast('No se encontró información de la cita', 'error');
                }
                break;

            case 'navigate_to_inspection':
                if (notification.inspection_order_id) {
                    console.log(`Navegando a inspección: ${notification.inspection_order_id}`);
                    // Aquí iría la navegación real usando React Router
                    // navigate(`${action.route}/${notification.inspection_order_id}`);

                    // Simular navegación exitosa
                    setTimeout(() => {
                        showToast(`Inspección ${notification.inspection_order_id} cargada correctamente`, 'success');
                    }, 1000);
                } else {
                    showToast('No se encontró información de la inspección', 'error');
                }
                break;

            default:
                console.warn(`Acción no implementada: ${action.action}`);
                showToast('Acción no implementada', 'error');
        }
    }, [markAsRead, showToast]);

    // Agregar nueva notificación
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        showToast('Nueva notificación recibida', 'info');
    }, [showToast]);

    // Eliminar notificación
    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        showToast('Notificación eliminada', 'success');
    }, [showToast]);

    // Recargar notificaciones
    const refreshNotifications = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        toast,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        addNotification,
        removeNotification,
        refreshNotifications,
        showToast,
        hideToast
    };
} 