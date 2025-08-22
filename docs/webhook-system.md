# Sistema de Webhooks - VML.Perito

## Quick Reference

- **Interfaz de Administración**: [Admin.jsx](mdc:apps/web/src/pages/Admin.jsx) - Nueva pestaña "Webhooks"
- **Configuración API**: [api.js](mdc:apps/web/src/config/api.js) - Rutas WEBHOOKS
- **Modelos**: WebhookConfig, WebhookLog
- **Servicios**: WebhookService, WebhookController
- **Endpoints**: `/api/webhooks/*` para gestión completa

## Implementation Details

### **1. Integración con Interfaz de Administración**

#### **Nueva Pestaña en Admin.jsx**
```javascript
// Añadir al TabsList existente
<TabsTrigger value="webhooks" className="flex items-center gap-2">
    <Webhook className="h-4 w-4" />
    Webhooks
</TabsTrigger>

// Contenido de la pestaña
<TabsContent value="webhooks" className="space-y-6">
    {/* Estadísticas, Gestión, Logs */}
</TabsContent>
```

#### **Estados Requeridos**
```javascript
const [webhooks, setWebhooks] = useState([]);
const [webhookStats, setWebhookStats] = useState(null);
const [webhookLogs, setWebhookLogs] = useState([]);
const [selectedWebhook, setSelectedWebhook] = useState(null);
const [showWebhookForm, setShowWebhookForm] = useState(false);
```

#### **Configuración de Rutas API**
```javascript
// En config/api.js
WEBHOOKS: {
    LIST: '/api/webhooks',
    CREATE: '/api/webhooks',
    UPDATE: (id) => `/api/webhooks/${id}`,
    DELETE: (id) => `/api/webhooks/${id}`,
    GET: (id) => `/api/webhooks/${id}`,
    STATS: '/api/webhooks/stats',
    LOGS: '/api/webhooks/logs',
    TEST: (id) => `/api/webhooks/${id}/test`,
    TRIGGER: '/api/webhooks/trigger',
    REGISTER: '/api/webhooks/register'
}
```

### **2. Modelos de Datos**

#### **WebhookConfig**
```javascript
{
    id: BIGINT,
    name: STRING,                    // Nombre descriptivo
    platform_name: STRING,           // Plataforma externa
    endpoint_url: STRING,            // URL del webhook
    events: JSON,                    // Array de eventos
    secret_key: STRING,              // Clave para firma
    is_active: BOOLEAN,              // Estado activo
    retry_count: INTEGER,            // Número de reintentos
    timeout_seconds: INTEGER,        // Timeout
    rate_limit_per_minute: INTEGER,  // Rate limiting
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP
}
```

#### **WebhookLog**
```javascript
{
    id: BIGINT,
    webhook_config_id: BIGINT,       // Configuración
    event_name: STRING,              // Evento disparado
    payload: JSON,                   // Datos enviados
    response_status: INTEGER,        // Código HTTP
    response_body: TEXT,             // Respuesta
    duration_ms: INTEGER,            // Duración
    success: BOOLEAN,                // Éxito/Fallo
    error_message: TEXT,             // Error si falló
    retry_count: INTEGER,            // Reintentos
    created_at: TIMESTAMP
}
```

### **3. Servicios y Controladores**

#### **WebhookService**
```javascript
class WebhookService {
    async registerWebhook(config)
    async sendWebhook(webhookConfig, eventName, payload)
    async processEvent(eventName, data)
    async retryFailedWebhooks()
    validateSignature(payload, signature, secretKey)
    generateSignature(payload, secretKey)
}
```

#### **WebhookController**
```javascript
class WebhookController {
    async receiveWebhook(req, res)
    async registerWebhook(req, res)
    async listWebhooks(req, res)
    async updateWebhook(req, res)
    async deleteWebhook(req, res)
    async getWebhookLogs(req, res)
}
```

### **4. Middleware de Autenticación**

#### **WebhookAuthMiddleware**
```javascript
const webhookAuthMiddleware = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const signature = req.headers['x-signature'];
    
    const webhookConfig = await WebhookConfig.findOne({
        where: { secret_key: apiKey, is_active: true }
    });
    
    if (!webhookConfig) {
        return res.status(401).json({ error: 'API key inválida' });
    }
    
    // Validar firma si está presente
    if (signature) {
        const isValid = webhookService.validateSignature(
            req.body, signature, webhookConfig.secret_key
        );
        if (!isValid) {
            return res.status(401).json({ error: 'Firma inválida' });
        }
    }
    
    req.webhookConfig = webhookConfig;
    next();
};
```

## Common Patterns

