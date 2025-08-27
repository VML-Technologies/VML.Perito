# Changelog - Sistema Movilidad Mundial

Todas las notables modificaciones a este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-14

### 🚀 **Lanzamiento Inicial**
- **Sistema Movilidad Mundial**: Primera versión estable del sistema de gestión de órdenes de inspección
- **Funcionalidades Base**: Sistema completo de agendamiento, gestión de órdenes, contact center y RBAC
- **Arquitectura**: Backend Express.js con frontend React, base de datos con Sequelize
- **Roles y Permisos**: Sistema RBAC completo con roles de Comercial Mundial, Agente de Contact Center y Coordinador

---

## [1.0.1] - 2025-08-18

### 🔧 **Mejoras**
- **Validaciones de Tiempo**: Nuevas validaciones para campos de tiempo en ScheduleController
- **Obtención de Datos**: Mejoras en obtención de datos de tiempo en modelos
- **Integridad de Datos**: Aseguramiento de integridad y consistencia en manipulación de tiempos

## [1.0.2] - 2025-08-19

### 🔧 **Mejoras**
- **Indicadores de Carga**: Funcionalidad de carga en OrdersTable
- **Optimización de Gestión**: Mejor gestión de órdenes en AgenteContacto
- **Experiencia de Usuario**: Indicador de carga y simplificación de lógica de obtención de datos
- **Manejo de Zona Horaria**: Conversión de horas a zona horaria local en ScheduleController
- **Integridad de Datos**: Mejoras en baseModel para correcta representación de datos temporales

### 🐛 **Correcciones**
- **Selección de Fechas**: Modificación para permitir selección de todas las fechas
- **Validaciones de Tiempo**: Agregadas validaciones para campos de tiempo en ScheduleController

## [1.0.3] - 2025-08-20

### 🔧 **Mejoras**
- **Selección de Fechas**: Ajuste en lógica de CalendarioAgendamiento para permitir solo fechas a partir de hoy
- **Usabilidad**: Mejora en la usabilidad del componente de selección de fechas

## [1.0.4] - 2025-08-21

### 🔧 **Mejoras**
- **Consulta de Placas**: Funcionalidad de consulta de placas en servidor
- **Paginación y Ordenamiento**: Actualización de AgenteContacto con paginación en tabla de órdenes
- **Optimización de Experiencia**: Mejor experiencia del usuario

## [1.0.5] - 2025-08-22

### 🔧 **Mejoras**
- **Nombre de Aplicación**: Actualización a "Movilidad Mundial" en documentación y configuraciones
- **Configuración de Sequelize**: Nuevos archivos de configuración para migraciones
- **Gestión de Base de Datos**: Mejoras en la gestión y desarrollo

### 🐛 **Correcciones**
- **Asunto de Correos**: Actualización de "virtual" por "a domicilio" en notificaciones
- **Campos de Correo**: Corrección de nombres de campos en controlador de ContactAgent
- **Migraciones Pendientes**: Eliminación de migraciones pendientes del script seedAll

## [1.1.0] - 2025-08-22

### 🚀 **Nuevas Características**
- **Sistema de Webhooks Completo**: Implementación completa de gestión de webhooks
  - Nuevo controlador con manejo de eventos, validaciones y gestión de API keys
  - Nuevos modelos: WebhookApiKey y WebhookLog
  - Autenticación, validación de firmas y manejo de eventos
  - Gestión de API keys y logs de webhooks
- **Envío de Correos Automático**: Sistema de notificaciones por email para nuevas órdenes
  - Implementación con nodemailer para notificar a agentes
  - Detalles de citas agendadas en correos

## [1.1.1] - 2025-08-22

### 🚀 **Nuevas Características**
- **Método de Inspección Recomendado**: Campo de selección en modal de creación de órdenes
  - Opciones: virtual, presencial y a domicilio
  - Actualización de interfaz del formulario
  - Nuevo campo en modelo y migración de `inspection_orders`
- **Sistema de Capacidad Global**: Control centralizado de citas por intervalo de tiempo
  - Configuración en `.env.example` para límite máximo de disponibilidad
  - Documentación completa del sistema de capacidad global
  - Lógica mejorada en controlador de agendamiento

### 🔧 **Mejoras**
- **Campos de Vehículo Flexibles**: Modificación para permitir valores nulos en campos de vehículo
- **Validaciones de Formulario**: Ajustes en formulario de creación de órdenes
- **Configuración de Webhooks**: Nuevas opciones para limitación de tasa, verificación de firma
- **Scripts de Migración**: Nuevos scripts en `package.json` para gestión de base de datos

### 🐛 **Correcciones**
- **Lógica de Verificación**: Ajuste en lógica de verificación de roles en `inspectionOrderController`

## [1.1.2] - 2025-08-25

### 🔧 **Mejoras**
- **Detalles de Resultado**: Agregar detalles del resultado de la inspección en el controlador de órdenes
- **Información de Estado**: Mostrar información adicional en el panel de detalles cuando el estado es 'RECHAZADO'
- **Historial de Contactos**: Nuevos controladores y rutas para gestión de cambios de contacto
- **Historial de Comentarios**: Sistema para gestión y visualización de comentarios asociados
- **Nuevas Migraciones**: Tablas para historial de contactos y comentarios en órdenes de inspección

### 🐛 **Correcciones**
- **Diseño de Modal**: Ajuste del modal de creación de órdenes eliminando campo opcional 'Código FASECOLDA'
- **Estructura de Columnas**: Modificación de la estructura de columnas en el formulario para mejor presentación

## [1.1.3] - 2025-08-26

