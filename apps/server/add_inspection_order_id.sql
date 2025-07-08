-- Script para agregar la columna inspection_order_id a la tabla appointments
-- Ejecutar este script en la base de datos para resolver el error de relación
ALTER TABLE
    `appointments`
ADD
    COLUMN `inspection_order_id` bigint NOT NULL
AFTER
    `sede_id`,
ADD
    CONSTRAINT `appointments_ibfk_inspection_order` FOREIGN KEY (`inspection_order_id`) REFERENCES `inspection_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Agregar índice para mejorar el rendimiento
ALTER TABLE
    `appointments`
ADD
    INDEX `appointment_inspection_order_idx` (`inspection_order_id`);