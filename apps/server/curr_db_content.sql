-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 04-07-2025 a las 22:30:28
-- Versión del servidor: 8.0.42
-- Versión de PHP: 8.3.22
SET
    SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
    time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;

/*!40101 SET NAMES utf8mb4 */
;

--
-- Base de datos: `vmltechnologies_DEV_PeritoVML`
--
-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `appointments`
--
CREATE TABLE `appointments` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `sede_id` bigint DEFAULT NULL,
    `call_log_id` bigint NOT NULL,
    `inspection_order_id` bigint NOT NULL,
    `inspection_type_id` bigint NOT NULL,
    `scheduled_date` date DEFAULT NULL,
    `scheduled_time` time DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `call_logs`
--
CREATE TABLE `call_logs` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `inspection_order_id` bigint NOT NULL,
    `call_time` datetime NOT NULL,
    `status_id` bigint NOT NULL,
    `comments` text
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `call_statuses`
--
CREATE TABLE `call_statuses` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `creates_schedule` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `call_statuses`
--
INSERT INTO
    `call_statuses` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `creates_schedule`
    )
VALUES
    (
        1,
        '2025-07-04 13:04:45',
        '2025-07-04 13:04:45',
        'Contacto exitoso',
        1
    ),
    (
        2,
        '2025-07-04 13:04:46',
        '2025-07-04 13:04:46',
        'Agendado',
        1
    ),
    (
        3,
        '2025-07-04 13:04:46',
        '2025-07-04 13:04:46',
        'No contesta',
        0
    ),
    (
        4,
        '2025-07-04 13:04:47',
        '2025-07-04 13:04:47',
        'Ocupado',
        0
    ),
    (
        5,
        '2025-07-04 13:04:47',
        '2025-07-04 13:04:47',
        'Número incorrecto',
        0
    ),
    (
        6,
        '2025-07-04 13:04:47',
        '2025-07-04 13:04:47',
        'Solicita reagendar',
        0
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `cities`
--
CREATE TABLE `cities` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `department_id` bigint NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cities`
--
INSERT INTO
    `cities` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `department_id`
    )
VALUES
    (
        1,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Medellín',
        1
    ),
    (
        2,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Bello',
        1
    ),
    (
        3,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Envigado',
        1
    ),
    (
        4,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Bogotá',
        2
    ),
    (
        5,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Soacha',
        2
    ),
    (
        6,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Cali',
        3
    ),
    (
        7,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Palmira',
        3
    ),
    (
        8,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Barranquilla',
        4
    ),
    (
        9,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Soledad',
        4
    ),
    (
        10,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Bucaramanga',
        5
    ),
    (
        11,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Medellín',
        1
    ),
    (
        12,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Bello',
        1
    ),
    (
        13,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Envigado',
        1
    ),
    (
        14,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Bogotá',
        2
    ),
    (
        15,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Soacha',
        2
    ),
    (
        16,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Cali',
        3
    ),
    (
        17,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Palmira',
        3
    ),
    (
        18,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Barranquilla',
        4
    ),
    (
        19,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Soledad',
        4
    ),
    (
        20,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        'Bucaramanga',
        5
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `companies`
--
CREATE TABLE `companies` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(150) NOT NULL,
    `nit` varchar(20) NOT NULL,
    `city_id` bigint NOT NULL,
    `address` varchar(255) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `companies`
--
INSERT INTO
    `companies` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `nit`,
        `city_id`,
        `address`
    )
VALUES
    (
        1,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'VML Perito S.A.S.',
        '900123456-7',
        1,
        'Calle 10 # 20-30, Medellín'
    ),
    (
        2,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Consultores Asociados Ltda.',
        '800987654-3',
        4,
        'Carrera 15 # 45-67, Bogotá'
    ),
    (
        3,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Expertos Legales S.A.',
        '700456789-1',
        6,
        'Avenida 4 Norte # 12-34, Cali'
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `departments`
--
CREATE TABLE `departments` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `departments`
--
INSERT INTO
    `departments` (`id`, `created_at`, `updated_at`, `name`)
VALUES
    (
        1,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Antioquia'
    ),
    (
        2,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Cundinamarca'
    ),
    (
        3,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Valle del Cauca'
    ),
    (
        4,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Atlántico'
    ),
    (
        5,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        'Santander'
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `inspection_orders`
--
CREATE TABLE `inspection_orders` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `user_id` bigint NOT NULL,
    `sede_id` bigint DEFAULT NULL,
    `producto` varchar(50) NOT NULL,
    `callback_url` text NOT NULL,
    `numero` int NOT NULL,
    `intermediario` varchar(50) NOT NULL,
    `clave_intermediario` varchar(10) NOT NULL,
    `sucursal` varchar(50) NOT NULL,
    `cod_oficina` varchar(10) NOT NULL,
    `fecha` date NOT NULL,
    `vigencia` varchar(10) NOT NULL,
    `avaluo` varchar(50) NOT NULL,
    `vlr_accesorios` varchar(50) NOT NULL,
    `placa` varchar(6) NOT NULL,
    `marca` varchar(50) NOT NULL,
    `linea` varchar(50) NOT NULL,
    `clase` varchar(50) NOT NULL,
    `modelo` varchar(4) NOT NULL,
    `cilindraje` varchar(10) NOT NULL,
    `color` varchar(100) NOT NULL,
    `servicio` varchar(50) NOT NULL,
    `motor` varchar(50) NOT NULL,
    `chasis` varchar(50) NOT NULL,
    `vin` varchar(50) NOT NULL,
    `carroceria` varchar(50) NOT NULL,
    `combustible` varchar(50) NOT NULL,
    `cod_fasecolda` varchar(8) NOT NULL,
    `tipo_doc` varchar(10) NOT NULL,
    `num_doc` varchar(15) NOT NULL,
    `nombre_cliente` varchar(200) NOT NULL,
    `celular_cliente` varchar(10) NOT NULL,
    `correo_cliente` varchar(150) NOT NULL,
    `nombre_contacto` varchar(250) NOT NULL,
    `celular_contacto` varchar(10) NOT NULL,
    `correo_contacto` varchar(150) NOT NULL,
    `inspection_result` text,
    `inspection_result_details` text,
    `status` bigint NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inspection_orders`
--
INSERT INTO
    `inspection_orders` (
        `id`,
        `created_at`,
        `updated_at`,
        `user_id`,
        `sede_id`,
        `producto`,
        `callback_url`,
        `numero`,
        `intermediario`,
        `clave_intermediario`,
        `sucursal`,
        `cod_oficina`,
        `fecha`,
        `vigencia`,
        `avaluo`,
        `vlr_accesorios`,
        `placa`,
        `marca`,
        `linea`,
        `clase`,
        `modelo`,
        `cilindraje`,
        `color`,
        `servicio`,
        `motor`,
        `chasis`,
        `vin`,
        `carroceria`,
        `combustible`,
        `cod_fasecolda`,
        `tipo_doc`,
        `num_doc`,
        `nombre_cliente`,
        `celular_cliente`,
        `correo_cliente`,
        `nombre_contacto`,
        `celular_contacto`,
        `correo_contacto`,
        `inspection_result`,
        `inspection_result_details`,
        `status`
    )
VALUES
    (
        1,
        '2025-07-04 20:10:45',
        '2025-07-04 20:10:45',
        1,
        NULL,
        'livianos',
        'https://apis.segurosmundial.com.co/exp/api/prod/v1/webhook%22',
        123456789,
        'Intermediario',
        'Clave2000',
        'Sucursal',
        '0000',
        '2025-07-04',
        '30',
        'Avaluo',
        'Valor accesorios',
        'ASD123',
        'Marca del vehiculo',
        'Linea del vehiculo',
        'Clase del vehiculo',
        'MAAX',
        '159.3',
        'Azul',
        'Servicio del vehiculo',
        'Motor del vehiculo',
        'Chasis del vehiculo',
        'Vin del vehiculo',
        'Carroceria del vehiculo',
        'Combustible del vehiculo',
        'CodigoXX',
        'CC',
        '1234567890',
        'Juan Andres Puentes Rosario',
        '3000000000',
        'correocliente@example.com',
        'Juan Andres Puentes Rosario',
        '3000000000',
        'correocontacto@example.com',
        NULL,
        NULL,
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `inspection_orders_statuses`
--
CREATE TABLE `inspection_orders_statuses` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `description` text
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inspection_orders_statuses`
--
INSERT INTO
    `inspection_orders_statuses` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `description`
    )
VALUES
    (
        1,
        '2025-07-04 13:04:42',
        '2025-07-04 13:04:42',
        'Creada',
        'Orden de inspección creada, pendiente de contacto'
    ),
    (
        2,
        '2025-07-04 13:04:42',
        '2025-07-04 13:04:42',
        'Contacto exitoso',
        'Se logró contactar al cliente exitosamente'
    ),
    (
        3,
        '2025-07-04 13:04:43',
        '2025-07-04 13:04:43',
        'Agendado',
        'Inspección agendada con fecha y hora'
    ),
    (
        4,
        '2025-07-04 13:04:43',
        '2025-07-04 13:04:43',
        'No contesta',
        'Cliente no contesta las llamadas'
    ),
    (
        5,
        '2025-07-04 13:04:43',
        '2025-07-04 13:04:43',
        'Ocupado',
        'Cliente ocupado, reagendar llamada'
    ),
    (
        6,
        '2025-07-04 13:04:44',
        '2025-07-04 13:04:44',
        'Número incorrecto',
        'Número de teléfono incorrecto'
    ),
    (
        7,
        '2025-07-04 13:04:44',
        '2025-07-04 13:04:44',
        'Solicita reagendar',
        'Cliente solicita reagendar la llamada'
    ),
    (
        8,
        '2025-07-04 13:04:44',
        '2025-07-04 13:04:44',
        'En progreso',
        'Inspección en progreso'
    ),
    (
        9,
        '2025-07-04 13:04:45',
        '2025-07-04 13:04:45',
        'Finalizada',
        'Inspección completada'
    ),
    (
        10,
        '2025-07-04 13:04:45',
        '2025-07-04 13:04:45',
        'Cancelada',
        'Orden cancelada'
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `inspection_types`
--
CREATE TABLE `inspection_types` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `description` text,
    `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inspection_types`
--
INSERT INTO
    `inspection_types` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `description`,
        `active`
    )
VALUES
    (
        1,
        '2025-07-04 13:04:48',
        '2025-07-04 13:04:48',
        'En sede',
        'Inspección realizada en las instalaciones de la empresa',
        1
    ),
    (
        2,
        '2025-07-04 13:04:48',
        '2025-07-04 13:04:48',
        'A domicilio',
        'Inspección realizada en el domicilio del cliente',
        1
    ),
    (
        3,
        '2025-07-04 13:04:49',
        '2025-07-04 13:04:49',
        'Remoto',
        'Inspección realizada de forma virtual',
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `notifications`
--
CREATE TABLE `notifications` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `notification_config_id` bigint NOT NULL,
    `appointment_id` bigint DEFAULT NULL,
    `inspection_order_id` bigint DEFAULT NULL,
    `recipient_type` varchar(20) NOT NULL,
    `recipient_user_id` bigint DEFAULT NULL,
    `recipient_email` varchar(150) DEFAULT NULL,
    `recipient_phone` varchar(50) DEFAULT NULL,
    `recipient_name` varchar(150) DEFAULT NULL,
    `title` text NOT NULL,
    `content` text NOT NULL,
    `status` varchar(50) NOT NULL DEFAULT 'pending',
    `sent_at` datetime DEFAULT NULL,
    `delivered_at` datetime DEFAULT NULL,
    `read_at` datetime DEFAULT NULL,
    `external_id` varchar(100) DEFAULT NULL,
    `error_message` text
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `notification_channels`
--
CREATE TABLE `notification_channels` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(50) NOT NULL,
    `description` text,
    `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notification_channels`
--
INSERT INTO
    `notification_channels` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `description`,
        `active`
    )
VALUES
    (
        1,
        '2025-07-04 13:04:49',
        '2025-07-04 13:04:49',
        'in_app',
        'Notificaciones dentro de la aplicación',
        1
    ),
    (
        2,
        '2025-07-04 13:04:49',
        '2025-07-04 13:04:49',
        'email',
        'Notificaciones por correo electrónico',
        1
    ),
    (
        3,
        '2025-07-04 13:04:50',
        '2025-07-04 13:04:50',
        'sms',
        'Notificaciones por SMS',
        1
    ),
    (
        4,
        '2025-07-04 13:04:50',
        '2025-07-04 13:04:50',
        'whatsapp',
        'Notificaciones por WhatsApp',
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `notification_config`
--
CREATE TABLE `notification_config` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `notification_type_id` bigint NOT NULL,
    `notification_channel_id` bigint NOT NULL,
    `template_title` text NOT NULL,
    `template_content` text NOT NULL,
    `for_clients` tinyint(1) NOT NULL DEFAULT '0',
    `for_users` tinyint(1) NOT NULL DEFAULT '0',
    `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notification_config`
--
INSERT INTO
    `notification_config` (
        `id`,
        `created_at`,
        `updated_at`,
        `notification_type_id`,
        `notification_channel_id`,
        `template_title`,
        `template_content`,
        `for_clients`,
        `for_users`,
        `active`
    )
VALUES
    (
        1,
        '2025-07-04 13:04:52',
        '2025-07-04 13:04:52',
        2,
        1,
        'Llamada realizada',
        'Se ha registrado una llamada para la orden #{numero}',
        0,
        1,
        1
    ),
    (
        2,
        '2025-07-04 13:04:53',
        '2025-07-04 13:04:53',
        3,
        1,
        'Agendamiento realizado',
        'Se ha agendado una inspección para la orden #{numero}',
        0,
        1,
        1
    ),
    (
        3,
        '2025-07-04 13:04:53',
        '2025-07-04 13:04:53',
        3,
        3,
        'Inspección Agendada',
        'Su inspección ha sido agendada para el {fecha} a las {hora}. Orden: #{numero}',
        1,
        0,
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `notification_types`
--
CREATE TABLE `notification_types` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `description` text
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notification_types`
--
INSERT INTO
    `notification_types` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `description`
    )
VALUES
    (
        1,
        '2025-07-04 13:04:50',
        '2025-07-04 13:04:50',
        'order_created',
        'Orden de inspección creada'
    ),
    (
        2,
        '2025-07-04 13:04:51',
        '2025-07-04 13:04:51',
        'call_made',
        'Llamada realizada'
    ),
    (
        3,
        '2025-07-04 13:04:51',
        '2025-07-04 13:04:51',
        'appointment_scheduled',
        'Agendamiento realizado'
    ),
    (
        4,
        '2025-07-04 13:04:52',
        '2025-07-04 13:04:52',
        'inspection_completed',
        'Inspección completada'
    ),
    (
        5,
        '2025-07-04 13:04:52',
        '2025-07-04 13:04:52',
        'status_updated',
        'Estado de orden actualizado'
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `permissions`
--
CREATE TABLE `permissions` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `description` text,
    `resource` varchar(100) NOT NULL COMMENT 'Recurso al que se aplica el permiso (users, departments, etc.)',
    `action` varchar(50) NOT NULL COMMENT 'Acción permitida (create, read, update, delete, etc.)',
    `endpoint` varchar(200) DEFAULT NULL COMMENT 'Endpoint específico del permiso',
    `method` varchar(10) DEFAULT NULL COMMENT 'Método HTTP (GET, POST, PUT, DELETE)',
    `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `permissions`
--
INSERT INTO
    `permissions` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `description`,
        `resource`,
        `action`,
        `endpoint`,
        `method`,
        `is_active`
    )
VALUES
    (
        1,
        '2025-07-02 02:07:08',
        '2025-07-02 02:07:08',
        'users.read',
        'Ver usuarios',
        'users',
        'read',
        '/api/users',
        'GET',
        1
    ),
    (
        2,
        '2025-07-02 02:07:09',
        '2025-07-02 02:07:09',
        'users.create',
        'Crear usuarios',
        'users',
        'create',
        '/api/users',
        'POST',
        1
    ),
    (
        3,
        '2025-07-02 02:07:09',
        '2025-07-02 02:07:09',
        'users.update',
        'Actualizar usuarios',
        'users',
        'update',
        '/api/users/:id',
        'PUT',
        1
    ),
    (
        4,
        '2025-07-02 02:07:10',
        '2025-07-02 02:07:10',
        'users.delete',
        'Eliminar usuarios',
        'users',
        'delete',
        '/api/users/:id',
        'DELETE',
        1
    ),
    (
        5,
        '2025-07-02 02:07:10',
        '2025-07-02 02:07:10',
        'departments.read',
        'Ver departamentos',
        'departments',
        'read',
        '/api/departments',
        'GET',
        1
    ),
    (
        6,
        '2025-07-02 02:07:11',
        '2025-07-02 02:07:11',
        'departments.create',
        'Crear departamentos',
        'departments',
        'create',
        '/api/departments',
        'POST',
        1
    ),
    (
        7,
        '2025-07-02 02:07:11',
        '2025-07-02 02:07:11',
        'departments.update',
        'Actualizar departamentos',
        'departments',
        'update',
        '/api/departments/:id',
        'PUT',
        1
    ),
    (
        8,
        '2025-07-02 02:07:11',
        '2025-07-02 02:07:11',
        'departments.delete',
        'Eliminar departamentos',
        'departments',
        'delete',
        '/api/departments/:id',
        'DELETE',
        1
    ),
    (
        9,
        '2025-07-02 02:07:12',
        '2025-07-02 02:07:12',
        'cities.read',
        'Ver ciudades',
        'cities',
        'read',
        '/api/cities',
        'GET',
        1
    ),
    (
        10,
        '2025-07-02 02:07:12',
        '2025-07-02 02:07:12',
        'cities.create',
        'Crear ciudades',
        'cities',
        'create',
        '/api/cities',
        'POST',
        1
    ),
    (
        11,
        '2025-07-02 02:07:13',
        '2025-07-02 02:07:13',
        'cities.update',
        'Actualizar ciudades',
        'cities',
        'update',
        '/api/cities/:id',
        'PUT',
        1
    ),
    (
        12,
        '2025-07-02 02:07:13',
        '2025-07-02 02:07:13',
        'cities.delete',
        'Eliminar ciudades',
        'cities',
        'delete',
        '/api/cities/:id',
        'DELETE',
        1
    ),
    (
        13,
        '2025-07-02 02:07:13',
        '2025-07-02 02:07:13',
        'companies.read',
        'Ver empresas',
        'companies',
        'read',
        '/api/companies',
        'GET',
        1
    ),
    (
        14,
        '2025-07-02 02:07:14',
        '2025-07-02 02:07:14',
        'companies.create',
        'Crear empresas',
        'companies',
        'create',
        '/api/companies',
        'POST',
        1
    ),
    (
        15,
        '2025-07-02 02:07:14',
        '2025-07-02 02:07:14',
        'companies.update',
        'Actualizar empresas',
        'companies',
        'update',
        '/api/companies/:id',
        'PUT',
        1
    ),
    (
        16,
        '2025-07-02 02:07:15',
        '2025-07-02 02:07:15',
        'companies.delete',
        'Eliminar empresas',
        'companies',
        'delete',
        '/api/companies/:id',
        'DELETE',
        1
    ),
    (
        17,
        '2025-07-02 02:07:15',
        '2025-07-02 02:07:15',
        'sedes.read',
        'Ver sedes',
        'sedes',
        'read',
        '/api/sedes',
        'GET',
        1
    ),
    (
        18,
        '2025-07-02 02:07:15',
        '2025-07-02 02:07:15',
        'sedes.create',
        'Crear sedes',
        'sedes',
        'create',
        '/api/sedes',
        'POST',
        1
    ),
    (
        19,
        '2025-07-02 02:07:16',
        '2025-07-02 02:07:16',
        'sedes.update',
        'Actualizar sedes',
        'sedes',
        'update',
        '/api/sedes/:id',
        'PUT',
        1
    ),
    (
        20,
        '2025-07-02 02:07:16',
        '2025-07-02 02:07:16',
        'sedes.delete',
        'Eliminar sedes',
        'sedes',
        'delete',
        '/api/sedes/:id',
        'DELETE',
        1
    ),
    (
        21,
        '2025-07-02 02:07:16',
        '2025-07-02 02:07:16',
        'roles.read',
        'Ver roles',
        'roles',
        'read',
        '/api/roles',
        'GET',
        1
    ),
    (
        22,
        '2025-07-02 02:07:17',
        '2025-07-02 02:07:17',
        'roles.create',
        'Crear roles',
        'roles',
        'create',
        '/api/roles',
        'POST',
        1
    ),
    (
        23,
        '2025-07-02 02:07:17',
        '2025-07-02 02:07:17',
        'roles.update',
        'Actualizar roles',
        'roles',
        'update',
        '/api/roles/:id',
        'PUT',
        1
    ),
    (
        24,
        '2025-07-02 02:07:18',
        '2025-07-02 02:07:18',
        'roles.delete',
        'Eliminar roles',
        'roles',
        'delete',
        '/api/roles/:id',
        'DELETE',
        1
    ),
    (
        25,
        '2025-07-02 02:07:18',
        '2025-07-02 02:07:18',
        'permissions.read',
        'Ver permisos',
        'permissions',
        'read',
        '/api/permissions',
        'GET',
        1
    ),
    (
        26,
        '2025-07-02 02:07:18',
        '2025-07-02 02:07:18',
        'permissions.create',
        'Crear permisos',
        'permissions',
        'create',
        '/api/permissions',
        'POST',
        1
    ),
    (
        27,
        '2025-07-02 02:07:19',
        '2025-07-02 02:07:19',
        'permissions.update',
        'Actualizar permisos',
        'permissions',
        'update',
        '/api/permissions/:id',
        'PUT',
        1
    ),
    (
        28,
        '2025-07-02 02:07:19',
        '2025-07-02 02:07:19',
        'permissions.delete',
        'Eliminar permisos',
        'permissions',
        'delete',
        '/api/permissions/:id',
        'DELETE',
        1
    ),
    (
        29,
        '2025-07-04 13:04:07',
        '2025-07-04 13:04:07',
        'inspection_orders.read',
        'Ver órdenes de inspección',
        'inspection_orders',
        'read',
        '/api/inspection-orders',
        'GET',
        1
    ),
    (
        30,
        '2025-07-04 13:04:07',
        '2025-07-04 13:04:07',
        'inspection_orders.create',
        'Crear órdenes de inspección',
        'inspection_orders',
        'create',
        '/api/inspection-orders',
        'POST',
        1
    ),
    (
        31,
        '2025-07-04 13:04:08',
        '2025-07-04 13:04:08',
        'inspection_orders.update',
        'Actualizar órdenes de inspección',
        'inspection_orders',
        'update',
        '/api/inspection-orders/:id',
        'PUT',
        1
    ),
    (
        32,
        '2025-07-04 13:04:08',
        '2025-07-04 13:04:08',
        'inspection_orders.delete',
        'Eliminar órdenes de inspección',
        'inspection_orders',
        'delete',
        '/api/inspection-orders/:id',
        'DELETE',
        1
    ),
    (
        33,
        '2025-07-04 13:04:08',
        '2025-07-04 13:04:08',
        'contact_agent.read',
        'Ver órdenes como agente de contacto',
        'contact_agent',
        'read',
        '/api/contact-agent',
        'GET',
        1
    ),
    (
        34,
        '2025-07-04 13:04:09',
        '2025-07-04 13:04:09',
        'contact_agent.create_call',
        'Registrar llamadas',
        'contact_agent',
        'create_call',
        '/api/contact-agent/call-logs',
        'POST',
        1
    ),
    (
        35,
        '2025-07-04 13:04:09',
        '2025-07-04 13:04:09',
        'contact_agent.create_appointment',
        'Crear agendamientos',
        'contact_agent',
        'create_appointment',
        '/api/contact-agent/appointments',
        'POST',
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `roles`
--
CREATE TABLE `roles` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `name` varchar(100) NOT NULL,
    `description` text,
    `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `roles`
--
INSERT INTO
    `roles` (
        `id`,
        `created_at`,
        `updated_at`,
        `name`,
        `description`,
        `is_active`
    )
VALUES
    (
        1,
        '2025-07-02 02:07:20',
        '2025-07-02 02:07:20',
        'super_admin',
        'Administrador del sistema con todos los permisos',
        1
    ),
    (
        2,
        '2025-07-02 02:07:20',
        '2025-07-02 02:07:20',
        'admin',
        'Administrador con permisos de gestión',
        1
    ),
    (
        3,
        '2025-07-02 02:07:21',
        '2025-07-02 02:07:21',
        'manager',
        'Gerente con permisos de lectura y escritura',
        1
    ),
    (
        4,
        '2025-07-02 02:07:21',
        '2025-07-02 02:07:21',
        'user',
        'Usuario básico con permisos de lectura',
        1
    ),
    (
        5,
        '2025-07-04 13:04:11',
        '2025-07-04 13:04:11',
        'comercial_mundial',
        'Comercial Mundial - Puede crear y gestionar órdenes de inspección',
        1
    ),
    (
        6,
        '2025-07-04 13:04:11',
        '2025-07-04 13:04:11',
        'agente_contacto',
        'Agente de Contacto - Gestiona llamadas y agendamientos',
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `role_permissions`
--
CREATE TABLE `role_permissions` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `role_id` bigint NOT NULL,
    `permission_id` bigint NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `role_permissions`
--
INSERT INTO
    `role_permissions` (
        `id`,
        `created_at`,
        `updated_at`,
        `role_id`,
        `permission_id`
    )
VALUES
    (
        1,
        '2025-07-02 02:07:21',
        '2025-07-02 02:07:21',
        1,
        1
    ),
    (
        2,
        '2025-07-02 02:07:22',
        '2025-07-02 02:07:22',
        1,
        2
    ),
    (
        3,
        '2025-07-02 02:07:22',
        '2025-07-02 02:07:22',
        1,
        3
    ),
    (
        4,
        '2025-07-02 02:07:23',
        '2025-07-02 02:07:23',
        1,
        4
    ),
    (
        5,
        '2025-07-02 02:07:23',
        '2025-07-02 02:07:23',
        1,
        5
    ),
    (
        6,
        '2025-07-02 02:07:23',
        '2025-07-02 02:07:23',
        1,
        6
    ),
    (
        7,
        '2025-07-02 02:07:24',
        '2025-07-02 02:07:24',
        1,
        7
    ),
    (
        8,
        '2025-07-02 02:07:24',
        '2025-07-02 02:07:24',
        1,
        8
    ),
    (
        9,
        '2025-07-02 02:07:24',
        '2025-07-02 02:07:24',
        1,
        9
    ),
    (
        10,
        '2025-07-02 02:07:25',
        '2025-07-02 02:07:25',
        1,
        10
    ),
    (
        11,
        '2025-07-02 02:07:25',
        '2025-07-02 02:07:25',
        1,
        11
    ),
    (
        12,
        '2025-07-02 02:07:26',
        '2025-07-02 02:07:26',
        1,
        12
    ),
    (
        13,
        '2025-07-02 02:07:26',
        '2025-07-02 02:07:26',
        1,
        13
    ),
    (
        14,
        '2025-07-02 02:07:26',
        '2025-07-02 02:07:26',
        1,
        14
    ),
    (
        15,
        '2025-07-02 02:07:27',
        '2025-07-02 02:07:27',
        1,
        15
    ),
    (
        16,
        '2025-07-02 02:07:27',
        '2025-07-02 02:07:27',
        1,
        16
    ),
    (
        17,
        '2025-07-02 02:07:27',
        '2025-07-02 02:07:27',
        1,
        17
    ),
    (
        18,
        '2025-07-02 02:07:28',
        '2025-07-02 02:07:28',
        1,
        18
    ),
    (
        19,
        '2025-07-02 02:07:28',
        '2025-07-02 02:07:28',
        1,
        19
    ),
    (
        20,
        '2025-07-02 02:07:29',
        '2025-07-02 02:07:29',
        1,
        20
    ),
    (
        21,
        '2025-07-02 02:07:29',
        '2025-07-02 02:07:29',
        1,
        21
    ),
    (
        22,
        '2025-07-02 02:07:29',
        '2025-07-02 02:07:29',
        1,
        22
    ),
    (
        23,
        '2025-07-02 02:07:30',
        '2025-07-02 02:07:30',
        1,
        23
    ),
    (
        24,
        '2025-07-02 02:07:30',
        '2025-07-02 02:07:30',
        1,
        24
    ),
    (
        25,
        '2025-07-02 02:07:31',
        '2025-07-02 02:07:31',
        1,
        25
    ),
    (
        26,
        '2025-07-02 02:07:31',
        '2025-07-02 02:07:31',
        1,
        26
    ),
    (
        27,
        '2025-07-02 02:07:31',
        '2025-07-02 02:07:31',
        1,
        27
    ),
    (
        28,
        '2025-07-02 02:07:32',
        '2025-07-02 02:07:32',
        1,
        28
    ),
    (
        29,
        '2025-07-02 02:07:32',
        '2025-07-02 02:07:32',
        2,
        1
    ),
    (
        30,
        '2025-07-02 02:07:32',
        '2025-07-02 02:07:32',
        2,
        2
    ),
    (
        31,
        '2025-07-02 02:07:33',
        '2025-07-02 02:07:33',
        2,
        3
    ),
    (
        32,
        '2025-07-02 02:07:33',
        '2025-07-02 02:07:33',
        2,
        4
    ),
    (
        33,
        '2025-07-02 02:07:34',
        '2025-07-02 02:07:34',
        2,
        5
    ),
    (
        34,
        '2025-07-02 02:07:34',
        '2025-07-02 02:07:34',
        2,
        6
    ),
    (
        35,
        '2025-07-02 02:07:34',
        '2025-07-02 02:07:34',
        2,
        7
    ),
    (
        36,
        '2025-07-02 02:07:35',
        '2025-07-02 02:07:35',
        2,
        8
    ),
    (
        37,
        '2025-07-02 02:07:35',
        '2025-07-02 02:07:35',
        2,
        9
    ),
    (
        38,
        '2025-07-02 02:07:35',
        '2025-07-02 02:07:35',
        2,
        10
    ),
    (
        39,
        '2025-07-02 02:07:36',
        '2025-07-02 02:07:36',
        2,
        11
    ),
    (
        40,
        '2025-07-02 02:07:36',
        '2025-07-02 02:07:36',
        2,
        12
    ),
    (
        41,
        '2025-07-02 02:07:37',
        '2025-07-02 02:07:37',
        2,
        13
    ),
    (
        42,
        '2025-07-02 02:07:37',
        '2025-07-02 02:07:37',
        2,
        14
    ),
    (
        43,
        '2025-07-02 02:07:37',
        '2025-07-02 02:07:37',
        2,
        15
    ),
    (
        44,
        '2025-07-02 02:07:38',
        '2025-07-02 02:07:38',
        2,
        16
    ),
    (
        45,
        '2025-07-02 02:07:38',
        '2025-07-02 02:07:38',
        2,
        17
    ),
    (
        46,
        '2025-07-02 02:07:39',
        '2025-07-02 02:07:39',
        2,
        18
    ),
    (
        47,
        '2025-07-02 02:07:39',
        '2025-07-02 02:07:39',
        2,
        19
    ),
    (
        48,
        '2025-07-02 02:07:39',
        '2025-07-02 02:07:39',
        2,
        20
    ),
    (
        49,
        '2025-07-02 02:07:40',
        '2025-07-02 02:07:40',
        3,
        1
    ),
    (
        50,
        '2025-07-02 02:07:40',
        '2025-07-02 02:07:40',
        3,
        2
    ),
    (
        51,
        '2025-07-02 02:07:41',
        '2025-07-02 02:07:41',
        3,
        5
    ),
    (
        52,
        '2025-07-02 02:07:41',
        '2025-07-02 02:07:41',
        3,
        6
    ),
    (
        53,
        '2025-07-02 02:07:41',
        '2025-07-02 02:07:41',
        3,
        9
    ),
    (
        54,
        '2025-07-02 02:07:42',
        '2025-07-02 02:07:42',
        3,
        10
    ),
    (
        55,
        '2025-07-02 02:07:42',
        '2025-07-02 02:07:42',
        3,
        13
    ),
    (
        56,
        '2025-07-02 02:07:42',
        '2025-07-02 02:07:42',
        3,
        14
    ),
    (
        57,
        '2025-07-02 02:07:43',
        '2025-07-02 02:07:43',
        3,
        17
    ),
    (
        58,
        '2025-07-02 02:07:43',
        '2025-07-02 02:07:43',
        3,
        18
    ),
    (
        59,
        '2025-07-02 02:07:44',
        '2025-07-02 02:07:44',
        3,
        21
    ),
    (
        60,
        '2025-07-02 02:07:44',
        '2025-07-02 02:07:44',
        3,
        25
    ),
    (
        61,
        '2025-07-02 02:07:44',
        '2025-07-02 02:07:44',
        4,
        1
    ),
    (
        62,
        '2025-07-02 02:07:45',
        '2025-07-02 02:07:45',
        4,
        5
    ),
    (
        63,
        '2025-07-02 02:07:45',
        '2025-07-02 02:07:45',
        4,
        9
    ),
    (
        64,
        '2025-07-02 02:07:46',
        '2025-07-02 02:07:46',
        4,
        13
    ),
    (
        65,
        '2025-07-02 02:07:46',
        '2025-07-02 02:07:46',
        4,
        17
    ),
    (
        66,
        '2025-07-02 02:07:46',
        '2025-07-02 02:07:46',
        4,
        21
    ),
    (
        67,
        '2025-07-02 02:07:47',
        '2025-07-02 02:07:47',
        4,
        25
    ),
    (
        68,
        '2025-07-04 13:04:19',
        '2025-07-04 13:04:19',
        1,
        29
    ),
    (
        69,
        '2025-07-04 13:04:19',
        '2025-07-04 13:04:19',
        1,
        30
    ),
    (
        70,
        '2025-07-04 13:04:20',
        '2025-07-04 13:04:20',
        1,
        31
    ),
    (
        71,
        '2025-07-04 13:04:20',
        '2025-07-04 13:04:20',
        1,
        32
    ),
    (
        72,
        '2025-07-04 13:04:20',
        '2025-07-04 13:04:20',
        1,
        33
    ),
    (
        73,
        '2025-07-04 13:04:21',
        '2025-07-04 13:04:21',
        1,
        34
    ),
    (
        74,
        '2025-07-04 13:04:21',
        '2025-07-04 13:04:21',
        1,
        35
    ),
    (
        75,
        '2025-07-04 13:04:27',
        '2025-07-04 13:04:27',
        2,
        29
    ),
    (
        76,
        '2025-07-04 13:04:27',
        '2025-07-04 13:04:27',
        2,
        30
    ),
    (
        77,
        '2025-07-04 13:04:28',
        '2025-07-04 13:04:28',
        2,
        31
    ),
    (
        78,
        '2025-07-04 13:04:28',
        '2025-07-04 13:04:28',
        2,
        32
    ),
    (
        79,
        '2025-07-04 13:04:28',
        '2025-07-04 13:04:28',
        2,
        33
    ),
    (
        80,
        '2025-07-04 13:04:29',
        '2025-07-04 13:04:29',
        2,
        34
    ),
    (
        81,
        '2025-07-04 13:04:29',
        '2025-07-04 13:04:29',
        2,
        35
    ),
    (
        82,
        '2025-07-04 13:04:33',
        '2025-07-04 13:04:33',
        3,
        29
    ),
    (
        83,
        '2025-07-04 13:04:33',
        '2025-07-04 13:04:33',
        3,
        30
    ),
    (
        84,
        '2025-07-04 13:04:33',
        '2025-07-04 13:04:33',
        3,
        33
    ),
    (
        85,
        '2025-07-04 13:04:36',
        '2025-07-04 13:04:36',
        4,
        29
    ),
    (
        86,
        '2025-07-04 13:04:36',
        '2025-07-04 13:04:36',
        4,
        33
    ),
    (
        87,
        '2025-07-04 13:04:36',
        '2025-07-04 13:04:36',
        5,
        5
    ),
    (
        88,
        '2025-07-04 13:04:37',
        '2025-07-04 13:04:37',
        5,
        9
    ),
    (
        89,
        '2025-07-04 13:04:37',
        '2025-07-04 13:04:37',
        5,
        17
    ),
    (
        90,
        '2025-07-04 13:04:37',
        '2025-07-04 13:04:37',
        5,
        29
    ),
    (
        91,
        '2025-07-04 13:04:38',
        '2025-07-04 13:04:38',
        5,
        30
    ),
    (
        92,
        '2025-07-04 13:04:38',
        '2025-07-04 13:04:38',
        5,
        31
    ),
    (
        93,
        '2025-07-04 13:04:38',
        '2025-07-04 13:04:38',
        5,
        32
    ),
    (
        94,
        '2025-07-04 13:04:39',
        '2025-07-04 13:04:39',
        6,
        5
    ),
    (
        95,
        '2025-07-04 13:04:39',
        '2025-07-04 13:04:39',
        6,
        9
    ),
    (
        96,
        '2025-07-04 13:04:39',
        '2025-07-04 13:04:39',
        6,
        17
    ),
    (
        97,
        '2025-07-04 13:04:40',
        '2025-07-04 13:04:40',
        6,
        29
    ),
    (
        98,
        '2025-07-04 13:04:40',
        '2025-07-04 13:04:40',
        6,
        33
    ),
    (
        99,
        '2025-07-04 13:04:41',
        '2025-07-04 13:04:41',
        6,
        34
    ),
    (
        100,
        '2025-07-04 13:04:41',
        '2025-07-04 13:04:41',
        6,
        35
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `sedes`
--
CREATE TABLE `sedes` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `company_id` bigint NOT NULL,
    `name` varchar(150) NOT NULL,
    `email` varchar(150) DEFAULT NULL,
    `phone` varchar(50) DEFAULT NULL,
    `city_id` bigint NOT NULL,
    `address` varchar(255) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sedes`
--
INSERT INTO
    `sedes` (
        `id`,
        `created_at`,
        `updated_at`,
        `company_id`,
        `name`,
        `email`,
        `phone`,
        `city_id`,
        `address`
    )
VALUES
    (
        1,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        1,
        'Sede Principal Medellín',
        'medellin@vmlperito.com',
        '604-1234567',
        1,
        'Calle 10 # 20-30, Medellín'
    ),
    (
        2,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        1,
        'Sede Bello',
        'bello@vmlperito.com',
        '604-2345678',
        2,
        'Carrera 50 # 45-12, Bello'
    ),
    (
        3,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        2,
        'Sede Bogotá',
        'bogota@consultores.com',
        '601-3456789',
        4,
        'Carrera 15 # 45-67, Bogotá'
    ),
    (
        4,
        '2025-07-02 01:39:30',
        '2025-07-02 01:39:30',
        3,
        'Sede Cali',
        'cali@expertos.com',
        '602-4567890',
        6,
        'Avenida 4 Norte # 12-34, Cali'
    ),
    (
        5,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        1,
        'Sede Principal Medellín',
        'medellin@vmlperito.com',
        '604-1234567',
        1,
        'Calle 10 # 20-30, Medellín'
    ),
    (
        6,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        1,
        'Sede Bello',
        'bello@vmlperito.com',
        '604-2345678',
        2,
        'Carrera 50 # 45-12, Bello'
    ),
    (
        7,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        2,
        'Sede Bogotá',
        'bogota@consultores.com',
        '601-3456789',
        4,
        'Carrera 15 # 45-67, Bogotá'
    ),
    (
        8,
        '2025-07-04 13:07:56',
        '2025-07-04 13:07:56',
        3,
        'Sede Cali',
        'cali@expertos.com',
        '602-4567890',
        6,
        'Avenida 4 Norte # 12-34, Cali'
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `users`
--
CREATE TABLE `users` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `sede_id` bigint NOT NULL,
    `name` varchar(150) NOT NULL,
    `email` varchar(150) NOT NULL,
    `phone` varchar(50) DEFAULT NULL,
    `password` varchar(255) NOT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT '1',
    `notification_channel_in_app_enabled` tinyint(1) DEFAULT '1',
    `notification_channel_sms_enabled` tinyint(1) DEFAULT '1',
    `notification_channel_email_enabled` tinyint(1) DEFAULT '1',
    `notification_channel_whatsapp_enabled` tinyint(1) DEFAULT '1'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--
INSERT INTO
    `users` (
        `id`,
        `created_at`,
        `updated_at`,
        `sede_id`,
        `name`,
        `email`,
        `phone`,
        `password`,
        `is_active`,
        `notification_channel_in_app_enabled`,
        `notification_channel_sms_enabled`,
        `notification_channel_email_enabled`,
        `notification_channel_whatsapp_enabled`
    )
VALUES
    (
        1,
        '2025-07-01 20:21:34',
        '2025-07-01 20:21:34',
        1,
        'Administrador',
        'admin@vmlperito.com',
        '123456789',
        '$2b$10$OHDterTMEyiWjvStyMbnbePgUOE566DGm0SKu5mkTbpoDlI647s1e',
        1,
        1,
        1,
        1,
        1
    ),
    (
        2,
        '2025-07-02 01:39:31',
        '2025-07-02 01:39:31',
        1,
        'Juan Pérez',
        'juan@vmlperito.com',
        '300-1234567',
        '$2b$10$UvqW.jy6CV0H7vuQKMzz8eYvR2u9a4KN03Go4B2w/dj.4BIrbNLBe',
        1,
        1,
        1,
        1,
        1
    ),
    (
        3,
        '2025-07-02 01:39:31',
        '2025-07-02 01:39:31',
        1,
        'María García',
        'maria@vmlperito.com',
        '300-2345678',
        '$2b$10$UvqW.jy6CV0H7vuQKMzz8eYvR2u9a4KN03Go4B2w/dj.4BIrbNLBe',
        1,
        1,
        1,
        1,
        1
    ),
    (
        4,
        '2025-07-02 01:39:31',
        '2025-07-02 01:39:31',
        2,
        'Carlos López',
        'carlos@vmlperito.com',
        '300-3456789',
        '$2b$10$UvqW.jy6CV0H7vuQKMzz8eYvR2u9a4KN03Go4B2w/dj.4BIrbNLBe',
        1,
        1,
        1,
        1,
        1
    ),
    (
        5,
        '2025-07-02 01:39:31',
        '2025-07-02 01:39:31',
        3,
        'Ana Rodríguez',
        'ana@consultores.com',
        '300-4567890',
        '$2b$10$UvqW.jy6CV0H7vuQKMzz8eYvR2u9a4KN03Go4B2w/dj.4BIrbNLBe',
        1,
        1,
        1,
        1,
        1
    ),
    (
        6,
        '2025-07-02 01:39:31',
        '2025-07-02 01:39:31',
        4,
        'Luis Martínez',
        'luis@expertos.com',
        '300-5678901',
        '$2b$10$UvqW.jy6CV0H7vuQKMzz8eYvR2u9a4KN03Go4B2w/dj.4BIrbNLBe',
        1,
        1,
        1,
        1,
        1
    ),
    (
        7,
        '2025-07-04 13:04:54',
        '2025-07-04 13:04:54',
        1,
        'María Comercial',
        'comercial@vmlperito.com',
        '300-7654321',
        '$2b$10$6fR9fEXQ.kTZAT1NRogHfeAlxIbLDckBht0bTyN7Ua0sD7j26.RNm',
        1,
        1,
        1,
        1,
        1
    ),
    (
        8,
        '2025-07-04 13:04:55',
        '2025-07-04 13:04:55',
        1,
        'Carlos Agente',
        'agente@vmlperito.com',
        '300-1357924',
        '$2b$10$6fR9fEXQ.kTZAT1NRogHfeAlxIbLDckBht0bTyN7Ua0sD7j26.RNm',
        1,
        1,
        1,
        1,
        1
    ),
    (
        9,
        '2025-07-04 13:04:55',
        '2025-07-04 13:04:55',
        1,
        'Ana Supervisora',
        'supervisora@vmlperito.com',
        '300-2468135',
        '$2b$10$6fR9fEXQ.kTZAT1NRogHfeAlxIbLDckBht0bTyN7Ua0sD7j26.RNm',
        1,
        1,
        1,
        1,
        1
    );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `user_roles`
--
CREATE TABLE `user_roles` (
    `id` bigint NOT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    `user_id` bigint NOT NULL,
    `role_id` bigint NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user_roles`
--
INSERT INTO
    `user_roles` (
        `id`,
        `created_at`,
        `updated_at`,
        `user_id`,
        `role_id`
    )
VALUES
    (
        4,
        '2025-07-04 05:53:10',
        '2025-07-04 05:53:10',
        2,
        2
    ),
    (
        5,
        '2025-07-04 06:11:54',
        '2025-07-04 06:11:54',
        1,
        1
    ),
    (
        6,
        '2025-07-04 13:04:54',
        '2025-07-04 13:04:54',
        7,
        5
    ),
    (
        7,
        '2025-07-04 13:04:55',
        '2025-07-04 13:04:55',
        8,
        6
    ),
    (
        8,
        '2025-07-04 13:04:56',
        '2025-07-04 13:04:56',
        9,
        5
    ),
    (
        9,
        '2025-07-04 13:04:56',
        '2025-07-04 13:04:56',
        9,
        6
    );

--
-- Índices para tablas volcadas
--
--
-- Indices de la tabla `appointments`
--
ALTER TABLE
    `appointments`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `sede_id` (`sede_id`),
ADD
    KEY `call_log_id` (`call_log_id`),
ADD
    KEY `inspection_order_id` (`inspection_order_id`),
ADD
    KEY `inspection_type_id` (`inspection_type_id`);

--
-- Indices de la tabla `call_logs`
--
ALTER TABLE
    `call_logs`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `inspection_order_id` (`inspection_order_id`),
ADD
    KEY `status_id` (`status_id`);

--
-- Indices de la tabla `call_statuses`
--
ALTER TABLE
    `call_statuses`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `cities`
--
ALTER TABLE
    `cities`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `department_id` (`department_id`);

--
-- Indices de la tabla `companies`
--
ALTER TABLE
    `companies`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `nit` (`nit`),
ADD
    UNIQUE KEY `nit_2` (`nit`),
ADD
    KEY `city_id` (`city_id`);

--
-- Indices de la tabla `departments`
--
ALTER TABLE
    `departments`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`),
ADD
    UNIQUE KEY `name_2` (`name`);

--
-- Indices de la tabla `inspection_orders`
--
ALTER TABLE
    `inspection_orders`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `user_id` (`user_id`),
ADD
    KEY `sede_id` (`sede_id`),
ADD
    KEY `status` (`status`);

--
-- Indices de la tabla `inspection_orders_statuses`
--
ALTER TABLE
    `inspection_orders_statuses`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `inspection_types`
--
ALTER TABLE
    `inspection_types`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE
    `notifications`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `notification_config_id` (`notification_config_id`),
ADD
    KEY `appointment_id` (`appointment_id`),
ADD
    KEY `inspection_order_id` (`inspection_order_id`),
ADD
    KEY `recipient_user_id` (`recipient_user_id`);

--
-- Indices de la tabla `notification_channels`
--
ALTER TABLE
    `notification_channels`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `notification_config`
--
ALTER TABLE
    `notification_config`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `notification_type_id` (`notification_type_id`),
ADD
    KEY `notification_channel_id` (`notification_channel_id`);

--
-- Indices de la tabla `notification_types`
--
ALTER TABLE
    `notification_types`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `permissions`
--
ALTER TABLE
    `permissions`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE
    `roles`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `role_permissions`
--
ALTER TABLE
    `role_permissions`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `role_permissions_permission_id_role_id_unique` (`role_id`, `permission_id`),
ADD
    UNIQUE KEY `role_permissions_role_id_permission_id` (`role_id`, `permission_id`),
ADD
    KEY `permission_id` (`permission_id`);

--
-- Indices de la tabla `sedes`
--
ALTER TABLE
    `sedes`
ADD
    PRIMARY KEY (`id`),
ADD
    KEY `company_id` (`company_id`),
ADD
    KEY `city_id` (`city_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE
    `users`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `email` (`email`),
ADD
    UNIQUE KEY `email_2` (`email`),
ADD
    UNIQUE KEY `email_3` (`email`),
ADD
    UNIQUE KEY `email_4` (`email`),
ADD
    UNIQUE KEY `email_5` (`email`),
ADD
    UNIQUE KEY `email_6` (`email`),
ADD
    UNIQUE KEY `email_7` (`email`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE
    `user_roles`
ADD
    PRIMARY KEY (`id`),
ADD
    UNIQUE KEY `user_roles_role_id_user_id_unique` (`user_id`, `role_id`),
ADD
    UNIQUE KEY `user_roles_user_id_role_id` (`user_id`, `role_id`),
ADD
    KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--
--
-- AUTO_INCREMENT de la tabla `appointments`
--
ALTER TABLE
    `appointments`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `call_logs`
--
ALTER TABLE
    `call_logs`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `call_statuses`
--
ALTER TABLE
    `call_statuses`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 7;

--
-- AUTO_INCREMENT de la tabla `cities`
--
ALTER TABLE
    `cities`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT de la tabla `companies`
--
ALTER TABLE
    `companies`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 7;

--
-- AUTO_INCREMENT de la tabla `departments`
--
ALTER TABLE
    `departments`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 11;

--
-- AUTO_INCREMENT de la tabla `inspection_orders`
--
ALTER TABLE
    `inspection_orders`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 2;

--
-- AUTO_INCREMENT de la tabla `inspection_orders_statuses`
--
ALTER TABLE
    `inspection_orders_statuses`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 11;

--
-- AUTO_INCREMENT de la tabla `inspection_types`
--
ALTER TABLE
    `inspection_types`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 4;

--
-- AUTO_INCREMENT de la tabla `notifications`
--
ALTER TABLE
    `notifications`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notification_channels`
--
ALTER TABLE
    `notification_channels`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 5;

--
-- AUTO_INCREMENT de la tabla `notification_config`
--
ALTER TABLE
    `notification_config`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 4;

--
-- AUTO_INCREMENT de la tabla `notification_types`
--
ALTER TABLE
    `notification_types`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 6;

--
-- AUTO_INCREMENT de la tabla `permissions`
--
ALTER TABLE
    `permissions`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 36;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE
    `roles`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 7;

--
-- AUTO_INCREMENT de la tabla `role_permissions`
--
ALTER TABLE
    `role_permissions`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 102;

--
-- AUTO_INCREMENT de la tabla `sedes`
--
ALTER TABLE
    `sedes`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 9;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE
    `users`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 15;

--
-- AUTO_INCREMENT de la tabla `user_roles`
--
ALTER TABLE
    `user_roles`
MODIFY
    `id` bigint NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 10;

--
-- Restricciones para tablas volcadas
--
--
-- Filtros para la tabla `appointments`
--
ALTER TABLE
    `appointments`
ADD
    CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE
SET
    NULL ON UPDATE CASCADE,
ADD
    CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`call_log_id`) REFERENCES `call_logs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`inspection_order_id`) REFERENCES `inspection_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`inspection_type_id`) REFERENCES `inspection_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `call_logs`
--
ALTER TABLE
    `call_logs`
ADD
    CONSTRAINT `call_logs_ibfk_1` FOREIGN KEY (`inspection_order_id`) REFERENCES `inspection_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `call_logs_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `call_statuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cities`
--
ALTER TABLE
    `cities`
ADD
    CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `companies`
--
ALTER TABLE
    `companies`
ADD
    CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inspection_orders`
--
ALTER TABLE
    `inspection_orders`
ADD
    CONSTRAINT `inspection_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `inspection_orders_ibfk_2` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE
SET
    NULL ON UPDATE CASCADE,
ADD
    CONSTRAINT `inspection_orders_ibfk_3` FOREIGN KEY (`status`) REFERENCES `inspection_orders_statuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE
    `notifications`
ADD
    CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`notification_config_id`) REFERENCES `notification_config` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE
SET
    NULL ON UPDATE CASCADE,
ADD
    CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`inspection_order_id`) REFERENCES `inspection_orders` (`id`) ON DELETE
SET
    NULL ON UPDATE CASCADE,
ADD
    CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE
SET
    NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `notification_config`
--
ALTER TABLE
    `notification_config`
ADD
    CONSTRAINT `notification_config_ibfk_1` FOREIGN KEY (`notification_type_id`) REFERENCES `notification_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `notification_config_ibfk_2` FOREIGN KEY (`notification_channel_id`) REFERENCES `notification_channels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `role_permissions`
--
ALTER TABLE
    `role_permissions`
ADD
    CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sedes`
--
ALTER TABLE
    `sedes`
ADD
    CONSTRAINT `sedes_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `sedes_ibfk_4` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE
    `user_roles`
ADD
    CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD
    CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;