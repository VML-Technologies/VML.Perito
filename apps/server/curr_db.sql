-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 08-07-2025 a las 11:01:41
-- Versión del servidor: 8.0.42
-- Versión de PHP: 8.3.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

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
  `sede_id` bigint NOT NULL,
  `inspection_modality_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'Estado de la cita (pending, confirmed, cancelled, etc.)',
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `call_logs`
--

CREATE TABLE `call_logs` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `inspection_order_id` bigint NOT NULL,
  `agent_id` bigint DEFAULT NULL COMMENT 'ID del agente que realizó la llamada',
  `call_time` datetime NOT NULL,
  `status_id` bigint NOT NULL,
  `comments` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `call_logs`
--

INSERT INTO `call_logs` (`id`, `created_at`, `updated_at`, `inspection_order_id`, `agent_id`, `call_time`, `status_id`, `comments`) VALUES
(1, '2025-07-07 22:05:12', '2025-07-07 22:05:12', 1, 5, '2025-07-07 22:05:12', 3, 'No contesto'),
(2, '2025-07-08 15:50:41', '2025-07-08 15:50:41', 6, 42, '2025-07-08 15:50:41', 3, 'No contesta');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `call_statuses`
--

INSERT INTO `call_statuses` (`id`, `created_at`, `updated_at`, `name`, `creates_schedule`) VALUES
(1, '2025-07-07 21:12:47', '2025-07-07 21:12:47', 'Contacto exitoso', 1),
(2, '2025-07-07 21:12:48', '2025-07-07 21:12:48', 'Agendado', 1),
(3, '2025-07-07 21:12:48', '2025-07-07 21:12:48', 'No contesta', 0),
(4, '2025-07-07 21:12:49', '2025-07-07 21:12:49', 'Ocupado', 0),
(5, '2025-07-07 21:12:49', '2025-07-07 21:12:49', 'Número incorrecto', 0),
(6, '2025-07-07 21:12:49', '2025-07-07 21:12:49', 'Solicita reagendar', 0);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cities`
--

