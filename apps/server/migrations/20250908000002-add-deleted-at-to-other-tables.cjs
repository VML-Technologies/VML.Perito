'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'users',
      'roles',
      'permissions',
      'user_roles',
      'role_permissions',
      'departments',
      'cities',
      'companies',
      'sedes',
      'sede_types',
      'vehicle_types',
      'sede_vehicle_types',
      'inspection_modalities',
      'sede_modality_availability',
      'inspection_orders',
      'inspection_orders_statuses',
      'schedule_templates',
      'call_logs',
      'call_statuses',
      'notifications',
      'notification_queue',
      'notification_config',
      'notification_types',
      'notification_channels',
      'events',
      'event_listeners',
      'accessories',
      'checklist_responses',
      'checklists',
      'database_firewall_rules',
      'image_captures',
      'inspection_categories',
      'inspection_category_responses',
      'inspection_part_responses',
      'inspection_parts',
      'mechanical_tests',
      'messages',
      'recordings',
      'refresh_tokens',
      'token_blacklist',
    ]
    for (const table of tables) {
      try {
        await queryInterface.addColumn(table, 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha de eliminación para soft delete (paranoid)'
        });
        
        await queryInterface.addIndex(table, ['deleted_at'], {
          name: `${table}_deleted_at_idx`
        });
      } catch (error) {
        console.log(`Error al agregar deleted_at a la tabla ${table}:`, error);
      }

    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'users',
      'roles',
      'permissions',
      'user_roles',
      'role_permissions',
      'departments',
      'cities',
      'companies',
      'sedes',
      'sede_types',
      'vehicle_types',
      'sede_vehicle_types',
      'inspection_modalities',
      'sede_modality_availability',
      'inspection_orders',
      'inspection_orders_statuses',
      'inspection_parts',
      'inspection_categories',
      'inspection_category_responses',
      'mechanical_tests',
      'schedule_templates',
      'call_logs',
      'call_statuses',
      'notifications',
      'notification_queue',
      'notification_config',
      'notification_types',
      'notification_channels',
      'events',
      'event_listeners'
    ]
    for (const table of tables) {
      await queryInterface.removeIndex(table, `${table}_deleted_at_idx`);
      await queryInterface.removeColumn(table, 'deleted_at');
    }
  }
};
