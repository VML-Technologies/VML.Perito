# Checklist de Implementación RBAC

## ✅ Fase 1: Base de Datos y Modelos

- [x] Crear modelos Sequelize para:
  - [x] Role
  - [x] Permission
  - [x] RolePermission (relación muchos a muchos)
  - [x] UserRole (relación muchos a muchos)
- [x] Definir relaciones entre modelos en `models/index.js`
- [x] Crear script de seed para roles y permisos básicos (`seedRBAC.js`)
- [x] Agregar script a `package.json` y probar ejecución

---

## ⏳ Fase 2: Backend - Registro de Permisos y Middleware de Autorización

- [ ] Middleware para verificar permisos en endpoints (`requirePermission`)
- [ ] Sistema para registrar permisos de forma dinámica en los controladores
- [ ] Endpoints para consultar y administrar roles/permisos

---

## ⏳ Fase 3: Frontend - Contexto y Hooks

- [ ] Contexto de permisos (`rbac-context.jsx`)
- [ ] Hooks de verificación de permisos y roles
- [ ] Componentes de protección (`PermissionGate`, `RoleBasedRoute`)

---

## ⏳ Fase 4: Integración y Testing

- [ ] Integrar RBAC con rutas y acciones existentes
- [ ] Proteger endpoints críticos
- [ ] Testing de seguridad y validación

---

## ⏳ Fase 5: Interfaz de Administración

- [ ] Panel de gestión de roles y permisos
- [ ] Asignación de permisos a roles y usuarios
- [ ] Gestión de usuarios por roles

---

**Leyenda:**

- [x] Completado
- [ ] Pendiente
