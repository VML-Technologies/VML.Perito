# Sistema de Migraciones - Movilidad Mundial

Este directorio contiene las migraciones de base de datos para Movilidad Mundial usando **Sequelize CLI**.

## 📁 Estructura

```
migrations/
├── README.md                    # Esta documentación
├── [timestamp]_[nombre].cjs     # Migraciones (formato CommonJS para CLI)
└── [timestamp]_[nombre].cjs     # Migraciones futuras
```

## 🚀 Comandos Disponibles

### Ejecutar Migraciones
```bash
npm run migrate
```
Ejecuta todas las migraciones pendientes.

### Ver Estado
```bash
npm run migrate:status
```
Muestra el estado actual de las migraciones (ejecutadas y pendientes).

### Revertir Migraciones
```bash
npm run migrate:rollback
```
Reverte la última migración ejecutada.

### Revertir Todas las Migraciones
```bash
npm run migrate:rollback:all
```
Reverte todas las migraciones ejecutadas.

### Crear Nueva Migración
```bash
npm run migrate:create "nombre_de_la_migracion"
```
Crea un nuevo archivo de migración con template.

## 📝 Crear una Nueva Migración

1. **Generar el archivo:**
   ```bash
   npm run migrate:create "add_user_fields"
   ```

2. **Editar la migración:**
   El archivo generado tendrá este formato:
   ```javascript
   'use strict';

   /** @type {import('sequelize-cli').Migration} */
   module.exports = {
     async up (queryInterface, Sequelize) {
       // Implementar cambios aquí
       await queryInterface.addColumn('users', 'phone', {
         type: Sequelize.STRING(20),
         allowNull: true
       });
     },

     async down (queryInterface, Sequelize) {
       // Implementar rollback aquí
       await queryInterface.removeColumn('users', 'phone');
     }
   };
   ```

3. **Ejecutar la migración:**
   ```bash
   npm run migrate
   ```

## 🔧 Configuración

### Archivo de Configuración
El sistema usa `config/database-cli.cjs` para la configuración de Sequelize CLI.

### Formato de Archivos
- **Migraciones**: `.cjs` (CommonJS) para compatibilidad con Sequelize CLI
- **Configuración**: `database-cli.cjs` separado de `database.js` (ES modules)

## 📊 Migraciones Existentes

### 20250822074457-add-appointment-fields.cjs
- **Propósito**: Agregar campos críticos a la tabla `appointments`
- **Campos agregados**:
  - `direccion_inspeccion` (STRING(1000)) - Dirección para inspección a domicilio
  - `observaciones` (STRING(1000)) - Observaciones del agendamiento

## 🎯 Ventajas de Sequelize CLI

1. **✅ Estándar de la industria**: Herramienta oficial de Sequelize
2. **✅ Automatización completa**: Maneja la tabla `SequelizeMeta` automáticamente
3. **✅ Rollback fácil**: Comandos simples para revertir cambios
4. **✅ Generación automática**: Templates automáticos para nuevas migraciones
5. **✅ Compatibilidad**: Funciona con cualquier base de datos soportada
6. **✅ Documentación**: Amplia documentación y comunidad

## 🚨 Notas Importantes

- Las migraciones usan formato **CommonJS** (`.cjs`) para compatibilidad con Sequelize CLI
- La configuración está separada en `database-cli.cjs` para no afectar la aplicación principal
- Siempre verifica el estado antes de ejecutar migraciones: `npm run migrate:status`
- Para crear migraciones, usa: `npm run migrate:create "nombre-descriptivo"`

## 🔍 Troubleshooting

### Error: "module is not defined"
- Verificar que el archivo tenga extensión `.cjs`
- Asegurar que use `module.exports` en lugar de `export`

### Error: "migrations-extension not recognized"
- Remover `migrations-extension` del archivo `.sequelizerc`
- Usar archivos `.cjs` directamente

### Error de conexión a base de datos
- Verificar configuración en `config/database-cli.cjs`
- Confirmar variables de entorno en `.env`

## 📚 Memoria del Proyecto

### Migración de Sistema Personalizado a Sequelize CLI (2025-08-22)

**Problema Original:**
- Los campos `direccion_inspeccion` y `observaciones` no se guardaban en las órdenes de inspección
- Se implementó un sistema de migraciones personalizado que resultó complejo y problemático

**Solución Implementada:**
1. **Migración a Sequelize CLI**: Reemplazamos el sistema personalizado por Sequelize CLI estándar
2. **Corrección de Tabla**: Los campos se movieron de `inspection_orders` a `appointments` (tabla correcta)
3. **Configuración Dual**: 
   - `config/database-cli.cjs` para Sequelize CLI (CommonJS)
   - `config/database.js` para la aplicación (ES modules)

**Archivos Eliminados:**
- `scripts/runMigrations.js`
- `scripts/testMigrations.js`
- `scripts/createMigration.js`
- `scripts/debugMigrations.js`
- `scripts/simpleDebug.js`
- `config/sequelize.js` - Archivo duplicado eliminado

**Archivos Creados/Modificados:**
- `migrations/20250822074457-add-appointment-fields.cjs` - Migración correcta
- `config/database-cli.cjs` - Configuración para CLI
- `config/database.js` - Configuración para aplicación (mantenido)
- `.sequelizerc` - Configuración de rutas
- `models/appointment.js` - Agregados campos críticos
- `controllers/contactAgentController.js` - Corregida lógica de guardado

**Comandos Actualizados:**
- `npm run migrate` → `npx sequelize-cli db:migrate`
- `npm run migrate:status` → `npx sequelize-cli db:migrate:status`
- `npm run migrate:rollback` → `npx sequelize-cli db:migrate:undo`

**Lecciones Aprendidas:**
1. Siempre usar herramientas estándar de la industria cuando sea posible
2. Verificar que los campos se guarden en la tabla correcta
3. Separar configuración de CLI y aplicación para evitar conflictos
4. Documentar cambios importantes para futuras referencias
