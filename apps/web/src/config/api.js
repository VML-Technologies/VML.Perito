// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        VERIFY: `${API_BASE_URL}/api/auth/verify`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
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
    // ===== NUEVAS RUTAS - ÓRDENES DE INSPECCIÓN =====
    INSPECTION_ORDERS: {
        LIST: `${API_BASE_URL}/api/inspection-orders`,
        STATS: `${API_BASE_URL}/api/inspection-orders/stats`,
        SEARCH: `${API_BASE_URL}/api/inspection-orders/search`,
        GET: (id) => `${API_BASE_URL}/api/inspection-orders/${id}`,
        CREATE: `${API_BASE_URL}/api/inspection-orders`,
        UPDATE: (id) => `${API_BASE_URL}/api/inspection-orders/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/inspection-orders/${id}`,
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
    // ===== NUEVAS RUTAS - Agente de Contact =====
    CONTACT_AGENT: {
        ORDERS: `${API_BASE_URL}/api/contact-agent/orders`,
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
    },
    // ===== NUEVAS RUTAS - Coordinador de Contact Center =====
    COORDINADOR_CONTACTO: {
        ORDERS: `${API_BASE_URL}/api/coordinador-contacto/orders`,
        ORDER_DETAILS: (id) => `${API_BASE_URL}/api/coordinador-contacto/orders/${id}`,
        STATS: `${API_BASE_URL}/api/coordinador-contacto/stats`,
        AGENTS: `${API_BASE_URL}/api/coordinador-contacto/agents`,
        ASSIGN: `${API_BASE_URL}/api/coordinador-contacto/assign`,
    },
    // ===== NUEVAS RUTAS - Sistema de Horarios =====
    SCHEDULES: {
        AVAILABLE: `${API_BASE_URL}/api/schedules/available`,
        APPOINTMENTS: `${API_BASE_URL}/api/schedules/appointments`,
        VEHICLE_TYPES: (sedeId) => `${API_BASE_URL}/api/sedes/${sedeId}/vehicle-types`,
    },
    // ===== RUTAS DE NOTIFICACIONES =====
    NOTIFICATIONS: {
        GET_USER_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/user`,
        MARK_AS_READ: `${API_BASE_URL}/api/notifications`,
        MARK_ALL_AS_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
        STATS: `${API_BASE_URL}/api/notifications/stats`,
    },
};

export const API_CONFIG = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
}; 