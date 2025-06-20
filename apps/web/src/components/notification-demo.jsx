import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotificationContext } from "@/contexts/notification-context"

export function NotificationDemo() {
    const { addNotification } = useNotificationContext();

    const demoNotifications = [
        {
            id: Date.now() + 1,
            type: 'agendamiento_confirmacion',
            title: "Cita Confirmada",
            description: "Su cita para inspección ha sido confirmada para mañana a las 10:00 AM",
            time: "Ahora",
            read: false,
            appointment_id: 789,
            inspection_order_id: null
        },
        {
            id: Date.now() + 2,
            type: 'inspeccion_aprobada',
            title: "Inspección Aprobada",
            description: "La inspección del vehículo ABC123 ha sido aprobada exitosamente",
            time: "Ahora",
            read: false,
            appointment_id: null,
            inspection_order_id: 987654321
        },
        {
            id: Date.now() + 3,
            type: 'inspeccion_rechazada',
            title: "Inspección Rechazada",
            description: "La inspección del vehículo XYZ789 ha sido rechazada. Revisar detalles.",
            time: "Ahora",
            read: false,
            appointment_id: null,
            inspection_order_id: 123456789
        },
        {
            id: Date.now() + 4,
            type: 'agendamiento_recordatorio',
            title: "Recordatorio de Cita",
            description: "Recuerde su cita de inspección mañana a las 2:00 PM",
            time: "Ahora",
            read: false,
            appointment_id: 456,
            inspection_order_id: null
        }
    ];

    const handleAddNotification = (notification) => {
        addNotification(notification);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Demostración de Notificaciones</CardTitle>
                <CardDescription>
                    Haz clic en los botones para agregar diferentes tipos de notificaciones y probar las acciones
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={() => handleAddNotification(demoNotifications[0])}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Agregar Cita Confirmada
                    </Button>

                    <Button
                        onClick={() => handleAddNotification(demoNotifications[1])}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Agregar Inspección Aprobada
                    </Button>

                    <Button
                        onClick={() => handleAddNotification(demoNotifications[2])}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Agregar Inspección Rechazada
                    </Button>

                    <Button
                        onClick={() => handleAddNotification(demoNotifications[3])}
                        className="bg-yellow-600 hover:bg-yellow-700"
                    >
                        Agregar Recordatorio
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                    <p><strong>Instrucciones:</strong></p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Haz clic en el ícono de campana en el header para ver las notificaciones</li>
                        <li>Haz clic en cualquier notificación para ejecutar su acción</li>
                        <li>Observa los toasts que aparecen al ejecutar las acciones</li>
                        <li>Usa "Marcar todas como leídas" para limpiar el contador</li>
                        <li>Usa el botón X para eliminar notificaciones individuales</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
} 