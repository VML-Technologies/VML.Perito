import { useState, useCallback } from 'react';

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
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'inspeccion_aprobada',
            title: "Inspección Aprobada",
            description: "La orden de inspección 1234567890 ha sido aprobada",
            time: "Hace 5 minutos",
            read: false,
            appointment_id: null,
            inspection_order_id: 1234567890
        },
        {
            id: 2,
            type: 'inspeccion_rechazada',
            title: "Inspección Rechazada",
            description: "La orden de inspección 1234567890 ha sido rechazada",
            time: "Hace 1 hora",
            read: false,
            appointment_id: null,
            inspection_order_id: 1234567890
        },
        {
            id: 3,
            type: 'inspeccion_en_curso',
            title: "Inspección en curso",
            description: "La orden de inspección 1234567890 ha sido iniciada",
            time: "Hace 2 horas",
            read: true,
            appointment_id: null,
            inspection_order_id: 1234567890
        },
        {
            id: 4,
            type: 'inspeccion_agendada',
            title: "Inspección agendada",
            description: "La orden de inspección 1234567890 ha sido agendada",
            time: "Hace 3 horas",
            read: false,
            appointment_id: 456,
            inspection_order_id: 1234567890
        }
    ]);

    const [toast, setToast] = useState(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Mostrar toast
    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
    }, []);

    // Ocultar toast
    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    // Marcar notificación como leída
    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        showToast('Todas las notificaciones marcadas como leídas', 'success');
    }, [showToast]);

    // Manejar click en notificación
    const handleNotificationClick = useCallback((notification) => {
        // Marcar como leída
        markAsRead(notification.id);

        // Obtener la acción correspondiente al tipo de notificación
        const action = NOTIFICATION_ACTIONS[notification.type];

        if (!action) {
            console.warn(`No se encontró acción para el tipo de notificación: ${notification.type}`);
            showToast('Acción no disponible para este tipo de notificación', 'warning');
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

    return {
        notifications,
        unreadCount,
        toast,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        addNotification,
        removeNotification,
        showToast,
        hideToast
    };
} 