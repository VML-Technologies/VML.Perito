import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useAuth } from '@/contexts/auth-context';
import CalendarioAgendamiento from '@/components/CalendarioAgendamiento';
import useScheduleValidation from '@/hooks/use-schedule-validation';
import AgentOrderPanel from '@/components/AgentOrderPanel';
import { AlertCircle, Search, Phone, MessageSquare, User, Car, FileText, Clock, RefreshCw, UserCheck, Calendar } from 'lucide-react';

const AgentOrdenesRecuperacion = () => {
    const { showToast } = useNotificationContext();
    const { user } = useAuth();
    const { validationState, validateRealTime, clearValidations } = useScheduleValidation();

    const [ordenesRecuperacion, setOrdenesRecuperacion] = useState([]);
    const [ordenesNoRecuperadas, setOrdenesNoRecuperadas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('recuperacion');

    // Estados para el AgentOrderPanel
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
    const [callStatuses, setCallStatuses] = useState([]);

    // Paginación para Recuperación (server-side)
    const [pageRecuperacion, setPageRecuperacion] = useState(1);
    const [paginationRecuperacion, setPaginationRecuperacion] = useState(null);
    const limitRecuperacion = 12;

    // Paginación para No Recuperadas (server-side)
    const [pageNoRecuperadas, setPageNoRecuperadas] = useState(1);
    const [paginationNoRecuperadas, setPaginationNoRecuperadas] = useState(null);
    const limitNoRecuperadas = 12;

    useEffect(() => {
        loadOrdenes();
        loadCallStatuses();
    }, []);

    useEffect(() => {
        loadOrdenes();
    }, [pageRecuperacion, pageNoRecuperadas]);

    // Debounce para el término de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efecto para búsqueda - resetea la paginación cuando se busca
    useEffect(() => {
        if (debouncedSearchTerm !== searchTerm) return; // Solo ejecutar cuando el debounce esté listo

        if (debouncedSearchTerm !== '') {
            setPageRecuperacion(1);
            setPageNoRecuperadas(1);
        }

        // Activar indicador de búsqueda solo si hay término de búsqueda
        if (debouncedSearchTerm.trim()) {
            setSearching(true);
        }

        loadOrdenes();
    }, [debouncedSearchTerm]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOrdenes();
        setRefreshing(false);
        showToast('Órdenes actualizadas', 'success');
    };

    const loadCallStatuses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.CALL_STATUSES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCallStatuses(data);
            }
        } catch (error) {
            console.error('Error loading call statuses:', error);
        }
    };

    // Nueva función para cargar todas las modalidades disponibles
    const loadAllModalities = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.ALL_MODALITIES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAllModalities(data.data || []);
            }
        } catch (error) {
            console.error('Error loading all modalities:', error);
        }
    }, []);

    // Función para cargar appointments activos de la orden
    const loadActiveAppointments = useCallback(async (orderId) => {
        if (!orderId) return;

        setLoadingAppointments(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.ACTIVE_APPOINTMENTS(orderId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setExistingAppointments(data.data || []);
                setLoadedOrderId(orderId);
            } else {
                console.error('Error loading active appointments:', response.statusText);
                setExistingAppointments([]);
                setLoadedOrderId(orderId);
            }
        } catch (error) {
            console.error('Error loading active appointments:', error);
            setExistingAppointments([]);
            setLoadedOrderId(orderId);
        } finally {
            setLoadingAppointments(false);
        }
    }, []);

    // Nueva función para cargar sedes por modalidad
    const loadSedesByModality = async (modalityId) => {
        if (!modalityId) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.CONTACT_AGENT.SEDES_BY_MODALITY}?modalityId=${modalityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableSedesByModality(data.data || []);
                return data.data || [];
            }
        } catch (error) {
            console.error('Error loading sedes by modality:', error);
        }
    };

    const handleContactOrder = (orden) => {
        setSelectedOrder(orden);
        setIsOrderPanelOpen(true);
    };

    // Función para detectar si el estado seleccionado requiere agendamiento
    const handleCallStatusChange = (statusId) => {
        setCallForm(prev => ({
            ...prev,
            call_status_id: statusId
        }));

        // Verificar si el estado requiere agendamiento
        const selectedStatus = callStatuses.find(status => status.id.toString() == statusId);
        const needsScheduling = selectedStatus?.creates_schedule;

        setShowAppointmentForm(needsScheduling);
    };

    // Nueva función para manejar la selección de modalidad
    const handleModalityChange = (modalityId) => {
        setSelectedModality(modalityId);
        setSelectedSede(null);
        setSelectedDepartment('');
        setSelectedCity('');
        setAppointmentForm(prev => ({
            ...prev,
            sede_id: '',
            inspection_modality_id: modalityId
        }));
        setSelectedSlot(null);
        setCalendarSelectedDate('');

        if (modalityId) {
            loadSedesByModality(modalityId).then((sedes) => {
                // Extraer departamentos únicos
                const departments = [];
                const deptIds = new Set();
                sedes.forEach(sede => {
                    if (sede.department_id && !deptIds.has(sede.department_id)) {
                        departments.push({ id: sede.department_id, name: sede.department });
                        deptIds.add(sede.department_id);
                    }
                });
                setFilteredDepartments(departments);
                setFilteredCities([]);
                setFilteredSedes([]);
            });
        } else {
            setAvailableSedesByModality([]);
            setFilteredDepartments([]);
            setFilteredCities([]);
            setFilteredSedes([]);
        }
    };

    // Nueva función para manejar la selección de departamento
    const handleDepartmentChange = (departmentId) => {
        setSelectedDepartment(departmentId);
        setSelectedCity('');
        setSelectedSede(null);
        setAppointmentForm(prev => ({ ...prev, sede_id: '' }));
        setSelectedSlot(null);
        setCalendarSelectedDate('');
        // Filtrar ciudades posibles
        const cities = [];
        const cityIds = new Set();
        availableSedesByModality.forEach(sede => {
            if (sede.department_id == parseInt(departmentId) && sede.city_id && !cityIds.has(sede.city_id)) {
                cities.push({ id: sede.city_id, name: sede.city });
                cityIds.add(sede.city_id);
            }
        });
        setFilteredCities(cities);
        setFilteredSedes([]);
    };

    // Nueva función para manejar la selección de ciudad
    const handleCityChange = (cityId) => {
        setSelectedCity(cityId);
        setSelectedSede(null);
        setAppointmentForm(prev => ({ ...prev, sede_id: '' }));
        setSelectedSlot(null);
        setCalendarSelectedDate('');
        // Filtrar sedes posibles
        const sedes = availableSedesByModality.filter(sede => sede.city_id == parseInt(cityId));
        setFilteredSedes(sedes);
    };

    // Nueva función para manejar la selección de sede
    const handleSedeChange = (sedeId) => {
        const selectedSedeData = filteredSedes.find(sede => sede.id.toString() == sedeId);
        setSelectedSede(selectedSedeData);
        setAppointmentForm(prev => ({
            ...prev,
            sede_id: sedeId
        }));
        setSelectedSlot(null);
        setCalendarSelectedDate('');
    };

    // Manejar selección de slot de horario
    const handleSlotSelect = useCallback((slotData) => {
        setSelectedSlot(slotData);

        setAppointmentForm(prev => ({
            ...prev,
            fecha_inspeccion: calendarSelectedDate || prev.fecha_inspeccion,
            hora_inspeccion: slotData.startTime
        }));
    }, [calendarSelectedDate]);

    // Callback para cuando cambia la fecha en el calendario
    const handleCalendarDateChange = useCallback((selectedDate) => {
        setAppointmentForm(prev => ({
            ...prev,
            fecha_inspeccion: selectedDate
        }));
    }, []);

    // Validar en tiempo real cuando cambian los parámetros del agendamiento (con debounce)
    const validateAppointment = useCallback(() => {
        const timeoutId = setTimeout(() => {
            if (appointmentForm.sede_id && selectedModality && appointmentForm.inspection_type_id) {
                validateRealTime(
                    appointmentForm.sede_id,
                    selectedModality,
                    appointmentForm.inspection_type_id,
                    appointmentForm.fecha_inspeccion,
                    appointmentForm.hora_inspeccion
                );
            } else {
                clearValidations();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [
        appointmentForm.sede_id,
        selectedModality,
        appointmentForm.inspection_type_id,
        appointmentForm.fecha_inspeccion,
        appointmentForm.hora_inspeccion,
        validateRealTime,
        clearValidations
    ]);

    // Ejecutar validación cuando cambian los parámetros
    validateAppointment();

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCallSubmit = async (e) => {
        e.preventDefault();

        // Prevenir múltiples envíos
        if (loadingCallSubmit) {
            console.log('⚠️ Intento de envío múltiple bloqueado');
            showToast('Ya se está procesando la llamada, por favor espera...', 'warning');
            return;
        }

        if (!selectedOrder || !callForm.call_status_id) {
            showToast('Selecciona un estado de llamada', 'warning');
            return;
        }

        setLoadingCallSubmit(true);

        // Timeout de seguridad para evitar que el loading se quede atascado
        const loadingTimeout = setTimeout(() => {
            console.warn('⚠️ Timeout de seguridad: forzando finalización del loading');
            setLoadingCallSubmit(false);
            showToast('La operación está tomando más tiempo del esperado. Por favor intenta nuevamente.', 'warning');
        }, 30000); // 30 segundos

        try {
            const token = localStorage.getItem('authToken');
            // 1. Registrar llamada
            const selectedStatus = callStatuses.find(status => status.id.toString() == callForm.call_status_id);
            const willCreateAppointment = selectedStatus?.creates_schedule;

            const callResponse = await fetch(API_ROUTES.CONTACT_AGENT.CALL_LOGS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inspection_order_id: selectedOrder.id,
                    ...callForm,
                    fecha_seguimiento: new Date().toISOString(),
                    skip_email_for_appointment: willCreateAppointment // No enviar email si se va a crear appointment
                })
            });
            if (!callResponse.ok) throw new Error('Error al registrar la llamada');
            const callData = await callResponse.json();

            // 2. Si requiere agendamiento, registrar agendamiento
            if (selectedStatus?.creates_schedule) {
                if (!appointmentForm.fecha_inspeccion || !appointmentForm.hora_inspeccion) {
                    showToast('Completa la fecha y hora del agendamiento', 'warning');
                    clearTimeout(loadingTimeout);
                    setLoadingCallSubmit(false);
                    return;
                }
                const appointmentBody = {
                    inspection_order_id: selectedOrder.id,
                    call_log_id: callData.data?.id, // Usa el ID de la llamada recién creada
                    user_id: user?.id, // Enviar el usuario autenticado
                    ...appointmentForm,
                    scheduled_date: appointmentForm.fecha_inspeccion, // Enviar ambos nombres
                    scheduled_time: appointmentForm.hora_inspeccion
                };

                try {
                    const appointmentResponse = await fetch(API_ROUTES.CONTACT_AGENT.APPOINTMENTS, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(appointmentBody)
                    });

                    if (!appointmentResponse.ok) {
                        const err = await appointmentResponse.json();
                        throw new Error(`Error al crear el agendamiento: ${err.message || appointmentResponse.statusText}`);
                    }

                    const appointmentData = await appointmentResponse.json();

                    // Mostrar mensaje personalizado según si se reemplazaron appointments
                    let successMessage = 'Llamada registrada y agendamiento creado exitosamente';
                    if (appointmentData.replaced_appointments > 0) {
                        successMessage = `Llamada registrada y agendamiento creado exitosamente. Se inhabilitó ${appointmentData.replaced_appointments} agendamiento(s) anterior(es).`;
                    }

                    showToast(successMessage, 'success');
                } catch (error) {
                    console.error("Appointment error:", error);
                    showToast(`Error: ${error.message}`, 'error');
                    clearTimeout(loadingTimeout);
                    setLoadingCallSubmit(false);
                    return;
                }
            } else {
                showToast('Llamada registrada exitosamente', 'success');
            }

            // Cerrar el dialog y recargar las órdenes
            setIsContactDialogOpen(false);
            await loadOrdenes();

        } catch (error) {
            console.error('Error submitting call:', error);
            showToast('Error al registrar la llamada: ' + error.message, 'error');
        } finally {
            clearTimeout(loadingTimeout);
            setLoadingCallSubmit(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysFromCreation = (createdAt) => {
        if (!createdAt) return 0;
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const renderOrdenCard = (orden, showDays = false) => {
        const diasDesdeCreacion = getDaysFromCreation(orden.created_at);

        return (
            <Card key={orden.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Orden #{orden.numero}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Creada: {formatDate(orden.created_at)}
                            </CardDescription>
                        </div>
                        {showDays && (
                            <Badge variant={diasDesdeCreacion >= 6 ? 'destructive' : 'warning'} className="ml-2">
                                Día {diasDesdeCreacion}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Información del cliente */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{orden.nombre_cliente || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{orden.celular_cliente || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>{orden.marca} {orden.modelo} - {orden.placa}</span>
                        </div>
                    </div>

                    {/* Contadores de actividad */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Actividad de Contacto</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Llamadas</span>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                                    {orden.call_count || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">SMS</span>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-900">
                                    {orden.sms_count || 0}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Estado y agente asignado */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Estado: <span className="font-medium">{orden.estado || 'Pendiente'}</span>
                                </span>
                            </div>
                            {orden.assigned_agent_name && (
                                <Badge variant="outline">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    {orden.assigned_agent_name}
                                </Badge>
                            )}
                        </div>

                        {/* Acciones del agente */}
                        <div className="pt-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                onClick={() => handleContactOrder(orden)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Gestionar Recuperacion
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const loadOrdenes = async () => {
        try {
            // Solo mostrar loading completo en la carga inicial
            if (!searching) {
                setLoading(true);
            }

            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Construir parámetros de búsqueda
            const searchParam = debouncedSearchTerm.trim() ? `&search=${encodeURIComponent(debouncedSearchTerm.trim())}` : '';

            // Cargar órdenes en recuperación (días 2-5) con paginación y búsqueda
            const recuperacionUrl = `${API_ROUTES.COORDINADOR_CONTACTO.ORDENES_RECUPERACION}?page=${pageRecuperacion}&limit=${limitRecuperacion}${searchParam}`;
            const recuperacionResponse = await fetch(recuperacionUrl, { headers });
            if (!recuperacionResponse.ok) throw new Error('Error al cargar órdenes en recuperación');
            const recuperacionData = await recuperacionResponse.json();

            // Cargar órdenes no recuperadas (día 6+) con paginación y búsqueda
            const noRecuperadasUrl = `${API_ROUTES.COORDINADOR_CONTACTO.ORDENES_NO_RECUPERADAS}?page=${pageNoRecuperadas}&limit=${limitNoRecuperadas}${searchParam}`;
            const noRecuperadasResponse = await fetch(noRecuperadasUrl, { headers });
            if (!noRecuperadasResponse.ok) throw new Error('Error al cargar órdenes no recuperadas');
            const noRecuperadasData = await noRecuperadasResponse.json();

            setOrdenesRecuperacion(recuperacionData.data || []);
            setPaginationRecuperacion(recuperacionData.pagination || null);

            setOrdenesNoRecuperadas(noRecuperadasData.data || []);
            setPaginationNoRecuperadas(noRecuperadasData.pagination || null);
        } catch (error) {
            console.error('Error cargando órdenes:', error);
            showToast('Error al cargar órdenes de recuperación', 'error');
        } finally {
            setLoading(false);
            setSearching(false); // Desactivar indicador de búsqueda
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando órdenes en recuperación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con filtros y búsqueda */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Órdenes en Recuperación</h2>
                        <p className="text-muted-foreground">
                            Órdenes asignadas que requieren seguimiento y recuperación
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Actualizando...' : 'Actualizar'}
                        </Button>

                        {/* Indicador de búsqueda */}
                        {searching && (
                            <Button
                                disabled
                                variant="outline"
                                size="sm"
                            >
                                <Search className="h-4 w-4 mr-2 animate-pulse" />
                                Buscando...
                            </Button>
                        )}
                    </div>
                </div>

                {/* Campo de búsqueda */}
                <div className="flex-1 max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por número, cliente, placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs para Recuperación y No Recuperadas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recuperacion" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        En Recuperación (Días 2-5)
                        <Badge variant="secondary" className="ml-2">
                            {paginationRecuperacion?.total || 0}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="no-recuperadas" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        No Recuperadas (Día 6+)
                        <Badge variant="destructive" className="ml-2">
                            {paginationNoRecuperadas?.total || 0}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Tab: En Recuperación */}
                <TabsContent value="recuperacion">
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes en Proceso de Recuperación</CardTitle>
                            <CardDescription>
                                Órdenes asignadas entre el día 2 y el día 5 que requieren seguimiento activo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordenesRecuperacion.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay órdenes en recuperación</h3>
                                    <p className="text-muted-foreground">
                                        No tienes órdenes asignadas en el período de recuperación (días 2-5)
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ordenesRecuperacion.map(orden => renderOrdenCard(orden, true))}
                                    </div>

                                    {/* Paginación */}
                                    {paginationRecuperacion && paginationRecuperacion.pages > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Página {paginationRecuperacion.page} de {paginationRecuperacion.pages} ({paginationRecuperacion.total} órdenes)
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageRecuperacion(prev => Math.max(1, prev - 1))}
                                                    disabled={!paginationRecuperacion.hasPrev}
                                                >
                                                    Anterior
                                                </Button>
                                                <span className="text-sm">
                                                    Página {paginationRecuperacion.page} de {paginationRecuperacion.pages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageRecuperacion(prev => prev + 1)}
                                                    disabled={!paginationRecuperacion.hasNext}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: No Recuperadas */}
                <TabsContent value="no-recuperadas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes No Recuperadas</CardTitle>
                            <CardDescription>
                                Órdenes asignadas con 6 o más días que requieren atención prioritaria.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordenesNoRecuperadas.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay órdenes no recuperadas</h3>
                                    <p className="text-muted-foreground">
                                        No tienes órdenes asignadas con 6 o más días sin recuperar
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ordenesNoRecuperadas.map(orden => renderOrdenCard(orden, true))}
                                    </div>

                                    {/* Paginación */}
                                    {paginationNoRecuperadas && paginationNoRecuperadas.pages > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Página {paginationNoRecuperadas.page} de {paginationNoRecuperadas.pages} ({paginationNoRecuperadas.total} órdenes)
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageNoRecuperadas(prev => Math.max(1, prev - 1))}
                                                    disabled={!paginationNoRecuperadas.hasPrev}
                                                >
                                                    Anterior
                                                </Button>
                                                <span className="text-sm">
                                                    Página {paginationNoRecuperadas.page} de {paginationNoRecuperadas.pages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageNoRecuperadas(prev => prev + 1)}
                                                    disabled={!paginationNoRecuperadas.hasNext}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Panel de gestión de recuperación */}
            <AgentOrderPanel
                isOpen={isOrderPanelOpen}
                onOpenChange={setIsOrderPanelOpen}
                selectedOrder={selectedOrder}
                callStatuses={callStatuses}
                onOrderUpdate={() => {
                    // Recargar las órdenes cuando se actualice una
                    loadOrdenes();
                }}
            />
        </div>
    );
};

export default AgentOrdenesRecuperacion;