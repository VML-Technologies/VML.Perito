import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_ROUTES } from "@/config/api";

const DetailsButton = ({ item }) => {
    const [open, setOpen] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [queueEntries, setQueueEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        
        try {
            const orderId = item.inspectionOrder?.id || item.id;
            const response = await fetch(`${API_ROUTES.INSPECTION_ORDERS.GET(orderId)}/appointments-history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                throw new Error('Respuesta no es JSON válido');
            }
            
            if (data.success) {
                setAppointments(data.data || []);
                setQueueEntries([]); // Por ahora solo appointments
            } else {
                console.error('❌ Error en respuesta:', data.message);
            }
        } catch (error) {
            console.error('❌ Error cargando appointments:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClose = () => setOpen(false);

    // Mapear appointments
    const allInspections = appointments.map(apt => ({
        type: 'appointment',
        date: apt.scheduled_date,
        time: apt.scheduled_time,
        status: apt.status,
        notes: apt.notes,
        observaciones: apt.observaciones,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        deleted_at: apt.deleted_at
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Mapeo de estados a español
    const statusMap = {
        pending: "Pendiente",
        in_progress: "En Progreso",
        completed: "Completada",
        failed: "Fallida",
        ineffective_with_retry: "No Efectiva - Reagendar",
        ineffective_no_retry: "No Efectiva - No Reagendar",
        call_finished: "Llamada Finalizada",
        revision_supervisor: "Revisión Supervisor",
        assigned: "Asignada",
        cancelled: "Cancelada",
        en_cola: "En Cola",
        en_proceso: "En Proceso",
        completada: "Completada",
        cancelada: "Cancelada"
    };

    const typeMap = {
        appointment: "Cita Agendada",
        queue: "Inspección Virtual"
    };

    return (
        <>
            <Button size="sm" variant="outline" onClick={handleOpen}>
                Ver Detalle
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div
                        className="w-full max-w-3xl rounded-lg shadow-lg bg-white dark:bg-gray-800 transform scale-95 opacity-0 animate-show"
                        style={{ animation: "showModal 0.2s forwards" }}
                    >
                        <Card className="bg-transparent shadow-none">
                            <CardHeader>
                                <CardTitle>Historial de Inspecciones</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <table className="w-full text-sm border-collapse table-auto">
                                    <thead>
                                        <tr className="border-b bg-gray-100 dark:bg-gray-700">
                                            <th className="py-2 px-3 text-center w-36">Tipo</th>
                                            <th className="py-2 px-3 text-center w-32">Fecha</th>
                                            <th className="py-2 px-3 text-center w-28">Hora</th>
                                            <th className="py-2 px-3 text-center w-20">Activo</th>
                                            <th className="py-2 px-3 text-center">Notas</th>
                                            <th className="py-2 px-3 text-center">Observaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr className="border-b">
                                                <td colSpan="6" className="text-center py-4">
                                                    Cargando...
                                                </td>
                                            </tr>
                                        ) : allInspections.length > 0 ? (
                                            allInspections.map((inspection, idx) => {
                                                const fecha = inspection.date
                                                    ? new Date(inspection.date).toLocaleDateString("es-CO")
                                                    : "-";

                                                const hora = inspection.time || "-";
                                                const estadoTraducido = statusMap[inspection.status] || inspection.status || "N/A";
                                                const tipoTraducido = typeMap[inspection.type] || inspection.type;

                                                return (
                                                    <tr key={idx} className={`border-b ${inspection.deleted_at ? 'bg-red-50 opacity-60' : ''}`}>
                                                        <td className="py-2 px-3 text-center">
                                                            <Badge variant={inspection.type === 'queue' ? 'default' : 'outline'}>
                                                                {tipoTraducido}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">{fecha}</td>
                                                        <td className="py-2 px-3 text-center">{hora}</td>
                                                        <td className="py-2 px-3 text-center">
                                                            <Badge variant={inspection.deleted_at ? 'destructive' : 'success'}>
                                                                {inspection.deleted_at ? 'Eliminado' : 'Activo'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-3 text-center whitespace-pre-wrap">
                                                            {inspection.notes || "N/A"}
                                                        </td>
                                                        <td className="py-2 px-3 text-center whitespace-pre-wrap">
                                                            {inspection.observaciones || "N/A"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr className="border-b">
                                                <td colSpan="6" className="text-center py-4">
                                                    No hay inspecciones registradas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="flex justify-end mt-2">
                                    <Button size="sm" onClick={handleClose}>
                                        Cerrar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes showModal {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default DetailsButton;
