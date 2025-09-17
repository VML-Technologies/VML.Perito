import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const ImageCapture = createModelWithSoftDeletes('ImageCapture', {
    appointment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'appointments',
            key: 'id'
        }
    },
    slot: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Identificador del slot de imagen (ej: lateral_frontal, numero_motor, etc.)'
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'URL o ruta de la imagen capturada'
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nombre personalizado para la imagen (especialmente para fotos adicionales)'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Categoría de la foto adicional (accesorios o preexistencias)',
        validate: {
            isIn: [['accesorios', 'preexistencias']]
        }
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    blob_name: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Nombre del blob en Azure Blob Storage'
    }
}, {
    tableName: 'image_captures',
    indexes: [
        {
            name: 'image_capture_appointment_slot_idx',
            fields: ['appointment_id', 'slot']
        }
    ]
});

export default ImageCapture;