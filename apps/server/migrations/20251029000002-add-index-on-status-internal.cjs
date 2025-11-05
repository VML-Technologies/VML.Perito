/**
 * Adds composite index on inspection_orders(status_internal, deleted_at) to speed up filtered lists
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('inspection_orders', {
            name: 'ix_inspection_orders_status_internal_deleted_at',
            fields: ['status_internal', 'deleted_at'],
            using: 'BTREE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('inspection_orders', 'ix_inspection_orders_status_internal_deleted_at');
    }
};
