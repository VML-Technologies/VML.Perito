# VML Perito - Backend API

Backend REST API construido con Express.js, Sequelize ORM y soporte para múltiples bases de datos.

## 🏗️ Estructura del Proyecto

```
apps/server/
├── config/
│   └── database.js          # Configuración de Sequelize y conexiones DB
├── controllers/
│   ├── baseController.js    # Controlador base con CRUD y soft deletes
│   ├── authController.js    # Controlador de autenticación
│   └── userController.js    # Controlador específico de usuarios
├── models/
│   ├── baseModel.js         # Modelo base con soft deletes
│   └── user.js              # Modelo de usuario
├── middleware/              # Middlewares personalizados (futuro)
├── routes/                  # Definición de rutas (futuro)
├── services/                # Lógica de negocio (futuro)
├── utils/                   # Utilidades y helpers (futuro)
├── .env.example             # Variables de entorno de ejemplo
├── index.js                 # Punto de entrada de la aplicación
└── README.md               # Este archivo
```

## 🚀 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Configuración de la base de datos
DATABASE_DRIVER=mysql        # Opciones: mysql, mssql, sqlite
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=vml_perito
DB_USERNAME=root
DB_PASSWORD=secret
DB_STORAGE=./database.sqlite # Solo para sqlite

# JWT
JWT_SECRET=tu_secreto_super_seguro

# Puerto del servidor
PORT=3001
```

### 3. Configurar base de datos

```bash
# Configuración segura (recomendada)
npm run setup:db

# Si hay problemas de foreign keys, forzar recreación
FORCE_DB=true npm run setup:db
```

### 4. Crear datos de prueba (opcional)

```bash
# Solo usuario de prueba
npm run seed

# Todos los datos (departamentos, ciudades, empresas, sedes, usuarios)
npm run seed:all
```

### 5. Ejecutar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📊 Soporte de Bases de Datos

### MySQL

```env
DATABASE_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=vml_perito
DB_USERNAME=root
DB_PASSWORD=secret
```

### SQL Server

```env
DATABASE_DRIVER=mssql
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=vml_perito
DB_USERNAME=sa
DB_PASSWORD=secret
```

### SQLite

```env
DATABASE_DRIVER=sqlite
DB_STORAGE=./database.sqlite
```

## 🔐 Autenticación

### Endpoints de Autenticación

| Método | Endpoint           | Descripción     |
| ------ | ------------------ | --------------- |
| POST   | `/api/auth/login`  | Iniciar sesión  |
| GET    | `/api/auth/verify` | Verificar token |
| POST   | `/api/auth/logout` | Cerrar sesión   |

### Ejemplo de Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "123456"
  }'
```

### Respuesta de Login

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "usuario@example.com",
    "sede_id": 1,
    "phone": "123456789"
  }
}
```

## 👥 Gestión de Usuarios

### Endpoints de Usuarios

| Método | Endpoint                  | Descripción                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/api/users`              | Listar usuarios                      |
| GET    | `/api/users/:id`          | Obtener usuario                      |
| POST   | `/api/users`              | Crear usuario                        |
| PUT    | `/api/users/:id`          | Actualizar usuario                   |
| DELETE | `/api/users/:id`          | Soft delete usuario                  |
| DELETE | `/api/users/:id/force`    | Hard delete usuario                  |
| POST   | `/api/users/:id/restore`  | Restaurar usuario                    |
| GET    | `/api/users/trashed/all`  | Listar todos (incluyendo eliminados) |
| GET    | `/api/users/trashed/only` | Solo usuarios eliminados             |

### Ejemplo de Crear Usuario

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "sede_id": 1,
    "name": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "phone": "123456789",
    "password": "123456"
  }'
```

## 🗑️ Soft Deletes

El sistema incluye soft deletes automáticos usando Sequelize `paranoid`.

### Comportamiento

- `DELETE /api/users/:id` → Marca como eliminado (soft delete)
- `DELETE /api/users/:id/force` → Elimina permanentemente
- `POST /api/users/:id/restore` → Restaura registro eliminado
- `GET /api/users` → Solo registros activos
- `GET /api/users/trashed/all` → Todos los registros
- `GET /api/users/trashed/only` → Solo eliminados

## 🏗️ Convenciones de Desarrollo

### 1. Modelos

- Extender de `BaseModel` para soft deletes automáticos
- Usar `createModelWithSoftDeletes()` helper
- Definir relaciones en el modelo

```javascript
import { createModelWithSoftDeletes } from './baseModel.js';

const MiModelo = createModelWithSoftDeletes(
  'MiModelo',
  {
    // Atributos específicos del modelo
  },
  {
    tableName: 'mi_tabla',
  }
);
```

### 2. Controladores

- Extender de `BaseController` para CRUD automático
- Sobrescribir métodos según necesidades específicas
- Usar async/await para operaciones asíncronas

```javascript
import { BaseController } from './baseController.js';

class MiControlador extends BaseController {
  constructor() {
    super(MiModelo);
  }

  // Sobrescribir métodos según necesidad
  async store(req, res) {
    // Lógica personalizada
  }
}
```

### 3. Rutas

- Agrupar por recurso
- Usar prefijos consistentes
- Documentar endpoints

```javascript
// Rutas de autenticación
app.post('/api/auth/login', login);
app.get('/api/auth/verify', verify);

// Rutas de usuarios
app.get('/api/users', userController.index);
app.post('/api/users', userController.store);
```

### 4. Variables de Entorno

- Usar prefijos descriptivos
- Documentar todas las variables
- Proporcionar valores por defecto seguros

## 🔧 Middleware Futuro

### Autenticación

```javascript
// middleware/auth.js
export const authenticateToken = (req, res, next) => {
  // Verificar JWT token
};
```

### Validación

```javascript
// middleware/validation.js
export const validateUser = (req, res, next) => {
  // Validar datos de entrada
};
```

### Rate Limiting

```javascript
// middleware/rateLimit.js
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
});
```

## 📝 Scripts Disponibles

```json
{
  "dev": "nodemon index.js",
  "start": "node index.js",
  "test": "jest",
  "migrate": "sequelize-cli db:migrate",
  "seed": "sequelize-cli db:seed:all"
}
```

## 🧪 Testing

### Estructura de Tests (Futuro)

```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── services/
├── integration/
│   └── api/
└── fixtures/
```

## 📚 Recursos Adicionales

- [Sequelize Documentation](https://sequelize.org/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/)

## 🤝 Contribución

1. Seguir las convenciones establecidas
2. Documentar nuevos endpoints
3. Agregar tests para nueva funcionalidad
4. Usar commits descriptivos

## 📄 Licencia

Este proyecto está bajo la licencia ISC.
