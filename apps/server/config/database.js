import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const driver = process.env.DATABASE_DRIVER || 'mysql';

let sequelize;

if (driver == 'mysql') {
    sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
        }
    );
} else if (driver == 'mssql') {
    sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 1433,
            dialect: 'mssql',
            logging: false,
            dialectOptions: {
                options: {
                    encrypt: true,
                },
            },
        }
    );
} else if (driver == 'sqlite') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || './database.sqlite',
        logging: false,
    });
} else {
    throw new Error('DATABASE_DRIVER no soportado');
}

export default sequelize; 