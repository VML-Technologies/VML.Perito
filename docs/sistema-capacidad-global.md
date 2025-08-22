# Sistema de Capacidad Global - Movilidad Mundial

## Resumen

Se ha implementado un sistema de capacidad global que permite controlar el número máximo de citas por intervalo de tiempo de manera independiente a las sedes y modalidades de inspección.

## Cambios Implementados

### 1. Variable de Entorno

Se agregó la variable de entorno `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL` en el archivo `.env.example`:

```env
# Configuración de Agendamiento
MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=10
```

### 2. Modificaciones en ScheduleController

#### Archivo: `apps/server/controllers/scheduleController.js`

**Cambios principales:**

1. **Importación de la variable global:**
```javascript
const MAX_GLOBAL_AVAILABILITY = parseInt(process.env.MAX_GLOBAL_AVAILABILITY_PER_INTERVAL) || 10;
```

2. **Documentación agregada:**
```javascript
/**
 * Controlador de agendamiento con capacidad global
 * 
 * IMPORTANTE: El sistema de cupos ahora es independiente de sedes y modalidades.
 * Se usa MAX_GLOBAL_AVAILABILITY_PER_INTERVAL para limitar el número total
 * de citas por intervalo de tiempo, sin importar la sede o modalidad.
 */
```

3. **Método `generateTimeSlots()` actualizado:**
   - Ahora busca citas existentes de forma global (sin filtrar por sede o modalidad)
   - Usa `MAX_GLOBAL_AVAILABILITY` en lugar de `template.capacity_per_interval`
   - Retorna la capacidad global en lugar de la capacidad por plantilla

4. **Método `getAvailableSchedules()` actualizado:**
   - Muestra la capacidad global en la respuesta de la API

5. **Método `createScheduledAppointment()` actualizado:**
   - Mensaje de error más descriptivo cuando se agota el cupo global

## Comportamiento del Sistema

### Antes (Capacidad por Plantilla)
- Cada plantilla de horario tenía su propia capacidad (`capacity_per_interval`)
- Las citas se contaban por sede y modalidad
- Podía haber 10 citas en sede A y 10 citas en sede B al mismo tiempo

### Ahora (Capacidad Global)
- Una sola capacidad máxima para todo el sistema
- Las citas se cuentan globalmente por fecha y hora exacta
- Si `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=10`, solo puede haber 10 citas en total a las 9:00 AM, sin importar la sede o modalidad
- **Ejemplo**: Si hay 1 cita virtual + 1 cita a domicilio a las 07:00, quedan 8 cupos disponibles

## Configuración

### Para Desarrollo
```env
MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=10
```

### Para Producción
```env
MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=50
```

## Ejemplos Prácticos

### Escenario 1: Capacidad Básica
- **Configuración**: `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=10`
- **Citas existentes a las 07:00**:
  - 1 cita virtual
  - 1 cita a domicilio
- **Resultado**: 8 cupos disponibles (10 - 2 = 8)

### Escenario 2: Capacidad Agotada
- **Configuración**: `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=5`
- **Citas existentes a las 09:00**:
  - 3 citas en sede
  - 2 citas virtuales
- **Resultado**: 0 cupos disponibles (5 - 5 = 0) - **CUPO AGOTADO**

### Escenario 3: Diferentes Horarios
- **Configuración**: `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL=10`
- **Citas existentes**:
  - 07:00: 2 citas
  - 08:00: 5 citas
  - 09:00: 0 citas
- **Resultado**:
  - 07:00: 8 cupos disponibles
  - 08:00: 5 cupos disponibles
  - 09:00: 10 cupos disponibles

## API Response

La respuesta de la API ahora incluye la capacidad global:

```json
{
  "success": true,
  "data": [
    {
      "template": {
        "id": 1,
        "name": "Lunes a Viernes Mañana",
        "start_time": "08:00:00",
        "end_time": "12:00:00",
        "interval_minutes": 60,
        "capacity_per_interval": 10
      },
      "slots": [
        {
          "start_time": "08:00:00",
          "end_time": "09:00:00",
          "available_capacity": 7,
          "total_capacity": 10,
          "occupied": 3
        }
      ]
    }
  ]
}
```

## Validaciones

### Creación de Citas
- Se verifica que no se exceda la capacidad global
- Si se agota el cupo, se retorna error: "El horario seleccionado no está disponible (cupo global agotado)"

### Consulta de Horarios
- Solo se muestran slots con capacidad disponible
- La capacidad mostrada es la global, no la de la plantilla

## Script de Prueba

Se creó un script de prueba en `apps/server/test-global-capacity.js` para verificar el funcionamiento:

```bash
node apps/server/test-global-capacity.js
```

## Migración

### Para Usuarios Existentes
1. Agregar la variable `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL` al archivo `.env`
2. Reiniciar el servidor
3. El sistema automáticamente usará la nueva lógica

### Para Nuevas Instalaciones
1. Copiar el archivo `.env.example` a `.env`
2. Configurar `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL` según necesidades
3. Iniciar el servidor

## Beneficios

1. **Control Centralizado:** Una sola configuración para todo el sistema
2. **Flexibilidad:** Fácil ajuste de capacidad sin modificar plantillas
3. **Consistencia:** Mismo límite para todas las sedes y modalidades
4. **Escalabilidad:** Fácil ajuste según demanda del negocio

## Consideraciones

1. **Impacto en Citas Existentes:** Las citas ya creadas seguirán funcionando normalmente
2. **Rendimiento:** La consulta global puede ser ligeramente más lenta, pero es mínima
3. **Compatibilidad:** Totalmente compatible con el sistema existente

## Troubleshooting

### Error: "MAX_GLOBAL_AVAILABILITY_PER_INTERVAL is not defined"
- Verificar que la variable esté definida en `.env`
- Reiniciar el servidor después de agregar la variable

### Capacidad Incorrecta
- Verificar el valor de `MAX_GLOBAL_AVAILABILITY_PER_INTERVAL`
- Asegurar que sea un número válido

### Citas No Se Crean
- Verificar que haya capacidad disponible globalmente
- Revisar logs del servidor para errores específicos
