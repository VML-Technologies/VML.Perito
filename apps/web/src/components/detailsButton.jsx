import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DetailsButton = ({ item }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Citas reales desde el backend
    const appointments = item?.inspectionOrder?.appointments || [];

    // Fecha de ingreso si no hay citas
    const fechaIngreso = item.tiempo_ingreso
        ? new Date(item.tiempo_ingreso).toLocaleDateString("es-CO")
        : "-";

    const horaIngreso = item.tiempo_ingreso
        ? new Date(item.tiempo_ingreso).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "-";

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
                                            <th className="py-2 px-10 text-left w-32">Fecha</th>
                                            <th className="py-2 px-8 text-left w-28">Hora</th>
                                            <th className="py-2 px-9 text-left w-32">Estado</th>
                                            <th className="py-2 px-30 text-left">Observaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {appointments.length > 0 ? (
                                            appointments.map((cita, idx) => {
                                                const fecha = cita.fecha
                                                    ? new Date(cita.fecha).toLocaleDateString("es-CO")
                                                    : "-";

                                                const hora = cita.fecha
                                                    ? new Date(cita.fecha).toLocaleTimeString("es-CO", {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      })
                                                    : "-";

                                                return (
                                                    <tr key={idx} className="border-b">
                                                        <td className="py-2 px-3">{fecha}</td>
                                                        <td className="py-2 px-3">{hora}</td>
                                                        <td className="py-2 px-3">
                                                            <Badge variant="secondary">
                                                                {cita.estado || "N/A"}
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
                                                <td className="py-2 px-3">{fechaIngreso}</td>
                                                <td className="py-2 px-3">{horaIngreso}</td>
                                                <td className="py-2 px-3">
                                                    <Badge variant="outline">Ingresó a la cola</Badge>
                                                </td>
                                                <td className="py-2 px-3">N/A</td>
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
