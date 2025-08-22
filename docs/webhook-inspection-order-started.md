# Webhook: inspection_order.started

## 📋 Descripción

Este documento describe la implementación y uso del webhook para el evento `inspection_order.started`, que permite a sistemas externos notificar cuando una inspección virtual ha comenzado, activando automáticamente el envío de SMS al cliente con el enlace de la sesión.

## 🎯 Propósito

El webhook `inspection_order.started` está diseñado para:

- **Integración externa**: Permitir que plataformas de videoconferencia (Google Meet, Zoom, Teams) notifiquen cuando una inspección virtual ha iniciado
- **Notificación automática**: Enviar SMS al cliente con el enlace de la sesión virtual
- **Trazabilidad**: Registrar el evento en el sistema para auditoría y seguimiento

## 🔧 Implementación Técnica

### **Endpoint del Webhook**

```
POST /api/webhooks/events
```

### **Autenticación**

El webhook utiliza autenticación HMAC-SHA256 con los siguientes headers:

- `Authorization: Bearer {API_KEY}`
- `X-Webhook-Signature: {HMAC_SIGNATURE}`
- `X-Webhook-Timestamp: {TIMESTAMP}`

### **Configuración de API Keys**

| API Key | Secreto | Descripción |
|---------|---------|-------------|
| `wh_live_sk_hzEiQjexTt02avI0dYQPE8GkVU8ubDCg` | `xNNX0Z3LpcsEhEMuJgYsTLmCl0OtMAqLcVqh3hxyqa67IqfXReKHIVrIAgmRsqsT` | CRM Comercial |

## 📡 Estructura del Payload

### **Payload Requerido**

```json
{
  "event": "inspection_order.started",
  "data": {
    "inspection_order": {
      "id": 1,
      "numero": "INS-2024-001",
      "nombre_cliente": "Juan Pérez",
      "celular_cliente": "3043425127",
      "correo_cliente": "simon.bolivar@holdingvml.net",
      "placa": "ABC123"
    },
    "appointment": {
      "id": 1,
      "session_id": "session_1234567890_abc123",
      "scheduled_date": "2024-01-15",
      "scheduled_time": "14:00:00",
      "session_url": "https://meet.google.com/abc-defg-hij"
    }
  }
}
```

### **Campos Obligatorios**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event` | string | Debe ser exactamente `"inspection_order.started"` |
| `data.inspection_order.id` | number | ID de la orden de inspección |
| `data.inspection_order.numero` | string | Número de la orden |
| `data.inspection_order.nombre_cliente` | string | Nombre completo del cliente |
| `data.inspection_order.celular_cliente` | string | Número de celular del cliente |
| `data.inspection_order.correo_cliente` | string | Email del cliente |
| `data.inspection_order.placa` | string | Placa del vehículo |
| `data.appointment.session_url` | string | **URL de la sesión virtual** |

## 🔐 Generación de Firma HMAC

### **Proceso de Implementación**

Para implementar el webhook `inspection_order.started`, sigue estos pasos:

#### **Paso 1: Preparar el Payload**
```json
{
  "event": "inspection_order.started",
  "data": {
    "inspection_order": {
      "id": 1,
      "numero": "INS-2024-001",
      "nombre_cliente": "Juan Pérez",
      "celular_cliente": "3043425127",
      "correo_cliente": "simon.bolivar@holdingvml.net",
      "placa": "ABC123"
    },
    "appointment": {
      "id": 1,
      "session_id": "session_1234567890_abc123",
      "scheduled_date": "2024-01-15",
      "scheduled_time": "14:00:00",
      "session_url": "https://meet.google.com/abc-defg-hij"
    }
  }
}
```

#### **Paso 2: Generar Timestamp**
```javascript
const timestamp = Math.floor(Date.now() / 1000);
// Ejemplo: 1755835195
```

#### **Paso 3: Crear Datos para Firma**
```javascript
const data = `${timestamp}.${JSON.stringify(payload)}`;
// Ejemplo: "1755835195.{\"event\":\"inspection_order.started\",...}"
```

