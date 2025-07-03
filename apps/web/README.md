# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Gestión de Permisos (RBAC)

En la sección de administración (`/admin`), los usuarios con roles `admin` o `super_admin` pueden gestionar los permisos del sistema:

- **Ver permisos:** Se muestra una tabla con todos los permisos registrados en la base de datos.
- **Crear permiso:** Haz clic en "Crear permiso" y completa el formulario. El permiso se guardará en la base de datos.
- **Editar permiso:** Haz clic en "Editar" junto al permiso deseado, modifica los campos y guarda los cambios.
- **Eliminar permiso:** Haz clic en "Eliminar" y confirma la acción. El permiso será eliminado permanentemente.

> **Nota:** Solo los usuarios con los permisos `permissions.create`, `permissions.update` y `permissions.delete` pueden realizar las acciones correspondientes. Si no tienes estos permisos, los botones estarán deshabilitados o no aparecerán.

### Campos de un permiso
- **Nombre:** Identificador único del permiso (ej: `users.create`)
- **Descripción:** Explicación breve del permiso
- **Recurso:** Entidad o módulo al que aplica (ej: `users`)
- **Acción:** Operación permitida (ej: `create`, `read`, `update`, `delete`)
- **Endpoint:** Ruta protegida (opcional)
- **Método:** Método HTTP (opcional)

## Gestión de Asignaciones (RBAC)

En la pestaña "Asignaciones" del panel de administración (`/admin`), puedes gestionar las relaciones entre roles, permisos y usuarios:

### Asignar Permisos a Roles
1. **Seleccionar rol:** Elige un rol del dropdown para ver sus permisos actuales
2. **Gestionar permisos:** Marca/desmarca los checkboxes para asignar o quitar permisos
3. **Guardar cambios:** Los cambios se aplican automáticamente al marcar/desmarcar

### Asignar Roles a Usuarios
1. **Seleccionar usuario:** Elige un usuario del dropdown para ver sus roles actuales
2. **Gestionar roles:** Marca/desmarca los checkboxes para asignar o quitar roles
3. **Guardar cambios:** Los cambios se aplican automáticamente al marcar/desmarcar

### Permisos Requeridos
- **Ver asignaciones:** `roles.read`, `permissions.read`, `users.read`
- **Modificar asignaciones:** `roles.update`, `users.update`

### Consideraciones
- Los cambios se aplican inmediatamente sin confirmación adicional
- Un usuario puede tener múltiples roles simultáneamente
- Un rol puede tener múltiples permisos simultáneamente
- Los permisos se heredan de todos los roles asignados al usuario

---
