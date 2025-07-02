// Registro global de permisos declarados en controladores
const permissionRegistry = new Map();

export function registerPermission(permission) {
    if (!permission || !permission.name) return;
    permissionRegistry.set(permission.name, permission);
}

export function getRegisteredPermissions() {
    return Array.from(permissionRegistry.values());
} 