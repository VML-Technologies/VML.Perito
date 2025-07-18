# 🔒 Documentación de Seguridad - VML Perito Server

## 📋 Resumen de Medidas de Seguridad Implementadas

### 🛡️ Protección de Headers HTTP

#### Helmet.js

- **Content Security Policy (CSP)**: Configurado para prevenir XSS y ataques de inyección
- **X-Frame-Options**: Previene clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing
- **X-XSS-Protection**: Protección adicional contra XSS
- **Referrer-Policy**: Controla información del referrer
- **Permissions-Policy**: Restringe acceso a APIs sensibles

### 🌐 Configuración CORS

#### Dominios Permitidos

```javascript
[
  'https://movilidadmundial.vmltechnologies.com',
  'https://qa-movilidadmundial.vmltechnologies.com',
  'https://dev-movilidadmundial.vmltechnologies.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];
```

#### Características

- ✅ Validación estricta de orígenes
- ✅ Credenciales habilitadas para autenticación
- ✅ Métodos HTTP permitidos: GET, POST, PUT, DELETE, OPTIONS
- ✅ Headers permitidos: Content-Type, Authorization, X-Requested-With

### ⏰ Rate Limiting

#### Límites Generales

- **Ventana**: 15 minutos
- **Máximo**: 1000 requests por IP (optimizado para apps empresariales)
- **Mensaje**: "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos"

#### Límites de Lectura

- **Ventana**: 15 minutos
- **Máximo**: 2000 requests de lectura por IP (para dashboards y consultas)
- **Mensaje**: "Demasiadas solicitudes de lectura desde esta IP, intenta de nuevo en 15 minutos"

#### Límites de Autenticación

- **Ventana**: 15 minutos
- **Máximo**: 10 intentos de login por IP (más permisivo)
- **Mensaje**: "Demasiados intentos de autenticación, intenta de nuevo en 15 minutos"

### 🔐 Control de Acceso (RBAC)

#### Rutas Protegidas

- ✅ **Departamentos**: `departments.read`, `departments.create`, `departments.update`, `departments.delete`
- ✅ **Ciudades**: `cities.read`, `cities.create`, `cities.update`, `cities.delete`
- ✅ **Empresas**: `companies.read`, `companies.create`, `companies.update`, `companies.delete`
- ✅ **Sedes**: `sedes.read`, `sedes.create`, `sedes.update`, `sedes.delete`
- ✅ **Usuarios**: `users.read`, `users.create`, `users.update`, `users.delete`
- ✅ **Órdenes de Inspección**: `inspection_orders.read`, `inspection_orders.create`, `inspection_orders.update`, `inspection_orders.delete`
- ✅ **Sistema**: `system.read` (para rutas de debug)

### 📊 Logging de Seguridad

#### Características del Logging

- ✅ Log de todas las solicitudes con timestamp
- ✅ Log de respuestas con duración y status code
- ✅ Log de errores de CORS
- ✅ Log de rate limiting excedido
- ✅ Log de errores no manejados
- ✅ Información de IP y User-Agent

#### Formato de Logs

```
🔍 [2024-01-15T10:30:00.000Z] GET /api/users - IP: 192.168.1.100 - User-Agent: Mozilla/5.0...
✅ [2024-01-15T10:30:00.150Z] GET /api/users - Status: 200 - Duration: 150ms
❌ [2024-01-15T10:30:01.000Z] POST /api/auth/login - Status: 401 - Duration: 50ms
```

### 🧹 Sanitización de Datos SQL

#### Medidas Implementadas

- ✅ **Sanitización personalizada**: Remoción de caracteres peligrosos para SQL
- ✅ **Protección contra inyección SQL**: Filtrado de `'`, `"`, `;`, `\`
- ✅ **Límites de tamaño**: 10MB para JSON y URL-encoded
- ✅ **Validación de tipos**: Prevención de inyección de datos maliciosos
- ✅ **Sanitización recursiva**: Aplicada a objetos anidados
- ✅ **Compatibilidad Express 5.x**: Propiedades sanitizadas disponibles en `req`
- ✅ **Logging de intentos**: Detección y registro de posibles inyecciones SQL

#### Uso en Controladores

```javascript
// En tus controladores, usa las propiedades sanitizadas:
export const createUser = async (req, res) => {
  const { sanitizedBody } = req; // Datos sanitizados del body

  try {
    const user = await User.create(sanitizedBody);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Para queries sanitizadas:
export const searchUsers = async (req, res) => {
  const { sanitizedQuery } = req; // Query parameters sanitizados

  try {
    const users = await User.findAll({
      where: sanitizedQuery,
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error en búsqueda' });
  }
};
```

### 🚨 Manejo de Errores

#### Tipos de Errores Manejados

- ✅ **Errores de CORS**: Respuesta 403 con mensaje claro
- ✅ **Rate Limiting**: Respuesta 429 con información de retry
- ✅ **Errores Generales**: Respuesta 500 sin exponer detalles en producción

#### Configuración de Entorno

```javascript
// Desarrollo: Muestra stack trace completo
// Producción: Solo mensaje genérico
const isDevelopment = process.env.NODE_ENV === 'development';
```

## 🔧 Configuración

### Archivo de Configuración

Todas las configuraciones de seguridad están centralizadas en:

```
apps/server/config/security.js
```

### Variables de Entorno Requeridas

```bash
NODE_ENV=production|development
JWT_SECRET=tu_jwt_secret_muy_seguro
```

## 📈 Monitoreo

### Métricas de Seguridad

- Número de requests bloqueados por CORS
- Intentos de autenticación fallidos
- Requests que exceden rate limiting
- Errores de seguridad detectados

### Alertas Recomendadas

- Más de 10 intentos de login fallidos por IP en 15 minutos
- Más de 50 requests bloqueados por CORS en 1 hora
- Errores 500 frecuentes desde la misma IP

## 🚀 Despliegue Seguro

### Checklist de Producción

- [ ] `NODE_ENV=production`
- [ ] JWT_SECRET configurado y seguro
- [ ] Certificados SSL/TLS válidos
- [ ] Firewall configurado
- [ ] Logs de seguridad monitoreados
- [ ] Backups regulares de base de datos

### Headers de Seguridad Verificados

```bash
# Verificar headers de seguridad
curl -I https://tu-dominio.com/api/test
```

Headers esperados:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🔄 Actualizaciones de Seguridad

### Proceso de Actualización

1. Revisar dependencias vulnerables: `npm audit`
2. Actualizar dependencias: `npm update`
3. Probar funcionalidad después de actualizaciones
4. Monitorear logs por posibles problemas

### Dependencias de Seguridad

- `helmet`: Headers de seguridad
- `express-rate-limit`: Rate limiting
- `cors`: Control de acceso por origen
- **Sanitización SQL personalizada**: Implementada internamente para MySQL/SQL Server

## 📞 Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:

- Email: seguridad@vmltechnologies.com
- Proceso: Reporte confidencial con detalles completos
- Respuesta: Dentro de 24-48 horas

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0