#### **Paso 4: Calcular Firma HMAC**
```javascript
const signature = crypto.createHmac('sha256', secret)
  .update(data)
  .digest('hex');
// Ejemplo: "a1b2c3d4e5f6..."
```

#### **Paso 5: Preparar Headers**
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'X-Webhook-Signature': signature,
  'X-Webhook-Timestamp': timestamp
};
```

## 📱 Notificación SMS Automática

### **Configuración de Notificación**

Cuando el webhook se procesa exitosamente, se activa automáticamente:

- **Tipo**: `inspection_started_client_sms`
- **Canal**: SMS
- **Destinatario**: Cliente de la orden de inspección
- **Envío**: Inmediato

### **Plantilla SMS**

```
¡Hola! SEGUROS MUNDIAL te informa que te estamos esperando para la inspección virtual, únete a la sesión con el siguiente enlace: {{inspection_order.appointment.session_url}}
```

### **Variables Disponibles**

| Variable | Descripción |
|----------|-------------|
| `{{inspection_order.numero}}` | Número de la orden |
| `{{inspection_order.nombre_cliente}}` | Nombre del cliente |
| `{{inspection_order.placa}}` | Placa del vehículo |
| `{{appointment.session_id}}` | ID de la sesión |
| `{{appointment.scheduled_date}}` | Fecha programada |
| `{{appointment.scheduled_time}}` | Hora programada |
| `{{inspection_order.appointment.session_url}}` | **URL de la sesión virtual** |

## 🧪 Testing del Webhook

### **Paso 6: Enviar la Petición**

Una vez que tengas todos los elementos, envía la petición HTTP:

#### **Usando curl**
```bash
curl -X POST "https://movilidadmundial.vmltechnologies.com/api/webhooks/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wh_live_sk_hzEiQjexTt02avI0dYQPE8GkVU8ubDCg" \
  -H "X-Webhook-Signature: {TU_FIRMA_HMAC}" \
  -H "X-Webhook-Timestamp: {TU_TIMESTAMP}" \
  -d '{"event":"inspection_order.started","data":{...}}'
```

#### **Usando JavaScript/Node.js**
```javascript
const response = await fetch('https://movilidadmundial.vmltechnologies.com/api/webhooks/events', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(payload)
});

const result = await response.json();
console.log('Respuesta:', result);
```

#### **Usando Python**
```python
import requests
import json

response = requests.post(
    'https://movilidadmundial.vmltechnologies.com/api/webhooks/events',
    headers=headers,
    json=payload
)

result = response.json()
print('Respuesta:', result)
```

### **Respuesta Exitosa**

```json
{
  "success": true,
  "data": {
    "event_id": "webhook_1755835195898",
    "listeners_executed": 1,
    "notifications_sent": 1,
    "websocket_events": 0,
    "message": "Inspección virtual iniciada y notificaciones enviadas"
  },
  "webhook_id": "wh_evt_1755835194404_27kb13758",
  "processed_at": "2025-08-22T03:59:56.001Z"
}
```

### **Respuesta de Error**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Firma HMAC inválida"
  },
  "webhook_id": "wh_evt_1755835194404_27kb13758",
  "processed_at": "2025-08-22T03:59:56.001Z"
}
```

## 🔍 Logs y Debugging

### **Logs del Servidor**

El sistema genera logs detallados para debugging:

```
🔐 Verificación de firma HMAC: HABILITADA
✅ API Key encontrada: crm-comercial
✅ Firma HMAC válida
🎯 Procesando webhook: inspection_order.started
📬 Creando notificación tipo: inspection_started_client_sms
✅ Cliente agregado como destinatario: Juan Pérez
📱 Enviando SMS a: 3043425127
✅ SMS enviado exitosamente
```

### **Verificación de Variables**

Los logs incluyen información detallada sobre el procesamiento de variables:

