import http from 'http';

function makeRequest(options, description) {
    return new Promise((resolve, reject) => {
        console.log(`🔍 ${description}...`);
        
        const req = http.request(options, (res) => {
            console.log(`📊 ${description} - Status:`, res.statusCode);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`✅ ${description} - Exitoso:`, JSON.stringify(jsonData, null, 2));
                    } else {
                        console.log(`❌ ${description} - Error:`, JSON.stringify(jsonData, null, 2));
                    }
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    console.log(`❌ ${description} - Error al parsear JSON:`, data);
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', (error) => {
            console.error(`❌ ${description} - Error de conexión:`, error.message);
            reject(error);
        });
        
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function testRBAC() {
    try {
        // 1. Primero hacer login para obtener un token fresco
        const loginOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@vmlperito.com',
                password: 'admin123'
            })
        };
        
        const loginResult = await makeRequest(loginOptions, 'Login');
        
        if (loginResult.status !== 200 || !loginResult.data.token) {
            console.log('❌ Login falló, no se puede continuar con las pruebas');
            return;
        }
        
        const token = loginResult.data.token;
        console.log('🎯 Token obtenido, continuando con las pruebas...\n');
        
        // 2. Probar ruta de perfil
        const profileOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/users/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        await makeRequest(profileOptions, 'Obtener perfil');
        
        // 3. Probar ruta protegida de ejemplo
        const protectedOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/users/protected',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        await makeRequest(protectedOptions, 'Ruta protegida de ejemplo');
        
        // 4. Probar acceso sin token (debe fallar)
        const unauthorizedOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/users/profile',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        await makeRequest(unauthorizedOptions, 'Acceso sin token (debe fallar)');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

testRBAC(); 