import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { login, verify, logout } from './controllers/authController.js';
import userController from './controllers/userController.js';

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
        await sequelize.sync({ alter: true });
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

