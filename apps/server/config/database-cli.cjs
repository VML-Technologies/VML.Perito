require('dotenv').config();

const driver = process.env.DATABASE_DRIVER || 'mysql';

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || (driver === 'mysql' ? 3306 : 1433),
    dialect: driver,
    dialectOptions: driver === 'mssql' ? {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    } : {},
    logging: console.log,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || (driver === 'mysql' ? 3306 : 1433),
    dialect: driver,
    dialectOptions: driver === 'mssql' ? {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    } : {},
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || (driver === 'mysql' ? 3306 : 1433),
    dialect: driver,
    dialectOptions: driver === 'mssql' ? {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    } : {},
    logging: false,
  }
};
