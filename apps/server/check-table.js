const { sequelize } = require('./models');

(async () => {
    try {
        console.log('Verificando estructura de la tabla inspection_orders...');
        const result = await sequelize.query('DESCRIBE inspection_orders');
        console.log('Columnas actuales:');
        console.table(result[0]);

        // También verificar si la tabla existe
        const tables = await sequelize.query("SHOW TABLES LIKE 'inspection_orders'");
        console.log('\nTabla existe:', tables[0].length > 0);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})(); 