import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DetailsButton = ({ item, inspectionQueue }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const getReinspectionText = (status) => {
        if (status === "ineffective_with_retry") return "Si";
        if (status === "ineffective_no_retry") return "No";
        return "No";
    };

    const attempts = inspectionQueue.filter(
        (entry) => Number(entry.inspectionOrder?.id) === Number(item.inspectionOrder?.id)
    ).length;

    const inspections = item.inspectionOrder?.inspections || [];

    const detailData = {
        "Fecha y Hora de Conexión": item.tiempo_ingreso
            ? new Date(item.tiempo_ingreso).toLocaleString("es-CO", { timeZone: "America/Bogota" })
            : "-",
        "Número de intentos": attempts,
        "Discriminado de inspecciones": inspections,
        "Reinspección": getReinspectionText(item.status),
        "Observaciones": item.observaciones || "N/A"
    };

    return (
        <>
            <Button size="sm" variant="outline" className="cursor-pointer" onClick={handleOpen}>
                Ver Detalle
            </Button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4
                     bg-black/20 backdrop-blur-sm transition-opacity duration-200"
                >
                    <div
                        className="w-full max-w-lg transform rounded-lg shadow-lg
                       bg-white dark:bg-gray-800 transition-all duration-300
                       scale-95 opacity-0 animate-show"
                        style={{ animation: "showModal 0.2s forwards" }}
                    >
                        <Card className="bg-transparent shadow-none">
                            <CardHeader>
                                <CardTitle>Detalle del Asegurado</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <table className="w-full text-sm table-auto border-collapse">
                                    <tbody>
                                        {Object.entries(detailData).map(([key, value]) => (
                                            <tr key={key} className="border-b last:border-b-0">
                                                <td className="font-medium py-2 pr-4 align-top">{key}</td>

                                                <td className="py-2">
                                                    {key === "Reinspección" ? (
                                                        <Badge variant="secondary" className="text-sm">
                                                            {value}
                                                        </Badge>
                                                    ) : key === "Observaciones" ? (
                                                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                                                            {value}
                                                        </div>
                                                    ) : key === "Discriminado de inspecciones" ? (
                                                        Array.isArray(value) && value.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {value.map((ins, idx) => (
                                                                    <li key={idx} className="flex gap-2 items-start">
                                                                        <Badge variant="outline">
                                                                            {ins.estado || "Sin estado"}
                                                                        </Badge>
                                                                        <span className="text-gray-700 dark:text-gray-200">
                                                                            {ins.descripcion || JSON.stringify(ins)}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            "No hay inspecciones"
                                                        )
                                                    ) : (
                                                        value
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};

export default DetailsButton;
