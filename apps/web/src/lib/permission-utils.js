/**
 * Extrae todos los permisos de los roles del usuario
 * @param {Object} user - Objeto usuario con roles
 * @returns {Array} Array de permisos únicos
 */
export const getUserPermissions = (user) => {
    if (!user || !user.roles) {
        return [];
    }

    const permissions = new Set();
    
    user.roles.forEach(role => {
        if (role.permissions) {
            role.permissions.forEach(permission => {
                permissions.add(permission.name);
            });
        }
    });

    return Array.from(permissions);
};

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {Object} user - Objeto usuario con roles
 * @param {string} permissionName - Nombre del permiso a verificar
 * @returns {boolean} True si el usuario tiene el permiso
 */
export const hasPermission = (user, permissionName) => {
    const permissions = getUserPermissions(user);
    return permissions.includes(permissionName);
};

/**
 * Verifica si el usuario tiene al menos uno de los permisos especificados
 * @param {Object} user - Objeto usuario con roles
 * @param {Array} permissionNames - Array de nombres de permisos
 * @returns {boolean} True si el usuario tiene al menos uno de los permisos
 */
export const hasAnyPermission = (user, permissionNames) => {
    const permissions = getUserPermissions(user);
    return permissionNames.some(permission => permissions.includes(permission));
};

/**
 * Verifica si el usuario tiene todos los permisos especificados
 * @param {Object} user - Objeto usuario con roles
 * @param {Array} permissionNames - Array de nombres de permisos
 * @returns {boolean} True si el usuario tiene todos los permisos
 */
export const hasAllPermissions = (user, permissionNames) => {
    const permissions = getUserPermissions(user);
    return permissionNames.every(permission => permissions.includes(permission));
};

/**
 * Obtiene los permisos relacionados con órdenes de inspección
 * @param {Object} user - Objeto usuario con roles
 * @returns {Array} Array de permisos de órdenes de inspección
 */
export const getInspectionOrderPermissions = (user) => {
    const permissions = getUserPermissions(user);
    return permissions.filter(permission => permission.startsWith('inspection_orders.'));
};

/**
 * Verifica si el usuario puede crear comentarios
 * @param {Object} user - Objeto usuario con roles
 * @returns {boolean} True si puede crear comentarios
 */
export const canCreateComments = (user) => {
    return hasPermission(user, 'inspection_orders.update');
};

/**
 * Verifica si el usuario puede ver comentarios
 * @param {Object} user - Objeto usuario con roles
 * @returns {boolean} True si puede ver comentarios
 */
export const canViewComments = (user) => {
    return hasPermission(user, 'inspection_orders.read');
};

/**
 * Verifica si el usuario puede editar datos de contacto
 * @param {Object} user - Objeto usuario con roles
 * @returns {boolean} True si puede editar datos de contacto
 */
export const canEditContactData = (user) => {
    return hasPermission(user, 'inspection_orders.update');
};
