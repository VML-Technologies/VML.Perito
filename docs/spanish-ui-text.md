# Guías de Texto en Español - VML.Perito

## 📋 Descripción

Guías para texto de interfaz de usuario en español para VML.Perito, incluyendo mensajes de notificación, errores descriptivos, etiquetas de formularios, placeholders, mensajes de éxito, y ejemplos de implementación correcta usando el sistema de notificaciones en lugar de alerts del navegador.

## Textos Dirigidos al Usuario en Español

Todas las etiquetas, mensajes, notificaciones y textos de interfaz de usuario deben mostrarse en español.

## Ejemplos

- ✅ "Agendamiento creado exitosamente"
- ✅ "Error interno del servidor"
- ✅ "Campos requeridos faltantes"
- ❌ "Appointment created successfully"
- ❌ "Internal server error"

## Mensajes de Notificación

Use el sistema de notificaciones existente en lugar de alerts del navegador:

```javascript
// ✅ Correct - Use notification context
notificationContext.showNotification({
  type: 'success',
  title: 'Éxito',
  message: 'Agendamiento creado exitosamente',
});

// ❌ Avoid browser alerts
alert('Success message');
```

## Mensajes de Error

Siempre proporcione mensajes de error descriptivos en español:

```javascript
res.status(400).json({
  success: false,
  message: 'Sede, modalidad y fecha son requeridos',
});
```

## Etiquetas y Placeholders de Formularios

Todos los elementos de formulario deben tener etiquetas y placeholders en español:

```javascript
<Label htmlFor="sede">Sede</Label>
<Input placeholder="Seleccione una sede" />
```

## Mensajes de Éxito

Use lenguaje positivo y orientado a la acción:

- ✅ "Agendamiento creado exitosamente"
- ✅ "Orden de inspección guardada"
- ✅ "Datos actualizados correctamente"

## 📚 Referencias Relacionadas

- [**Formato de Respuestas API**](./api-response-format.md) - Estándares de respuestas
- [**Patrones de Componentes**](./ui-component-patterns.md) - Componentes de interfaz
- [**Sistema de Notificaciones**](./Notificaciones.md) - Sistema de notificaciones

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado
