# 📱 Acceso Móvil - Movilidad Mundial

## 🌐 URLs de Acceso

### **Desde tu celular en la misma red WiFi:**

- **Frontend (React)**: `http://192.168.2.6:5173`
- **Backend (API)**: `http://192.168.2.6:3000`

### **Credenciales de Prueba:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@vmlperito.com` | `admin123` |
| Comercial | `comercial@vmlperito.com` | `comercial123` |
| Coordinador | `coordinador@vmlperito.com` | `coordinador123` |
| Agente | `agente@vmlperito.com` | `agente123` |

## 🚀 Pasos para Acceder

### 1. **Verificar que tu celular esté en la misma red WiFi**
   - Tu PC está en la red: `192.168.2.x`
   - Tu celular debe estar conectado a la misma red WiFi

### 2. **Iniciar los servidores**
   ```bash
   # En la terminal de tu PC:
   npm run dev
   ```

### 3. **Abrir en el navegador del celular**
   - Abre el navegador de tu celular
   - Ve a: `http://192.168.2.6:5173`
   - Inicia sesión con cualquiera de las credenciales de arriba

## 🔧 Configuraciones Aplicadas

### ✅ **Backend (Express)**
- ✅ Servidor configurado para escuchar en `0.0.0.0:3000`
- ✅ CORS actualizado para permitir `http://192.168.2.6:5173`
- ✅ Rate limiting configurado para red local

### ✅ **Frontend (Vite)**
- ✅ Servidor configurado para `host: '0.0.0.0'`
- ✅ API URL actualizada a `http://192.168.2.6:3000`
- ✅ Puerto configurado en `5173`

## 🛠️ Troubleshooting

### **Si no puedes acceder:**

1. **Verifica la IP de tu PC:**
   ```bash
   ipconfig
   ```
   - Debe mostrar `192.168.2.6` en la sección Wi-Fi

2. **Verifica que el firewall no esté bloqueando:**
   - Windows Defender puede bloquear conexiones entrantes
   - Permite Node.js en el firewall si aparece el popup

3. **Verifica que ambos dispositivos estén en la misma red:**
   - PC: `192.168.2.6`
   - Celular: `192.168.2.x` (donde x es otro número)

4. **Reinicia los servidores:**
   ```bash
   # Detén con Ctrl+C y vuelve a ejecutar:
   npm run dev
   ```

## 📱 Funcionalidades Móviles

### **Completamente funcional en móvil:**
- ✅ Login y autenticación
- ✅ Dashboard responsivo
- ✅ Gestión de órdenes de inspección
- ✅ Sistema de notificaciones en tiempo real
- ✅ Contact center management
- ✅ Agendamiento de citas
- ✅ WebSockets para actualizaciones en vivo

### **Optimizado para touch:**
- ✅ Interfaz táctil con shadcn/ui
- ✅ Navegación móvil
- ✅ Formularios adaptados para móvil
- ✅ Tablas responsivas

## 🔗 Enlaces Rápidos

- **QR Code Generator**: Puedes generar un QR con `http://192.168.2.6:5173` para acceso rápido
- **Bookmark**: Guarda la URL en favoritos de tu navegador móvil

## 📊 Monitoreo

### **Logs en tiempo real:**
- Los logs del servidor mostrarán las conexiones desde tu IP móvil
- Formato: `✅ [timestamp] GET /api/... - IP: 192.168.2.x - Status: 200`

### **WebSocket Stats:**
- Endpoint: `http://192.168.2.6:3000/api/websocket/stats`
- Muestra usuarios conectados desde diferentes dispositivos