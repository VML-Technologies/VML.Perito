import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';
import { useInspectionQueueWebSocket } from '@/hooks/use-inspection-queue-websocket';
import { Landing, Wait, InspectorAssigned } from '@/components/queues';
import { isHoliday } from '@/utils/holidays';

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
    const [businessHoursTimer, setBusinessHoursTimer] = useState(null);
    const [isHolidayToday, setIsHolidayToday] = useState(false);
    const [holidayName, setHolidayName] = useState('');
    
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

    // Efecto para validación continua de ventana horaria cada segundo
    useEffect(() => {
        // Validar inmediatamente al cargar
        checkBusinessHours();

        // Configurar timer para validar cada segundo
        const timer = setInterval(() => {
            checkBusinessHours();
        }, 1000);

        setBusinessHoursTimer(timer);

        // Cleanup del timer
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, []);

    // Efecto para manejar cambios de visibilidad de la pestaña
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Cuando la pestaña vuelve a estar visible, validar inmediatamente
                checkBusinessHours();
                console.log('Pestaña restaurada - validando ventana horaria');
            }
        };

        const handleFocus = () => {
            // Cuando la ventana recibe foco, validar inmediatamente
            checkBusinessHours();
            console.log('Ventana enfocada - validando ventana horaria');
        };

        const handleBeforeUnload = () => {
            // Limpiar timer antes de salir
            if (businessHoursTimer) {
                clearInterval(businessHoursTimer);
            }
        };
        const handleGoBack = () => {
            console.log('Volviendo a Landing'); // debug
            setCurrentView('landing');
        };


        // Agregar event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup de event listeners
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [businessHoursTimer]);

    // Efecto para manejar cambios de estado desde WebSocket
    useEffect(() => {
        if (wsQueueStatus) {
            const queueData = wsQueueStatus.data || wsQueueStatus;
            setQueueStatus(queueData);

            // Si se asigna un inspector, cambiar a vista de inspector asignado
            // PERO solo si NO es una reinspección (ineffective_with_retry)
            if (queueData.inspector && (queueData.estado === 'en_proceso' || queueData.status === 'en_proceso')) {
                console.log('🔔 Inspector asignado detectado, actualizando estado:', queueData);

                // Verificar si el appointment es una reinspección
                const isReinspection = queueData.appointment?.status === 'ineffective_with_retry';
                
                if (isReinspection) {
                    console.log('⚠️ Appointment es reinspección, NO cambiar a vista inspectorAssigned');
                    return;
                }

                // Actualizar existingAppointment con los datos del appointment si existen
                if (queueData.appointment) {
                    console.log('📋 Actualizando existingAppointment con datos del WebSocket:', queueData.appointment);
                    setExistingAppointment(queueData.appointment);
                    setCurrentView('inspectorAssigned');
                } else if (queueData.session_id) {
                    // Si viene session_id directamente en queueData, crear appointment temporal
                    console.log('📋 Creando appointment temporal con session_id:', queueData.session_id);
                    setExistingAppointment({
                        session_id: queueData.session_id,
                        inspector: queueData.inspector,
                        estado: queueData.estado || queueData.status,
                        sede: queueData.sede
                    });
                    setCurrentView('inspectorAssigned');
                } else {
                    // Si no hay appointment ni session_id, hacer fetch de la orden completa para obtenerlos
                    console.log('🔄 No hay session_id en WebSocket, haciendo fetch de la orden completa...');
                    fetchInspectionOrderSilent();
                }
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
        const bogotaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

        const dayOfWeek = bogotaTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const hour = bogotaTime.getHours();
        const minute = bogotaTime.getMinutes();
        const currentTime = hour * 60 + minute; // Convertir a minutos para facilitar comparación

        // Verificar si hoy es festivo
        const year = bogotaTime.getFullYear();
        const month = String(bogotaTime.getMonth() + 1).padStart(2, '0');
        const day = String(bogotaTime.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        const holidayCheck = isHoliday(todayString);
        const previousHolidayState = isHolidayToday;

        // Actualizar estado de festivo si cambió
        if (holidayCheck.isHoliday !== previousHolidayState) {
            setIsHolidayToday(holidayCheck.isHoliday);
            setHolidayName(holidayCheck.celebration || '');

            if (holidayCheck.isHoliday) {
                console.log(`¡Hoy es festivo! ${holidayCheck.celebration}`);
            }
        }

        let isWithinHours = false;
        let previousState = isWithinBusinessHours;

        // Si es festivo, no está disponible el servicio
        if (holidayCheck.isHoliday) {
            isWithinHours = false;
        }
        // Si es domingo, cerrado
        else if (dayOfWeek === 0) {
            isWithinHours = false;
        }
        // Lunes a viernes (1-5): 8:00 AM - 5:00 PM
        else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const startTime = 8 * 60; // 8:00 AM en minutos
            const endTime = 17 * 60; // 5:00 PM en minutos
            isWithinHours = currentTime >= startTime && currentTime <= endTime;
        }
        // Sábados (6): 8:00 AM - 12:00 PM
        else if (dayOfWeek === 6) {
            const startTime = 8 * 60; // 8:00 AM en minutos
            const endTime = 12 * 60; // 12:00 PM en minutos
            isWithinHours = currentTime >= startTime && currentTime <= endTime;
        }

        // Solo actualizar si el estado cambió para evitar renders innecesarios
        if (previousState !== isWithinHours) {
            setIsWithinBusinessHours(true)//isWithinHours);

            // Mostrar notificación cuando cambie el estado
            if (holidayCheck.isHoliday) {
                showToast(`Hoy es festivo: ${holidayCheck.celebration}. El servicio no está disponible.`, 'warning');
            } else if (isWithinHours) {
                showToast('¡El servicio de inspecciones está disponible!', 'success');
            } else {
                showToast('El servicio de inspecciones está fuera del horario de atención', 'warning');
            }

            console.log(`Estado de ventana horaria cambió: ${isWithinHours ? 'ABIERTO' : 'CERRADO'}${holidayCheck.isHoliday ? ' (Festivo)' : ''}`);
        }
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
            // EXCLUIR appointments con status 'ineffective_with_retry' para permitir reinspección
            const hasValidAppointment = data.data.appointment && 
                !data.data.show_start_button && 
                data.data.appointment.status !== 'ineffective_with_retry';
            
            const isReinspection = data.data.appointment && 
                data.data.appointment.status === 'ineffective_with_retry';
            
            if (hasValidAppointment) {
                setExistingAppointment(data.data.appointment);
                setCurrentView('inspectorAssigned');
            } else {
                // Si es reinspección, SIEMPRE intentar agregar a la cola (el backend manejará si ya existe)
                if (isReinspection) {
                    await handleStartInspection();
                } else {
                    // Solo para NO reinspecciones, verificar si ya está en cola
                    await checkQueueStatus();
                }
            }
        } catch (error) {
            console.error('Error fetching inspection order:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch silencioso para actualizar datos sin cambiar el estado de loading
    const fetchInspectionOrderSilent = async () => {
        try {
            console.log('🔄 Haciendo fetch silencioso de la orden de inspección...');
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
            console.log('📦 Datos de la orden recibidos:', data.data);
            setInspectionOrder(data.data);

            // Si ahora tiene un appointment con session_id (y NO es ineffective_with_retry), actualizar y cambiar vista
            const hasValidAppointment = data.data.appointment && 
                data.data.appointment.session_id && 
                data.data.appointment.status !== 'ineffective_with_retry';
            
            if (hasValidAppointment) {
                console.log('✅ Appointment válido con session_id encontrado, actualizando estado:', data.data.appointment);
                setExistingAppointment(data.data.appointment);
                setCurrentView('inspectorAssigned');
                showToast('¡Inspector asignado! Ya puedes ingresar a la inspección.', 'success');
            } else {
                console.warn('⚠️ No se encontró appointment válido con session_id en la orden (o es reinspección)');
            }
        } catch (error) {
            console.error('Error en fetch silencioso:', error);
            // No mostrar error al usuario, solo loguear
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
                    return true; // Está en cola
                }
            }
            return false; // No está en cola
        } catch (error) {
            console.error('Error checking queue status:', error);
            // Mantener vista de landing si no hay cola
            return false;
        }
    };

    const handleStartInspection = async () => {
        // ✅ Validación adicional: Verificar horario antes de proceder
        if (!isWithinBusinessHours) {
            showToast(
                isHolidayToday
                    ? 'No se puede iniciar la inspección en días festivos'
                    : 'No se puede iniciar la inspección fuera del horario de atención',
                'error'
            );
            return;
        }

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
        // Detectar si es reinspección
        const isReinspection = inspectionOrder?.appointment?.status === 'ineffective_with_retry';
        
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
                        isHolidayToday={isHolidayToday}
                        holidayName={holidayName}
                        // inspectionStartedAt={inspectionStartedAt}
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
