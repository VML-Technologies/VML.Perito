import { io } from 'socket.io-client';
import http from 'http';

// Función para hacer login y obtener token
async function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            email: 'admin@vmlperito.com',
            password: '123456'
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 200 && response.token) {
                        resolve(response.token);
                    } else {
                        reject(new Error('Login falló: ' + data));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
}

// Función principal de prueba
async function testWebSockets() {
    try {
        console.log('🔍 Iniciando pruebas de WebSockets...\n');

        // 1. Hacer login para obtener token
        console.log('1. Obteniendo token de autenticación...');
        const token = await login();
        console.log('✅ Token obtenido exitosamente\n');

        // 2. Conectar al WebSocket
        console.log('2. Conectando al WebSocket...');
        const socket = io('http://localhost:3000', {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        // 3. Configurar listeners
        socket.on('connect', () => {
            console.log('✅ Conectado al WebSocket');
            console.log('🆔 Socket ID:', socket.id);
        });

        socket.on('connected', (data) => {
            console.log('✅ Confirmación de conexión:', data);
            runTests(socket);
        });

        socket.on('notification', (notification) => {
            console.log('📢 Notificación recibida:', {
                type: notification.type,
                title: notification.title,
                message: notification.message,
                timestamp: notification.timestamp
            });
        });

        socket.on('data_update', (update) => {
            console.log('📊 Actualización de datos:', {
                channel: update.channel,
                timestamp: update.timestamp,
                data: update.data
            });
        });

        socket.on('error', (error) => {
            console.log('❌ Error del WebSocket:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Desconectado:', reason);
        });

        // 4. Manejar errores de conexión
        socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error.message);
            process.exit(1);
        });

        // 5. Configurar timeout para cerrar la conexión
        setTimeout(() => {
            console.log('\n🔌 Cerrando conexión de prueba...');
            socket.disconnect();
            process.exit(0);
        }, 30000); // 30 segundos

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
        process.exit(1);
    }
}

// Función para ejecutar pruebas específicas
function runTests(socket) {
    console.log('\n🧪 Ejecutando pruebas específicas...\n');

    // Test 1: Ping/Pong
    console.log('Test 1: Ping/Pong');
    socket.emit('ping', { test: 'data' });
    socket.on('pong', (data) => {
        console.log('✅ Pong recibido:', data.timestamp);
    });

    // Test 2: Test de conexión
    setTimeout(() => {
        console.log('\nTest 2: Test de conexión');
        socket.emit('test_connection', { testData: 'Hola WebSocket!' });
        socket.on('connection_test_result', (result) => {
            console.log('✅ Resultado del test:', {
                userId: result.userId,
                userName: result.userName,
                echo: result.echo
            });
        });
    }, 2000);

    // Test 3: Obtener usuarios conectados
    setTimeout(() => {
        console.log('\nTest 3: Obtener usuarios conectados');
        socket.emit('get_connected_users');
        socket.on('connected_users', (users) => {
            console.log('✅ Usuarios conectados:', users.length);
            users.forEach(user => {
                console.log(`   - ${user.name} (${user.email})`);
            });
        });
    }, 4000);

    // Test 4: Suscribirse a canal de datos
    setTimeout(() => {
        console.log('\nTest 4: Suscripción a canales de datos');
        socket.emit('subscribe_to_data', { channels: ['users', 'system'] });
        socket.on('subscribed_to_data', (data) => {
            console.log('✅ Suscrito a canales:', data.channels);
        });
    }, 6000);

    // Test 5: Obtener datos en tiempo real
    setTimeout(() => {
        console.log('\nTest 5: Obtener datos en tiempo real');
        socket.emit('get_realtime_data', { channel: 'system', filters: {} });
        socket.on('realtime_data', (data) => {
            console.log('✅ Datos en tiempo real recibidos:', {
                channel: data.channel,
                stats: data.data.stats
            });
        });
    }, 8000);

    // Test 6: Obtener estadísticas del sistema
    setTimeout(() => {
        console.log('\nTest 6: Estadísticas del sistema');
        socket.emit('get_system_stats');
        socket.on('system_stats', (stats) => {
            console.log('✅ Estadísticas del sistema:', {
                conexiones: stats.websocket.totalConnections,
                canales: stats.realtime.totalChannels,
                uptime: Math.round(stats.server.uptime) + 's'
            });
        });
    }, 10000);

    // Test 7: Unirse a sala personalizada
    setTimeout(() => {
        console.log('\nTest 7: Unirse a sala personalizada');
        socket.emit('join_room', { roomName: 'test_room' });
        socket.on('joined_room', (data) => {
            console.log('✅ Unido a sala:', data.roomName);
        });
    }, 12000);

    // Test 8: Salir de sala
    setTimeout(() => {
        console.log('\nTest 8: Salir de sala');
        socket.emit('leave_room', { roomName: 'test_room' });
        socket.on('left_room', (data) => {
            console.log('✅ Salió de sala:', data.roomName);
        });
    }, 14000);
}

// Ejecutar las pruebas
testWebSockets(); 