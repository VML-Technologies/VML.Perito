import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Download, Loader2 } from 'lucide-react';

const AppointmentsHistory = ({
    appointments = [],
    title = "Informes",
    description = "Informes de inspección disponibles",
    onDownloadPdf = null
}) => {
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
                {appointments && appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">
                                            {appointment.scheduled_date} a las {appointment.scheduled_time}
                                        </span>
                                    </div>
                                    {onDownloadPdf && appointment.session_id && (
                                        <button
                                            onClick={() => onDownloadPdf(appointment)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                            title="Descargar informe PDF"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            PDF
                                        </button>
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