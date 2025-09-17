import { BaseController } from './baseController.js';
import Appointment from '../models/appointment.js';
import InspectionOrder from '../models/inspectionOrder.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import { Op } from 'sequelize';
import XLSX from 'xlsx';
import InspectionModality from '../models/inspectionModality.js';

class InspectorAliadoController extends BaseController {
    constructor() {
        super(Appointment);
        
        // Bind methods
        this.createAppointment = this.createAppointment.bind(this);
        this.getHistoricalReport = this.getHistoricalReport.bind(this);
    }

    /**
     * Crear agendamiento desde Inspector Aliado
     */
    async createAppointment(req, res) {
        try {
            const { sede_id, inspection_order_id, user_id, scheduled_date, scheduled_time, session_id, status } = req.body;
            
            // Validar datos requeridos
            if (!sede_id || !inspection_order_id || !user_id || !scheduled_date || !scheduled_time || !session_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos para crear el agendamiento'
                });
            }

            // Verificar que la orden de inspección existe
            const inspectionOrder = await InspectionOrder.findByPk(inspection_order_id);
            if (!inspectionOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            const inspectionModality = await InspectionModality.findOne({
                where: {
                    code: 'SEDE'
                }
            });

            // Crear el agendamiento
            const appointment = await Appointment.create({
                sede_id,
                inspection_order_id,
                user_id,
                scheduled_date,
                scheduled_time,
                session_id,
                status: status || 'pending',
                inspection_modality_id: inspectionModality.id
            });

            // Obtener el agendamiento creado con relaciones
            const createdAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'placa', 'nombre_contacto', 'celular_contacto', 'correo_contacto']
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        attributes: ['id', 'name', 'address']
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Role,
                                as: 'roles',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Agendamiento creado exitosamente',
                data: createdAppointment
            });

        } catch (error) {
            console.error('❌ Error creando agendamiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Generar reporte histórico de agendamientos del CDA
     */
    async getHistoricalReport(req, res) {
        try {
            const { sede_id, start_date, end_date } = req.query;
            
            // Validar parámetros requeridos
            if (!sede_id || !start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: sede_id, start_date, end_date'
                });
            }

            // Validar formato de fechas
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de fecha inválido'
                });
            }

            if (startDate > endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio no puede ser mayor a la fecha de fin'
                });
            }

            // Obtener datos históricos del CDA
            const appointments = await Appointment.findAll({
                where: {
                    sede_id: sede_id,
                    scheduled_date: {
                        [Op.between]: [start_date, end_date]
                    }
                },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'placa', 'numero', 'nombre_contacto', 'celular_contacto', 'correo_contacto', 'created_at'],
                        include: [
                            {
                                model: InspectionOrderStatus,
                                as: 'InspectionOrderStatus',
                                attributes: ['id', 'name', 'description']
                            }
                        ]
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        attributes: ['id', 'name', 'address', 'city_id'],
                        include: [
                            {
                                model: City,
                                as: 'city',
                                attributes: ['id', 'name']
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Role,
                                as: 'roles',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']]
            });

            // Obtener información de la sede con la relación a City
            const sede = await Sede.findByPk(sede_id, {
                attributes: ['id', 'name', 'address', 'city_id'],
                include: [
                    {
                        model: City,
                        as: 'city',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!sede) {
                return res.status(404).json({
                    success: false,
                    message: 'Sede no encontrada'
                });
            }

            // Preparar datos para el Excel
            const excelData = appointments.map((appointment, index) => {
                return {
                    'Placa': appointment.inspectionOrder?.placa || '-',
                    'Número': appointment.inspectionOrder?.numero || '-',
                    'Nombre Contacto': appointment.inspectionOrder?.nombre_contacto || '-',
                    'Fecha Agendamiento': appointment.scheduled_date ? 
                        new Date(appointment.scheduled_date).toLocaleDateString('es-ES') : '-',
                    'Hora Agendamiento': appointment.scheduled_time || '-'
                };
            });

            // Crear workbook de Excel
            const workbook = XLSX.utils.book_new();
            
            // Hoja principal con datos
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Ajustar ancho de columnas
            const columnWidths = [
                { wch: 10 },  // Placa
                { wch: 15 },  // Número
                { wch: 25 },  // Nombre Contacto
                { wch: 15 },  // Fecha Agendamiento
                { wch: 12 }   // Hora Agendamiento
            ];
            worksheet['!cols'] = columnWidths;

            // Añadir hoja al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Histórico');

            // Hoja de resumen
            const summaryData = [
                { 'Métrica': 'Total Agendamientos', 'Valor': appointments.length },
                { 'Métrica': 'Período', 'Valor': `${start_date} a ${end_date}` },
                { 'Métrica': 'Sede', 'Valor': sede.name },
                { 'Métrica': 'Dirección', 'Valor': sede.address },
                { 'Métrica': 'Ciudad', 'Valor': sede.city?.name || '-' },
                { 'Métrica': 'Fecha Generación', 'Valor': new Date().toLocaleString('es-ES') }
            ];

            const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
            summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');

            // Generar buffer del archivo
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx',
                compression: true
            });

            // Configurar headers para descarga
            const filename = `reporte-historico-cda-${sede.name.replace(/\s+/g, '-')}-${start_date}-${end_date}.xlsx`;
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', excelBuffer.length);

            // Enviar archivo
            res.send(excelBuffer);

        } catch (error) {
            console.error('❌ Error generando reporte histórico:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al generar el reporte',
                error: error.message
            });
        }
    }
}

export default InspectorAliadoController;
