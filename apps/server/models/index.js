import Department from './department.js';
import City from './city.js';
import Company from './company.js';
import Sede from './sede.js';
import User from './user.js';

// Definir relaciones

// Department -> Cities (1:N)
Department.hasMany(City, {
    foreignKey: 'department_id',
    as: 'cities'
});
City.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department'
});

// City -> Companies (1:N)
City.hasMany(Company, {
    foreignKey: 'city_id',
    as: 'companies'
});
Company.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
});

// City -> Sedes (1:N)
City.hasMany(Sede, {
    foreignKey: 'city_id',
    as: 'sedes'
});
Sede.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
});

// Company -> Sedes (1:N)
Company.hasMany(Sede, {
    foreignKey: 'company_id',
    as: 'sedes'
});
Sede.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
});

// Sede -> Users (1:N)
Sede.hasMany(User, {
    foreignKey: 'sede_id',
    as: 'users'
});
User.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
});

export {
    Department,
    City,
    Company,
    Sede,
    User
}; 