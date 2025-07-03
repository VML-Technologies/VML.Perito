import fetch from 'node-fetch';

async function testServer() {
    try {
        console.log('Probando conexión al servidor...');

        const response = await fetch('http://localhost:3000/api');
        const data = await response.json();

        console.log('✅ Servidor respondiendo correctamente:', data);

        // Probar login
        console.log('\nProbando login...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@vmlperito.com',
                password: '123456'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login exitoso');
            console.log('Token:', loginData.token ? 'Recibido' : 'No recibido');

            // Probar perfil con el token
            if (loginData.token) {
                console.log('\nProbando perfil...');
                const profileResponse = await fetch('http://localhost:3000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`
                    }
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log('✅ Perfil obtenido correctamente');
                    console.log('Usuario:', profileData.name);
                    console.log('Roles:', profileData.roles);
                } else {
                    const errorData = await profileResponse.json();
                    console.log('❌ Error al obtener perfil:', errorData);
                }
            }
        } else {
            const errorData = await loginResponse.json();
            console.log('❌ Error en login:', errorData);
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testServer(); 