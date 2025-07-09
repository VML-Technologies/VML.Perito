import sequelize from './config/database.js';
import './models/index.js';
import { InspectionOrder, Appointment, User } from './models/index.js';


async function test() {
    await sequelize.authenticate();
    console.log('Conexión exitosa');

    await sequelize.sync({ force: false });

    let inspecciones = await InspectionOrder.findAll({
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }, {
                model: Appointment,
                as: 'appointments',
                attributes: ['id', 'scheduled_date', 'scheduled_time']
            }
        ]
    });

    inspecciones.map(() => {
        console.log()
    })
}

test();