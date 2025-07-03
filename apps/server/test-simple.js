console.log('🔍 Iniciando pruebas del RBAC...');

// Función para hacer peticiones HTTP simples
async function testRoutes() {
    console.log('\n1. Probando ruta base del servidor...');

    try {
        const response = await fetch('http://localhost:3000/api');
        const data = await response.json();
        console.log('✅ Servidor responde:', data);
    } catch (error) {
        console.log('❌ Error conectando al servidor:', error.message);
        return;
    }

    console.log('\n2. Probando login...');
    try {
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@vmlperito.com',
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login exitoso');

            console.log('\n3. Probando ruta de perfil...');
            const profileResponse = await fetch('http://localhost:3000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('✅ Perfil obtenido exitosamente:', profileData.name);
                console.log('🎯 Roles:', profileData.roles);
                console.log('🔐 Permisos:', profileData.permissions?.slice(0, 5), '...');
            } else {
                const errorData = await profileResponse.json();
                console.log('❌ Error en perfil:', errorData);
            }

        } else {
            const errorData = await loginResponse.json();
            console.log('❌ Error en login:', errorData);
        }

    } catch (error) {
        console.log('❌ Error en pruebas:', error.message);
    }
}

// Solo ejecutar si tenemos fetch disponible
if (typeof fetch !== 'undefined') {
    testRoutes();
} else {
    console.log('❌ fetch no está disponible en esta versión de Node.js');
    console.log('💡 Puedes probar manualmente con:');
    console.log('   curl http://localhost:3000/api');
    console.log('   O abrir http://localhost:3000/api en tu navegador');
} 