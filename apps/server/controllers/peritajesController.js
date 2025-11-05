import PeritajeOrder from '../models/peritajeOrder.js';
import PeritajeAgendamiento from '../models/peritajeAgendamiento.js';
import User from '../models/user.js';
import UserRole from '../models/userRole.js';
import Role from '../models/role.js';
import { Sequelize } from 'sequelize';

class PeritajesController {
    constructor() { }

    async peritajesToSchedule(req, res) {
        try {
            const peritajeOrders = await PeritajeOrder.findAll({
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name']
                    }
                ],
                where: {
                    estado_momento: 'Pendiente por agendar'
                },
                order: [['created_at', 'ASC']]
            });
            
            res.json({
                success: true,
                data: peritajeOrders,
                count: peritajeOrders.length
            });
        } catch (error) {
            console.error('Error al obtener peritajes para agendar:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al obtener peritajes', 
                error: error.message 
            });
        }
    }

    async schedulePeritaje(req, res) {
        try {
            const {
                peritaje_order_id,
                fecha_agendada,
                direccion_peritaje,
                ciudad,
                modalidad_peritaje,
                observaciones,
                hora
            } = req.body;

            // Validaciones estrictas
            const errors = [];
            
            if (!peritaje_order_id || isNaN(Number(peritaje_order_id))) {
                errors.push('peritaje_order_id es requerido y debe ser numérico.');
            }
            
            if (!fecha_agendada || isNaN(Date.parse(fecha_agendada))) {
                errors.push('fecha_agendada es requerida y debe ser una fecha válida.');
            }
            
            // Validar que la fecha no sea en el pasado
            const fechaAgendada = new Date(fecha_agendada);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaAgendada < hoy) {
                errors.push('La fecha agendada no puede ser en el pasado.');
            }
            
            if (hora && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(hora)) {
                errors.push('hora debe estar en formato HH:mm o HH:mm:ss válido.');
            }
            
            if (direccion_peritaje && direccion_peritaje.length > 500) {
                errors.push('direccion_peritaje no puede exceder 500 caracteres.');
            }
            
            if (ciudad && ciudad.length > 100) {
                errors.push('ciudad no puede exceder 100 caracteres.');
            }
            
            if (modalidad_peritaje && modalidad_peritaje.length > 50) {
                errors.push('modalidad_peritaje no puede exceder 50 caracteres.');
            }

            if (errors.length > 0) {
                return res.status(422).json({ 
                    success: false,
                    message: 'Datos inválidos', 
                    errors 
                });
            }

            // Verificar que el peritaje_order_id exista
            const peritajeOrder = await PeritajeOrder.findByPk(peritaje_order_id);
            if (!peritajeOrder) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Peritaje no encontrado.' 
                });
            }

            // Si ya tiene un agendamiento, marcarlo como eliminado (soft delete) con fecha actual
            await PeritajeAgendamiento.update(
                { deleted_at: Sequelize.literal('GETDATE()') },
                { 
                    where: { 
                        peritaje_order_id,
                        deleted_at: null
                    }
                }
            );

            const newAgendamiento = await PeritajeAgendamiento.create({
                peritaje_order_id,
                fecha_agendada,
                direccion_peritaje,
                ciudad,
                modalidad_peritaje: modalidad_peritaje || 'presencial',
                observaciones,
                hora
            });

            // Actualizar el estado del peritaje a 'Pendiente por asignar perito'
            await PeritajeOrder.update(
                { 
                    estado_momento: 'Pendiente por asignar perito',
                    fecha_momento: Sequelize.literal('GETDATE()')
                },
                { 
                    where: { id: peritaje_order_id }
                }
            );

            res.status(201).json({
                success: true,
                message: 'Peritaje agendado exitosamente',
                data: newAgendamiento
            });
        } catch (error) {
            console.error('Error al agendar peritaje:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al agendar peritaje', 
                error: error.message 
            });
        }
    }

    async assignAgent(req, res) {
        try {
            const { peritaje_order_id, agent_id } = req.body;

            // Validaciones
            const errors = [];
            if (!peritaje_order_id || isNaN(Number(peritaje_order_id))) {
                errors.push('peritaje_order_id es requerido y debe ser numérico.');
            }
            if (agent_id && isNaN(Number(agent_id))) {
                errors.push('agent_id debe ser numérico si se proporciona.');
            }

            if (errors.length > 0) {
                return res.status(422).json({ 
                    success: false,
                    message: 'Datos inválidos', 
                    errors 
                });
            }

            // Verificar que el peritaje existe
            const peritajeOrder = await PeritajeOrder.findByPk(peritaje_order_id);
            if (!peritajeOrder) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Peritaje no encontrado.' 
                });
            }

            // Si se proporciona agent_id, verificar que el agente existe
            if (agent_id) {
                const User = (await import('../models/user.js')).default;
                const agent = await User.findByPk(agent_id);
                if (!agent) {
                    return res.status(404).json({ 
                        success: false,
                        message: 'Agente no encontrado.' 
                    });
                }
            }

            // Actualizar solo la asignación del agente (sin cambiar el estado)
            await PeritajeOrder.update(
                { 
                    assigned_agent_id: agent_id || null
                },
                { 
                    where: { id: peritaje_order_id }
                }
            );

            const message = agent_id 
                ? 'Agente asignado exitosamente al peritaje'
                : 'Asignación de agente removida exitosamente';

            res.json({
                success: true,
                message,
                data: {
                    peritaje_order_id,
                    assigned_agent_id: agent_id || null
                }
            });
        } catch (error) {
            console.error('Error al asignar agente:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al asignar agente', 
                error: error.message 
            });
        }
    }

    async getAgentesContacto(req, res) {
        try {
            const agentes = await User.findAll({
                include: [
                    {
                        model: UserRole,
                        as: 'userRoles',
                        include: [
                            {
                                model: Role,
                                as: 'role',
                                where: {
                                    name: 'agente_contacto'
                                }
                            }
                        ]
                    }
                ],
                where: {
                    is_active: true
                },
                attributes: ['id', 'name', 'email', 'phone', 'is_active']
            });

            // Filtrar solo usuarios que tengan el rol agente_contacto
            const agentesFiltrados = agentes.filter(user => 
                user.userRoles && user.userRoles.length > 0
            );

            res.json({
                success: true,
                data: agentesFiltrados,
                count: agentesFiltrados.length
            });
        } catch (error) {
            console.error('Error al obtener agentes de contacto:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al obtener agentes de contacto', 
                error: error.message 
            });
        }
    }
}

export default new PeritajesController();