INSERT INTO `cities` (`id`, `created_at`, `updated_at`, `name`, `department_id`) VALUES
(1, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Bogotá', 1),
(2, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Soacha', 1),
(3, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Chía', 1),
(4, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Cali', 2),
(5, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Palmira', 2),
(6, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Buenaventura', 2),
(7, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Medellín', 3),
(8, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Bello', 3),
(9, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Envigado', 3),
(10, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Barranquilla', 4),
(11, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Soledad', 4),
(12, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Bucaramanga', 5),
(13, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Bogotá', 1),
(14, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Soacha', 1),
(15, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Chía', 1),
(16, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Cali', 2),
(17, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Palmira', 2),
(18, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Buenaventura', 2),
(19, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Medellín', 3),
(20, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Bello', 3),
(21, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Envigado', 3),
(22, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Barranquilla', 4),
(23, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Soledad', 4),
(24, '2025-07-08 02:36:21', '2025-07-08 02:36:21', 'Bucaramanga', 5),
(25, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Bogotá', 1),
(26, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Soacha', 1),
(27, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Chía', 1),
(28, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Cali', 2),
(29, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Palmira', 2),
(30, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Buenaventura', 2),
(31, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Medellín', 3),
(32, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Bello', 3),
(33, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Envigado', 3),
(34, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Barranquilla', 4),
(35, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Soledad', 4),
(36, '2025-07-08 13:29:00', '2025-07-08 13:29:00', 'Bucaramanga', 5);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `companies`
--

INSERT INTO `companies` (`id`, `created_at`, `updated_at`, `name`, `nit`, `city_id`, `address`) VALUES
(1, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Previcar', '900123456-7', 1, 'Carrera 15 # 93-47, Bogotá'),
(2, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'VML Perito S.A.S.', '800987654-3', 7, 'Calle 10 # 20-30, Medellín'),
(3, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Consultores Asociados Ltda.', '700456789-1', 4, 'Avenida 4 Norte # 12-34, Cali');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departments`
--

CREATE TABLE `departments` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `departments`
--

INSERT INTO `departments` (`id`, `created_at`, `updated_at`, `name`) VALUES
(1, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Cundinamarca'),
(2, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Valle del Cauca'),
(3, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Antioquia'),
(4, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Atlántico'),
(5, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'Santander');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inspection_modalities`
--

CREATE TABLE `inspection_modalities` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `code` varchar(20) NOT NULL COMMENT 'Código único: SEDE, DOMICILIO, VIRTUAL',
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inspection_modalities`
--

INSERT INTO `inspection_modalities` (`id`, `created_at`, `updated_at`, `name`, `description`, `code`, `active`) VALUES
(1, '2025-07-07 21:12:38', '2025-07-07 21:12:38', 'En Sede', 'Inspección realizada en las instalaciones de la sede', 'SEDE', 1),
(2, '2025-07-07 21:12:39', '2025-07-07 21:12:39', 'A Domicilio', 'Inspección realizada en el domicilio del cliente', 'DOMICILIO', 1),
(3, '2025-07-07 21:12:39', '2025-07-07 21:12:39', 'Virtual', 'Inspección realizada de forma virtual/remota', 'VIRTUAL', 1);

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
  `assigned_agent_id` bigint DEFAULT NULL COMMENT 'ID del agente de contact center asignado a esta orden',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inspection_orders`
--

INSERT INTO `inspection_orders` (`id`, `created_at`, `updated_at`, `user_id`, `sede_id`, `assigned_agent_id`, `producto`, `callback_url`, `numero`, `intermediario`, `clave_intermediario`, `sucursal`, `cod_oficina`, `fecha`, `vigencia`, `avaluo`, `vlr_accesorios`, `placa`, `marca`, `linea`, `clase`, `modelo`, `cilindraje`, `color`, `servicio`, `motor`, `chasis`, `vin`, `carroceria`, `combustible`, `cod_fasecolda`, `tipo_doc`, `num_doc`, `nombre_cliente`, `celular_cliente`, `correo_cliente`, `nombre_contacto`, `celular_contacto`, `correo_contacto`, `inspection_result`, `inspection_result_details`, `status`) VALUES
(1, '2025-07-07 21:13:48', '2025-07-07 22:13:30', 1, NULL, 5, 'livianos', 'https://apis.segurosmundial.com.co/exp/api/prod/v1/webhook%22', 125584435, 'Intermediario', 'Clave2000', 'Sucursal', '0000', '2025-07-07', '30', 'Avaluo', 'Valor accesorios', 'ASD123', 'Marca del vehiculo', 'Linea del vehiculo', 'Clase del vehiculo', 'MAAX', '159.3', 'Azul', 'Servicio del vehiculo', 'Motor del vehiculo', 'Chasis del vehiculo', 'Vin del vehiculo', 'Carroceria del vehiculo', 'Combustible del vehiculo', 'CodigoXX', 'CC', '1234567890', 'Juan Andres Puentes Rosario', '3000000000', 'correocliente@example.com', 'Juan Andres Puentes Rosario', '3000000000', 'correocontacto@example.com', NULL, NULL, 1),
(2, '2025-07-07 22:08:44', '2025-07-07 22:10:40', 1, NULL, 5, 'livianos', 'https://apis.segurosmundial.com.co/exp/api/prod/v1/webhook%22', 115584435, 'Intermediario', 'Clave2000', 'Sucursal', '0000', '2025-07-07', '30', 'Avaluo', 'Valor accesorios', 'ASD123', 'Marca del vehiculo', 'Linea del vehiculo', 'Clase del vehiculo', 'MAAX', '159.3', 'Azul', 'Servicio del vehiculo', 'Motor del vehiculo', 'Chasis del vehiculo', 'Vin del vehiculo', 'Carroceria del vehiculo', 'Combustible del vehiculo', 'CodigoXX', 'CC', '1234567890', 'Miguel Angel Pineda', '3000000000', 'mpineda@example.com', 'Juan Andres Puentes Rosario', '3000000000', 'correocontacto@example.com', NULL, NULL, 1),
(3, '2025-07-07 22:13:09', '2025-07-07 22:13:26', 1, NULL, 5, 'livianos', 'https://apis.segurosmundial.com.co/exp/api/prod/v1/webhook%22', 115684435, 'Intermediario', 'Clave2000', 'Sucursal', '0000', '2025-07-07', '30', 'Avaluo', 'Valor accesorios', 'ASD123', 'Marca del vehiculo', 'Linea del vehiculo', 'Clase del vehiculo', 'MAAX', '159.3', 'Azul', 'Servicio del vehiculo', 'Motor del vehiculo', 'Chasis del vehiculo', 'Vin del vehiculo', 'Carroceria del vehiculo', 'Combustible del vehiculo', 'CodigoXX', 'CC', '1234567890', 'Miguel Angel Pineda', '3000000000', 'mpineda@example.com', 'Juan Andres Puentes Rosario', '3000000000', 'correocontacto@example.com', NULL, NULL, 1),
(4, '2025-07-07 22:27:39', '2025-07-07 22:27:39', 1, NULL, NULL, 'taxis individual', 'https://qa-services.vmltechnologies.com/api/perito-vml/consultar-cotizacion/', 4253, 'VML', '860505494', 'BOGOTA', '14', '2025-07-07', '30', '45000000', '0', 'GUV836', 'FAW', 'CA7150BUE4', 'AUTOMOVIL', '2020', '1497', 'AMARILLO', 'Público', 'CA4GA5MJ300077', 'LFP73ACC3L5A00134', 'LFP73ACC3L5A00134', 'SEDAN', 'GASOLINA', '25701003', 'C.C', '1016052951', 'KAREN LIZETH SARMIENTO PUENTES', '3002475772', 'sistemas90@red5g.co', 'FQFDQFQ', '3215123213', 'dqdqd@gmail.com', NULL, NULL, 1),
(5, '2025-07-07 22:45:42', '2025-07-07 22:45:42', 1, NULL, NULL, 'taxis individual', 'https://qa-services.vmltechnologies.com/api/perito-vml/consultar-cotizacion/', 4257, 'VML', '860505494', 'BOGOTA', '14', '2025-07-07', '30', '50000000', '0', 'GUV856', 'HYUNDAI', 'GRANDI10', 'AUTOMOVIL', '2020', '1248', 'AMARILLO', 'Público', 'G4LAKM284657', 'MALA741CALM372301', 'MALA741CALM372301', 'SEDAN', 'GASOLINA', '04601269', 'C.C', '39524900', 'LUZ MARINA GUERRERO', '3002475772', 'sistemas90@red5g.co', 'LUZ MARINA GUERRERO', '3002475772', 'sistemas90@red5g.co', NULL, NULL, 1),
(6, '2025-07-07 22:55:18', '2025-07-08 13:34:14', 1, NULL, 42, 'taxis individual', 'https://qa-services.vmltechnologies.com/api/perito-vml/consultar-cotizacion/', 4259, 'VML', '860505494', 'BOGOTA', '14', '2025-07-07', '30', '56000000', '0', 'GUV880', 'CITROEN', 'CELYSEE', 'AUTOMOVIL', '2020', '1587', 'AMARILLO', 'Público', '10KNAA0001482', 'VF7DDNFPBLJ519733', 'VF7DDNFPBLJ519733', 'SEDAN', 'GASOLINA', '01801133', 'C.C', '80020935', 'LUIS ALEXANDER VELOZA BUITRAGO', '3002475772', 'sistemas90@red5g.co', 'LUIS ALEXANDER VELOZA BUITRAGO', '3002475772', 'sistemas90@red5g.co', NULL, NULL, 1),
(7, '2025-07-08 13:24:04', '2025-07-08 13:34:21', 1, NULL, NULL, 'taxis individual', 'https://qa-services.vmltechnologies.com/api/perito-vml/consultar-cotizacion/', 4260, 'VML', '860505494', 'BOGOTA', '14', '2025-07-08', '30', '56000000', '0', 'GUZ604', 'CITROEN', 'CELYSEE', 'AUTOMOVIL', '2020', '1587', 'AMARILLO', 'Público', '10KNAA0001509', 'VF7DDNFPBLJ520375', 'VF7DDNFPBLJ520375', 'SEDAN', 'GASOLINA', '01801133', 'C.C', '19127736', 'RAFAEL  SANCHEZ GARCIA', '3002475772', 'sistemas90@red5g.co', 'RAFAEL  SANCHEZ GARCIA', '3002475772', 'sistemas90@red5g.co', NULL, NULL, 1),
(8, '2025-07-08 14:25:02', '2025-07-08 14:25:02', 1, NULL, NULL, 'taxis individual', 'https://qa-services.vmltechnologies.com/api/perito-vml/consultar-cotizacion/', 4261, 'VML', '860505494', 'BOGOTA', '14', '2025-07-08', '30', '76500000', '0', 'GVR422', 'KIA', 'SUPERVIP', 'AUTOMOVIL', '2021', '1591', 'AMARILLO', 'Público', 'G4FGLH800237', 'KNAJ281EAM7124735', 'KNAJ281EAM7124735', 'HATCH BACK', 'GASOLINA', '04601294', 'C.C', '94324778', 'RICARDO JULIAN OTERO MARTINEZ', '3002475772', 'sistemas90@red5g.co', 'RICARDO JULIAN OTERO MARTINEZ', '3002475772', 'sistemas90@red5g.co', NULL, NULL, 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inspection_orders_statuses`
--

INSERT INTO `inspection_orders_statuses` (`id`, `created_at`, `updated_at`, `name`, `description`) VALUES
(1, '2025-07-07 21:12:43', '2025-07-07 21:12:43', 'Creada', 'Orden de inspección creada, pendiente de contacto'),
(2, '2025-07-07 21:12:44', '2025-07-07 21:12:44', 'Contacto exitoso', 'Se logró contactar al cliente exitosamente'),
(3, '2025-07-07 21:12:44', '2025-07-07 21:12:44', 'Agendado', 'Inspección agendada con fecha y hora'),
(4, '2025-07-07 21:12:44', '2025-07-07 21:12:44', 'No contesta', 'Cliente no contesta las llamadas'),
(5, '2025-07-07 21:12:45', '2025-07-07 21:12:45', 'Ocupado', 'Cliente ocupado, reagendar llamada'),
(6, '2025-07-07 21:12:45', '2025-07-07 21:12:45', 'Número incorrecto', 'Número de teléfono incorrecto'),
(7, '2025-07-07 21:12:46', '2025-07-07 21:12:46', 'Solicita reagendar', 'Cliente solicita reagendar la llamada'),
(8, '2025-07-07 21:12:46', '2025-07-07 21:12:46', 'En progreso', 'Inspección en progreso'),
(9, '2025-07-07 21:12:46', '2025-07-07 21:12:46', 'Finalizada', 'Inspección completada'),
(10, '2025-07-07 21:12:47', '2025-07-07 21:12:47', 'Cancelada', 'Orden cancelada');

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
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `scheduled_at` datetime DEFAULT NULL COMMENT 'Fecha y hora programada para envío',
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `failed_at` datetime DEFAULT NULL,
  `retry_count` int NOT NULL DEFAULT '0' COMMENT 'Número de intentos de reenvío realizados',
  `max_retries` int NOT NULL DEFAULT '3' COMMENT 'Máximo número de intentos de reenvío',
  `external_id` varchar(100) DEFAULT NULL COMMENT 'ID externo del proveedor (WhatsApp, SMS, etc.)',
  `external_response` json DEFAULT NULL COMMENT 'Respuesta completa del proveedor externo',
  `error_message` text,
  `metadata` json DEFAULT NULL COMMENT 'Datos adicionales específicos del tipo de notificación',
  `push_token` varchar(255) DEFAULT NULL COMMENT 'Token para notificaciones push',
  `websocket_delivered` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si fue entregada via WebSocket'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notifications`
--

INSERT INTO `notifications` (`id`, `created_at`, `updated_at`, `notification_config_id`, `appointment_id`, `inspection_order_id`, `recipient_type`, `recipient_user_id`, `recipient_email`, `recipient_phone`, `recipient_name`, `title`, `content`, `status`, `priority`, `scheduled_at`, `sent_at`, `delivered_at`, `read_at`, `failed_at`, `retry_count`, `max_retries`, `external_id`, `external_response`, `error_message`, `metadata`, `push_token`, `websocket_delivered`) VALUES
(1, '2025-07-07 21:14:28', '2025-07-07 21:14:28', 3, NULL, 1, 'user', 5, NULL, NULL, NULL, 'Nueva Orden Asignada', 'Te han asignado una nueva orden de inspección #125584435 para el vehículo ASD123', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(2, '2025-07-07 22:10:28', '2025-07-07 22:10:28', 3, NULL, 1, 'user', 5, NULL, NULL, NULL, 'Orden Removida', 'La orden de inspección #125584435 para el vehículo ASD123 ha sido removida de tu asignación', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(3, '2025-07-07 22:10:40', '2025-07-07 22:10:40', 3, NULL, 2, 'user', 5, NULL, NULL, NULL, 'Nueva Orden Asignada', 'Te han asignado una nueva orden de inspección #115584435 para el vehículo ASD123', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(4, '2025-07-07 22:13:27', '2025-07-07 22:13:27', 3, NULL, 3, 'user', 5, NULL, NULL, NULL, 'Nueva Orden Asignada', 'Te han asignado una nueva orden de inspección #115684435 para el vehículo ASD123', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(5, '2025-07-07 22:13:31', '2025-07-07 22:13:31', 3, NULL, 1, 'user', 5, NULL, NULL, NULL, 'Nueva Orden Asignada', 'Te han asignado una nueva orden de inspección #125584435 para el vehículo ASD123', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(6, '2025-07-08 13:31:45', '2025-07-08 13:31:45', 3, NULL, 7, 'user', 42, NULL, NULL, NULL, 'Nueva Orden Asignada', 'Te han asignado una nueva orden de inspección #4260 para el vehículo GUZ604', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(7, '2025-07-08 13:34:15', '2025-07-08 13:34:15', 3, NULL, 6, 'user', 42, NULL, NULL, NULL, 'Nueva Orden Asignada', 'Te han asignado una nueva orden de inspección #4259 para el vehículo GUV880', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0),
(8, '2025-07-08 13:34:21', '2025-07-08 13:34:21', 3, NULL, 7, 'user', 42, NULL, NULL, NULL, 'Orden Removida', 'La orden de inspección #4260 para el vehículo GUZ604 ha sido removida de tu asignación', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, 0);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notification_channels`
--

INSERT INTO `notification_channels` (`id`, `created_at`, `updated_at`, `name`, `description`, `active`) VALUES
(1, '2025-07-07 21:12:51', '2025-07-07 21:12:51', 'sistema', 'Notificaciones del sistema interno', 1),
(2, '2025-07-07 21:12:51', '2025-07-07 21:12:51', 'in_app', 'Notificaciones dentro de la aplicación', 1),
(3, '2025-07-07 21:12:52', '2025-07-07 21:12:52', 'email', 'Notificaciones por correo electrónico', 1),
(4, '2025-07-07 21:12:52', '2025-07-07 21:12:52', 'sms', 'Notificaciones por SMS', 1),
(5, '2025-07-07 21:12:52', '2025-07-07 21:12:52', 'whatsapp', 'Notificaciones por WhatsApp', 1);

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
  `name` varchar(100) NOT NULL COMMENT 'Nombre descriptivo de la configuración',
  `template_title` text NOT NULL COMMENT 'Plantilla del título con variables {{variable}}',
  `template_content` text NOT NULL COMMENT 'Plantilla del contenido con variables {{variable}}',
  `template_variables` json DEFAULT NULL COMMENT 'Variables disponibles para la plantilla: {key: description}',
  `target_roles` json DEFAULT NULL COMMENT 'Array de roles que reciben esta notificación',
  `target_users` json DEFAULT NULL COMMENT 'Array de IDs de usuarios específicos',
  `for_clients` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si la notificación es para clientes',
  `for_users` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si la notificación es para usuarios del sistema',
  `trigger_conditions` json DEFAULT NULL COMMENT 'Condiciones que disparan la notificación',
  `schedule_type` enum('immediate','delayed','recurring') NOT NULL DEFAULT 'immediate' COMMENT 'Tipo de programación de la notificación',
  `schedule_delay_minutes` int DEFAULT NULL COMMENT 'Minutos de retraso para notificaciones delayed',
  `schedule_cron` varchar(100) DEFAULT NULL COMMENT 'Expresión cron para notificaciones recurring',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal' COMMENT 'Prioridad de la notificación',
  `retry_attempts` int NOT NULL DEFAULT '3' COMMENT 'Número de intentos de reenvío en caso de fallo',
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notification_config`
--

INSERT INTO `notification_config` (`id`, `created_at`, `updated_at`, `notification_type_id`, `notification_channel_id`, `name`, `template_title`, `template_content`, `template_variables`, `target_roles`, `target_users`, `for_clients`, `for_users`, `trigger_conditions`, `schedule_type`, `schedule_delay_minutes`, `schedule_cron`, `priority`, `retry_attempts`, `active`) VALUES
(1, '2025-07-07 21:12:56', '2025-07-07 21:12:56', 2, 2, 'Llamada realizada - Notificación interna', 'Llamada realizada', 'Se ha registrado una llamada para la orden #{numero}', NULL, NULL, NULL, 0, 1, NULL, 'immediate', NULL, NULL, 'normal', 3, 1),
(2, '2025-07-07 21:12:56', '2025-07-07 21:12:56', 3, 2, 'Agendamiento realizado - Notificación interna', 'Agendamiento realizado', 'Se ha agendado una inspección para la orden #{numero}', NULL, NULL, NULL, 0, 1, NULL, 'immediate', NULL, NULL, 'normal', 3, 1),
(3, '2025-07-07 21:12:56', '2025-07-07 21:12:56', 6, 1, 'Asignación de orden - Sistema', 'Orden Asignada', 'Te han asignado una nueva orden de inspección #{numero}', NULL, NULL, NULL, 0, 1, NULL, 'immediate', NULL, NULL, 'normal', 3, 1),
(4, '2025-07-07 21:12:57', '2025-07-07 21:12:57', 3, 4, 'Inspección agendada - SMS cliente', 'Inspección Agendada', 'Su inspección ha sido agendada para el {fecha} a las {hora}. Orden: #{numero}', NULL, NULL, NULL, 1, 0, NULL, 'immediate', NULL, NULL, 'normal', 3, 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notification_types`
--

INSERT INTO `notification_types` (`id`, `created_at`, `updated_at`, `name`, `description`) VALUES
(1, '2025-07-07 21:12:53', '2025-07-07 21:12:53', 'order_created', 'Orden de inspección creada'),
(2, '2025-07-07 21:12:54', '2025-07-07 21:12:54', 'call_made', 'Llamada realizada'),
(3, '2025-07-07 21:12:54', '2025-07-07 21:12:54', 'appointment_scheduled', 'Agendamiento realizado'),
(4, '2025-07-07 21:12:54', '2025-07-07 21:12:54', 'inspection_completed', 'Inspección completada'),
(5, '2025-07-07 21:12:55', '2025-07-07 21:12:55', 'status_updated', 'Estado de orden actualizado'),
(6, '2025-07-07 21:12:55', '2025-07-07 21:12:55', 'asignacion_orden', 'Asignación de orden a agente');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `permissions`
--

INSERT INTO `permissions` (`id`, `created_at`, `updated_at`, `name`, `description`, `resource`, `action`, `endpoint`, `method`, `is_active`) VALUES
(1, '2025-07-07 21:11:27', '2025-07-07 21:11:27', 'users.read', 'Ver usuarios', 'users', 'read', '/api/users', 'GET', 1),
(2, '2025-07-07 21:11:28', '2025-07-07 21:11:28', 'users.create', 'Crear usuarios', 'users', 'create', '/api/users', 'POST', 1),
(3, '2025-07-07 21:11:28', '2025-07-07 21:11:28', 'users.update', 'Actualizar usuarios', 'users', 'update', '/api/users/:id', 'PUT', 1),
(4, '2025-07-07 21:11:29', '2025-07-07 21:11:29', 'users.delete', 'Eliminar usuarios', 'users', 'delete', '/api/users/:id', 'DELETE', 1),
(5, '2025-07-07 21:11:29', '2025-07-07 21:11:29', 'departments.read', 'Ver departamentos', 'departments', 'read', '/api/departments', 'GET', 1),
(6, '2025-07-07 21:11:30', '2025-07-07 21:11:30', 'departments.create', 'Crear departamentos', 'departments', 'create', '/api/departments', 'POST', 1),
(7, '2025-07-07 21:11:30', '2025-07-07 21:11:30', 'departments.update', 'Actualizar departamentos', 'departments', 'update', '/api/departments/:id', 'PUT', 1),
(8, '2025-07-07 21:11:30', '2025-07-07 21:11:30', 'departments.delete', 'Eliminar departamentos', 'departments', 'delete', '/api/departments/:id', 'DELETE', 1),
(9, '2025-07-07 21:11:31', '2025-07-07 21:11:31', 'cities.read', 'Ver ciudades', 'cities', 'read', '/api/cities', 'GET', 1),
(10, '2025-07-07 21:11:31', '2025-07-07 21:11:31', 'cities.create', 'Crear ciudades', 'cities', 'create', '/api/cities', 'POST', 1),
(11, '2025-07-07 21:11:32', '2025-07-07 21:11:32', 'cities.update', 'Actualizar ciudades', 'cities', 'update', '/api/cities/:id', 'PUT', 1),
(12, '2025-07-07 21:11:32', '2025-07-07 21:11:32', 'cities.delete', 'Eliminar ciudades', 'cities', 'delete', '/api/cities/:id', 'DELETE', 1),
(13, '2025-07-07 21:11:33', '2025-07-07 21:11:33', 'companies.read', 'Ver empresas', 'companies', 'read', '/api/companies', 'GET', 1),
(14, '2025-07-07 21:11:33', '2025-07-07 21:11:33', 'companies.create', 'Crear empresas', 'companies', 'create', '/api/companies', 'POST', 1),
(15, '2025-07-07 21:11:34', '2025-07-07 21:11:34', 'companies.update', 'Actualizar empresas', 'companies', 'update', '/api/companies/:id', 'PUT', 1),
(16, '2025-07-07 21:11:34', '2025-07-07 21:11:34', 'companies.delete', 'Eliminar empresas', 'companies', 'delete', '/api/companies/:id', 'DELETE', 1),
(17, '2025-07-07 21:11:34', '2025-07-07 21:11:34', 'sedes.read', 'Ver sedes', 'sedes', 'read', '/api/sedes', 'GET', 1),
(18, '2025-07-07 21:11:35', '2025-07-07 21:11:35', 'sedes.create', 'Crear sedes', 'sedes', 'create', '/api/sedes', 'POST', 1),
(19, '2025-07-07 21:11:35', '2025-07-07 21:11:35', 'sedes.update', 'Actualizar sedes', 'sedes', 'update', '/api/sedes/:id', 'PUT', 1),
(20, '2025-07-07 21:11:36', '2025-07-07 21:11:36', 'sedes.delete', 'Eliminar sedes', 'sedes', 'delete', '/api/sedes/:id', 'DELETE', 1),
(21, '2025-07-07 21:11:36', '2025-07-07 21:11:36', 'roles.read', 'Ver roles', 'roles', 'read', '/api/roles', 'GET', 1),
(22, '2025-07-07 21:11:37', '2025-07-07 21:11:37', 'roles.create', 'Crear roles', 'roles', 'create', '/api/roles', 'POST', 1),
(23, '2025-07-07 21:11:37', '2025-07-07 21:11:37', 'roles.update', 'Actualizar roles', 'roles', 'update', '/api/roles/:id', 'PUT', 1),
(24, '2025-07-07 21:11:38', '2025-07-07 21:11:38', 'roles.delete', 'Eliminar roles', 'roles', 'delete', '/api/roles/:id', 'DELETE', 1),
(25, '2025-07-07 21:11:38', '2025-07-07 21:11:38', 'permissions.read', 'Ver permisos', 'permissions', 'read', '/api/permissions', 'GET', 1),
(26, '2025-07-07 21:11:38', '2025-07-07 21:11:38', 'permissions.create', 'Crear permisos', 'permissions', 'create', '/api/permissions', 'POST', 1),
(27, '2025-07-07 21:11:39', '2025-07-07 21:11:39', 'permissions.update', 'Actualizar permisos', 'permissions', 'update', '/api/permissions/:id', 'PUT', 1),
(28, '2025-07-07 21:11:39', '2025-07-07 21:11:39', 'permissions.delete', 'Eliminar permisos', 'permissions', 'delete', '/api/permissions/:id', 'DELETE', 1),
(29, '2025-07-07 21:11:40', '2025-07-07 21:11:40', 'inspection_orders.read', 'Ver órdenes de inspección', 'inspection_orders', 'read', '/api/inspection-orders', 'GET', 1),
(30, '2025-07-07 21:11:40', '2025-07-07 21:11:40', 'inspection_orders.create', 'Crear órdenes de inspección', 'inspection_orders', 'create', '/api/inspection-orders', 'POST', 1),
(31, '2025-07-07 21:11:41', '2025-07-07 21:11:41', 'inspection_orders.update', 'Actualizar órdenes de inspección', 'inspection_orders', 'update', '/api/inspection-orders/:id', 'PUT', 1),
(32, '2025-07-07 21:11:41', '2025-07-07 21:11:41', 'inspection_orders.delete', 'Eliminar órdenes de inspección', 'inspection_orders', 'delete', '/api/inspection-orders/:id', 'DELETE', 1),
(33, '2025-07-07 21:11:42', '2025-07-07 21:11:42', 'contact_agent.read', 'Ver órdenes como Agente de Contact Center', 'contact_agent', 'read', '/api/contact-agent', 'GET', 1),
(34, '2025-07-07 21:11:42', '2025-07-07 21:11:42', 'contact_agent.create_call', 'Registrar llamadas', 'contact_agent', 'create_call', '/api/contact-agent/call-logs', 'POST', 1),
(35, '2025-07-07 21:11:42', '2025-07-07 21:11:42', 'contact_agent.create_appointment', 'Crear agendamientos', 'contact_agent', 'create_appointment', '/api/contact-agent/appointments', 'POST', 1),
(36, '2025-07-07 21:11:43', '2025-07-07 21:11:43', 'coordinador_contacto.read', 'Ver órdenes como Coordinador de Contact Center', 'coordinador_contacto', 'read', '/api/coordinador-contacto', 'GET', 1),
(37, '2025-07-07 21:11:43', '2025-07-07 21:11:43', 'coordinador_contacto.assign', 'Asignar agentes a órdenes', 'coordinador_contacto', 'assign', '/api/coordinador-contacto/assign', 'POST', 1),
(38, '2025-07-07 21:11:44', '2025-07-07 21:11:44', 'coordinador_contacto.stats', 'Ver estadísticas de órdenes', 'coordinador_contacto', 'stats', '/api/coordinador-contacto/stats', 'GET', 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `created_at`, `updated_at`, `name`, `description`, `is_active`) VALUES
(1, '2025-07-07 21:11:44', '2025-07-07 21:11:44', 'super_admin', 'Administrador del sistema con todos los permisos', 1),
(2, '2025-07-07 21:11:45', '2025-07-07 21:11:45', 'admin', 'Administrador con permisos de gestión', 1),
(3, '2025-07-07 21:11:45', '2025-07-07 21:11:45', 'manager', 'Gerente con permisos de lectura y escritura', 1),
(4, '2025-07-07 21:11:46', '2025-07-07 21:11:46', 'user', 'Usuario básico con permisos de lectura', 1),
(5, '2025-07-07 21:11:46', '2025-07-07 21:11:46', 'comercial_mundial', 'Comercial Mundial - Puede crear y gestionar órdenes de inspección', 1),
(6, '2025-07-07 21:11:47', '2025-07-07 21:11:47', 'agente_contacto', 'Agente de Contact Center - Gestiona llamadas y agendamientos', 1),
(7, '2025-07-07 21:11:47', '2025-07-07 21:11:47', 'coordinador_contacto', 'Coordinador de Contact Center - Supervisa y asigna agentes', 1),
(8, '2025-07-08 02:13:16', '2025-07-08 02:13:16', 'supervisor', 'Rol de supervisor, con la capacidad de asignar inspectores', 1),
(9, '2025-07-08 02:13:16', '2025-07-08 02:13:16', 'inspector', 'Rol de inspector, con la capacidad de gestionar agendamientos de inspección', 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `created_at`, `updated_at`, `role_id`, `permission_id`) VALUES
(1, '2025-07-07 21:11:47', '2025-07-07 21:11:47', 1, 1),
(2, '2025-07-07 21:11:48', '2025-07-07 21:11:48', 1, 2),
(3, '2025-07-07 21:11:48', '2025-07-07 21:11:48', 1, 3),
(4, '2025-07-07 21:11:49', '2025-07-07 21:11:49', 1, 4),
(5, '2025-07-07 21:11:49', '2025-07-07 21:11:49', 1, 5),
(6, '2025-07-07 21:11:50', '2025-07-07 21:11:50', 1, 6),
(7, '2025-07-07 21:11:50', '2025-07-07 21:11:50', 1, 7),
(8, '2025-07-07 21:11:51', '2025-07-07 21:11:51', 1, 8),
(9, '2025-07-07 21:11:51', '2025-07-07 21:11:51', 1, 9),
(10, '2025-07-07 21:11:51', '2025-07-07 21:11:51', 1, 10),
(11, '2025-07-07 21:11:52', '2025-07-07 21:11:52', 1, 11),
(12, '2025-07-07 21:11:52', '2025-07-07 21:11:52', 1, 12),
(13, '2025-07-07 21:11:53', '2025-07-07 21:11:53', 1, 13),
(14, '2025-07-07 21:11:53', '2025-07-07 21:11:53', 1, 14),
(15, '2025-07-07 21:11:53', '2025-07-07 21:11:53', 1, 15),
(16, '2025-07-07 21:11:54', '2025-07-07 21:11:54', 1, 16),
(17, '2025-07-07 21:11:54', '2025-07-07 21:11:54', 1, 17),
(18, '2025-07-07 21:11:55', '2025-07-07 21:11:55', 1, 18),
(19, '2025-07-07 21:11:55', '2025-07-07 21:11:55', 1, 19),
(20, '2025-07-07 21:11:56', '2025-07-07 21:11:56', 1, 20),
(21, '2025-07-07 21:11:56', '2025-07-07 21:11:56', 1, 21),
(22, '2025-07-07 21:11:56', '2025-07-07 21:11:56', 1, 22),
(23, '2025-07-07 21:11:57', '2025-07-07 21:11:57', 1, 23),
(24, '2025-07-07 21:11:57', '2025-07-07 21:11:57', 1, 24),
(25, '2025-07-07 21:11:58', '2025-07-07 21:11:58', 1, 25),
(26, '2025-07-07 21:11:58', '2025-07-07 21:11:58', 1, 26),
(27, '2025-07-07 21:11:58', '2025-07-07 21:11:58', 1, 27),
(28, '2025-07-07 21:11:59', '2025-07-07 21:11:59', 1, 28),
(29, '2025-07-07 21:11:59', '2025-07-07 21:11:59', 1, 29),
(30, '2025-07-07 21:12:00', '2025-07-07 21:12:00', 1, 30),
(31, '2025-07-07 21:12:00', '2025-07-07 21:12:00', 1, 31),
(32, '2025-07-07 21:12:00', '2025-07-07 21:12:00', 1, 32),
(33, '2025-07-07 21:12:01', '2025-07-07 21:12:01', 1, 33),
(34, '2025-07-07 21:12:01', '2025-07-07 21:12:01', 1, 34),
(35, '2025-07-07 21:12:02', '2025-07-07 21:12:02', 1, 35),
(36, '2025-07-07 21:12:02', '2025-07-07 21:12:02', 1, 36),
(37, '2025-07-07 21:12:03', '2025-07-07 21:12:03', 1, 37),
(38, '2025-07-07 21:12:03', '2025-07-07 21:12:03', 1, 38),
(39, '2025-07-07 21:12:04', '2025-07-07 21:12:04', 2, 1),
(40, '2025-07-07 21:12:04', '2025-07-07 21:12:04', 2, 2),
(41, '2025-07-07 21:12:05', '2025-07-07 21:12:05', 2, 3),
(42, '2025-07-07 21:12:05', '2025-07-07 21:12:05', 2, 4),
(43, '2025-07-07 21:12:05', '2025-07-07 21:12:05', 2, 5),
(44, '2025-07-07 21:12:06', '2025-07-07 21:12:06', 2, 6),
(45, '2025-07-07 21:12:06', '2025-07-07 21:12:06', 2, 7),
(46, '2025-07-07 21:12:07', '2025-07-07 21:12:07', 2, 8),
(47, '2025-07-07 21:12:07', '2025-07-07 21:12:07', 2, 9),
(48, '2025-07-07 21:12:07', '2025-07-07 21:12:07', 2, 10),
(49, '2025-07-07 21:12:08', '2025-07-07 21:12:08', 2, 11),
(50, '2025-07-07 21:12:08', '2025-07-07 21:12:08', 2, 12),
(51, '2025-07-07 21:12:09', '2025-07-07 21:12:09', 2, 13),
(52, '2025-07-07 21:12:09', '2025-07-07 21:12:09', 2, 14),
(53, '2025-07-07 21:12:10', '2025-07-07 21:12:10', 2, 15),
(54, '2025-07-07 21:12:10', '2025-07-07 21:12:10', 2, 16),
(55, '2025-07-07 21:12:10', '2025-07-07 21:12:10', 2, 17),
(56, '2025-07-07 21:12:11', '2025-07-07 21:12:11', 2, 18),
(57, '2025-07-07 21:12:11', '2025-07-07 21:12:11', 2, 19),
(58, '2025-07-07 21:12:12', '2025-07-07 21:12:12', 2, 20),
(59, '2025-07-07 21:12:12', '2025-07-07 21:12:12', 2, 29),
(60, '2025-07-07 21:12:12', '2025-07-07 21:12:12', 2, 30),
(61, '2025-07-07 21:12:13', '2025-07-07 21:12:13', 2, 31),
(62, '2025-07-07 21:12:14', '2025-07-07 21:12:14', 2, 32),
(63, '2025-07-07 21:12:14', '2025-07-07 21:12:14', 2, 33),
(64, '2025-07-07 21:12:14', '2025-07-07 21:12:14', 2, 34),
(65, '2025-07-07 21:12:15', '2025-07-07 21:12:15', 2, 35),
(66, '2025-07-07 21:12:15', '2025-07-07 21:12:15', 2, 36),
(67, '2025-07-07 21:12:16', '2025-07-07 21:12:16', 2, 37),
(68, '2025-07-07 21:12:16', '2025-07-07 21:12:16', 2, 38),
(69, '2025-07-07 21:12:16', '2025-07-07 21:12:16', 3, 1),
(70, '2025-07-07 21:12:17', '2025-07-07 21:12:17', 3, 2),
(71, '2025-07-07 21:12:17', '2025-07-07 21:12:17', 3, 5),
(72, '2025-07-07 21:12:18', '2025-07-07 21:12:18', 3, 6),
(73, '2025-07-07 21:12:18', '2025-07-07 21:12:18', 3, 9),
(74, '2025-07-07 21:12:18', '2025-07-07 21:12:18', 3, 10),
(75, '2025-07-07 21:12:19', '2025-07-07 21:12:19', 3, 13),
(76, '2025-07-07 21:12:19', '2025-07-07 21:12:19', 3, 14),
(77, '2025-07-07 21:12:20', '2025-07-07 21:12:20', 3, 17),
(78, '2025-07-07 21:12:20', '2025-07-07 21:12:20', 3, 18),
(79, '2025-07-07 21:12:20', '2025-07-07 21:12:20', 3, 21),
(80, '2025-07-07 21:12:21', '2025-07-07 21:12:21', 3, 25),
(81, '2025-07-07 21:12:21', '2025-07-07 21:12:21', 3, 29),
(82, '2025-07-07 21:12:22', '2025-07-07 21:12:22', 3, 30),
(83, '2025-07-07 21:12:22', '2025-07-07 21:12:22', 3, 33),
(84, '2025-07-07 21:12:22', '2025-07-07 21:12:22', 3, 36),
(85, '2025-07-07 21:12:23', '2025-07-07 21:12:23', 4, 1),
(86, '2025-07-07 21:12:23', '2025-07-07 21:12:23', 4, 5),
(87, '2025-07-07 21:12:24', '2025-07-07 21:12:24', 4, 9),
(88, '2025-07-07 21:12:24', '2025-07-07 21:12:24', 4, 13),
(89, '2025-07-07 21:12:24', '2025-07-07 21:12:24', 4, 17),
(90, '2025-07-07 21:12:25', '2025-07-07 21:12:25', 4, 21),
(91, '2025-07-07 21:12:25', '2025-07-07 21:12:25', 4, 25),
(92, '2025-07-07 21:12:26', '2025-07-07 21:12:26', 4, 29),
(93, '2025-07-07 21:12:26', '2025-07-07 21:12:26', 4, 33),
(94, '2025-07-07 21:12:27', '2025-07-07 21:12:27', 4, 36),
(95, '2025-07-07 21:12:27', '2025-07-07 21:12:27', 5, 5),
(96, '2025-07-07 21:12:28', '2025-07-07 21:12:28', 5, 9),
(97, '2025-07-07 21:12:28', '2025-07-07 21:12:28', 5, 17),
(98, '2025-07-07 21:12:29', '2025-07-07 21:12:29', 5, 29),
(99, '2025-07-07 21:12:29', '2025-07-07 21:12:29', 5, 30),
(100, '2025-07-07 21:12:29', '2025-07-07 21:12:29', 5, 31),
(101, '2025-07-07 21:12:30', '2025-07-07 21:12:30', 5, 32),
(102, '2025-07-07 21:12:30', '2025-07-07 21:12:30', 6, 5),
(103, '2025-07-07 21:12:31', '2025-07-07 21:12:31', 6, 9),
(104, '2025-07-07 21:12:31', '2025-07-07 21:12:31', 6, 17),
(105, '2025-07-07 21:12:32', '2025-07-07 21:12:32', 6, 29),
(106, '2025-07-07 21:12:32', '2025-07-07 21:12:32', 6, 33),
(107, '2025-07-07 21:12:32', '2025-07-07 21:12:32', 6, 34),
(108, '2025-07-07 21:12:33', '2025-07-07 21:12:33', 6, 35),
(109, '2025-07-07 21:12:33', '2025-07-07 21:12:33', 7, 1),
(110, '2025-07-07 21:12:34', '2025-07-07 21:12:34', 7, 29),
(111, '2025-07-07 21:12:34', '2025-07-07 21:12:34', 7, 33),
(112, '2025-07-07 21:12:34', '2025-07-07 21:12:34', 7, 36),
(113, '2025-07-07 21:12:35', '2025-07-07 21:12:35', 7, 37),
(114, '2025-07-07 21:12:35', '2025-07-07 21:12:35', 7, 38);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `schedule_templates`
--

CREATE TABLE `schedule_templates` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `sede_id` bigint NOT NULL,
  `inspection_modality_id` bigint NOT NULL,
  `name` varchar(200) NOT NULL COMMENT 'Nombre descriptivo del horario (ej: "Lunes a Viernes Mañana")',
  `days_pattern` varchar(50) NOT NULL COMMENT 'Patrón de días: "1,2,3,4,5" o "1,3,5" o "6" etc. (1=Lun, 7=Dom)',
  `start_time` time NOT NULL COMMENT 'Hora de inicio del bloque',
  `end_time` time NOT NULL COMMENT 'Hora de fin del bloque',
  `interval_minutes` int NOT NULL DEFAULT '60' COMMENT 'Duración de cada intervalo en minutos',
  `capacity_per_interval` int NOT NULL DEFAULT '5' COMMENT 'Cupos disponibles por intervalo',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `priority` int NOT NULL DEFAULT '0' COMMENT 'Prioridad para ordenar horarios (mayor número = mayor prioridad)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `schedule_templates`
--

INSERT INTO `schedule_templates` (`id`, `created_at`, `updated_at`, `sede_id`, `inspection_modality_id`, `name`, `days_pattern`, `start_time`, `end_time`, `interval_minutes`, `capacity_per_interval`, `active`, `priority`) VALUES
(1, '2025-07-07 21:13:01', '2025-07-07 21:13:01', 2, 1, 'Lunes a Viernes - En Sede', '1,2,3,4', '07:00:00', '17:00:00', 60, 5, 1, 1),
(2, '2025-07-07 21:13:01', '2025-07-07 21:13:01', 2, 2, 'Lunes a Viernes - A Domicilio', '1,2,3,4', '07:00:00', '17:00:00', 120, 5, 1, 2),
(3, '2025-07-07 21:13:02', '2025-07-07 21:13:02', 2, 1, 'Sábados - En Sede', '6', '08:00:00', '17:00:00', 60, 5, 1, 1),
(4, '2025-07-07 21:13:02', '2025-07-07 21:13:02', 2, 2, 'Sábados - A Domicilio', '6', '08:00:00', '17:00:00', 60, 3, 1, 2),
(5, '2025-07-07 21:13:03', '2025-07-07 21:13:03', 3, 1, 'Lunes a Viernes - En Sede', '1,2,3,4,5', '07:00:00', '17:00:00', 60, 5, 1, 1),
(6, '2025-07-07 21:13:04', '2025-07-07 21:13:04', 3, 2, 'Lunes a Viernes - A Domicilio', '1,2,3,4,5', '07:00:00', '17:00:00', 60, 3, 1, 2),
(7, '2025-07-07 21:13:04', '2025-07-07 21:13:04', 3, 1, 'Sábados - En Sede', '6', '08:00:00', '17:00:00', 60, 5, 1, 1),
(8, '2025-07-07 21:13:05', '2025-07-07 21:13:05', 3, 2, 'Sábados - A Domicilio', '6', '08:00:00', '17:00:00', 60, 3, 1, 2),
(9, '2025-07-07 21:13:06', '2025-07-07 21:13:06', 4, 1, 'Lunes a Sábados - En Sede', '1,2,3,4,5,6', '06:00:00', '18:00:00', 60, 5, 1, 1),
(10, '2025-07-07 21:13:06', '2025-07-07 21:13:06', 4, 2, 'Lunes a Sábados - A Domicilio', '1,2,3,4,5,6', '06:00:00', '18:00:00', 60, 3, 1, 2),
(11, '2025-07-07 21:13:08', '2025-07-07 21:13:08', 5, 1, 'Lunes a Viernes - En Sede', '1,2,3,4,5', '07:00:00', '17:00:00', 60, 5, 1, 1),
(12, '2025-07-07 21:13:09', '2025-07-07 21:13:09', 5, 2, 'Lunes a Viernes - A Domicilio', '1,2,3,4,5', '07:00:00', '17:00:00', 60, 3, 1, 2),
(13, '2025-07-07 21:13:09', '2025-07-07 21:13:09', 5, 1, 'Sábados - En Sede', '6', '08:00:00', '17:00:00', 60, 5, 1, 1),
(14, '2025-07-07 21:13:10', '2025-07-07 21:13:10', 5, 2, 'Sábados - A Domicilio', '6', '08:00:00', '17:00:00', 60, 3, 1, 2),
(15, '2025-07-07 21:13:10', '2025-07-07 21:13:10', 5, 1, 'Domingos - En Sede', '7', '08:00:00', '12:00:00', 60, 5, 1, 1),
(16, '2025-07-07 21:13:10', '2025-07-07 21:13:10', 5, 2, 'Domingos - A Domicilio', '7', '08:00:00', '12:00:00', 60, 3, 1, 2),
(17, '2025-07-07 21:13:12', '2025-07-07 21:13:12', 6, 1, 'Lunes a Viernes - En Sede', '1,2,3,4,5', '07:00:00', '17:00:00', 60, 5, 1, 1),
(18, '2025-07-07 21:13:12', '2025-07-07 21:13:12', 6, 2, 'Lunes a Viernes - A Domicilio', '1,2,3,4,5', '07:00:00', '17:00:00', 60, 3, 1, 2),
(19, '2025-07-07 21:13:13', '2025-07-07 21:13:13', 6, 1, 'Sábados - En Sede', '6', '08:00:00', '17:00:00', 60, 5, 1, 1),
(20, '2025-07-07 21:13:13', '2025-07-07 21:13:13', 6, 2, 'Sábados - A Domicilio', '6', '08:00:00', '17:00:00', 60, 3, 1, 2),
(21, '2025-07-07 21:13:14', '2025-07-07 21:13:14', 6, 1, 'Domingos - En Sede', '7', '08:00:00', '12:00:00', 60, 5, 1, 1),
(22, '2025-07-07 21:13:14', '2025-07-07 21:13:14', 6, 2, 'Domingos - A Domicilio', '7', '08:00:00', '12:00:00', 60, 3, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sedes`
--

CREATE TABLE `sedes` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `company_id` bigint NOT NULL,
  `sede_type_id` bigint NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `city_id` bigint NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL COMMENT 'Latitud para ubicación GPS',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT 'Longitud para ubicación GPS',
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sedes`
--

INSERT INTO `sedes` (`id`, `created_at`, `updated_at`, `company_id`, `sede_type_id`, `name`, `email`, `phone`, `city_id`, `address`, `latitude`, `longitude`, `active`) VALUES
(1, '2025-07-07 21:12:42', '2025-07-07 21:12:42', 1, 2, 'Sede Administrativa Temporal', 'admin@vmlperito.com', '601-000-0000', 1, 'Sede temporal para administrador', NULL, NULL, 1),
(2, '2025-07-07 21:12:59', '2025-07-07 21:12:59', 1, 1, 'CDA 197', 'cda197@previcar.com', '601-234-5001', 1, 'AUTOPISTA NORTE No. 197 -75', NULL, NULL, 1),
(3, '2025-07-07 21:13:02', '2025-07-07 21:13:02', 1, 1, 'CDA Distrital', 'cdadistrital@previcar.com', '601-234-5002', 1, 'Carrera 36 # 19 – 21', NULL, NULL, 1),
(4, '2025-07-07 21:13:05', '2025-07-07 21:13:05', 1, 1, 'CDA PREVITAX', 'previtax@previcar.com', '601-234-5003', 1, 'CALLE 12 B No. 44 – 08', NULL, NULL, 1),
(5, '2025-07-07 21:13:07', '2025-07-07 21:13:07', 1, 1, 'CDA Cali Norte', 'calinorte@previcar.com', '602-234-5004', 4, 'CRA 1 N° 47 – 250', NULL, NULL, 1),
(6, '2025-07-07 21:13:11', '2025-07-07 21:13:11', 1, 1, 'CDA Cali Sur', 'calisur@previcar.com', '602-234-5005', 4, 'CRA 41 N° 6-02', NULL, NULL, 1),
(7, '2025-07-07 21:13:15', '2025-07-07 21:13:15', 1, 2, 'Sede Comercial Bogotá', 'comercial@previcar.com', '601-234-5100', 1, 'Carrera 15 # 93-47 Oficina 501', NULL, NULL, 1),
(8, '2025-07-07 21:13:15', '2025-07-07 21:13:15', 1, 3, 'Sede Soporte Bogotá', 'soporte@previcar.com', '601-234-5200', 1, 'Carrera 15 # 93-47 Oficina 502', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sede_modality_availability`
--

CREATE TABLE `sede_modality_availability` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `sede_id` bigint NOT NULL,
  `inspection_modality_id` bigint NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `max_daily_capacity` int DEFAULT NULL COMMENT 'Capacidad máxima diaria para esta modalidad',
  `working_hours_start` time DEFAULT NULL COMMENT 'Hora de inicio de atención',
  `working_hours_end` time DEFAULT NULL COMMENT 'Hora de fin de atención',
  `working_days` varchar(20) DEFAULT '1,2,3,4,5' COMMENT 'Días de trabajo (1=Lunes, 7=Domingo)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sede_modality_availability`
--

INSERT INTO `sede_modality_availability` (`id`, `created_at`, `updated_at`, `sede_id`, `inspection_modality_id`, `active`, `max_daily_capacity`, `working_hours_start`, `working_hours_end`, `working_days`) VALUES
(1, '2025-07-07 21:13:16', '2025-07-07 21:13:16', 2, 1, 1, 25, '07:00:00', '17:00:00', '1,2,3,4,5,6'),
(2, '2025-07-07 21:13:17', '2025-07-07 21:13:17', 3, 1, 1, 25, '07:00:00', '17:00:00', '1,2,3,4,5,6'),
(3, '2025-07-07 21:13:17', '2025-07-07 21:13:17', 4, 1, 1, 25, '07:00:00', '17:00:00', '1,2,3,4,5,6'),
(4, '2025-07-07 21:13:18', '2025-07-07 21:13:18', 5, 1, 1, 25, '07:00:00', '17:00:00', '1,2,3,4,5,6'),
(5, '2025-07-07 21:13:18', '2025-07-07 21:13:18', 6, 1, 1, 25, '07:00:00', '17:00:00', '1,2,3,4,5,6'),
(6, '2025-07-07 21:13:19', '2025-07-07 21:13:19', 3, 2, 1, 15, '07:00:00', '17:00:00', '1,2,3,4,5,6'),
(7, '2025-07-07 21:13:19', '2025-07-07 21:13:19', 3, 3, 1, 20, '08:00:00', '18:00:00', '1,2,3,4,5,6'),
(8, '2025-07-07 21:13:20', '2025-07-07 21:13:20', 5, 2, 1, 15, '07:00:00', '17:00:00', '1,2,3,4,5,6,7'),
(9, '2025-07-07 21:13:20', '2025-07-07 21:13:20', 5, 3, 1, 20, '08:00:00', '18:00:00', '1,2,3,4,5,6,7');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sede_types`
--

CREATE TABLE `sede_types` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `code` varchar(20) NOT NULL COMMENT 'Código único: CDA, COMERCIAL, SOPORTE',
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sede_types`
--

INSERT INTO `sede_types` (`id`, `created_at`, `updated_at`, `name`, `description`, `code`, `active`) VALUES
(1, '2025-07-07 21:12:36', '2025-07-07 21:12:36', 'CDA', 'Centro de Diagnóstico Automotor', 'CDA', 1),
(2, '2025-07-07 21:12:37', '2025-07-07 21:12:37', 'Comercial', 'Sede comercial y ventas', 'COMERCIAL', 1),
(3, '2025-07-07 21:12:38', '2025-07-07 21:12:38', 'Soporte', 'Sede de soporte y contact center', 'SOPORTE', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sede_vehicle_types`
--

CREATE TABLE `sede_vehicle_types` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `sede_id` bigint NOT NULL,
  `vehicle_type_id` bigint NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sede_vehicle_types`
--

INSERT INTO `sede_vehicle_types` (`id`, `created_at`, `updated_at`, `sede_id`, `vehicle_type_id`, `active`) VALUES
(1, '2025-07-07 21:12:59', '2025-07-07 21:12:59', 2, 1, 1),
(2, '2025-07-07 21:13:00', '2025-07-07 21:13:00', 2, 2, 1),
(3, '2025-07-07 21:13:00', '2025-07-07 21:13:00', 2, 3, 1),
(4, '2025-07-07 21:13:03', '2025-07-07 21:13:03', 3, 1, 1),
(5, '2025-07-07 21:13:05', '2025-07-07 21:13:05', 4, 1, 1),
(6, '2025-07-07 21:13:07', '2025-07-07 21:13:07', 5, 1, 1),
(7, '2025-07-07 21:13:08', '2025-07-07 21:13:08', 5, 2, 1),
(8, '2025-07-07 21:13:08', '2025-07-07 21:13:08', 5, 3, 1),
(9, '2025-07-07 21:13:11', '2025-07-07 21:13:11', 6, 1, 1),
(10, '2025-07-07 21:13:12', '2025-07-07 21:13:12', 6, 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `notification_channel_in_app_enabled` tinyint(1) DEFAULT '1',
  `notification_channel_sms_enabled` tinyint(1) DEFAULT '1',
  `notification_channel_email_enabled` tinyint(1) DEFAULT '1',
  `notification_channel_whatsapp_enabled` tinyint(1) DEFAULT '1',
  `sede_id` bigint DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `created_at`, `updated_at`, `name`, `email`, `phone`, `password`, `notification_channel_in_app_enabled`, `notification_channel_sms_enabled`, `notification_channel_email_enabled`, `notification_channel_whatsapp_enabled`, `sede_id`, `is_active`) VALUES
(1, '2025-07-07 21:12:42', '2025-07-07 21:12:42', 'Administrador del Sistema', 'admin@vmlperito.com', '123456789', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 1, 1, 1, NULL, 1),
(2, '2025-07-07 21:13:21', '2025-07-07 21:13:21', 'María Comercial', 'comercial@vmlperito.com', '300-7654321', '$2b$10$C7Y1jfSQLXAeQ0gIX8b1PeCflaJvWTmG2/UF4XjJK.3r/P145rDpq', 1, 1, 1, 1, NULL, 1),
(3, '2025-07-07 21:13:22', '2025-07-07 21:13:22', 'Ana Coordinadora', 'coordinadora@vmlperito.com', '300-1111111', '$2b$10$C7Y1jfSQLXAeQ0gIX8b1PeCflaJvWTmG2/UF4XjJK.3r/P145rDpq', 1, 1, 1, 1, NULL, 1),
(10, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'BUCURU RODRIGUEZ MAURICIO', 'mbucuru16775264@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(11, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'SALAZAR GOMEZ CARLOS LEDNI', 'csalazar1130615880@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(12, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'RAMIREZ SANCHEZ MIGUEL ANGEL', 'mramirez1113622104@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(13, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'TOLOZA CASTRO HAMINTON STIVEN', 'htoloza1005981654@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(14, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'RUIZ GOMEZ JHON EDISON', 'jruiz94535749@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(15, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CESAR ANDRES DAZA GIL', 'cda1114822225@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(16, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CASTRO SANCHEZ HERNAN', 'hcastro79890094@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(17, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'ORTIZ CORTES WILLIAM GUSTAVO', 'wortiz94409928@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(18, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CHARA MAFLA NILSON', 'nchara76041462@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(19, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'REYES MOSQUERA CARLOS ANDRES', 'creyes16536446@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(20, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CASTILLO VILLALOBOS ALVARO JAVIER', 'acastillo1144030001@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(21, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'URIBE LONDOÑO BRYAN', 'buribe1143989634@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(22, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CALVO DELGADO CRISTIAN CAMILO', 'ccalvo1143956069@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(23, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'DIAZ PACHECO JULIAN ALFONSO', 'jdiaz16918921@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(24, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'VIDES RENTERIA EDWIN ARTURO', 'evides1088268579@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(25, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'ALARCON  GERMAN ALVERTO', 'galarcon80513234@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(26, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CAICEDO ARANA JULIO CESAR', 'jcaicedo79207060@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(27, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'DIAZ GUTIERREZ JHON NEIDER', 'jdiaz1073253076@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(28, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'SANABRIA RIVERA CARLOS ALBERTO', 'csanabria1032370919@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(29, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'MARTINEZ DIAZ MIGUEL ANGEL', 'mmartinez1024574759@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(30, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'PALACIOS WILCHES JOHN MICHAEL', 'jpalacios1019040263@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(31, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'VARON PINZON JAIRO STIVEN', 'jvaron1014295732@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(32, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'VARGAS VELASQUEZ DANIEL MAURICIO', 'dvargas1010019330@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(33, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'BELLO ROSAS BRAYAN STEVEN', 'bbello1012463600@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(34, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'ANTOLINEZ MOYA CHRISTIAN JOSE', 'cantolinez1020754137@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(35, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'HERRERA MONROY CRISTIAN BERNARDO', 'cherrera1022396464@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(36, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'YASNO SOLANO JESUS HERNAN', 'jyasno12281052@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(37, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'GUARNIZO SEGURA FRANCISCO', 'fguarnizo1110452757@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(38, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'CRUZ CIFUENTES CRISTHIAM FABIAN', 'ccruz1069735494@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(39, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'TOVAR BAEZ RHOY EDWARS', 'rtovar1031122123@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(40, '2025-07-08 02:26:09', '2025-07-08 02:26:09', 'FANDIÑO ROJAS JUAN DIEGO', 'jfandino1023960780@holdingvml.net', '', '$2b$10$JMAKO5i3UKcrHAaj.bGG/OFJ/WAu9N2Hd8FRy6Vv51mqmKE8oi2mS', 1, 0, 1, 0, NULL, 1),
(41, '2025-07-08 13:29:22', '2025-07-08 13:29:22', 'Carlos Agente', 'agente1@vmlperito.com', '300-1357924', '$2b$10$D5p20.3TXzpZ7xmGggEKcuWWxFqchqmly5i1CNxlWKKXppqChtnEe', 1, 1, 1, 1, 1, 1),
(42, '2025-07-08 13:29:23', '2025-07-08 13:29:23', 'Laura Agente', 'agente2@vmlperito.com', '300-2222222', '$2b$10$D5p20.3TXzpZ7xmGggEKcuWWxFqchqmly5i1CNxlWKKXppqChtnEe', 1, 1, 1, 1, 1, 1),
(43, '2025-07-08 13:29:24', '2025-07-08 13:29:24', 'Diego Agente', 'agente3@vmlperito.com', '300-3333333', '$2b$10$D5p20.3TXzpZ7xmGggEKcuWWxFqchqmly5i1CNxlWKKXppqChtnEe', 1, 1, 1, 1, 1, 1),
(44, '2025-07-08 13:29:24', '2025-07-08 13:29:24', 'Sofia Agente', 'agente4@vmlperito.com', '300-4444444', '$2b$10$D5p20.3TXzpZ7xmGggEKcuWWxFqchqmly5i1CNxlWKKXppqChtnEe', 1, 1, 1, 1, 1, 1),
(45, '2025-07-08 13:29:25', '2025-07-08 13:29:25', 'Roberto Agente', 'agente5@vmlperito.com', '300-5555555', '$2b$10$D5p20.3TXzpZ7xmGggEKcuWWxFqchqmly5i1CNxlWKKXppqChtnEe', 1, 1, 1, 1, 1, 1),
(46, '2025-07-08 13:29:26', '2025-07-08 13:29:26', 'Patricia Supervisora', 'supervisora@vmlperito.com', '300-2468135', '$2b$10$D5p20.3TXzpZ7xmGggEKcuWWxFqchqmly5i1CNxlWKKXppqChtnEe', 1, 1, 1, 1, 1, 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user_roles`
--

INSERT INTO `user_roles` (`id`, `created_at`, `updated_at`, `user_id`, `role_id`) VALUES
(1, '2025-07-07 21:12:42', '2025-07-07 21:12:42', 1, 1),
(2, '2025-07-07 21:13:21', '2025-07-07 21:13:21', 2, 5),
(3, '2025-07-07 21:13:22', '2025-07-07 21:13:22', 3, 7),
(12, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 10, 9),
(13, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 11, 9),
(14, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 12, 9),
(15, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 13, 9),
(16, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 17, 9),
(17, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 18, 9),
(18, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 19, 9),
(19, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 20, 9),
(20, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 21, 9),
(21, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 22, 9),
(22, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 25, 9),
(23, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 26, 9),
(24, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 27, 9),
(25, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 28, 9),
(26, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 29, 9),
(27, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 30, 9),
(28, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 31, 9),
(29, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 32, 9),
(30, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 33, 9),
(31, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 36, 9),
(32, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 37, 9),
(33, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 39, 9),
(34, '2025-07-08 02:29:24', '2025-07-08 02:29:24', 40, 9),
(35, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 14, 8),
(36, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 15, 8),
(37, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 16, 8),
(38, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 23, 8),
(39, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 24, 8),
(40, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 34, 8),
(41, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 35, 8),
(42, '2025-07-08 02:29:30', '2025-07-08 02:29:30', 38, 8),
(43, '2025-07-08 13:29:23', '2025-07-08 13:29:23', 41, 6),
(44, '2025-07-08 13:29:23', '2025-07-08 13:29:23', 42, 6),
(45, '2025-07-08 13:29:24', '2025-07-08 13:29:24', 43, 6),
(46, '2025-07-08 13:29:25', '2025-07-08 13:29:25', 44, 6),
(47, '2025-07-08 13:29:26', '2025-07-08 13:29:26', 45, 6),
(48, '2025-07-08 13:29:26', '2025-07-08 13:29:26', 46, 5),
(49, '2025-07-08 13:29:27', '2025-07-08 13:29:27', 46, 7),
(50, '2025-07-08 13:29:27', '2025-07-08 13:29:27', 46, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL COMMENT 'Código único: LIVIANO, PESADO, MOTO',
  `description` text,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `created_at`, `updated_at`, `name`, `code`, `description`, `active`) VALUES
(1, '2025-07-07 21:12:39', '2025-07-07 21:12:39', 'Livianos', 'LIVIANO', 'Vehículos livianos (automóviles, camionetas pequeñas)', 1),
(2, '2025-07-07 21:12:40', '2025-07-07 21:12:40', 'Pesados', 'PESADO', 'Vehículos pesados (camiones, buses, tractomulas)', 1),
(3, '2025-07-07 21:12:40', '2025-07-07 21:12:40', 'Motos', 'MOTO', 'Motocicletas y ciclomotores', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inspection_modality_id` (`inspection_modality_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `appointment_sede_modality_idx` (`sede_id`,`inspection_modality_id`);

--
-- Indices de la tabla `call_logs`
--
ALTER TABLE `call_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inspection_order_id` (`inspection_order_id`),
  ADD KEY `agent_id` (`agent_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `call_statuses`
--
ALTER TABLE `call_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indices de la tabla `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nit` (`nit`),
  ADD UNIQUE KEY `nit_2` (`nit`),
  ADD UNIQUE KEY `nit_3` (`nit`),
  ADD KEY `city_id` (`city_id`);

--
-- Indices de la tabla `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`);

--
-- Indices de la tabla `inspection_modalities`
--
ALTER TABLE `inspection_modalities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indices de la tabla `inspection_orders`
--
ALTER TABLE `inspection_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_agent_id` (`assigned_agent_id`),
  ADD KEY `status` (`status`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sede_id` (`sede_id`);

--
-- Indices de la tabla `inspection_orders_statuses`
--
ALTER TABLE `inspection_orders_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_config_id` (`notification_config_id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `inspection_order_id` (`inspection_order_id`),
  ADD KEY `recipient_user_id` (`recipient_user_id`);

--
-- Indices de la tabla `notification_channels`
--
ALTER TABLE `notification_channels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `notification_config`
--
ALTER TABLE `notification_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_type_id` (`notification_type_id`),
  ADD KEY `notification_channel_id` (`notification_channel_id`);

--
-- Indices de la tabla `notification_types`
--
ALTER TABLE `notification_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`);

--
-- Indices de la tabla `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permissions_permission_id_role_id_unique` (`role_id`,`permission_id`),
  ADD UNIQUE KEY `role_permissions_role_id_permission_id` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indices de la tabla `schedule_templates`
--
ALTER TABLE `schedule_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inspection_modality_id` (`inspection_modality_id`),
  ADD KEY `schedule_sede_modality_idx` (`sede_id`,`inspection_modality_id`);

--
-- Indices de la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `sede_type_id` (`sede_type_id`),
  ADD KEY `city_id` (`city_id`);

--
-- Indices de la tabla `sede_modality_availability`
--
ALTER TABLE `sede_modality_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sede_modality_unique` (`sede_id`,`inspection_modality_id`),
  ADD KEY `inspection_modality_id` (`inspection_modality_id`);

--
-- Indices de la tabla `sede_types`
--
ALTER TABLE `sede_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `code_3` (`code`);

--
-- Indices de la tabla `sede_vehicle_types`
--
ALTER TABLE `sede_vehicle_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sede_vehicle_types_vehicle_type_id_sede_id_unique` (`sede_id`,`vehicle_type_id`),
  ADD UNIQUE KEY `sede_vehicle_type_unique` (`sede_id`,`vehicle_type_id`),
  ADD KEY `vehicle_type_id` (`vehicle_type_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD KEY `users_sede_id_foreign_idx` (`sede_id`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_role_id_user_id_unique` (`user_id`,`role_id`),
  ADD UNIQUE KEY `user_roles_user_id_role_id` (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indices de la tabla `vehicle_types`
--
ALTER TABLE `vehicle_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `call_logs`
--
ALTER TABLE `call_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `call_statuses`
--
ALTER TABLE `call_statuses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `inspection_modalities`
--
ALTER TABLE `inspection_modalities`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `inspection_orders`
--
ALTER TABLE `inspection_orders`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `inspection_orders_statuses`
--
ALTER TABLE `inspection_orders_statuses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `notification_channels`
--
ALTER TABLE `notification_channels`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `notification_config`
--
ALTER TABLE `notification_config`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `notification_types`
--
ALTER TABLE `notification_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT de la tabla `schedule_templates`
--
ALTER TABLE `schedule_templates`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `sedes`
--
ALTER TABLE `sedes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `sede_modality_availability`
--
ALTER TABLE `sede_modality_availability`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `sede_types`
--
ALTER TABLE `sede_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `sede_vehicle_types`
--
ALTER TABLE `sede_vehicle_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `vehicle_types`
--
ALTER TABLE `vehicle_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inspection_orders`
--
ALTER TABLE `inspection_orders`
  ADD CONSTRAINT `inspection_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inspection_orders_ibfk_2` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD CONSTRAINT `sedes_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sedes_ibfk_5` FOREIGN KEY (`sede_type_id`) REFERENCES `sede_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sedes_ibfk_6` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_sede_id_foreign_idx` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
