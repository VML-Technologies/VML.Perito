/**
 * Utilidades para tracking de eventos con Matomo Analytics
 * Sistema de analytics para Movilidad Mundial
 */

// Función base para trackear eventos
export const trackEvent = (eventName, eventData = {}) => {
    if (window._mtm) {
        window._mtm.push({
            'event': eventName,
            ...eventData,
            timestamp: new Date().toISOString()
        });
        console.log(`📊 Evento trackeado: ${eventName}`, eventData);
    } else {
        console.warn('⚠️ Matomo no está disponible para trackear:', eventName);
    }
};

// Función para trackear vistas de página
export const trackPageView = (pageName, pageUrl = window.location.pathname) => {
    if (window._mtm) {
        window._mtm.push({
            'event': 'pageView',
            page: pageName,
            url: pageUrl,
            timestamp: new Date().toISOString()
        });
        console.log(`📊 Página trackeada: ${pageName} (${pageUrl})`);
    }
};

// Eventos específicos del sistema Movilidad Mundial
export const analytics = {
    // === EVENTOS DE NAVEGACIÓN ===
    pageView: (pageName, pageUrl) => trackPageView(pageName, pageUrl),
    
    // === EVENTOS DE ÓRDENES DE INSPECCIÓN ===
    orderAssigned: (order) => trackEvent('orderAssigned', {
        orderNumber: order.numero,
        orderId: order.id,
        agentId: order.agent_id,
        clientType: order.tipo_cliente,
        vehicleType: order.tipo_vehiculo
    }),
    
    orderRemoved: (order) => trackEvent('orderRemoved', {
        orderNumber: order.numero,
        orderId: order.id
    }),
    
    orderCreated: (order) => trackEvent('orderCreated', {
        orderNumber: order.numero,
        clientType: order.tipo_cliente,
        vehicleType: order.tipo_vehiculo,
        sede: order.sede_nombre
    }),
    
    orderStatusChanged: (order, oldStatus, newStatus) => trackEvent('orderStatusChanged', {
        orderNumber: order.numero,
        orderId: order.id,
        oldStatus,
        newStatus
    }),
    
    // === EVENTOS DE LLAMADAS ===
    callLogged: (orderNumber, status, callType = 'outbound') => trackEvent('callLogged', {
        orderNumber,
        status,
        callType
    }),
    
    callAttempted: (orderNumber, attemptNumber) => trackEvent('callAttempted', {
        orderNumber,
        attemptNumber
    }),
    
    // === EVENTOS DE AGENDAMIENTO ===
    appointmentScheduled: (orderNumber, appointmentData) => trackEvent('appointmentScheduled', {
        orderNumber,
        sede: appointmentData.sede,
        modalidad: appointmentData.modalidad,
        fecha: appointmentData.fecha,
        hora: appointmentData.hora
    }),
    
    appointmentCancelled: (orderNumber, reason) => trackEvent('appointmentCancelled', {
        orderNumber,
        reason
    }),
    
    appointmentRescheduled: (orderNumber, oldDate, newDate) => trackEvent('appointmentRescheduled', {
        orderNumber,
        oldDate,
        newDate
    }),
    
    // === EVENTOS DE USUARIOS ===
    userLogin: (userId, userRole) => trackEvent('userLogin', {
        userId,
        userRole
    }),
    
    userLogout: (userId) => trackEvent('userLogout', {
        userId
    }),
    
    // === EVENTOS DE SISTEMA ===
    systemError: (error, context) => trackEvent('systemError', {
        error: error.message || error,
        context,
        stack: error.stack
    }),
    
    // === EVENTOS DE CONTACT CENTER ===
    agentAssigned: (agentId, orderCount) => trackEvent('agentAssigned', {
        agentId,
        orderCount
    }),
    
    coordinatorAction: (action, details) => trackEvent('coordinatorAction', {
        action,
        ...details
    }),
    
    // === EVENTOS DE BÚSQUEDA ===
    searchPerformed: (searchTerm, resultsCount, searchType) => trackEvent('searchPerformed', {
        searchTerm,
        resultsCount,
        searchType
    }),
    
    // === EVENTOS DE FILTROS ===
    filterApplied: (filterType, filterValue) => trackEvent('filterApplied', {
        filterType,
        filterValue
    }),
    
    // === EVENTOS DE EXPORTACIÓN ===
    dataExported: (exportType, recordCount) => trackEvent('dataExported', {
        exportType,
        recordCount
    })
};

// Mapeo de rutas a nombres de página para tracking
export const pageNames = {
    '/dashboard': 'Dashboard',
    '/admin': 'Administración RBAC',
    '/comercial-mundial': 'Comercial Mundial',
    '/agente-contacto': 'Agente Contact Center',
    '/coordinador-contacto': 'Coordinador Contact Center',
    '/profile': 'Perfil de Usuario',
    '/notification-templates': 'Plantillas de Notificación',
    '/channel-configurations': 'Configuración de Canales',
    '/notification-admin': 'Administración de Notificaciones',
    '/checkinspectionorder': 'Consulta de Órdenes',
    '/login': 'Inicio de Sesión',
    '/forgot-password': 'Recuperar Contraseña',
    '/reset-password': 'Restablecer Contraseña',
    '/forced-password-change': 'Cambio de Contraseña Forzado'
};

// Función para obtener el nombre de página basado en la ruta
export const getPageName = (pathname) => {
    // Buscar coincidencia exacta primero
    if (pageNames[pathname]) {
        return pageNames[pathname];
    }
    
    // Buscar coincidencias con parámetros (ej: /inspection-report/:id)
    for (const [route, name] of Object.entries(pageNames)) {
        if (route.includes(':')) {
            const routePattern = route.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${routePattern}$`);
            if (regex.test(pathname)) {
                return name;
            }
        }
    }
    
    // Si no encuentra coincidencia, usar el pathname
    return pathname;
};

