// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Forzar recarga del cache
console.log('🔄 API Routes cargadas - Timestamp:', new Date().toISOString());

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        VERIFY: `${API_BASE_URL}/api/auth/verify`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        CHANGE_TEMPORARY_PASSWORD: `${API_BASE_URL}/api/auth/change-temporary-password`,
        CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    },
    USERS: {
        PROFILE: `${API_BASE_URL}/api/users/profile`,
        LIST: `${API_BASE_URL}/api/users`,
        WITH_ROLES: `${API_BASE_URL}/api/users/with-roles`,
        ASSIGN_ROLES: (userId) => `${API_BASE_URL}/api/users/${userId}/roles`,
        GET_ROLES: (userId) => `${API_BASE_URL}/api/users/${userId}/roles`,
    },
    DOCUMENTS: {
        LIST: `${API_BASE_URL}/api/documents`,
        CREATE: `${API_BASE_URL}/api/documents`,
        UPDATE: (id) => `${API_BASE_URL}/api/documents/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/documents/${id}`,
    },
    PERMISSIONS: {
        LIST: `${API_BASE_URL}/api/permissions`,
    },
    ROLES: {
        LIST: `${API_BASE_URL}/api/roles`,
        CREATE: `${API_BASE_URL}/api/roles`,
        UPDATE: (id) => `${API_BASE_URL}/api/roles/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/roles/${id}`,
        ASSIGN_PERMISSIONS: (id) => `${API_BASE_URL}/api/roles/${id}/permissions`,
        GET_PERMISSIONS: (id) => `${API_BASE_URL}/api/roles/${id}/permissions`,
    },
    RBAC: {
        BULK_ASSIGNMENTS: `${API_BASE_URL}/api/rbac/bulk-assignments`,
    },
    // ===== RUTAS UNIFICADAS - ÓRDENES DE INSPECCIÓN =====
    INSPECTION_ORDERS: {
        LIST: `${API_BASE_URL}/api/inspection-orders`,
        STATS: `${API_BASE_URL}/api/inspection-orders/stats`,
        SEARCH: `${API_BASE_URL}/api/inspection-orders/search`,
        GET: (id) => `${API_BASE_URL}/api/inspection-orders/${id}`,
        CREATE: `${API_BASE_URL}/api/inspection-orders`,
        UPDATE: (id) => `${API_BASE_URL}/api/inspection-orders/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/inspection-orders/${id}`,
        
        // ===== HISTORIAL DE CONTACTOS =====
        CONTACT_HISTORY: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/contact-history`,
        UPDATE_CONTACT: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/contact-data`,
        
        // ===== COMENTARIOS =====
        COMMENTS: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments`,
        CREATE_COMMENT: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments`,
        GET_COMMENT: (orderId, commentId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments/${commentId}`,
    },
    // ===== RUTAS DE HISTORIAL DE ÓRDENES =====
    ORDER_HISTORY: {
        CONTACT_HISTORY: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/contact-history`,
        UPDATE_CONTACT: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/contact-data`,
        COMMENTS: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments`,
        CREATE_COMMENT: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments`,
        GET_COMMENT: (orderId, commentId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments/${commentId}`,
        STATS: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/comments-stats`,
        ACTIVITY_LOG: (orderId) => `${API_BASE_URL}/api/inspection-orders/${orderId}/activity-log`,
    },
    // ===== RUTAS DE SEDES =====
    SEDES: {
        LIST: `${API_BASE_URL}/api/sedes`,
        GET: (id) => `${API_BASE_URL}/api/sedes/${id}`,
        CREATE: `${API_BASE_URL}/api/sedes`,
        UPDATE: (id) => `${API_BASE_URL}/api/sedes/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/sedes/${id}`,
        BY_COMPANY: (companyId) => `${API_BASE_URL}/api/companies/${companyId}/sedes`,
    },
    // ===== RUTAS - Agente de Contact =====
    CONTACT_AGENT: {
        ORDER_DETAILS: (id) => `${API_BASE_URL}/api/contact-agent/orders/${id}`,
        CALL_LOGS: `${API_BASE_URL}/api/contact-agent/call-logs`,
        CALL_STATUSES: `${API_BASE_URL}/api/contact-agent/call-statuses`,
        APPOINTMENTS: `${API_BASE_URL}/api/contact-agent/appointments`,
        DEPARTMENTS: `${API_BASE_URL}/api/contact-agent/departments`,
        CITIES: (departmentId) => `${API_BASE_URL}/api/contact-agent/cities/${departmentId}`,
        SEDES: (cityId) => `${API_BASE_URL}/api/contact-agent/sedes/${cityId}`,
        MODALITIES: `${API_BASE_URL}/api/contact-agent/modalities`,
        AVAILABLE_SEDES: `${API_BASE_URL}/api/contact-agent/available-sedes`,
        ALL_MODALITIES: `${API_BASE_URL}/api/contact-agent/all-modalities`,
        SEDES_BY_MODALITY: `${API_BASE_URL}/api/contact-agent/sedes-by-modality`,
        
        // ===== HISTORIAL Y COMENTARIOS =====
        ORDER_CONTACT_HISTORY: (orderId) => `${API_BASE_URL}/api/contact-agent/orders/${orderId}/contact-history`,
        ORDER_COMMENTS: (orderId) => `${API_BASE_URL}/api/contact-agent/orders/${orderId}/comments`,
        CREATE_ORDER_COMMENT: (orderId) => `${API_BASE_URL}/api/contact-agent/orders/${orderId}/comments`,
        UPDATE_ORDER_CONTACT: (orderId) => `${API_BASE_URL}/api/contact-agent/orders/${orderId}/contact`,
    },
    // ===== RUTAS - Coordinador de Contact Center =====
    COORDINADOR_CONTACTO: {
        ORDER_DETAILS: (id) => `${API_BASE_URL}/api/coordinador-contacto/orders/${id}`,
        STATS: `${API_BASE_URL}/api/coordinador-contacto/stats`,
        AGENT_STATS: `${API_BASE_URL}/api/coordinador-contacto/agent-stats`,
        AGENTS: `${API_BASE_URL}/api/coordinador-contacto/agents`,
        ASSIGN: `${API_BASE_URL}/api/coordinador-contacto/assign`,
        
        // ===== HISTORIAL Y COMENTARIOS (SOLO LECTURA) =====
        ORDER_CONTACT_HISTORY: (orderId) => `${API_BASE_URL}/api/coordinador-contacto/orders/${orderId}/contact-history`,
        ORDER_COMMENTS: (orderId) => `${API_BASE_URL}/api/coordinador-contacto/orders/${orderId}/comments`,
    },
    // ===== RUTAS DE AGENDAMIENTO =====
    SCHEDULES: {
        AVAILABLE: `${API_BASE_URL}/api/schedules/available`,
        APPOINTMENTS: `${API_BASE_URL}/api/schedules/appointments`,
        VEHICLE_TYPES: (sedeId) => `${API_BASE_URL}/api/sedes/${sedeId}/vehicle-types`,
    },
    // ===== RUTAS DE NOTIFICACIONES =====
    NOTIFICATIONS: {
        GET_USER_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/user`,
        MARK_AS_READ: (id) => `${API_BASE_URL}/api/notifications/${id}`,
        MARK_ALL_AS_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
        STATS: `${API_BASE_URL}/api/notifications/stats`,
    },
    // ===== RUTAS DE ADMINISTRACIÓN DE NOTIFICACIONES =====
    NOTIFICATIONS_ADMIN: {
        // Estadísticas administrativas
        STATS: `${API_BASE_URL}/api/notifications/admin/stats`,
        // Configuraciones de notificación
        CONFIGS: `${API_BASE_URL}/api/notifications/configs`,
        CREATE_CONFIG: `${API_BASE_URL}/api/notifications/configs`,
        UPDATE_CONFIG: (id) => `${API_BASE_URL}/api/notifications/configs/${id}`,
        DELETE_CONFIG: (id) => `${API_BASE_URL}/api/notifications/configs/${id}`,
    },
    // ===== RUTAS DEL SISTEMA DE EVENTOS =====
    EVENTS: {
        // Gestión de eventos
        LIST: `${API_BASE_URL}/api/events`,
        STATS: `${API_BASE_URL}/api/events/stats`,
        BY_CATEGORY: (category) => `${API_BASE_URL}/api/events/category/${category}`,
        GET: (id) => `${API_BASE_URL}/api/events/${id}`,
        CREATE: `${API_BASE_URL}/api/events`,
        UPDATE: (id) => `${API_BASE_URL}/api/events/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/events/${id}`,
        TRIGGER: (id) => `${API_BASE_URL}/api/events/${id}/trigger`,

        // Gestión de listeners
        LISTENERS: (eventId) => `${API_BASE_URL}/api/events/${eventId}/listeners`,
        CREATE_LISTENER: `${API_BASE_URL}/api/events/listeners`,
        UPDATE_LISTENER: (listenerId) => `${API_BASE_URL}/api/events/listeners/${listenerId}`,
        DELETE_LISTENER: (listenerId) => `${API_BASE_URL}/api/events/listeners/${listenerId}`,
    },
    // ===== RUTAS DEL SISTEMA DE PLANTILLAS =====
    TEMPLATES: {
        // Gestión de plantillas
        LIST: `${API_BASE_URL}/api/templates`,
        STATS: `${API_BASE_URL}/api/templates/stats`,
        VARIABLES: `${API_BASE_URL}/api/templates/variables`,
        BY_CATEGORY: (category) => `${API_BASE_URL}/api/templates/category/${category}`,
        GET: (id) => `${API_BASE_URL}/api/templates/${id}`,
        CREATE: `${API_BASE_URL}/api/templates`,
        UPDATE: (id) => `${API_BASE_URL}/api/templates/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/templates/${id}`,

        // Operaciones especiales
        VALIDATE: `${API_BASE_URL}/api/templates/validate`,
        RENDER: `${API_BASE_URL}/api/templates/render`,
        DUPLICATE: (id) => `${API_BASE_URL}/api/templates/${id}/duplicate`,
    },

    // ===== RUTAS DEL SISTEMA DE CONFIGURACIÓN DE CANALES =====
    CHANNELS: {
        // Gestión de configuraciones de canales
        LIST: `${API_BASE_URL}/api/channels`,
        SCHEMAS: `${API_BASE_URL}/api/channels/schemas`,
        MEMORY: `${API_BASE_URL}/api/channels/memory`,
        GET: (channelName) => `${API_BASE_URL}/api/channels/${channelName}`,
        CREATE: `${API_BASE_URL}/api/channels`,
        UPDATE: (channelName) => `${API_BASE_URL}/api/channels/${channelName}`,
        DELETE: (channelName) => `${API_BASE_URL}/api/channels/${channelName}`,

        // Operaciones especiales
        TEST: (channelName) => `${API_BASE_URL}/api/channels/${channelName}/test`,
        VALIDATE: `${API_BASE_URL}/api/channels/validate`,
        RELOAD: `${API_BASE_URL}/api/channels/reload`,
    },



    // ===== RUTAS DE AGENDAMIENTOS =====
    APPOINTMENTS: {
        // Gestión de agendamientos
        LIST: `${API_BASE_URL}/api/appointments`,
        GET: (id) => `${API_BASE_URL}/api/appointments/${id}`,
        CREATE: `${API_BASE_URL}/api/appointments`,

        // Modalidades y sedes
        MODALITIES: `${API_BASE_URL}/api/appointments/modalities`,
        MODALITIES_BY_CITY: (cityId) => `${API_BASE_URL}/api/appointments/modalities/${cityId}`,
        SEDES: `${API_BASE_URL}/api/appointments/sedes`,
        TIME_SLOTS: `${API_BASE_URL}/api/appointments/time-slots`,
    },

    // ===== RUTAS DEL SISTEMA DE WEBHOOKS =====
    WEBHOOKS: {
        // Endpoints de webhooks
        EVENTS: `${API_BASE_URL}/api/webhooks/events`,
        APPOINTMENT: `${API_BASE_URL}/api/webhooks/appointment`,
        
        // Gestión de API Keys
        API_KEYS: `${API_BASE_URL}/api/webhooks/api-keys`,
        CREATE_API_KEY: `${API_BASE_URL}/api/webhooks/api-keys`,
        UPDATE_API_KEY: (id) => `${API_BASE_URL}/api/webhooks/api-keys/${id}`,
        DELETE_API_KEY: (id) => `${API_BASE_URL}/api/webhooks/api-keys/${id}`,
        
        // Logs
        LOGS: `${API_BASE_URL}/api/webhooks/logs`,
    },
};

export const API_CONFIG = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
}; 