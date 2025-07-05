/**
 * Determina la ruta por defecto según los roles del usuario
 * @param {Array} userRoles - Array de roles del usuario
 * @returns {string} - Ruta por defecto
 */
export const getDefaultRouteForUser = (userRoles) => {
    if (!userRoles || !Array.isArray(userRoles)) {
        return '/dashboard';
    }

    // Extraer nombres de roles
    const roleNames = userRoles.map(role => 
        typeof role === 'string' ? role : role.name
    );

    // Prioridad de roles (el más específico primero)
    if (roleNames.includes('super_admin')) {
        return '/admin';
    }
    
    if (roleNames.includes('coordinador_contacto')) {
        return '/coordinador-contacto';
    }
    
    if (roleNames.includes('comercial_mundial')) {
        return '/comercial-mundial';
    }
    
    if (roleNames.includes('agente_contacto')) {
        return '/agente-contacto';
    }
    
    if (roleNames.includes('admin')) {
        return '/admin';
    }

    // Por defecto, ir al dashboard
    return '/dashboard';
};

/**
 * Obtiene el nombre del rol principal para mostrar en la UI
 * @param {Array} userRoles - Array de roles del usuario
 * @returns {string} - Nombre del rol principal
 */
export const getPrimaryRoleName = (userRoles) => {
    if (!userRoles || !Array.isArray(userRoles)) {
        return 'Usuario';
    }

    const roleNames = userRoles.map(role => 
        typeof role === 'string' ? role : role.name
    );

    const roleDisplayNames = {
        'super_admin': 'Súper Administrador',
        'coordinador_contacto': 'Coordinador de Contacto',
        'comercial_mundial': 'Comercial Mundial',
        'agente_contacto': 'Agente de Contacto',
        'admin': 'Administrador',
        'manager': 'Gerente',
        'user': 'Usuario'
    };

    // Prioridad de roles para mostrar
    const priorityOrder = [
        'super_admin',
        'coordinador_contacto', 
        'comercial_mundial',
        'agente_contacto',
        'admin',
        'manager',
        'user'
    ];

    for (const role of priorityOrder) {
        if (roleNames.includes(role)) {
            return roleDisplayNames[role] || role;
        }
    }

    return 'Usuario';
}; 