```
🔍 Procesando variables en template:
   Template: ¡Hola! SEGUROS MUNDIAL te informa...
   Variables: ['{{inspection_order.appointment.session_url}}']
🔍 Variable: {{inspection_order.appointment.session_url}} -> Value: https://meet.google.com/abc-defg-hij
```

## 🚨 Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `INVALID_API_KEY` | API Key no válida o inactiva | Verificar API Key en base de datos |
| `INVALID_SIGNATURE` | Firma HMAC inválida | Revisar proceso de generación de firma |
| `MISSING_REQUIRED_FIELDS` | Campos obligatorios faltantes | Verificar estructura del payload |
| `PROCESSING_ERROR` | Error interno del servidor | Revisar logs del servidor |

## 🔄 Flujo Completo

### **Proceso de Implementación (Lado Cliente)**

#### **1. Preparación**
```
Preparar payload → Generar timestamp → Crear datos para firma
```

#### **2. Autenticación**
```
Calcular firma HMAC → Preparar headers → Validar formato
```

#### **3. Envío**
```
Enviar petición HTTP → Esperar respuesta → Procesar resultado
```

### **Proceso de Procesamiento (Lado Servidor)**

#### **1. Recepción del Webhook**
```
Sistema Externo → POST /api/webhooks/events → VML.Perito
```

#### **2. Autenticación**
```
Verificar API Key → Validar firma HMAC → Generar webhook_id
```

#### **3. Procesamiento del Evento**
```
Validar payload → Enriquecer contexto → Disparar evento
```

#### **4. Activación de Listener**
```
Buscar listeners → Verificar condiciones → Ejecutar acciones
```

#### **5. Envío de Notificación**
```
Crear notificación → Procesar plantilla → Enviar SMS
```

#### **6. Respuesta**
```
Registrar resultado → Devolver respuesta → Log de auditoría
```

## 📊 Monitoreo y Métricas

### **Métricas Disponibles**

- **Webhooks recibidos**: Contador total de webhooks
- **Webhooks exitosos**: Webhooks procesados correctamente
- **Webhooks fallidos**: Webhooks con errores
- **SMS enviados**: Notificaciones SMS enviadas
- **Tiempo de respuesta**: Latencia del procesamiento

### **Tablas de Auditoría**

- `webhook_logs`: Registro de todos los webhooks recibidos
- `notifications`: Registro de notificaciones enviadas
- `event_logs`: Registro de eventos procesados

## 🔧 Configuración del Sistema

### **Variables de Entorno**

```bash
# Webhook Configuration
WEBHOOK_SIGNATURE_VERIFICATION=true
WEBHOOK_TIMESTAMP_TOLERANCE=300  # 5 minutos
WEBHOOK_RATE_LIMIT=100           # requests por minuto
```

### **Configuración de Base de Datos**

```sql
-- Verificar API Keys activas
SELECT * FROM webhook_api_keys WHERE active = true;

-- Verificar configuración de notificación
SELECT * FROM notification_config 
WHERE notification_type_id = (
    SELECT id FROM notification_types 
    WHERE name = 'inspection_started_client_sms'
);
```

## 📚 Referencias Relacionadas

- [Sistema de Webhooks](./webhook-system.md) - Documentación general del sistema de webhooks
- [Sistema de Notificaciones](./Notificaciones.md) - Sistema de notificaciones multicanal
- [Plantillas de Notificación](./templates_reference.md) - Referencia de plantillas
- [Patrones de Desarrollo](./development-patterns.md) - Convenciones del proyecto

## 🆘 Soporte

### **Problemas Comunes**

1. **Firma HMAC inválida**: Verificar proceso de generación de firma paso a paso
2. **API Key no válida**: Verificar en tabla `webhook_api_keys`
3. **SMS no enviado**: Verificar configuración de notificación
4. **Variable no reemplazada**: Verificar ruta en plantilla

### **Contacto**

- **Email**: soporte@vmlperito.com
- **Documentación**: [Índice Principal](./README.md)
- **Sistema Principal**: [VML.Perito](../README.md)

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
