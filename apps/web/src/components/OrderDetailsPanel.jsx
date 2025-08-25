import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, UserX } from 'lucide-react';
import CallHistory from './CallHistory';
import AppointmentsHistory from './AppointmentsHistory';
import OrderCommunicationSection from './OrderCommunicationSection';

const OrderDetailsPanel = ({
    isOpen,
    onOpenChange,
    order,
    showCallHistory = true,
    showAppointments = true,
    showTabs = true,
    user = null
}) => {
    const getStatusBadgeVariant = (status, inspectionResult) => {
        if (!inspectionResult) {
            const variants = {
                'Creada': 'secondary',
                'Contacto exitoso': 'default',
                'Agendado': 'default',
                'No contesta': 'destructive',
                'Ocupado': 'outline',
                'Número incorrecto': 'destructive',
                'Solicita reagendar': 'outline',
                'En progreso': 'default',
                'Finalizada': 'default',
                'Cancelada': 'destructive'
            };
            return variants[status] || 'secondary';
        }

        const resultVariants = {
            'RECHAZADO - Vehículo no asegurable': 'destructive',
            'APROBADO CON RESTRICCIONES - Vehículo asegurable con limitaciones': 'outline',
            'PENDIENTE - Inspección en proceso': 'secondary',
            'APROBADO - Vehículo asegurable': 'default'
        };
        return resultVariants[inspectionResult] || 'secondary';
    };

    const getStatusDisplay = (status, inspectionResult) => {
        if (!inspectionResult) {
            return status || 'Sin estado';
        }
        return inspectionResult;
    };

    if (!order) return null;

    const orderInfo = [
        { label: 'Cliente', value: order.nombre_cliente },
        { label: 'Placa', value: order.placa, className: 'font-mono font-medium' },
        { label: 'Teléfono', value: order.celular_cliente, className: 'font-mono' },
        { label: 'Vehículo', value: `${order.marca} ${order.linea || ''} (${order.modelo})` },
        { label: 'Email', value: order.correo_cliente },
        { label: 'Documento', value: `${order.tipo_doc || ''} ${order.num_doc || ''}`, className: 'font-mono' },
        {
            label: 'Agente Asignado',
            value: order.AssignedAgent ? (
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>{order.AssignedAgent.name}</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground">Sin asignar</span>
                </div>
            )
        }
    ];

    const content = (
        <>
            <SheetHeader>
                <SheetTitle>Detalles de Orden #{order.numero}</SheetTitle>
                <SheetDescription>
                    Información completa y historial de la orden de inspección
                </SheetDescription>
            </SheetHeader>

            <div className="mt-2 space-y-4">
                {/* Información General */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2 text-sm">
                        {orderInfo.map((info, index) => (
                            <div key={index}>
                                <span className="font-medium">{info.label}:</span>
                                {typeof info.value == 'string' ? (
                                    <p className={info.className || ''}>{info.value}</p>
                                ) : (
                                    info.value
                                )}
                            </div>
                        ))}
                        <div>
                            <span className="font-medium">Estado:</span>
                            {order.inspection_result == 'APROBADO CON RESTRICCIONES - Vehículo asegurable con limitaciones' ? (
                                <Badge className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600">
                                    {getStatusDisplay(order.InspectionOrderStatus?.name, order.inspection_result)}
                                </Badge>
                            ) : (
                                <Badge variant={getStatusBadgeVariant(order.InspectionOrderStatus?.name, order.inspection_result)}>
                                    {getStatusDisplay(order.InspectionOrderStatus?.name, order.inspection_result)}
                                </Badge>
                            )}
                            {
                                (getStatusDisplay(order.InspectionOrderStatus?.name, order.inspection_result).includes('RECHAZADO')) && (
                                    <div className="text-xs text-gray-500 font-mono border border-gray-200 rounded-md p-2 bg-gray-100">
                                        {order.inspection_result_details}
                                    </div>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>

                {showTabs ? (
                    <Tabs defaultValue="calls" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            {showCallHistory && <TabsTrigger value="calls">Historial de Llamadas</TabsTrigger>}
                            {showAppointments && <TabsTrigger value="appointments">Agendamientos</TabsTrigger>}
                            <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
                        </TabsList>

                        {showCallHistory && (
                            <TabsContent value="calls">
                                <CallHistory callLogs={order.callLogs} />
                            </TabsContent>
                        )}

                        {showAppointments && (
                            <TabsContent value="appointments">
                                <AppointmentsHistory appointments={order.appointments} />
                            </TabsContent>
                        )}

                        <TabsContent value="communications">
                            <OrderCommunicationSection 
                                orderId={order.id}
                                orderData={order}
                                user={user}
                            />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-4">
                        {showCallHistory && <CallHistory callLogs={order.callLogs} />}
                        {showAppointments && <AppointmentsHistory appointments={order.appointments} />}
                        <OrderCommunicationSection 
                            orderId={order.id}
                            orderData={order}
                            user={user}
                        />
                    </div>
                )}
            </div>
        </>
    );

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto px-4">
                {content}
            </SheetContent>
        </Sheet>
    );
};

export default OrderDetailsPanel; 