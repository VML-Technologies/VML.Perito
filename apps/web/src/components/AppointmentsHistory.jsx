import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Download, Loader2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPDFLink } from '@/lib/pdfDownloads';

const AppointmentsHistory = ({
    orderId = null,
    appointments = [],
    title = "Informes",
    description = "Informes de inspección disponibles",
    onDownloadPdf = null
}) => {
    const [appointmentsWithPdfLinks, setAppointmentsWithPdfLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const downloadPDF = (downloadUrl, fileName) => {
        // Crear un enlace temporal para descargar
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank'; // Abrir en nueva pestaña como fallback
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`✅ PDF de appointment descargado: ${fileName}`);
    }

    useEffect(() => {
        const loadPdfLinks = async () => {
            if (appointments && appointments.length > 0 && orderId) {
                setIsLoading(true);

                // Crear una copia del array para no mutar el original
                const appointmentsWithLinks = await Promise.all(
                    appointments.map(async (appointment) => {
                        const appointmentCopy = { ...appointment };

                        if (appointment.session_id) {
                            try {
                                const pdfLinkData = await getPDFLink(orderId, appointment.id, appointment.session_id);
                                appointmentCopy.pdfLinkData = pdfLinkData;
                            } catch (error) {
                                console.error('Error obteniendo PDF link para appointment:', appointment.id, error);
                                appointmentCopy.pdfLinkData = null;
                            }
                        }

                        return appointmentCopy;
                    })
                );

                setAppointmentsWithPdfLinks(appointmentsWithLinks);
                setIsLoading(false);
            } else {
                setAppointmentsWithPdfLinks([]);
                setIsLoading(false);
            }
        };

        loadPdfLinks();
    }, [appointments, orderId]);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin opacity-50" />
                        <p>Cargando informes...</p>
                    </div>
                ) : appointmentsWithPdfLinks && appointmentsWithPdfLinks.length > 0 ? (
                    <div className="space-y-4">
                        {appointmentsWithPdfLinks.map((appointment) => (
                            <div key={appointment.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">
                                            {appointment.scheduled_date} a las {appointment.scheduled_time}
                                        </span>
                                    </div>
                                    {onDownloadPdf && appointment.session_id && (
                                        <div className="flex items-center gap-2">
                                            {isLoading ? (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Verificando PDF...
                                                </div>
                                            ) : appointment.pdfLinkData ? (
                                                appointment.pdfLinkData.downloadUrl ? (
                                                    <button
                                                        onClick={() => downloadPDF(appointment.pdfLinkData.downloadUrl, appointment.pdfLinkData.fileName)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 hover:border-blue-400 transition-all duration-200"
                                                        title="Descargar informe PDF"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        Descargar PDF
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            const reportUrl = `/inspection-report/${orderId}/${appointment.id}`;
                                                            window.open(reportUrl, '_blank');
                                                        }}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-green-100 text-green-700 border border-green-300 rounded hover:bg-green-200 hover:border-green-400 transition-all duration-200"
                                                        title="Ver reporte de inspección"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Ver Reporte
                                                    </button>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-100 text-gray-500 border border-gray-300 rounded">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Sin sesión
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {appointment.inspectionType && (
                                    <div className="text-sm mb-2">
                                        <span className="font-medium">Tipo:</span>
                                        <span className="ml-2">{appointment.inspectionType.name}</span>
                                    </div>
                                )}

                                {appointment.sede && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {appointment.sede.name}
                                            {appointment.sede.city && ` - ${appointment.sede.city.name}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay informes disponibles</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AppointmentsHistory; 