import Department from './department.js';
import City from './city.js';
import Company from './company.js';
import Sede from './sede.js';
import User from './user.js';
import Role from './role.js';
import Permission from './permission.js';
import RolePermission from './rolePermission.js';
import UserRole from './userRole.js';

// Definir relaciones

// Department -> Cities (1:N)
Department.hasMany(City, {
    foreignKey: 'department_id',
    as: 'cities'
});
City.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department'
});

// City -> Companies (1:N)
City.hasMany(Company, {
    foreignKey: 'city_id',
    as: 'companies'
});
Company.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
});

// City -> Sedes (1:N)
City.hasMany(Sede, {
    foreignKey: 'city_id',
    as: 'sedes'
});
Sede.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
});

// Company -> Sedes (1:N)
Company.hasMany(Sede, {
    foreignKey: 'company_id',
    as: 'sedes'
});
Sede.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
});

// Sede -> Users (1:N)
Sede.hasMany(User, {
    foreignKey: 'sede_id',
    as: 'users'
});
User.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
});

// ===== RELACIONES RBAC =====

// User -> Roles (N:N a través de UserRole)
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles'
});
Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users'
});

// Role -> Permissions (N:N a través de RolePermission)
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions'
});
Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles'
});

// Relaciones directas para facilitar consultas
User.hasMany(UserRole, {
    foreignKey: 'user_id',
    as: 'userRoles'
});
UserRole.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Role.hasMany(UserRole, {
    foreignKey: 'role_id',
    as: 'userRoles'
});
UserRole.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role'
});

Role.hasMany(RolePermission, {
    foreignKey: 'role_id',
    as: 'rolePermissions'
});
RolePermission.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role'
});

Permission.hasMany(RolePermission, {
    foreignKey: 'permission_id',
    as: 'rolePermissions'
});
RolePermission.belongsTo(Permission, {
    foreignKey: 'permission_id',
    as: 'permission'
});

export {
    Department,
    City,
    Company,
    Sede,
    User,
    Role,
    Permission,
    RolePermission,
    UserRole
}; 