### **1. Gestión de Webhooks desde UI**
```javascript
// Función de envío de webhook
const handleWebhookSubmit = async (webhookData) => {
    const url = webhookData.id 
        ? API_ROUTES.WEBHOOKS.UPDATE(webhookData.id)
        : API_ROUTES.WEBHOOKS.CREATE;
    
    const method = webhookData.id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
    });
};
```

### **2. Testing de Webhooks**
```javascript
const handleWebhookTest = async (webhookId) => {
    const response = await fetch(API_ROUTES.WEBHOOKS.TEST(webhookId), {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const result = await response.json();
    showToast(`Test enviado: ${result.success ? 'Exitoso' : 'Fallido'}`);
};
```

### **3. Filtrado de Logs**
```javascript
const [webhookFilters, setWebhookFilters] = useState({
    status: '',
    webhook_id: '',
    dateRange: null
});

const handleFilterChange = (filterType, value) => {
    setWebhookFilters(prev => ({
        ...prev,
        [filterType]: value
    }));
};
```

### **4. Validación de Eventos**
```javascript
// Lista de eventos disponibles para webhooks
const availableEvents = [
    'inspection_order.status_changed',
    'inspection_order.assigned',
    'inspection_order.scheduled',
    'appointment.created',
    'appointment.cancelled',
    'user.created',
    'user.updated',
    'sede.created',
    'sede.updated'
];
```

## Troubleshooting

### **1. Errores Comunes**

#### **API Key Inválida**
```javascript
// Verificar que la API key esté en headers
headers: {
    'x-api-key': 'your_api_key_here',
    'Content-Type': 'application/json'
}
```

#### **Firma HMAC Inválida**
```javascript
// Generar firma correcta
const signature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(payload))
    .digest('hex');
```

#### **Rate Limiting Excedido**
```javascript
// Implementar retry con backoff exponencial
const retryWithBackoff = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status === 429) {
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, i) * 1000)
                );
            } else {
                throw error;
            }
        }
    }
};
```

### **2. Debug de Webhooks**

#### **Logs de Webhook**
```javascript
// Verificar logs en la interfaz de administración
// Ruta: Admin.jsx > Pestaña Webhooks > Sección Logs
```

#### **Testing de Endpoints**
```bash
# Probar endpoint de trigger
curl -X POST http://localhost:3000/api/webhooks/trigger \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{
    "event": "inspection_order.status_changed",
    "data": {
      "order_id": 123,
      "old_status": "pending",
      "new_status": "assigned"
    }
  }'
```

### **3. Problemas de Performance**

#### **Webhooks Lentos**
- Verificar timeout_seconds en configuración
- Implementar procesamiento asíncrono
- Usar colas para webhooks masivos

#### **Memoria Alta**
- Limpiar logs antiguos regularmente
- Implementar paginación en logs
- Optimizar queries de base de datos

## Related Rules

- [vml-perito-system.mdc](mdc:.cursor/rules/vml-perito-system.mdc) - Sistema principal de VML.Perito
- [api-controllers.mdc](mdc:.cursor/rules/api-controllers.mdc) - Patrones de controladores API
- [notification-system.mdc](mdc:.cursor/rules/notification-system.mdc) - Sistema de notificaciones
- [rbac-admin-ui.mdc](mdc:.cursor/rules/rbac-admin-ui.mdc) - Interfaz de administración RBAC

## Eventos Soportados

### **Fase 1 - Eventos Críticos**
1. `inspection_order.status_changed`
2. `inspection_order.assigned`
3. `inspection_order.scheduled`
4. `appointment.created`
5. `appointment.cancelled`

### **Fase 2 - Eventos Extendidos**
1. `user.created`
2. `user.updated`
3. `sede.created`
4. `sede.updated`

## Seguridad

### **1. Autenticación**
- API keys únicas por plataforma
- Firmas HMAC para verificar integridad
- Rate limiting por API key
- Validación de IPs permitidas

### **2. Validación de Datos**
- Esquemas JSON para validar payloads
- Sanitización de datos de entrada
- Validación de tipos de datos
- Límites en tamaño de payload

### **3. Logging y Auditoría**
- Log completo de todas las operaciones
- Almacenamiento seguro de logs
- Alertas para actividades sospechosas
- Retención de logs por 90 días
## 📚 Referencias Relacionadas

- [**Webhook: inspection_order.started**](./webhook-inspection-order-started.md) - Implementación específica
- [**Sistema de Notificaciones**](./Notificaciones.md) - Integración con notificaciones
- [**API Controllers**](./api-controllers.md) - Patrones de controladores
- [**Desarrollo**](./development-patterns.md) - Patrones de desarrollo

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado
