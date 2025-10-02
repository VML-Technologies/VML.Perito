import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, CheckCircle, AlertTriangle, ArrowLeft, User, Car, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';
import logo_mundial from '@/assets/logo_mundial.svg';
import { useInspectionQueueWebSocket } from '@/hooks/use-inspection-queue-websocket';
import { testScenarios, calculateTimeUntilAppointment } from '@/utils/appointmentTimeTest';

const InspeccionEspera = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const { showToast } = useNotifications();

    const [queueStatus, setQueueStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [position, setPosition] = useState(null);
    const [waitingTime, setWaitingTime] = useState(0);
    const [existingAppointment, setExistingAppointment] = useState(null);
    const [timeUntilAppointment, setTimeUntilAppointment] = useState(null);

    // Usar el hook de WebSocket para cola de inspecciones
    const { isConnected, queueStatus: wsQueueStatus, error: wsError } = useInspectionQueueWebSocket(hash);

    useEffect(() => {
        // Cargar estado inicial por API como fallback
        fetchQueueStatus();

        // Verificar agendamientos existentes
        checkExistingAppointment();

        // ✅ CORRECIÓN: NO agregar automáticamente a la cola
        // Solo Inspeccion.jsx debe manejar el agregado a cola

        // Actualizar información cada 30 segundos
        const intervalId = setInterval(() => {
            console.log('🔄 Actualizando información cada 30 segundos...');
            fetchQueueStatus();
            checkExistingAppointment();
        }, 30000); // 30 segundos

        // Limpiar el intervalo cuando el componente se desmonte
        return () => {
            clearInterval(intervalId);
        };
    }, [hash]);

    // Efecto para actualizar estado desde WebSocket
    useEffect(() => {
        if (wsQueueStatus) {
            // ✅ CORRECIÓN: WebSocket puede venir con estructura diferente
            const queueData = wsQueueStatus.data || wsQueueStatus;
            setQueueStatus(queueData);
            
            if (queueData.position) {
                setPosition(queueData.position);
            }
            setLoading(false);

            // ✅ CORRECIÓN: Si se asigna un inspector, redirigir a la página de inspección
            if (queueData.inspector && queueData.estado === 'en_proceso') {
                console.log('🚀 Inspector asignado, redirigiendo a inspección...');
                console.log('📊 Estado actual:', queueData);
                // Redirigir a la página de inspección del appointment
                if (existingAppointment && existingAppointment.session_id) {
                    const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
                    const inspectionUrl = `${base}/inspection/${existingAppointment.session_id}`;
                    window.location.href = inspectionUrl;
                } else {
                    navigate(`/inspeccion/${hash}`);
                }
            }
        }
    }, [wsQueueStatus, navigate, hash]);

    // Efecto para manejar errores de WebSocket
    useEffect(() => {
        if (wsError) {
            console.error('WebSocket error:', wsError);
            // ✅ CORRECIÓN: Si hay error de WebSocket, mostrar página de espera
            console.log('❌ Error de WebSocket, mostrando página de espera...');
            // No hacer redirect, mostrar la página de espera con mensaje azul
        }
    }, [wsError, navigate, hash]);

    // Contador de tiempo de espera - solo si hay cola activa
    useEffect(() => {
        // ✅ CORRECIÓN: Usar la estructura correcta de queueStatus
        const tiempoIngreso = queueStatus?.tiempo_ingreso || queueStatus?.data?.tiempo_ingreso;
        
        if (tiempoIngreso) {
            const startTime = new Date(tiempoIngreso).getTime();

            // Inicializar el tiempo inmediatamente
            const currentTime = Date.now();
            const elapsed = Math.floor((currentTime - startTime) / 1000);
            setWaitingTime(elapsed);

            const timer = setInterval(() => {
                setWaitingTime(prev => prev + 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [queueStatus?.tiempo_ingreso, queueStatus?.data?.tiempo_ingreso]);

    // Contador para tiempo hasta el agendamiento
    useEffect(() => {
        if (existingAppointment?.scheduled_date && existingAppointment?.scheduled_time) {
            const updateTimeUntilAppointment = () => {
                try {
                    const now = new Date();
                    const appointmentDate = new Date(existingAppointment.scheduled_date);
                    const [hours, minutes] = existingAppointment.scheduled_time.split(':');
                    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    const timeDiff = appointmentDate.getTime() - now.getTime();
                    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

                    console.log('🕐 Calculando tiempo hasta agendamiento:', {
                        now: now.toISOString(),
                        appointment: appointmentDate.toISOString(),
                        minutesDiff
                    });

                    setTimeUntilAppointment(minutesDiff);
                } catch (error) {
                    console.error('Error calculando tiempo hasta agendamiento:', error);
                    setTimeUntilAppointment(0); // Fallback: mostrar botón
                }
            };

            // Actualizar inmediatamente
            updateTimeUntilAppointment();

            // Actualizar cada minuto
            const timer = setInterval(updateTimeUntilAppointment, 60000);

            return () => clearInterval(timer);
        } else {
            // Si no hay fecha/hora, asumir que está listo
            setTimeUntilAppointment(0);
        }
    }, [existingAppointment]);

    const checkExistingAppointment = async () => {
        try {
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.ORDER_BY_HASH(hash), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                // ✅ CORRECIÓN: Solo considerar appointments activos (no finales)
                // El backend ya aplica la lógica correcta, solo usar si show_start_button es false
                if (data.data.appointment && !data.data.show_start_button) {
                    console.log('🚀 Appointment activo encontrado:', data.data.appointment);
                    setExistingAppointment(data.data.appointment);
                } else {
                    console.log('🚀 No hay appointment activo, usuario debe esperar en cola');
                    setExistingAppointment(null);
                    // ✅ CORRECIÓN: NO hacer redirect automático, mostrar página de espera
                    console.log('🚀 Mostrando página de espera con mensaje azul');
                    navigate(`/inspeccion/${hash}`);
                }
            }
        } catch (error) {
            console.error('Error checking existing appointment:', error);
        }
    };

    // ✅ FUNCIÓN ELIMINADA: addToQueue ya no se usa
    // Solo Inspeccion.jsx debe manejar el agregado a cola

    const fetchQueueStatus = async () => {
        try {
            const response = await fetch(API_ROUTES.INSPECTION_QUEUE.GET_STATUS_BY_HASH_PUBLIC(hash), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener el estado de la cola');
            }

            const data = await response.json();

            if (data.success && data.data) {
                // ✅ CORRECIÓN: La estructura viene como data.data
                const queueData = data.data;
                setQueueStatus(queueData);
                
                // La posición ya viene incluida en la respuesta del endpoint público
                if (queueData.position) {
                    setPosition(queueData.position);
                }

            // ✅ CORRECIÓN: Si se asigna un inspector, redirigir a la página de inspección
            if (queueData.inspector && queueData.estado === 'en_proceso') {
                console.log('🚀 Inspector asignado (API), redirigiendo a inspección...');
                // Redirigir a la página de inspección del appointment
                if (existingAppointment && existingAppointment.session_id) {
                    const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
                    const inspectionUrl = `${base}/inspection/${existingAppointment.session_id}`;
                    window.location.href = inspectionUrl;
                } else {
                    navigate(`/inspeccion/${hash}`);
                }
            }
            } else {
                // ✅ CORRECIÓN: Si no hay cola activa, mostrar página de espera
                console.log('❌ No se encontró cola activa, mostrando página de espera...');
                // No hacer redirect, mostrar la página de espera con mensaje azul
            }
        } catch (error) {
            console.error('Error fetching queue status:', error);
            // ✅ CORRECIÓN: Si hay error al consultar cola, mostrar página de espera
            console.log('❌ Error consultando cola, mostrando página de espera...');
            // No hacer redirect, mostrar la página de espera con mensaje azul
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoToInspection = () => {
        if (existingAppointment && existingAppointment.session_id) {
            const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
            const inspectionUrl = `${base}/inspection/${existingAppointment.session_id}`;
            console.log('🚀 Redirigiendo a:', inspectionUrl);
            console.log('🔧 VITE_INSPECTYA_URL:', import.meta.env.VITE_INSPECTYA_URL);
            console.log('🔑 Session ID:', existingAppointment.session_id);
            window.open(inspectionUrl, '_blank');
        }
    };

    const formatWaitingTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimeUntilAppointment = (minutes) => {
        if (minutes <= 0) {
            return '¡Ya es hora!';
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${remainingMinutes} minutos`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'en_cola':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En Cola</Badge>;
            case 'en_proceso':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">En Proceso</Badge>;
            case 'completada':
                return <Badge variant="default" className="bg-green-100 text-green-800">Completada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'en_cola':
                return 'Tu orden está en la cola de espera. Un inspector te atenderá pronto.';
            case 'en_proceso':
                return 'Un inspector está revisando tu orden. Prepárate para la inspección.';
            case 'completada':
                return 'La inspección ha sido completada.';
            default:
                return 'Estado desconocido';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Verificando estado de la cola...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-start mb-4">
                            <img src={logo_mundial} alt="logo_mundial" className="h-6 text-blue-600 mr-3" />
                        </div>
                        <div className="flex justify-center mb-4">
                            <div>
                                <CardTitle className="text-2xl text-gray-800">
                                    Inspector Asignado
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Agendamiento existente */}
                        {existingAppointment && (
                            <>
                                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                                    <div className="flex items-center justify-center mb-4">
                                        <CheckCircle className="h-12 w-12 text-green-600 mr-3" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                                        ¡Se ha asignado un inspector a tu inspección!
                                    </h2>

                                    {/* Información del agendamiento */}
                                    <div className="text-sm text-green-700 space-y-2 mb-4">
                                    </div>

                                    {timeUntilAppointment !== null ? (
                                        <div className="text-center">
                                            {timeUntilAppointment <= 5 ? (
                                                <div className="mb-4">
                                                    <p className="text-green-800 font-medium mb-3">
                                                        ¡Es hora de tu inspección!
                                                    </p>
                                                    <Button
                                                        onClick={handleGoToInspection}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                        size="lg"
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Ir a la Inspección
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                                                    <p className="text-yellow-800 font-medium text-sm">Tiempo restante</p>
                                                    <p className="text-yellow-900 font-bold text-2xl">
                                                        {formatTimeUntilAppointment(timeUntilAppointment)}
                                                    </p>
                                                    <p className="text-yellow-600 text-xs mt-1">
                                                        Tu inspección comenzará automáticamente
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Fallback: Si no se puede calcular el tiempo, mostrar botón directo
                                        <div className="text-center">
                                            <div className="mb-4">
                                                <p className="text-green-800 font-medium mb-3">
                                                    ¡Tu inspección está lista!
                                                </p>
                                                <Button
                                                    onClick={handleGoToInspection}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    size="lg"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Ir a la Inspección
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Mensaje principal - solo mostrar si no hay agendamiento */}
                        {!existingAppointment && (
                            <div className="text-center bg-blue-50 p-6 rounded-lg">
                                <div className="flex items-center justify-center mb-4">
                                    <Clock className="h-12 w-12 text-blue-600 mr-3" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    ¡Pronto un inspector iniciará tu inspección!
                                </h2>
                                <p className="text-gray-600">
                                    Tu orden está en la cola de espera. Un inspector te atenderá en breve.
                                </p>
                            </div>
                        )}

                        <Separator />

                        {/* Información de la orden */}
                        {queueStatus?.inspectionOrder && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Car className="h-5 w-5 mr-2 text-gray-600" />
                                    Información del Vehículo
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Placa:</span>
                                        <p className="text-gray-800 font-semibold">{queueStatus.inspectionOrder.placa}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Número de Orden:</span>
                                        <p className="text-gray-800 font-semibold">{queueStatus.inspectionOrder.numero}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Contacto:</span>
                                        <p className="text-gray-800">{queueStatus.inspectionOrder.nombre_contacto}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Tiempo de Ingreso:</span>
                                        <p className="text-gray-800">
                                            {new Date(queueStatus.tiempo_ingreso).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contador de tiempo y posición - solo mostrar si no hay agendamiento */}
                        {!existingAppointment && (
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {/* Tiempo de espera */}
                                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                                    <p className="text-yellow-800 font-medium text-sm">Tiempo de Espera</p>
                                    <p className="text-yellow-900 font-bold text-2xl">
                                        {formatWaitingTime(waitingTime)}
                                    </p>
                                </div>

                                {/* Posición en la cola */}
                                {/* {position && (
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                        <p className="text-blue-800 font-medium text-sm">Posición en Cola</p>
                                        <p className="text-blue-900 font-bold text-2xl">
                                            #{position}
                                        </p>
                                        <p className="text-blue-600 text-xs mt-1">
                                            Tiempo estimado: {position * 5} min
                                        </p>
                                    </div>
                                )} */}
                            </div>
                        )}

                        {/* Recomendaciones */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                {existingAppointment ? 'Preparación para la Inspección' : 'Recomendaciones'}
                            </h3>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Asegúrate de tener buena iluminación para las fotos
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        El vehículo debe estar limpio y sin objetos que obstaculicen la vista
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Ten a mano la documentación del vehículo
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Asegúrate de tener una conexión estable a internet
                                    </li>
                                    {existingAppointment ? (
                                        <li className="flex items-start">
                                            <span className="text-yellow-600 mr-2">•</span>
                                            Prepárate para la inspección virtual programada
                                        </li>
                                    ) : (
                                        <li className="flex items-start">
                                            <span className="text-yellow-600 mr-2">•</span>
                                            Mantén esta página abierta para recibir actualizaciones
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Inspector asignado */}
                        {queueStatus?.inspector && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                    Inspector Asignado
                                </h3>
                                <p className="text-gray-700">
                                    <span className="font-medium">Inspector:</span> {queueStatus.inspector.name}
                                </p>
                            </div>
                        )}

                        {/* Botón de regreso */}
                        <div className="text-center pt-4">
                            <Button
                                onClick={handleGoBack}
                                variant="outline"
                                className="w-full"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InspeccionEspera;
