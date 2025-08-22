# Formato de Respuestas API - VML.Perito

## 📋 Descripción

Estándares de formato de respuestas API para VML.Perito, incluyendo estructura estándar de respuestas exitosas y de error, códigos de estado HTTP apropiados, manejo de errores de validación, formato de paginación, mensajes de error en español, y patrones de implementación consistentes.

## Standard Response Structure

All API responses should follow this consistent format:

```javascript
// Success Response
{
    success: true,
    data: responseData,
    message: "Operación completada exitosamente" // Optional
}

// Error Response
{
    success: false,
    message: "Descripción del error en español"
}
```

## HTTP Status Codes

- `200`: Success (GET, PUT, PATCH)
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Error Handling Pattern

```javascript
try {
  // API logic here
  res.json({
    success: true,
    data: result,
  });
} catch (error) {
  console.error('Error description:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
}
```

## Validation Error Format

```javascript
res.status(400).json({
  success: false,
  message: 'Campos requeridos faltantes',
  errors: {
    field: 'Descripción del error específico',
  },
});
```

## Pagination Format

```javascript
{
    success: true,
    data: {
        items: [...],
        pagination: {
            total: 100,
            page: 1,
            pages: 10,
            limit: 10
        }
    }
}
```

## Mensajes de Error en Español

Todos los mensajes de error deben estar en español y ser descriptivos:

- ✅ "Sede, modalidad y fecha son requeridos"
- ✅ "La modalidad seleccionada no está disponible en esta sede"
- ❌ "Missing required fields"

## 📚 Referencias Relacionadas

- [**Controladores API**](./api-controllers.md) - Patrones de controladores
- [**Texto en Español**](./spanish-ui-text.md) - Guías de textos
- [**Patrones de Desarrollo**](./development-patterns.md) - Convenciones generales

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado
