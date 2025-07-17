import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';

const AppointmentsHistory = ({
    appointments = [],
    title = "Agendamientos",
    description = "Citas programadas para inspección"
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
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">
                                        {appointment.scheduled_date} a las {appointment.scheduled_time}
                                    </span>
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
                        <p>No hay agendamientos registrados</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AppointmentsHistory; 