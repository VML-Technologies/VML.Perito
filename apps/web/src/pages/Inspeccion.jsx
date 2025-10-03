import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';
import { useInspectionQueueWebSocket } from '@/hooks/use-inspection-queue-websocket';
import { Landing, Wait, InspectorAssigned } from '@/components/queues';

const Inspeccion = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useNotifications();
    
    // Detectar si estamos en la ruta de fallback
    const isFallbackRoute = location.pathname.includes('/espera/inspeccion/');
    
    const [inspectionOrder, setInspectionOrder] = useState(null);
    const [existingAppointment, setExistingAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startingInspection, setStartingInspection] = useState(false);
    const [isWithinBusinessHours, setIsWithinBusinessHours] = useState(true);
    
    // Estados para el sistema de colas
    const [currentView, setCurrentView] = useState('landing'); // 'landing', 'wait', 'inspectorAssigned'
    const [queueStatus, setQueueStatus] = useState(null);
    const [waitingTime, setWaitingTime] = useState(0);
    const [timeUntilAppointment, setTimeUntilAppointment] = useState(null);

    // WebSocket para cola de inspecciones
    const { isConnected, queueStatus: wsQueueStatus, error: wsError } = useInspectionQueueWebSocket(hash);

    useEffect(() => {
        fetchInspectionOrder();
        checkBusinessHours();
        
        // Si estamos en la ruta de fallback, mostrar mensaje informativo
        if (isFallbackRoute) {
            showToast('Has sido redirigido automáticamente. El sistema ahora maneja todo en una sola página.', 'info');
        }
    }, [hash, isFallbackRoute]);

    // Efecto para manejar cambios de estado desde WebSocket
    useEffect(() => {
        if (wsQueueStatus) {
            const queueData = wsQueueStatus.data || wsQueueStatus;
            setQueueStatus(queueData);

            // Si se asigna un inspector, cambiar a vista de inspector asignado
            if (queueData.inspector && queueData.estado === 'en_proceso') {
                setCurrentView('inspectorAssigned');
            }
        }
    }, [wsQueueStatus]);

    // Efecto para manejar errores de WebSocket
    useEffect(() => {
        if (wsError) {
            console.error('WebSocket error:', wsError);
            // Si hay error de WebSocket, mantener la vista actual
        }
    }, [wsError]);

    // Contador de tiempo de espera
    useEffect(() => {
        if (queueStatus?.tiempo_ingreso) {
            const startTime = new Date(queueStatus.tiempo_ingreso).getTime();
            const currentTime = Date.now();
            const elapsed = Math.floor((currentTime - startTime) / 1000);
            setWaitingTime(elapsed);

            const timer = setInterval(() => {
                setWaitingTime(prev => prev + 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [queueStatus?.tiempo_ingreso]);

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
                    setTimeUntilAppointment(minutesDiff);
                } catch (error) {
                    console.error('Error calculando tiempo hasta agendamiento:', error);
                    setTimeUntilAppointment(0);
                }
            };

            updateTimeUntilAppointment();
            const timer = setInterval(updateTimeUntilAppointment, 60000);
            return () => clearInterval(timer);
        } else {
            setTimeUntilAppointment(0);
        }
    }, [existingAppointment]);

    const checkBusinessHours = () => {
        // Crear fecha actual en zona horaria de Bogotá (UTC-5)
        const now = new Date();
        const bogotaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
        
        const dayOfWeek = bogotaTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const hour = bogotaTime.getHours();
        const minute = bogotaTime.getMinutes();
        const currentTime = hour * 60 + minute; // Convertir a minutos para facilitar comparación
        
        let isWithinHours = false;
        
        // Lunes a viernes (1-5): 8:00 AM - 4:00 PM
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const startTime = 8 * 60; // 8:00 AM en minutos
            const endTime = 16 * 60; // 4:00 PM en minutos
            isWithinHours = currentTime >= startTime && currentTime <= endTime;
        }
        // Sábados (6): 8:00 AM - 12:00 PM
        else if (dayOfWeek === 6) {
            const startTime = 8 * 60; // 8:00 AM en minutos
            const endTime = 12 * 60; // 12:00 PM en minutos
            isWithinHours = currentTime >= startTime && currentTime <= endTime;
        }
        // Domingos: cerrado
        
        setIsWithinBusinessHours(isWithinHours);
    };

    const fetchInspectionOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_ROUTES.INSPECTION_ORDERS.ORDER_BY_HASH(hash)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Orden de inspección no encontrada');
            }

            const data = await response.json();
            setInspectionOrder(data.data);
            
            // Verificar si ya existe un agendamiento para esta orden
            if (data.data.appointment && !data.data.show_start_button) {
                setExistingAppointment(data.data.appointment);
                setCurrentView('inspectorAssigned');
            } else {
                // Verificar si ya está en cola
                await checkQueueStatus();
            }
        } catch (error) {
            console.error('Error fetching inspection order:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkQueueStatus = async () => {
        try {
            const response = await fetch(API_ROUTES.INSPECTION_QUEUE.GET_STATUS_BY_HASH_PUBLIC(hash), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.data) {
                    // El endpoint devuelve {data: {data: {...}}}
                    // Necesitamos acceder a data.data para obtener los datos reales
                    const actualQueueData = data.data.data || data.data;
                    setQueueStatus(actualQueueData);
                    setCurrentView('wait');
                }
            }
        } catch (error) {
            console.error('Error checking queue status:', error);
            // Mantener vista de landing si no hay cola
        }
    };

    const handleStartInspection = async () => {
        try {
            setStartingInspection(true);
            
            // Agregar a la cola de inspecciones
            const queueResponse = await fetch(API_ROUTES.INSPECTION_QUEUE.ADD_TO_QUEUE_PUBLIC, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inspection_order_id: inspectionOrder.id,
                    hash_acceso: hash
                })
            });

            if (!queueResponse.ok) {
                const errorData = await queueResponse.json();
                throw new Error(errorData.message || 'Error al agregar a la cola de inspecciones');
            }

            const responseData = await queueResponse.json();
            
            if (responseData.tiempo_en_cola !== undefined) {
                showToast(`Ya estabas en la cola desde hace ${responseData.tiempo_en_cola} minutos. Continuando con tu posición actual.`, 'info');
            } else {
                showToast('Has sido agregado a la cola de inspecciones. Un inspector te atenderá pronto.', 'success');
            }
            
            // Cambiar a vista de espera
            const actualQueueData = responseData.data?.data || responseData.data || responseData;
            setQueueStatus(actualQueueData);
            setCurrentView('wait');
        } catch (error) {
            console.error('Error starting inspection:', error);
            showToast(error.message || 'Error al iniciar la inspección', 'error');
        } finally {
            setStartingInspection(false);
        }
    };

    const handleGoToExistingInspection = () => {
        if (existingAppointment && existingAppointment.session_id) {
            const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
            const inspectionUrl = `${base}/inspection/${existingAppointment.session_id}`;
            window.open(inspectionUrl, '_blank');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando información de inspección...</p>
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

    if (!inspectionOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró la orden de inspección
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Renderizar componente según la vista actual
    const renderCurrentView = () => {
        switch (currentView) {
            case 'wait':
    return (
                    <Wait 
                        queueStatus={queueStatus}
                        waitingTime={waitingTime}
                        onGoBack={handleGoBack}
                        formatWaitingTime={formatWaitingTime}
                    />
                );
            
            case 'inspectorAssigned':
                return (
                    <InspectorAssigned 
                        existingAppointment={existingAppointment}
                        timeUntilAppointment={timeUntilAppointment}
                        onGoToInspection={handleGoToExistingInspection}
                        onGoBack={handleGoBack}
                        formatTimeUntilAppointment={formatTimeUntilAppointment}
                    />
                );
            
            case 'landing':
            default:
                return (
                    <Landing 
                        inspectionOrder={inspectionOrder}
                        existingAppointment={existingAppointment}
                        isWithinBusinessHours={isWithinBusinessHours}
                        startingInspection={startingInspection}
                        onStartInspection={handleStartInspection}
                        onGoToExistingInspection={handleGoToExistingInspection}
                    />
                );
        }
    };

    // Si estamos en la ruta de fallback, mostrar mensaje informativo
    if (isFallbackRoute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-md mx-auto">
                    <Alert className="mb-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Has sido redirigido automáticamente. El sistema ahora maneja todo el proceso de inspección en una sola página para una mejor experiencia.
                        </AlertDescription>
                    </Alert>
                    {renderCurrentView()}
            </div>
        </div>
    );
    }

    return renderCurrentView();
};

export default Inspeccion;
