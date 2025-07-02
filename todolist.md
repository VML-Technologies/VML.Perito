# TODO List - Fase 5: Interfaz de Administración RBAC

## Backend

- [ ] Endpoint: Crear rol (`POST /api/roles`)
- [ ] Endpoint: Editar rol (`PUT /api/roles/:id`)
- [ ] Endpoint: Eliminar rol (`DELETE /api/roles/:id`)
- [ ] Endpoint: Crear permiso (`POST /api/permissions`)
- [ ] Endpoint: Editar permiso (`PUT /api/permissions/:id`)
- [ ] Endpoint: Eliminar permiso (`DELETE /api/permissions/:id`)
- [ ] Endpoint: Asignar permisos a rol (`POST /api/roles/:id/permissions`)
- [ ] Endpoint: Asignar roles a usuario (`POST /api/users/:id/roles`)
- [ ] Endpoint: Listar usuarios con sus roles (`GET /api/users?withRoles=true`)

## Frontend

- [ ] Página: `AdminRBAC.jsx` (panel principal)
- [ ] Componente: `RolesTable.jsx` (gestión de roles)
- [ ] Componente: `PermissionsTable.jsx` (gestión de permisos)
- [ ] Componente: `RolePermissionAssignment.jsx` (asignar permisos a roles)
- [ ] Componente: `UserRoleAssignment.jsx` (asignar roles a usuarios)
- [ ] Integrar feedback visual y validaciones
- [ ] Proteger el acceso al panel solo para roles autorizados

## Documentación

- [ ] Actualizar `README.md` con endpoints y ejemplos de uso del panel
- [ ] Agregar capturas o diagramas si es necesario

---

**Leyenda:**

- [ ] Pendiente
- [x] Completado
