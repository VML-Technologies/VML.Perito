# 📱 Plan de Implementación - Sistema de Notificaciones Push

## 🎯 Objetivo

Implementar un sistema completo de notificaciones push usando la [Push API nativa](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) sin dependencias de Firebase, integrado con el sistema de notificaciones existente de Movilidad Mundial.

## 📊 Análisis de la Push API

### **Componentes Principales**

1. **PushManager** - Gestiona suscripciones push
2. **PushSubscription** - Representa una suscripción activa
3. **PushEvent** - Maneja eventos push en el Service Worker
4. **PushMessageData** - Accede a datos enviados por el servidor

### **Flujo de Trabajo**

```
1. Usuario solicita permisos → 2. Service Worker se registra → 3. PushManager.subscribe() → 4. Servidor recibe endpoint → 5. Servidor envía push → 6. Service Worker recibe push → 7. Muestra notificación
```

## 🏗️ Arquitectura Propuesta

### **Frontend (React)**

```
src/
├── hooks/
│   ├── usePushNotifications.js     # Hook principal para push
│   └── usePushPermissions.js       # Hook para permisos
├── services/
│   ├── pushNotificationService.js  # Servicio de push
│   └── pushWorkerService.js        # Gestión del service worker
├── components/
│   ├── PushNotificationPrompt.jsx  # Componente de solicitud de permisos
│   └── PushSettings.jsx            # Configuración de push
└── workers/
    └── push-worker.js              # Service Worker para push
```

### **Backend (Node.js)**

```
apps/server/
├── services/
│   └── channels/
│       └── pushService.js          # Servicio actualizado
├── controllers/
│   └── pushController.js           # Controlador para push
├── models/
│   ├── pushSubscription.js         # Modelo de suscripciones
│   └── pushToken.js                # Modelo de tokens
└── routes/
    └── pushRoutes.js               # Rutas para push
```

## 📋 Task List Detallada

### **Fase 1: Configuración Base y Modelos**

#### **1.1 Crear Modelos de Base de Datos**

- [ ] **Task 1.1.1**: Crear modelo `PushSubscription`

  - Campos: `id`, `user_id`, `endpoint`, `p256dh`, `auth`, `device_info`, `is_active`, `created_at`, `updated_at`
  - Relaciones: `belongsTo(User)`
  - Índices: `user_id`, `endpoint`

- [ ] **Task 1.1.2**: Crear modelo `PushToken`

  - Campos: `id`, `user_id`, `token`, `device_type`, `device_info`, `is_active`, `created_at`, `updated_at`
  - Relaciones: `belongsTo(User)`
  - Índices: `user_id`, `token`

- [ ] **Task 1.1.3**: Crear migración para las tablas
  - Tabla `push_subscriptions`
  - Tabla `push_tokens`
  - Índices y constraints

#### **1.2 Configurar VAPID Keys**

- [ ] **Task 1.2.1**: Generar VAPID keys para el proyecto

  - Usar `web-push` library para generar keys
  - Almacenar en variables de entorno
  - Documentar proceso de generación

- [ ] **Task 1.2.2**: Actualizar variables de entorno
  ```bash
  VAPID_PUBLIC_KEY=your_public_key
  VAPID_PRIVATE_KEY=your_private_key
  VAPID_SUBJECT=mailto:notifications@vmlperito.com
  ```

### **Fase 2: Backend - Servicio Push**

#### **2.1 Actualizar PushService**

- [ ] **Task 2.1.1**: Instalar dependencias

  ```bash
  npm install web-push
  ```

- [ ] **Task 2.1.2**: Refactorizar `pushService.js`

  - Implementar envío real usando `web-push`
  - Manejar VAPID keys
  - Implementar validación de tokens
  - Agregar manejo de errores específicos

- [ ] **Task 2.1.3**: Implementar métodos principales
  ```javascript
  async send(notification)
  async sendToMultiple(subscriptions, notificationData)
  async validateSubscription(subscription)
  async getActiveSubscriptions(userId)
  ```

#### **2.2 Crear Controlador Push**

- [ ] **Task 2.2.1**: Crear `pushController.js`

  - `POST /api/push/subscribe` - Registrar suscripción
  - `DELETE /api/push/unsubscribe` - Eliminar suscripción
  - `GET /api/push/subscriptions` - Obtener suscripciones del usuario
  - `POST /api/push/test` - Enviar notificación de prueba

