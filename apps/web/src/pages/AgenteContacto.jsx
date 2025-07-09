import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Phone,
    Calendar,
    User,
    Clock,
    PhoneCall,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    MapPin,
    FileText
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/contexts/auth-context';
import CalendarioAgendamiento from '@/components/CalendarioAgendamiento';
import useScheduleValidation from '@/hooks/use-schedule-validation';

export default function AgenteContacto() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [callStatuses, setCallStatuses] = useState([]);
    const [inspectionTypes, setInspectionTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [modalities, setModalities] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedModality, setSelectedModality] = useState('');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('call');
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [calendarSelectedDate, setCalendarSelectedDate] = useState('');
    const { showToast } = useNotificationContext();
    const { isConnected } = useWebSocket();
    const { user } = useAuth();
    const { validationState, validateRealTime, clearValidations } = useScheduleValidation();

    // Estados del formulario
    const [callForm, setCallForm] = useState({
        call_status_id: '',
        observaciones: '',
        fecha_seguimiento: ''
    });

    const [appointmentForm, setAppointmentForm] = useState({
        fecha_inspeccion: '',
        hora_inspeccion: '',
        direccion_inspeccion: '',
        inspection_type_id: '',
        sede_id: '',
        observaciones: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Escuchar eventos de asignación de órdenes
    useEffect(() => {
        const handleOrderAssigned = (event) => {
            console.log('🎯 Orden asignada recibida en AgenteContacto:', event.detail);

            const { order, message, type, data } = event.detail;

            // Mostrar notificación específica según el tipo
            let notificationMessage = '¡Nueva orden asignada! Actualizando lista...';
            let notificationType = 'info';

            if (type === 'reasignacion_orden') {
                notificationMessage = `¡Orden reasignada! ${order?.numero || ''} - Actualizando lista...`;
                notificationType = 'info';
            } else if (type === 'asignacion_orden') {
                notificationMessage = `¡Nueva orden asignada! ${order?.numero || ''} - Actualizando lista...`;
                notificationType = 'success';
            }

            showToast(notificationMessage, notificationType, 4000);

            // Recargar las órdenes para mostrar la nueva asignación
            loadOrders();
        };

        const handleOrderRemoved = (event) => {
            console.log('🗑️ Orden removida recibida en AgenteContacto:', event.detail);

            const { order, message, type, data } = event.detail;

            // Mostrar notificación de advertencia
            const notificationMessage = `⚠️ Orden ${order?.numero || ''} removida de tu asignación - Actualizando lista...`;
            showToast(notificationMessage, 'warning', 4000);

            // Recargar las órdenes para reflejar la remoción
            loadOrders();
        };

        console.log('👂 Listeners de orderAssigned y orderRemoved registrados en AgenteContacto');
        window.addEventListener('orderAssigned', handleOrderAssigned);
        window.addEventListener('orderRemoved', handleOrderRemoved);

        return () => {
            console.log('🗑️ Removiendo listeners de orderAssigned y orderRemoved en AgenteContacto');
            window.removeEventListener('orderAssigned', handleOrderAssigned);
            window.removeEventListener('orderRemoved', handleOrderRemoved);
        };
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            loadCities(selectedDepartment);
        } else {
            setCities([]);
        }
        setSelectedCity('');
        setSedes([]);
    }, [selectedDepartment]);

    useEffect(() => {
        if (selectedCity) {
            loadSedes(selectedCity);
        } else {
            setSedes([]);
        }
    }, [selectedCity]);

    // Validar en tiempo real cuando cambian los parámetros del agendamiento (con debounce)
    useEffect(() => {
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
        }, 500); // 500ms debounce para evitar validaciones excesivas

        return () => clearTimeout(timeoutId);
    }, [
        appointmentForm.sede_id,
        selectedModality,
        appointmentForm.inspection_type_id,
        appointmentForm.fecha_inspeccion,
        appointmentForm.hora_inspeccion
    ]);

    // useEffect para seleccionar automáticamente la modalidad si solo hay una opción
    useEffect(() => {
        if (modalities.length === 1 && !selectedModality) {
            setSelectedModality(modalities[0].id.toString());
            setAppointmentForm(prev => ({
                ...prev,
                inspection_modality_id: modalities[0].id.toString()
            }));
        }
    }, [modalities, selectedModality]);

    // Solo escuchamos 'call_logged' para feedback visual inmediato.
    // El backend también emite 'order_status_updated' al agendar, pero no mostramos toast aquí.
    // En el futuro puedes agregar un listener específico para agendamientos si lo deseas.
    useEffect(() => {
        const handleCallLogged = (event) => {
            const { order_number, message, agent_id } = event.detail;
            if (user && String(agent_id) === String(user.id)) {
                showToast(message || `Llamada registrada para la orden #${order_number}`, 'success');
                loadOrders();
            }
        };
        window.addEventListener('call_logged', handleCallLogged);
        return () => {
            window.removeEventListener('call_logged', handleCallLogged);
        };
    }, [showToast, user]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadOrders(),
                loadCallStatuses(),
                loadInspectionTypes(),
                loadDepartments()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast('Error al cargar los datos iniciales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const url = new URL(API_ROUTES.CONTACT_AGENT.ORDERS);
            if (searchTerm) {
                url.searchParams.append('search', searchTerm);
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            } else {
                throw new Error('Error al cargar órdenes');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            showToast('Error al cargar las órdenes', 'error');
        }
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

    const loadInspectionTypes = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.INSPECTION_TYPES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInspectionTypes(data);
            }
        } catch (error) {
            console.error('Error loading inspection types:', error);
        }
    };

    const loadDepartments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.DEPARTMENTS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    };

    const loadCities = async (departmentId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.CITIES(departmentId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCities(data);
            }
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    };

    const loadSedes = async (cityId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.SEDES(cityId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSedes(data);
            }
        } catch (error) {
            console.error('Error loading sedes:', error);
        }
    };

    const loadModalities = async (departmentId, cityId) => {
        if (!departmentId || !cityId) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.CONTACT_AGENT.MODALITIES}?departmentId=${departmentId}&cityId=${cityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setModalities(data.data || []);
            }
        } catch (error) {
            console.error('Error loading modalities:', error);
        }
    };

    const loadAvailableSedes = async (modalityId, cityId) => {
        if (!modalityId || !cityId) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.CONTACT_AGENT.AVAILABLE_SEDES}?modalityId=${modalityId}&cityId=${cityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSedes(data.data || []);
            }
        } catch (error) {
            console.error('Error loading available sedes:', error);
        }
    };

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true);
        setActiveTab('call'); // Siempre empezar en la pestaña de llamada
        setShowAppointmentForm(false); // Ocultar formulario de agendamiento

        // Reset forms
        setCallForm({
            call_status_id: '',
            observaciones: '',
            fecha_seguimiento: ''
        });
        setAppointmentForm({
            fecha_inspeccion: '',
            hora_inspeccion: '',
            direccion_inspeccion: '',
            inspection_type_id: '',
            inspection_modality_id: '',
            sede_id: '',
            observaciones: ''
        });
    };

    // Cambiar handleCallSubmit para manejar ambos procesos
    const handleCallSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !callForm.call_status_id) {
            showToast('Selecciona un estado de llamada', 'warning');
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            // 1. Registrar llamada
            const callResponse = await fetch(API_ROUTES.CONTACT_AGENT.CALL_LOGS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inspection_order_id: selectedOrder.id,
                    ...callForm,
                    fecha_seguimiento: new Date().toISOString()
                })
            });
            if (!callResponse.ok) throw new Error('Error al registrar la llamada');
            const callData = await callResponse.json();
            // 2. Si requiere agendamiento, registrar agendamiento
            const selectedStatus = callStatuses.find(status => status.id.toString() === callForm.call_status_id);

            if (selectedStatus?.creates_schedule) {
                if (!appointmentForm.fecha_inspeccion || !appointmentForm.hora_inspeccion) {
                    showToast('Completa la fecha y hora del agendamiento', 'warning');
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
                const appointmentResponse = await fetch(API_ROUTES.CONTACT_AGENT.APPOINTMENTS, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(appointmentBody)
                }).then(res => {
                    console.log(res);
                });
                if (!appointmentResponse.ok) throw new Error('Error al crear el agendamiento');
                showToast('Llamada registrada y agendamiento creado exitosamente', 'success');
            } else {
                showToast('Llamada registrada exitosamente', 'success');
            }
            setIsPanelOpen(false);
            await loadOrders();
        } catch (error) {
            showToast('Error al registrar la llamada o agendamiento', 'error');
        }
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !appointmentForm.fecha_inspeccion || !appointmentForm.hora_inspeccion) {
            showToast('Completa los campos obligatorios', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.APPOINTMENTS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inspection_order_id: selectedOrder.id,
                    ...appointmentForm
                })
            });

            if (response.ok) {
                showToast('Agendamiento creado exitosamente', 'success');
                await loadOrders(); // Refresh orders
                setIsPanelOpen(false);
            } else {
                throw new Error('Error al crear el agendamiento');
            }
        } catch (error) {
            console.error('Error submitting appointment:', error);
            showToast('Error al crear el agendamiento', 'error');
        }
    };

    const getStatusBadgeVariant = (status) => {
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
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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

    // Función para detectar si el estado seleccionado requiere agendamiento
    const handleCallStatusChange = (statusId) => {
        setCallForm(prev => ({
            ...prev,
            call_status_id: statusId
        }));

        // Verificar si el estado requiere agendamiento
        const selectedStatus = callStatuses.find(status => status.id.toString() === statusId);
        const needsScheduling = selectedStatus?.creates_schedule;

        setShowAppointmentForm(needsScheduling);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando órdenes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Agente de Contact Center</h1>
                        <p className="text-muted-foreground">
                            Gestiona llamadas a clientes y programa agendamientos de inspección
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${isConnected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Buscar Órdenes</CardTitle>
                    <CardDescription>
                        Encuentra órdenes por número, placa o cliente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Buscar por número de orden, placa, cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && loadOrders()}
                        />
                        <Button onClick={loadOrders}>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes Pendientes de Contacto</CardTitle>
                    <CardDescription>
                        {orders.length} órdenes encontradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Número</th>
                                    <th className="text-left p-2">Cliente</th>
                                    <th className="text-left p-2">Teléfono</th>
                                    <th className="text-left p-2">Placa</th>
                                    <th className="text-left p-2">Intentos</th>
                                    <th className="text-left p-2">Estado</th>
                                    <th className="text-left p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center p-8">
                                            <div className="text-muted-foreground">
                                                <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No se encontraron órdenes</p>
                                                <p className="text-sm">Todas las órdenes han sido contactadas</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2 font-mono">{order.numero}</td>
                                            <td className="p-2">{order.cliente_nombre}</td>
                                            <td className="p-2 font-mono">{order.cliente_telefono}</td>
                                            <td className="p-2 font-mono">{order.vehiculo_placa}</td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className={`font-medium text-sm px-2 py-1 rounded-full ${(order.callLogsCount || 0) === 0
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : (order.callLogsCount || 0) <= 2
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : (order.callLogsCount || 0) <= 4
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {order.callLogsCount || order.callLogs?.length || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <Badge variant={getStatusBadgeVariant(order.InspectionOrderStatus?.name)}>
                                                    {order.InspectionOrderStatus?.name || 'Sin estado'}
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOrderSelect(order)}
                                                >
                                                    <PhoneCall className="h-4 w-4 mr-2" />
                                                    Contactar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Side Panel */}
            <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto py-2 px-4">
                    {selectedOrder && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Gestionar Orden #{selectedOrder.numero}</SheetTitle>
                                <SheetDescription>
                                    Registra la llamada o agenda una inspección
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex flex-col gap-4">
                                {/* Order Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Detalles de la Orden</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <span className="font-medium">Cliente:</span>
                                            <span>{selectedOrder.cliente_nombre}</span>
                                            <span className="font-medium">Teléfono:</span>
                                            <span>{selectedOrder.cliente_telefono}</span>
                                            <span className="font-medium">Email:</span>
                                            <span>{selectedOrder.cliente_email}</span>
                                            <span className="font-medium">Placa:</span>
                                            <span className="font-mono">{selectedOrder.vehiculo_placa}</span>
                                            <span className="font-medium">Marca:</span>
                                            <span>{selectedOrder.vehiculo_marca}</span>
                                            <span className="font-medium">Modelo:</span>
                                            <span>{selectedOrder.vehiculo_modelo}</span>
                                            <span className="font-medium">Intentos de contacto:</span>
                                            <span className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className={`font-medium text-sm px-2 py-1 rounded-full ${(selectedOrder.callLogsCount || selectedOrder.callLogs?.length || 0) === 0
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : (selectedOrder.callLogsCount || selectedOrder.callLogs?.length || 0) <= 2
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : (selectedOrder.callLogsCount || selectedOrder.callLogs?.length || 0) <= 4
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {selectedOrder.callLogsCount || selectedOrder.callLogs?.length || 0} intentos
                                                </span>
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Call History */}
                                {selectedOrder.callLogs && selectedOrder.callLogs.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Historial de Llamadas
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 max-h-40 overflow-y-auto">
                                                {selectedOrder.callLogs.slice(0, 5).map((callLog, index) => (
                                                    <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-4 border-blue-500">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                <span className="font-medium text-sm">
                                                                    {callLog.status?.name || 'Estado desconocido'}
                                                                </span>
                                                            </div>
                                                            <span className="text-muted-foreground text-xs">
                                                                {formatDateTime(callLog.call_time)}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3" />
                                                                <span>
                                                                    Agente: {callLog.Agent?.name || 'No especificado'}
                                                                </span>
                                                            </div>

                                                            {callLog.comments && (
                                                                <div className="flex items-start gap-2 mt-2">
                                                                    <FileText className="h-3 w-3 mt-0.5" />
                                                                    <span className="text-xs italic">
                                                                        "{callLog.comments}"
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {selectedOrder.callLogs.length > 5 && (
                                                    <div className="text-center text-xs text-muted-foreground py-2">
                                                        y {selectedOrder.callLogs.length - 5} llamadas más...
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Registrar Llamada</CardTitle>
                                        <CardDescription>
                                            Documenta el resultado de la llamada
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleCallSubmit} className="space-y-4">
                                            <div>
                                                <Label htmlFor="call_status">Estado de la Llamada *</Label>
                                                <Select
                                                    value={callForm.call_status_id}
                                                    onValueChange={handleCallStatusChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona el estado" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {callStatuses.map((status) => (
                                                            <SelectItem key={status.id} value={status.id.toString()}>
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span>{status.name}</span>
                                                                    {status.creates_schedule && (
                                                                        <div className="flex items-center gap-1 text-xs text-blue-600">
                                                                            <Calendar className="h-3 w-3" />
                                                                            <span>Requiere agenda</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="observaciones">Observaciones</Label>
                                                <Input
                                                    id="observaciones"
                                                    placeholder="Notas adicionales sobre la llamada"
                                                    value={callForm.observaciones}
                                                    onChange={(e) => setCallForm(prev => ({
                                                        ...prev,
                                                        observaciones: e.target.value
                                                    }))}
                                                />
                                            </div>

                                            <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    <span>La fecha de seguimiento se registrará automáticamente</span>
                                                </div>
                                            </div>

                                            {/* Formulario de agendamiento condicional */}
                                            {showAppointmentForm && (
                                                <div className="border-t pt-4 mt-4">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="text-base">Agendar Inspección</CardTitle>
                                                            <CardDescription>
                                                                Programa una cita para la inspección
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {/* Eliminar el form y el botón de submit aquí, solo mostrar los campos */}
                                                            <div className="space-y-4">
                                                                {/* Departamento */}
                                                                <div>
                                                                    <Label htmlFor="department">Departamento *</Label>
                                                                    <Select
                                                                        value={selectedDepartment}
                                                                        onValueChange={(value) => {
                                                                            setSelectedDepartment(value);
                                                                            setSelectedCity('');
                                                                            setSelectedModality('');
                                                                            setSedes([]);
                                                                            setModalities([]);
                                                                            if (value) {
                                                                                loadCities(value);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Selecciona departamento" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {departments.map((dept) => (
                                                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                                    {dept.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                {/* Ciudad */}
                                                                <div>
                                                                    <Label htmlFor="city">Ciudad *</Label>
                                                                    <Select
                                                                        value={selectedCity}
                                                                        onValueChange={(value) => {
                                                                            setSelectedCity(value);
                                                                            setSelectedModality('');
                                                                            setSedes([]);
                                                                            if (value && selectedDepartment) {
                                                                                loadModalities(selectedDepartment, value);
                                                                            }
                                                                        }}
                                                                        disabled={!selectedDepartment}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Selecciona ciudad" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {cities.map((city) => (
                                                                                <SelectItem key={city.id} value={city.id.toString()}>
                                                                                    {city.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                {/* Sede */}
                                                                <div>
                                                                    <Label htmlFor="sede">Centro de Diagnóstico Automotor (CDA) *</Label>
                                                                    <Select
                                                                        value={appointmentForm.sede_id}
                                                                        onValueChange={(value) => {
                                                                            setAppointmentForm(prev => ({
                                                                                ...prev,
                                                                                sede_id: value
                                                                            }));
                                                                            if (value) {
                                                                                loadModalities(selectedDepartment, selectedCity);
                                                                            }
                                                                        }}
                                                                        disabled={!selectedCity}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Selecciona un CDA" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {sedes.filter(sede => sede.sede_type_id === 1).length === 0 ? (
                                                                                <div className="p-2 text-xs text-muted-foreground">No hay CDAs disponibles para esta ciudad</div>
                                                                            ) : (
                                                                                sedes.filter(sede => sede.sede_type_id === 1).map((sede) => (
                                                                                    <SelectItem key={sede.id} value={sede.id.toString()}>
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-medium">{sede.name}</span>
                                                                                            <span className="text-xs text-muted-foreground">{sede.address}</span>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                ))
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Solo se muestran Centros de Diagnóstico Automotor (CDA) para agendar inspecciones de asegurabilidad
                                                                    </p>
                                                                </div>
                                                                {/* Modalidad (si hay más de una) */}
                                                                {modalities.length > 0 && (
                                                                    <div>
                                                                        <Label htmlFor="modality">Modalidad de Inspección *</Label>
                                                                        <Select
                                                                            value={selectedModality}
                                                                            onValueChange={(value) => {
                                                                                setSelectedModality(value);
                                                                                setAppointmentForm(prev => ({
                                                                                    ...prev,
                                                                                    inspection_modality_id: value
                                                                                }));
                                                                                setSelectedSlot(null);
                                                                            }}
                                                                            disabled={!appointmentForm.sede_id}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Selecciona modalidad" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {modalities.map((modality) => (
                                                                                    <SelectItem key={modality.id} value={modality.id.toString()}>
                                                                                        <div className="flex items-center justify-between w-full">
                                                                                            <span>{modality.name}</span>
                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {modality.sedesCount} sedes
                                                                                            </span>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}
                                                                {/* Calendario y Horarios Disponibles */}
                                                                <div className="space-y-4">
                                                                    <Label>Selecciona Fecha y Horario para Inspección de Asegurabilidad *</Label>
                                                                    <CalendarioAgendamiento
                                                                        sedeId={appointmentForm.sede_id}
                                                                        modalityId={selectedModality}
                                                                        onSlotSelect={handleSlotSelect}
                                                                        selectedSlot={selectedSlot}
                                                                        disabled={!appointmentForm.sede_id || !selectedModality}
                                                                        onDateChange={handleCalendarDateChange} // CONECTA EL CALLBACK
                                                                    />
                                                                    {/* Mostrar slot seleccionado */}
                                                                    {selectedSlot && (
                                                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                            <div className="flex items-center gap-2 text-blue-800">
                                                                                <Calendar className="h-4 w-4" />
                                                                                <span className="font-medium">Inspección de Asegurabilidad - Horario seleccionado:</span>
                                                                            </div>
                                                                            <div className="mt-1 text-sm text-blue-700">
                                                                                <div>Fecha: {appointmentForm.fecha_inspeccion}</div>
                                                                                <div>Hora: {selectedSlot.startTime} - {selectedSlot.endTime}</div>
                                                                                <div>Capacidad disponible: {selectedSlot.availableCapacity}/{selectedSlot.totalCapacity}</div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {validationState.errors.slot && (
                                                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                            <div className="flex items-center gap-2 text-red-800">
                                                                                <AlertCircle className="h-4 w-4" />
                                                                                <span className="text-sm">{validationState.errors.slot}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {/* Dirección (solo si es modalidad domicilio) */}
                                                                {selectedModality && modalities.find(m => m.id.toString() === selectedModality)?.code === 'DOMICILIO' && (
                                                                    <div>
                                                                        <Label htmlFor="direccion_inspeccion">Dirección de Inspección *</Label>
                                                                        <Input
                                                                            id="direccion_inspeccion"
                                                                            placeholder="Dirección donde se realizará la inspección"
                                                                            value={appointmentForm.direccion_inspeccion}
                                                                            onChange={(e) => setAppointmentForm(prev => ({
                                                                                ...prev,
                                                                                direccion_inspeccion: e.target.value
                                                                            }))}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {/* Observaciones */}
                                                                <div>
                                                                    <Label htmlFor="observaciones_appointment">Observaciones</Label>
                                                                    <Input
                                                                        id="observaciones_appointment"
                                                                        placeholder="Notas adicionales del agendamiento"
                                                                        value={appointmentForm.observaciones}
                                                                        onChange={(e) => setAppointmentForm(prev => ({
                                                                            ...prev,
                                                                            observaciones: e.target.value
                                                                        }))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}

                                            <Button type="submit" className="w-full">
                                                <Phone className="h-4 w-4 mr-2" />
                                                Registrar Llamada{showAppointmentForm ? ' y Agendar' : ''}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
} 