### 🚀 **Nuevas Características**
- **Sistema de Informes de Inspección**: Implementación completa de generación y visualización de informes
  - Nueva ruta y controlador para obtener informes de inspección
  - Nuevos modelos y relaciones para partes y categorías de inspección
  - Lógica para procesar y devolver datos relevantes en el informe

### 🔧 **Mejoras**
- **Diseño de Informes**: Mejorar el diseño y presentación del informe de inspección
- **Información de Contacto**: Añadir información de contacto adicional
- **Estructura de Datos**: Reorganizar sección de información básica y técnica del vehículo
- **Estilos de Visualización**: Implementar estilos para mejor visualización de datos

### 🐛 **Correcciones**
- **Validación de Roles**: Ajuste en lógica de verificación de roles en `inspectionOrderController`
- **Exclusión de Usuarios**: Mejora en filtrado por `intermediary_key` excluyendo usuarios de `segurosmundial.com.co`
- **Función PDF**: Eliminar función de exportación a PDF para simplificar código y mejorar mantenibilidad

## [1.2.0] - 2025-08-27

### 🚀 **Nuevas Características**
- **Sistema de Correos de Bienvenida**: Implementación completa del envío automático de correos electrónicos de bienvenida al crear nuevos usuarios
  - Nuevo controlador para gestión de correos de bienvenida
  - Validaciones para identificación y correo electrónico únicos
  - Plantillas de correo personalizadas
- **Gestión de Exclusiones de Horarios**: Nuevo modelo y sistema para gestionar exclusiones en la programación
  - Configuración de períodos de tiempo muerto
  - Flexibilidad para días específicos o toda la semana
  - Integración automática con el sistema de agendamiento
- **Nuevo Archivo de Imagen**: Mejora en la presentación visual de la aplicación

### 🔧 **Mejoras**
- **Control de Visualización por Rol**: Atributo `userRole` en componente CallHistory para controlar información según el rol del usuario
- **Información de Citas Mejorada**: Nuevo atributo `call_time` en registros de llamadas del controlador de órdenes
- **Ampliación de Datos de Citas**: Nuevos atributos y relaciones con modelos de modalidad de inspección y sede
- **Verificación de Órdenes Activas**: Nueva funcionalidad para verificar existencia de órdenes activas por placa
- **Diseño de Informes Mejorado**: Mejor presentación del informe de inspección con información de contacto adicional

### 🐛 **Correcciones**
- **Validación de Placas**: Lógica mejorada para validar placas ingresadas y mostrar información relevante
- **Estructura de Formularios**: Ajustes en el modal de creación de órdenes para mejor presentación

---

## Tipos de Cambios

- **🚀 Nuevas Características**: Nuevas funcionalidades agregadas
- **🔧 Mejoras**: Mejoras en funcionalidades existentes
- **🐛 Correcciones**: Corrección de errores
- **♻️ Refactorización**: Cambios en el código que no agregan funcionalidad
- **📚 Documentación**: Cambios en documentación
- **⚡ Rendimiento**: Mejoras en rendimiento
- **🔒 Seguridad**: Mejoras en seguridad

## Convenciones de Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de errores compatibles hacia atrás

## Notas de Lanzamiento

### v1.0.8
- **Deploy**: 27 de Agosto 2025
- **Características Principales**: Sistema de correos de bienvenida y gestión de exclusiones de horarios
- **Migración Requerida**: Nuevas migraciones para exclusiones de horarios

### v1.0.7
- **Deploy**: 26 de Agosto 2025
- **Características Principales**: Sistema completo de informes de inspección
- **Mejoras**: Diseño mejorado de informes y optimización de código

### v1.0.6
- **Deploy**: 25 de Agosto 2025
- **Mejoras**: Historial de contactos y comentarios en órdenes de inspección
- **Correcciones**: Ajustes en diseño de modales y formularios

### v1.0.5
- **Deploy**: 22 de Agosto 2025
- **Características Principales**: Métodos de inspección recomendados y capacidad global
- **Sistema de Control**: Control centralizado de capacidad de agendamiento
- **Características Principales**: Sistema completo de webhooks y notificaciones
- **Integración**: Sistema automático de correos electrónicos
- **Mejoras**: Actualización de nombre de aplicación y configuraciones (VML.Perito -> Movilidad Mundial)
- **Correcciones**: Ajustes en notificaciones y migraciones

### v1.0.4
- **Deploy**: 21 de Agosto 2025
- **Mejoras**: Consulta de placas y optimizaciones de experiencia

### v1.0.3
- **Deploy**: 20 de Agosto 2025
- **Mejoras**: Ajustes en selección de fechas del calendario

### v1.0.2
- **Deploy**: 19 de Agosto 2025
- **Mejoras**: Indicadores de carga y manejo de zona horaria
- **Correcciones**: Ajustes en selección de fechas y validaciones

### v1.0.1
- **Deploy**: 18 de Agosto 2025
- **Mejoras**: Validaciones de tiempo y integridad de datos

### v1.0.0
- **Deploy**: 14 de Agosto 2025
- **Lanzamiento Inicial**: Primera versión estable del sistema Movilidad Mundial
- **Funcionalidades Base**: Sistema completo de agendamiento, gestión de órdenes, contact center y RBAC


## Política de Deploy

- **Frecuencia**: Deploy diario en la tarde
- **Agrupación**: Cambios agrupados por día de deploy
- **Versionado**: 
  - **PATCH** (1.0.x): Correcciones y mejoras menores
  - **MINOR** (1.x.0): Nuevas funcionalidades significativas
  - **MAJOR** (x.0.0): Cambios breaking (no aplicado en este período)
- **Compatibilidad**: Mantenimiento de compatibilidad hacia atrás en todas las versiones