- [ ] **Task 2.2.2**: Implementar validaciones
  - Validar formato de suscripción
  - Verificar permisos del usuario
  - Validar VAPID keys

#### **2.3 Crear Rutas API**

- [ ] **Task 2.3.1**: Crear `pushRoutes.js`

  - Rutas protegidas con RBAC
  - Middleware de autenticación
  - Validación de entrada

- [ ] **Task 2.3.2**: Integrar rutas en `index.js`
  - Agregar rutas al servidor principal
  - Configurar middleware

### **Fase 3: Frontend - Service Worker**

#### **3.1 Crear Service Worker**

- [ ] **Task 3.1.1**: Crear `push-worker.js`

  ```javascript
  // Eventos principales
  self.addEventListener('push', handlePushEvent);
  self.addEventListener('pushsubscriptionchange', handleSubscriptionChange);
  self.addEventListener('notificationclick', handleNotificationClick);
  self.addEventListener('notificationclose', handleNotificationClose);
  ```

- [ ] **Task 3.1.2**: Implementar manejo de eventos push

  - Parsear datos de notificación
  - Mostrar notificación nativa
  - Manejar acciones de notificación
  - Implementar deep linking

- [ ] **Task 3.1.3**: Configurar Vite para Service Worker
  - Configurar build del service worker
  - Configurar registro automático
  - Manejar actualizaciones

#### **3.2 Crear Hook de Push Notifications**

- [ ] **Task 3.2.1**: Crear `usePushNotifications.js`

  ```javascript
  const { isSupported, permission, subscription, subscribe, unsubscribe, sendTestNotification } =
    usePushNotifications();
  ```

- [ ] **Task 3.2.2**: Implementar lógica de suscripción
  - Verificar soporte del navegador
  - Solicitar permisos
  - Registrar service worker
  - Crear suscripción push
  - Enviar suscripción al servidor

#### **3.3 Crear Hook de Permisos**

- [ ] **Task 3.3.1**: Crear `usePushPermissions.js`

  ```javascript
  const { permission, requestPermission, isBlocked, canRequest } = usePushPermissions();
  ```

- [ ] **Task 3.3.2**: Implementar manejo de permisos
  - Verificar estado actual
  - Solicitar permisos
  - Manejar cambios de estado
  - Persistir preferencias

### **Fase 4: Componentes de UI**

#### **4.1 Componente de Solicitud de Permisos**

- [ ] **Task 4.1.1**: Crear `PushNotificationPrompt.jsx`

  - Modal de solicitud de permisos
  - Explicación de beneficios
  - Botones de aceptar/rechazar
  - Integración con hooks

- [ ] **Task 4.1.2**: Implementar lógica de UI
  - Mostrar solo cuando sea necesario
  - Manejar diferentes estados
  - Integrar con sistema de notificaciones

#### **4.2 Componente de Configuración**

- [ ] **Task 4.2.1**: Crear `PushSettings.jsx`

  - Toggle para activar/desactivar
  - Configuración por tipo de notificación
  - Lista de dispositivos registrados
  - Opción de eliminar suscripciones

- [ ] **Task 4.2.2**: Integrar en perfil de usuario
  - Agregar a página de perfil
  - Persistir configuraciones
  - Sincronizar con backend

### **Fase 5: Integración con Sistema Existente**

#### **5.1 Actualizar NotificationService**

- [ ] **Task 5.1.1**: Integrar push en `notificationService.js`

  - Agregar canal push a la lista
  - Implementar envío de push
  - Manejar errores específicos

- [ ] **Task 5.1.2**: Actualizar `getRecipients`
  - Incluir suscripciones push activas
  - Filtrar por preferencias del usuario
  - Manejar múltiples dispositivos

#### **5.2 Actualizar EventService**

- [ ] **Task 5.2.1**: Integrar push en listeners existentes
  - Agregar canal push a plantillas
  - Actualizar condiciones de envío
  - Mantener compatibilidad

#### **5.3 Actualizar Plantillas**

- [ ] **Task 5.3.1**: Crear plantillas push específicas
  - Plantillas para cada tipo de notificación
  - Configurar acciones de notificación
  - Definir iconos y badges

### **Fase 6: Testing y Optimización**

#### **6.1 Testing del Service Worker**

- [ ] **Task 6.1.1**: Crear tests para service worker

  - Test de registro
  - Test de eventos push
  - Test de manejo de errores

- [ ] **Task 6.1.2**: Testing de hooks
  - Test de `usePushNotifications`
  - Test de `usePushPermissions`
  - Test de integración

