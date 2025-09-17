import { User, Role, UserRole } from '../models/index.js';

async function assignCoordinadorVMLRole() {
    try {
        console.log('🔍 === ASIGNACIÓN DE ROL COORDINADOR VML ===\n');
        
        // Buscar el rol coordinador_vml
        const coordinadorRole = await Role.findOne({
            where: { name: 'coordinador_vml' }
        });
        
        if (!coordinadorRole) {
            console.error('❌ Rol coordinador_vml no encontrado');
            return;
        }
        
        console.log('✅ Rol coordinador_vml encontrado:', coordinadorRole.name);
        
        // Listar usuarios disponibles
        const users = await User.findAll({
            attributes: ['id', 'name', 'email'],
            where: { is_active: true },
            order: [['name', 'ASC']]
        });
        
        console.log('\n👥 Usuarios disponibles:');
        users.forEach(user => {
            console.log(`   ${user.id}: ${user.name} (${user.email})`);
        });
        
        // Asignar rol a todos los usuarios (o puedes especificar un ID)
        console.log('\n🔧 Asignando rol coordinador_vml a todos los usuarios...');
        
        for (const user of users) {
            const [userRole, created] = await UserRole.findOrCreate({
                where: {
                    user_id: user.id,
                    role_id: coordinadorRole.id
                }
            });
            
            if (created) {
                console.log(`✅ Rol asignado a: ${user.name}`);
            } else {
                console.log(`ℹ️ Rol ya asignado a: ${user.name}`);
            }
        }
        
        console.log('\n🎉 Proceso completado!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('📍 Stack:', error.stack);
    }
}

// Ejecutar script
assignCoordinadorVMLRole().then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
});
