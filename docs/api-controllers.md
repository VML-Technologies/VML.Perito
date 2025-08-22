# Controladores API - Patrones y Convenciones

## 📋 Descripción

Patrones y convenciones para controladores API de Movilidad Mundial, incluyendo estructura de clases con métodos async, manejo de errores consistente, respuestas JSON estandarizadas, validaciones de parámetros, paginación y filtros, relaciones en consultas Sequelize, integración con notificaciones y WebSocket, y verificación de permisos RBAC.

## Estructura de Controladores

- Usar clases con métodos async para cada endpoint
- Implementar manejo de errores consistente con try/catch
- Retornar respuestas JSON estandarizadas con `success`, `data`, `message`

## Patrones de Respuesta

```javascript
// Éxito
res.json({
  success: true,
  data: result,
  message: 'Operación exitosa',
});

// Error
res.status(500).json({
  success: false,
  message: 'Error descriptivo',
  error: error.message,
});
```

## Validaciones

- Validar parámetros requeridos al inicio de cada método
- Usar middleware de validación para datos de entrada
- Verificar permisos usando el sistema RBAC
- Validar existencia de entidades antes de operaciones

## Paginación y Filtros

- Implementar paginación con `page`, `limit`, `offset`
- Permitir filtros por múltiples criterios
- Ordenamiento configurable con `sortBy`, `sortOrder`
- Búsqueda por texto en campos relevantes

## Relaciones en Consultas

- Usar `include` para cargar relaciones necesarias
- Especificar `attributes` para optimizar consultas
- Usar `required: false` para relaciones opcionales
- Ordenar resultados con `order`

## Notificaciones y WebSocket

- Usar `NotificationProvider` para notificaciones
- Emitir eventos WebSocket para actualizaciones en tiempo real
- Crear notificaciones en BD para persistencia

## 📚 Referencias Relacionadas

- [**Sistema de Notificaciones**](./Notificaciones.md) - Integración con notificaciones
- [**WebSockets**](./websockets-system.md) - Comunicación en tiempo real
- [**Formato de Respuestas**](./api-response-format.md) - Estándares de respuestas
- [**Patrones de Desarrollo**](./development-patterns.md) - Convenciones generales

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado
