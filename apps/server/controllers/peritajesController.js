import PeritajeOrder from '../models/peritajeOrder.js';
import PeritajeAgendamiento from '../models/peritajeAgendamiento.js';

class PeritajesController {
    constructor() { }

    async peritajesToSchedule(req, res) {
        try {
            const peritajeOrders = await PeritajeOrder.findAll({
                where: {
                    estado_momento: 'Pendiente por asignar perito'
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

            // Si ya tiene un agendamiento, marcarlo como eliminado (soft delete)
            await PeritajeAgendamiento.destroy({
                where: { peritaje_order_id }
            });

            const newAgendamiento = await PeritajeAgendamiento.create({
                peritaje_order_id,
                fecha_agendada,
                direccion_peritaje,
                ciudad,
                modalidad_peritaje: modalidad_peritaje || 'presencial',
                observaciones,
                hora
            });

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
}

export default new PeritajesController();