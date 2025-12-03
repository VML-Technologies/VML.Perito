'use strict';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import ListName from '../models/listName.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones (por si en el futuro hay FKs)
import '../models/index.js';

const seedLists = async () => {
  try {
    console.log('🌱 Iniciando seed de listas del sistema...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    /**
     * Configuración de listas:
     * - Producto (solo lista, sin ítems por ahora)
     * - tipo de vehiculo (con ítems: Camioneta, Moto)
     * - tipo motivo de cancelacion (solo lista, sin ítems por ahora)
     *
     * Nota: el campo "name" debe coincidir exactamente con lo que usa el frontend
     * (por ejemplo, "tipo de vehiculo" para el select de creación de orden).
     */
    const listsConfig = [
      {
        name: 'Producto',
        label: 'Producto',
        items: [],
      },
      {
        name: 'tipo de vehiculo',
        label: 'Tipo de Vehículo',
        items: [
          { value: 'Camioneta', label: 'Camioneta' },
          { value: 'Moto', label: 'Moto' },
        ],
      },
      {
        name: 'tipo motivo de cancelacion',
        label: 'Tipo motivo de cancelación',
        items: [],
      },
    ];

    for (const listDef of listsConfig) {
      const normalizedName = String(listDef.name).trim();
      const normalizedLabel = String(listDef.label || listDef.name).trim();

      const [parent, created] = await ListName.findOrCreate({
        where: { name: normalizedName, parent_id: null },
        defaults: {
          name: normalizedName,
          label: normalizedLabel,
          parent_id: null,
        },
      });

      if (created) {
        console.log(`✅ Lista creada: ${parent.label} (name="${parent.name}")`);
      } else {
        console.log(`ℹ️ Lista ya existía: ${parent.label} (name="${parent.name}")`);
      }

      // Crear ítems (hijos) si están configurados
      if (Array.isArray(listDef.items) && listDef.items.length > 0) {
        for (const itemDef of listDef.items) {
          const itemValue = String(itemDef.value).trim();
          const itemLabel = String(itemDef.label || itemValue).trim();

          const [item, itemCreated] = await ListName.findOrCreate({
            where: {
              parent_id: parent.id,
              value: itemValue,
            },
            defaults: {
              name: null,
              label: itemLabel,
              value: itemValue,
              parent_id: parent.id,
            },
          });

          if (itemCreated) {
            console.log(
              `   ✅ Ítem creado en "${parent.name}": value="${item.value}", label="${item.label}"`
            );
          } else {
            console.log(
              `   ℹ️ Ítem ya existía en "${parent.name}": value="${item.value}", label="${item.label}"`
            );
          }
        }
      }
    }

    console.log('🎉 Seed de listas completado correctamente.');
  } catch (error) {
    console.error('❌ Error ejecutando seed de listas:', error);
    process.exitCode = 1;
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Conexión a la base de datos cerrada.');
    } catch (closeError) {
      console.error('⚠️ Error al cerrar la conexión:', closeError);
    }
  }
};

// Permitir ejecutar el script directamente con `node scripts/seedLists.js`
if (import.meta.url === `file://${__filename}`) {
  seedLists();
}

export default seedLists;


