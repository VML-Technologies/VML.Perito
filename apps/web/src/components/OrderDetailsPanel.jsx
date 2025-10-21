import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, UserX, FileTextIcon, Loader2, Download } from 'lucide-react';
import CallHistory from './CallHistory';
import AppointmentsHistory from './AppointmentsHistory';
import OrderCommunicationSection from './OrderCommunicationSection';
import { API_ROUTES } from '@/config/api';

const OrderDetailsPanel = ({
    isOpen,
    onOpenChange,
    order,
    showCallHistory = true,
    showAppointments = true,
    showTabs = true,
    user = null
}) => {

    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [downloadingAppointmentPdf, setDownloadingAppointmentPdf] = useState(false);

    useEffect(() => {
        const fetchInspectionData = async () => {
            if (order?.session_id) {
                setLoading(true);
                const session_id = order.session_id;
                const token = localStorage.getItem('authToken');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                try {
                    const response = await fetch(API_ROUTES.INSPECTION_ORDERS.INSPECTION_REPORT(session_id), { headers });
                    const data = await response.json();
                    setInspection(data);
                } catch (error) {
                    console.error('Error fetching inspection data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchInspectionData();

        return () => {
            setInspection(null);
            setLoading(false);
        };
    }, [order]);

    const BadgeToDisplay = ({ statusId, statusName, result }) => {
        const statusBadgeColorMap = {
            1: 'outline',
            2: 'outline',
            3: 'secondary',
            4: 'default',
            5: {
                'APROBADO': 'success',
                'RECHAZADO': 'destructive',
            }
        }
        const resultLabel = (statusId == 5 ? result.split(" - ")[0] : statusName)
        const badgeColor = (statusId == 5 ? statusBadgeColorMap[statusId][resultLabel] : statusBadgeColorMap[statusId])
        const badgeLabel = statusId == 5 ? `${statusName} - ${resultLabel}` : resultLabel
        return (
            <Badge variant={badgeColor}>
                {badgeLabel}
            </Badge>
        )
    }

    if (!order) return null;

    const orderInfo = [
        { label: 'Cliente', value: order.nombre_cliente },
        { label: 'Placa', value: order.placa, className: 'font-mono font-medium' },
        { label: 'Contacto', value: order.nombre_contacto },
        { label: 'Teléfono Contacto', value: order.celular_contacto, className: 'font-mono' },
        { label: 'Email Contacto', value: order.correo_contacto },

    ];

    const formatObservations = (observations) => {
        if (observations) {
            const observationsArray = observations.split('\n\n')
            return observationsArray.map((observation, index) => {
                const data = observation.split('\n')
                const timestamp = data[0]
                const message = data[1]
                return <div className='flex flex-col gap-2 border border-gray-400 p-2 rounded-md' key={index}>
                    <div className='flex flex-col gap-1'>
                        <span className='font-bold font-mono'>{timestamp}</span>
                        <span>{message}</span>
                    </div>
                </div>;
            });
        }
    }

    const handleDownloadPdf = async () => {
        if (!order?.id) {
            console.error('No hay ID de orden disponible');
            return;
        }

        setDownloadingPdf(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // 1. Obtener la URL de descarga del PDF
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.PDF_DOWNLOAD_URL(order.id), {
                headers
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error obteniendo URL de descarga');
            }

            // 2. Descargar el archivo PDF
            const { downloadUrl, fileName } = data.data;

            // Crear un enlace temporal para descargar
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            link.target = '_blank'; // Abrir en nueva pestaña como fallback
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`✅ PDF descargado: ${fileName}`);

        } catch (error) {
            console.error('❌ Error descargando PDF:', error);
            alert(`Error descargando el PDF: ${error.message}`);
        } finally {
            setDownloadingPdf(false);
        }
    }

    const handleDownloadAppointmentPdf = async (appointment) => {
        if (!order?.id || !appointment?.session_id) {
            console.error('No hay datos suficientes para descargar el PDF');
            return;
        }

        setDownloadingAppointmentPdf(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // 1. Obtener la URL de descarga del PDF
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.PDF_DOWNLOAD_URL(order.id), {
                headers
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error obteniendo URL de descarga');
            }

            // 2. Descargar el archivo PDF
            const { downloadUrl, fileName } = data.data;

            // Crear un enlace temporal para descargar
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            link.target = '_blank'; // Abrir en nueva pestaña como fallback
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`✅ PDF de appointment descargado: ${fileName}`);

        } catch (error) {
            console.error('❌ Error descargando PDF de appointment:', error);
            alert(`Error descargando el PDF: ${error.message}`);
        } finally {
            setDownloadingAppointmentPdf(false);
        }
    }

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

                        <div className='flex justify-start gap-2 w-full mt-2'>
                            <button
                                onClick={handleDownloadPdf}
                                disabled={downloadingPdf}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                title="Descargar PDF de inspección"
                            >
                                {downloadingPdf ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5" />
                                )}
                                {downloadingPdf ? 'Descargando...' : 'Descargar informe'}
                            </button>
                        </div>
                        {
                            inspection && (
                                loading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    <div className='col-span-2 flex flex-col gap-2 w-full'>
                                        <div className='flex justify-between gap-2 w-full'>
                                            <div className="flex items-center gap-2">
                                                <span className='font-bold'>
                                                    Código Fasecolda:
                                                </span>
                                                <span className='font-mono'>
                                                    {inspection?.inspectionData?.inspectionOrder?.cod_fasecolda || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex justify-between gap-2 w-full'>
                                            <div className="w-full border border-gray-200 rounded-md p-4">
                                                <h2 className="font-bold text-gray-700 mb-2 flex items-center w-full">
                                                    OBSERVACIONES
                                                </h2>
                                                <div className="space-y-6">
                                                    <div className='flex flex-col gap-2'>
                                                        {formatObservations(inspection?.inspectionData.observaciones)}
                                                    </div>
                                                    {
                                                        order.InspectionOrderStatus?.id == 5 && order.comentariosAnulacion == null && order.fixedStatus != 'Pendiente de reinspección' ? (
                                                            <>
                                                                <div>
                                                                    <pre className='px-4'>
                                                                        {inspection?.inspectionData?.notes}
                                                                    </pre>
                                                                </div>
                                                                {/* Comentarios de partes individuales */}
                                                                {(() => {
                                                                    const partComments = {}

                                                                    inspection?.responsesData?.forEach(r => {
                                                                        // Usar part_id en lugar de part_id
                                                                        if (r.part_id && r.value) {
                                                                            partComments[r.part_id] = r.value;
                                                                        }

                                                                        // Procesar comentarios de partes
                                                                        if (r.comment && r.part_id) {
                                                                            partComments[r.part_id] = r.comment;
                                                                        }
                                                                    });


                                                                    const commentsList = [];
                                                                    Object.entries(partComments).forEach(([part_id, comment]) => {
                                                                        const part = inspection?.partsData?.find(p => p.id === parseInt(part_id));
                                                                        if (part && comment) {
                                                                            commentsList.push({
                                                                                partName: part.parte,
                                                                                categoryName: part.category?.categoria,
                                                                                comment: comment
                                                                            });
                                                                        }
                                                                    });

                                                                    if (commentsList.length > 0) {
                                                                        return (
                                                                            <div>
                                                                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                                                    Comentarios por Parte
                                                                                </h3>
                                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                                    {commentsList.map((item, index) => (
                                                                                        <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                                                                            <div className="font-semibold text-blue-800 mb-2">
                                                                                                {item.partName}
                                                                                            </div>
                                                                                            <div className="text-sm text-blue-600 mb-1">
                                                                                                Categoría: {item.categoryName}
                                                                                            </div>
                                                                                            <div className="text-gray-700 bg-white rounded-lg p-3 border border-blue-200">
                                                                                                {item.comment}
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        <div className="text-center py-12">
                                                                            <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
                                                                                <FileTextIcon size={48} className="text-gray-400 mx-auto mb-4" />
                                                                                <div className="text-gray-500 font-medium">Sin observaciones registradas</div>
                                                                                <div className="text-sm text-gray-400 mt-2">No se han registrado comentarios adicionales</div>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                })()}
                                                            </>
                                                        ) : (
                                                            <>

                                                            </>
                                                        )
                                                    }
                                                    {order.comentariosAnulacion && (
                                                        <div className="text-xs text-gray-500 font-mono border border-gray-200 rounded-md p-2 bg-gray-100">
                                                            {order.comentariosAnulacion}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )
                            )
                        }
                    </CardContent>
                </Card>
                {showTabs ? (
                    <Tabs defaultValue="calls" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            {showCallHistory && <TabsTrigger value="calls">Historial de Llamadas</TabsTrigger>}
                            {showAppointments && <TabsTrigger value="appointments">Informes</TabsTrigger>}
                            <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
                        </TabsList>

                        {showCallHistory && (
                            <TabsContent value="calls">
                                <CallHistory
                                    callLogs={order.callLogs}
                                    userRole={user?.roles?.[0]?.name}
                                />
                            </TabsContent>
                        )}

                        {showAppointments && (
                            <TabsContent value="appointments">
                                <AppointmentsHistory
                                    orderId={order.id}
                                    appointments={order.appointments?.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)) || []}
                                    onDownloadPdf={handleDownloadAppointmentPdf}
                                />
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
                        {showCallHistory && (
                            <CallHistory
                                callLogs={order.callLogs}
                                userRole={user?.roles?.[0]?.name}
                            />
                        )}
                        {showAppointments && (
                            <AppointmentsHistory
                                orderId={order.id}
                                appointments={order.appointments?.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)) || []}
                                onDownloadPdf={handleDownloadAppointmentPdf}
                            />
                        )}
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