/**
 * Consulta de registros Vigentes_Movilidad_Asistencia
 * GET /api/vigentes-movilidad-asistencia?placa=XXX
 */
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

export const getVigentesMovilidadAsistencia = async (req, res) => {
    try {
        const {
            placa
        } = req.query;

        const query = `
            SELECT *
            FROM Vigentes_Movilidad_Asistencia
            WHERE PlacaCT = :placa
        `;

        const result = await sequelize.query(query, {
            replacements: {
                placa
            },
            type: QueryTypes.SELECT
        });

        res.json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        console.error('Error consultando Vigentes_Movilidad_Asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error consultando registros',
            error: error.message
        });
    }
};