#### **6.2 Testing del Backend**

- [ ] **Task 6.2.1**: Crear tests para pushService

  - Test de envío de notificaciones
  - Test de validación de suscripciones
  - Test de manejo de errores

- [ ] **Task 6.2.2**: Testing de API endpoints
  - Test de suscripción/desuscripción
  - Test de permisos
  - Test de notificaciones de prueba

#### **6.3 Optimización**

- [ ] **Task 6.3.1**: Optimizar envío de notificaciones

  - Implementar cola de envío
  - Manejar rate limiting
  - Optimizar payload de notificaciones

- [ ] **Task 6.3.2**: Monitoreo y métricas
  - Logs de envío de push
  - Métricas de entrega
  - Alertas de errores

### **Fase 7: Documentación y Despliegue**

#### **7.1 Documentación**

- [ ] **Task 7.1.1**: Actualizar documentación técnica

  - Documentar configuración de VAPID
  - Documentar API endpoints
  - Documentar hooks y componentes

- [ ] **Task 7.1.2**: Crear guías de usuario
  - Guía de activación de push
  - Troubleshooting común
  - FAQ de push notifications

#### **7.2 Despliegue**

- [ ] **Task 7.2.1**: Configurar producción

  - Generar VAPID keys de producción
  - Configurar HTTPS (requerido para push)
  - Configurar service worker en producción

- [ ] **Task 7.2.2**: Testing en producción
  - Verificar funcionamiento en diferentes navegadores
  - Test de permisos y suscripciones
  - Monitoreo de errores

## 🔧 Configuración Técnica

### **Dependencias Requeridas**

```json
{
  "web-push": "^3.6.6",
  "vite-plugin-pwa": "^0.17.4"
}
```

### **Variables de Entorno**

```bash
# VAPID Keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:notifications@vmlperito.com

# Push Configuration
PUSH_ENABLED=true
PUSH_MAX_RETRIES=3
PUSH_TIMEOUT=5000
```

### **Estructura de Notificación Push**

```javascript
{
  title: "Título de la notificación",
  body: "Cuerpo de la notificación",
  icon: "/icon-192x192.png",
  badge: "/badge-72x72.png",
  image: "/notification-image.png",
  data: {
    notificationId: "123",
    type: "order_created",
    url: "/orden/123",
    action: "view_order"
  },
  actions: [
    {
      action: "view",
      title: "Ver",
      icon: "/view-icon.png"
    },
    {
      action: "dismiss",
      title: "Cerrar"
    }
  ]
}
```

## 🚀 Consideraciones de Implementación

### **Seguridad**

- ✅ Validar suscripciones en el servidor
- ✅ Usar VAPID para autenticación
- ✅ Sanitizar datos de notificaciones
- ✅ Implementar rate limiting

### **Performance**

- ✅ Envío asíncrono de notificaciones
- ✅ Cola de procesamiento
- ✅ Optimización de payload
- ✅ Manejo de errores eficiente

### **UX/UI**

- ✅ Solicitud de permisos no intrusiva
- ✅ Configuración granular por usuario
- ✅ Feedback visual del estado
- ✅ Manejo de errores amigable

### **Compatibilidad**

- ✅ Soporte para Chrome/Edge
- ✅ Soporte para Firefox
- ✅ Fallback para navegadores no soportados
- ✅ Progressive enhancement

## 📊 Métricas de Éxito

### **Técnicas**

- [ ] 95% de suscripciones exitosas
- [ ] < 2 segundos de envío promedio
- [ ] < 1% de errores de entrega
- [ ] 100% de compatibilidad con navegadores objetivo

### **Usuario**

- [ ] 70% de usuarios activan push
- [ ] 80% de usuarios mantienen activas las notificaciones
- [ ] < 5% de usuarios desactivan por spam
- [ ] 90% de satisfacción con las notificaciones

## 🔄 Próximos Pasos

1. **Revisar y aprobar el plan**
2. **Configurar entorno de desarrollo**
3. **Comenzar con Fase 1 (Modelos de BD)**
4. **Implementar iterativamente por fases**
5. **Testing continuo durante desarrollo**
6. **Despliegue gradual con feature flags**

---

**Fecha de creación**: Enero 2025  
**Responsable**: Equipo de Desarrollo Movilidad Mundial  
**Estado**: 📋 Planificado  
**Prioridad**: 🔄 Media (después de webhooks)
