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
    const [expandedObs, setExpandedObs] = useState({});

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

    // Mapear appointments y calcular contador de intentos
    // Ordenar por created_at ascendente para numerar correctamente los intentos
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    const allInspections = sortedAppointments.map((apt, index) => ({
        type: 'appointment',
        date: apt.scheduled_date,
        time: apt.scheduled_time,
        status: apt.status,
        notes: apt.notes,
        observaciones: apt.observaciones,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        deleted_at: apt.deleted_at,
        attemptNumber: index + 1, // Número de intento (1, 2, 3, etc.)
        isReinspection: index > 0 // Es reinspección si no es el primer intento
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Volver a ordenar por más reciente primero para mostrar
    
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
                    <div
                        className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] rounded-lg shadow-lg bg-white dark:bg-gray-800 transform scale-95 opacity-0 animate-show overflow-hidden"
                        style={{ animation: "showModal 0.2s forwards" }}
                    >
                        <Card className="bg-transparent shadow-none h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg sm:text-xl">Historial de Inspecciones</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 overflow-auto max-h-[calc(90vh-120px)]">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs sm:text-sm border-collapse table-auto min-w-[600px]">
                                        <thead>
                                            <tr className="border-b bg-gray-100 dark:bg-gray-700">
                                                <th className="py-2 px-1 sm:px-3 text-center w-20 sm:w-28">Fecha</th>
                                                <th className="py-2 px-1 sm:px-3 text-center w-16 sm:w-24">Hora</th>
                                                <th className="py-2 px-1 sm:px-3 text-center w-12 sm:w-16"># Intento</th>
                                                <th className="py-2 px-1 sm:px-3 text-center w-24 sm:w-32">Estado</th>
                                                <th className="py-2 px-1 sm:px-3 text-center w-20 sm:w-32">Reinspección</th>
                                                <th className="py-2 px-1 sm:px-3 text-center">Observaciones</th>
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
                                                const fecha = inspection.updated_at
                                                    ? new Date(inspection.updated_at).toLocaleDateString('es-CO')
                                                    : "-";

                                                const hora = inspection.time 
                                                    ? inspection.time.substring(0, 5)
                                                    : "-";
                                                const estadoTraducido = statusMap[inspection.status] || inspection.status || "N/A";
                                                const tipoTraducido = typeMap[inspection.type] || inspection.type;

                                                return (
                                                    <tr key={`${inspection.created_at}-${idx}`} className={`border-b ${inspection.deleted_at ? 'bg-red-50 opacity-60' : ''}`}>
                                                        <td className="py-2 px-1 sm:px-3 text-center text-xs sm:text-sm">{fecha}</td>
                                                        <td className="py-2 px-1 sm:px-3 text-center text-xs sm:text-sm">{hora}</td>
                                                        <td className="py-2 px-1 sm:px-3 text-center">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {inspection.attemptNumber}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-1 sm:px-3 text-center">
                                                            <Badge variant={inspection.status === 'completed' ? 'success' : inspection.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                                                                {estadoTraducido}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-1 sm:px-3 text-center">
                                                            <Badge variant={inspection.isReinspection ? "success" : "destructive"} className="text-xs">
                                                                {inspection.isReinspection ? "Sí" : "No"}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-1 sm:px-3 text-left text-xs sm:text-sm max-w-xs sm:max-w-md">
                                                            {(() => {
                                                                const rawObs = inspection.observaciones || "N/A";
                                                                // Eliminar todas las líneas duplicadas
                                                                const lines = rawObs.split('\n').map(line => line.trim()).filter(line => line);
                                                                const uniqueLines = [...new Set(lines)];
                                                                const obs = uniqueLines.join('\n');
                                                                const isLong = obs.length > 100;
                                                                const isExpanded = expandedObs[`${inspection.created_at}-${idx}`];
                                                                const displayText = isLong && !isExpanded ? obs.substring(0, 100) + "..." : obs;
                                                                
                                                                return (
                                                                    <div className="break-words leading-relaxed">
                                                                        <span className="whitespace-pre-line">{displayText}</span>
                                                                        {isLong && (
                                                                            <span 
                                                                                onClick={() => setExpandedObs(prev => ({
                                                                                    ...prev,
                                                                                    [`${inspection.created_at}-${idx}`]: !prev[`${inspection.created_at}-${idx}`]
                                                                                }))}
                                                                                className="ml-1 text-blue-500 cursor-pointer hover:text-blue-700 text-xs font-medium"
                                                                            >
                                                                                [{isExpanded ? "menos" : "más"}]
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()
                                                        }
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
                                </div>

                                <div className="flex justify-end mt-2 pt-2 border-t">
                                    <Button size="sm" onClick={handleClose} className="w-full sm:w-auto">
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
