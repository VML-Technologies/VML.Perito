import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const TemplateVersion = createModelWithSoftDeletes('TemplateVersion', {
    template_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID de la plantilla'
    },
    version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Número de versión'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre de la plantilla en esta versión'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción de la plantilla en esta versión'
    },
    channels: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Configuración de plantillas por canal en esta versión'
    },
    variables: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Lista de variables en esta versión'
    },
    changes_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Resumen de los cambios realizados'
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID del usuario que creó esta versión'
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si esta es la versión actual'
    }
}, {
    tableName: 'template_versions',
    timestamps: true,
    indexes: [
        {
            name: 'idx_template_versions_template_id',
            fields: ['template_id']
        },
        {
            name: 'idx_template_versions_version_number',
            fields: ['version_number']
        },
        {
            name: 'idx_template_versions_current',
            fields: ['is_current']
        },
        {
            name: 'idx_template_versions_created_by',
            fields: ['created_by']
        }
    ]
});

export default TemplateVersion; 