import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DetailsButton = ({ item }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Citas reales desde el backend
    const appointments = item?.inspectionOrder?.appointments || item?.appointments || [];

    // Mapeo de estados a español
    const statusMap = {
        pending: "Pendiente",
        in_progress: "En Progreso",
        completed: "Completada",
        failed: "Fallida",
        ineffective_with_retry: "No Efectiva - Reagendar",
        ineffective_no_retry: "No Efectiva - No Reagendar",
        call_finished: "Llamada Finalizada",
        revision_supervisor: "Revisión Supervisor"
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
                                <CardTitle>Detalle de Citas del Asegurado</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <table className="w-full text-sm border-collapse table-auto">
                                    <thead>
                                        <tr className="border-b bg-gray-100 dark:bg-gray-700">
                                            <th className="py-2 px-3 text-left w-32">Fecha</th>
                                            <th className="py-2 px-3 text-left w-28">Hora</th>
                                            <th className="py-2 px-3 text-left w-32">Estado</th>
                                            <th className="py-2 px-3 text-left">Observaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {appointments.length > 0 ? (
                                            appointments.map((cita, idx) => {
                                                const fecha = cita.scheduled_date
                                                    ? new Date(cita.scheduled_date).toLocaleDateString("es-CO")
                                                    : "-";

                                                const hora = cita.scheduled_time || "-";

                                                const estadoTraducido = statusMap[cita.status] || cita.status || "N/A";

                                                return (
                                                    <tr key={idx} className="border-b">
                                                        <td className="py-2 px-3">{fecha}</td>
                                                        <td className="py-2 px-3">{hora}</td>
                                                        <td className="py-2 px-3">
                                                            <Badge variant="secondary">
                                                                {estadoTraducido}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-3 whitespace-pre-wrap">
                                                            {cita.observaciones || "N/A"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr className="border-b">
                                                <td className="py-2 px-3" colSpan="4" className="text-center py-4">
                                                    No hay citas registradas
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
