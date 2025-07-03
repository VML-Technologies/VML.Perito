import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { login, verify, logout } from './controllers/authController.js';
import userController from './controllers/userController.js';
import departmentController from './controllers/departmentController.js';
import cityController from './controllers/cityController.js';
import companyController from './controllers/companyController.js';
import sedeController from './controllers/sedeController.js';
import { requirePermission } from './middleware/rbac.js';
import permissionController from './controllers/permissionController.js';
import roleController from './controllers/roleController.js';

// Importar modelos para establecer relaciones
import './models/index.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Rutas de autenticación
app.post('/api/auth/login', login);
app.get('/api/auth/verify', verify);
app.post('/api/auth/logout', logout);

// Rutas RBAC
app.get('/api/permissions', requirePermission('permissions.read'), permissionController.index);
app.get('/api/permissions/registered', requirePermission('permissions.read'), permissionController.registered);
app.get('/api/roles', requirePermission('roles.read'), roleController.index);
app.post('/api/roles', requirePermission('roles.create'), roleController.store);
app.put('/api/roles/:id', requirePermission('roles.update'), roleController.update);
app.delete('/api/roles/:id', requirePermission('roles.delete'), roleController.destroy);
app.post('/api/permissions', requirePermission('permissions.create'), permissionController.store);
app.put('/api/permissions/:id', requirePermission('permissions.update'), permissionController.update);
app.delete('/api/permissions/:id', requirePermission('permissions.delete'), permissionController.destroy);
app.post('/api/roles/:id/permissions', requirePermission('roles.update'), roleController.assignPermissions);
app.get('/api/roles/:id/permissions', requirePermission('roles.read'), roleController.getPermissions);
app.post('/api/users/:userId/roles', requirePermission('users.update'), roleController.assignUserRoles);
app.get('/api/users/:userId/roles', requirePermission('users.read'), roleController.getUserRoles);
app.get('/api/users/with-roles', requirePermission('users.read'), roleController.getUsersWithRoles);

// Rutas de departamentos
app.get('/api/departments', departmentController.index);
app.get('/api/departments/:id', departmentController.show);
app.post('/api/departments', departmentController.store);
app.put('/api/departments/:id', departmentController.update);
app.delete('/api/departments/:id', departmentController.destroy);
app.delete('/api/departments/:id/force', departmentController.forceDestroy);
app.post('/api/departments/:id/restore', departmentController.restore);

// Rutas de ciudades
app.get('/api/cities', cityController.index);
app.get('/api/cities/:id', cityController.show);
app.get('/api/departments/:departmentId/cities', cityController.getByDepartment);
app.post('/api/cities', cityController.store);
app.put('/api/cities/:id', cityController.update);
app.delete('/api/cities/:id', cityController.destroy);
app.delete('/api/cities/:id/force', cityController.forceDestroy);
app.post('/api/cities/:id/restore', cityController.restore);

// Rutas de empresas
app.get('/api/companies', companyController.index);
app.get('/api/companies/:id', companyController.show);
app.post('/api/companies', companyController.store);
app.put('/api/companies/:id', companyController.update);
app.delete('/api/companies/:id', companyController.destroy);
app.delete('/api/companies/:id/force', companyController.forceDestroy);
app.post('/api/companies/:id/restore', companyController.restore);

// Rutas de sedes
app.get('/api/sedes', sedeController.index);
app.get('/api/sedes/:id', sedeController.show);
app.get('/api/companies/:companyId/sedes', sedeController.getByCompany);
app.post('/api/sedes', sedeController.store);
app.put('/api/sedes/:id', sedeController.update);
app.delete('/api/sedes/:id', sedeController.destroy);
app.delete('/api/sedes/:id/force', sedeController.forceDestroy);
app.post('/api/sedes/:id/restore', sedeController.restore);

// Rutas de usuarios
app.get('/api/users', userController.index);
app.get('/api/users/:id', userController.show);
app.post('/api/users', userController.store);
app.put('/api/users/:id', userController.update);
app.delete('/api/users/:id', userController.destroy);
app.delete('/api/users/:id/force', userController.forceDestroy);
app.post('/api/users/:id/restore', userController.restore);
app.get('/api/users/trashed/all', userController.indexWithTrashed);
app.get('/api/users/trashed/only', userController.onlyTrashed);
app.get('/api/users/profile', requirePermission('users.read'), userController.profile);

// Ejemplo de endpoint protegido
app.get('/api/users/protected', requirePermission('users.read'), (req, res) => {
    res.json({ message: 'Tienes permiso para ver usuarios', user: req.user });
});

// Ruta de prueba
app.get('/api', (req, res) => {
    res.json({ message: '¡Hola desde el servidor Express!' });
});

// Sincronizar base de datos y arrancar servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');

        app.listen(port, () => {
            console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
            console.log(`📊 Base de datos: ${process.env.DATABASE_DRIVER || 'mysql'}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

startServer();

