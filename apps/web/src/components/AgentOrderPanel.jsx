import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    Phone,
    Calendar,
    User,
    AlertCircle,
    FileText
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useAuth } from '@/contexts/auth-context';
import CalendarioAgendamiento from '@/components/CalendarioAgendamiento';
import useScheduleValidation from '@/hooks/use-schedule-validation';

const AgentOrderPanel = ({
    isOpen,
    onOpenChange,
    selectedOrder,
    callStatuses,
    onOrderUpdate
}) => {
    const { showToast } = useNotificationContext();
    const { user } = useAuth();
    const { validationState, validateRealTime, clearValidations } = useScheduleValidation();

    // Estados para el flujo mejorado
    const [allModalities, setAllModalities] = useState([]);
    const [availableSedesByModality, setAvailableSedesByModality] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);
    const [selectedSede, setSelectedSede] = useState(null);
    const [selectedModality, setSelectedModality] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [calendarSelectedDate, setCalendarSelectedDate] = useState('');

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

    // Nueva función para cargar todas las modalidades disponibles
    const loadAllModalities = async () => {
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
    };

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
                return data.data || []; // Retornar los sedes para filtrar
            }
        } catch (error) {
            console.error('Error loading sedes by modality:', error);
        }
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
                fetch(API_ROUTES.CONTACT_AGENT.APPOINTMENTS, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(appointmentBody)
                })
                    .then(res => {
                        console.log('appointmentResponse');
                        console.log(res);

                        if (!res.ok) {
                            // It's good practice to throw an error here so the .catch block handles it
                            return res.json().then(err => { throw new Error(`Error al crear el agendamiento: ${err.message || res.statusText}`); });
                        }
                        return res; // Pass the response along if it's OK
                    })
                    .then(appointmentResponse => {
                        console.log('appointmentResponse2'); // This will be the same as the first console.log(res) if successful
                        console.log(appointmentResponse);
                        showToast('Llamada registrada y agendamiento creado exitosamente', 'success');
                    })
                    .catch(error => {
                        console.error("Fetch error:", error);
                        showToast(`Error: ${error.message}`, 'error');
                    });
            } else {
                showToast('Llamada registrada exitosamente', 'success');
            }
            onOpenChange(false);
            if (onOrderUpdate) {
                onOrderUpdate();
            }
        } catch (error) {
            showToast('Error al registrar la llamada o agendamiento', 'error');
        }
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
            if (sede.department_id === parseInt(departmentId) && sede.city_id && !cityIds.has(sede.city_id)) {
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
        const sedes = availableSedesByModality.filter(sede => sede.city_id === parseInt(cityId));
        setFilteredSedes(sedes);
    };

    // Nueva función para manejar la selección de sede
    const handleSedeChange = (sedeId) => {
        const selectedSedeData = filteredSedes.find(sede => sede.id.toString() === sedeId);
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

    // Cargar modalidades cuando se abre el panel
    if (isOpen && allModalities.length === 0) {
        loadAllModalities();
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
                                            {selectedOrder.callLogs
                                                .sort((a, b) => new Date(b.call_time) - new Date(a.call_time))
                                                .slice(0, 5).map((callLog, index) => (
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
                                                        <div className="space-y-4">
                                                            {/* Modalidad de Inspección - PRIMER PASO */}
                                                            <div>
                                                                <Label htmlFor="modality">Modalidad de Inspección *</Label>
                                                                <Select
                                                                    value={selectedModality}
                                                                    onValueChange={handleModalityChange}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue
                                                                            placeholder="Selecciona modalidad de inspección"
                                                                            value={allModalities.find(m => m.id.toString() === selectedModality)?.name || ''}
                                                                        />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="w-full">
                                                                        {allModalities.map((modality) => (
                                                                            <SelectItem key={modality.id} value={modality.id.toString()}>
                                                                                <div className="flex justify-between w-full items-center">
                                                                                    <span>{modality.name}</span>
                                                                                    <span className="text-xs text-muted-foreground ml-2">{modality.sedesCount} sedes</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Selecciona la modalidad para ver las sedes disponibles
                                                                </p>
                                                            </div>

                                                            {/* Departamento - SEGUNDO PASO */}
                                                            {filteredDepartments.length > 0 && (
                                                                <div>
                                                                    <Label htmlFor="department">Departamento *</Label>
                                                                    <Select
                                                                        value={selectedDepartment}
                                                                        onValueChange={handleDepartmentChange}
                                                                        disabled={!selectedModality}
                                                                        className="w-full"
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue
                                                                                placeholder="Selecciona un departamento"
                                                                                value={filteredDepartments.find(d => d.id.toString() === selectedDepartment)?.name || ''}
                                                                            />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="w-full">
                                                                            {filteredDepartments.map((department) => (
                                                                                <SelectItem key={department.id} value={department.id.toString()}>
                                                                                    <div className="flex justify-between w-full items-center">
                                                                                        <span>{department.name}</span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Selecciona el departamento para ver las ciudades disponibles
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Ciudad - TERCER PASO */}
                                                            {filteredCities.length > 0 && (
                                                                <div>
                                                                    <Label htmlFor="city">Ciudad *</Label>
                                                                    <Select
                                                                        value={selectedCity}
                                                                        onValueChange={handleCityChange}
                                                                        disabled={!selectedDepartment}
                                                                        className="w-full"
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue
                                                                                placeholder="Selecciona una ciudad"
                                                                                value={filteredCities.find(c => c.id.toString() === selectedCity)?.name || ''}
                                                                            />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="w-full">
                                                                            {filteredCities.map((city) => (
                                                                                <SelectItem key={city.id} value={city.id.toString()}>
                                                                                    <div className="flex justify-between w-full items-center">
                                                                                        <span>{city.name}</span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Selecciona la ciudad para ver las sedes disponibles
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Sede - CUARTO PASO */}
                                                            {filteredSedes.length > 0 && (
                                                                <div>
                                                                    <Label htmlFor="sede">Centro de Diagnóstico Automotor (CDA) *</Label>
                                                                    <Select
                                                                        value={appointmentForm.sede_id}
                                                                        onValueChange={handleSedeChange}
                                                                        disabled={!selectedCity}
                                                                        className="w-full"
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue
                                                                                placeholder="Selecciona un CDA"
                                                                                // Solo muestra el nombre de la sede seleccionada
                                                                                value={filteredSedes.find(s => s.id.toString() === appointmentForm.sede_id)?.name || ''}
                                                                            />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="w-full">
                                                                            {filteredSedes.map((sede) => (
                                                                                <SelectItem key={sede.id} value={sede.id.toString()}>
                                                                                    <div className="flex justify-between w-full items-center">
                                                                                        <span className="font-medium">{sede.name}</span>
                                                                                        <span className="text-xs text-muted-foreground ml-2">{sede.address}</span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Solo se muestran Centros de Diagnóstico Automotor (CDA) para agendar inspecciones de asegurabilidad
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Calendario y Horarios Disponibles */}
                                                            {
                                                                (!(!appointmentForm.sede_id || !selectedModality)) && <>
                                                                    <div className="space-y-4">
                                                                        <Label>Selecciona Fecha y Horario para Inspección de Asegurabilidad *</Label>
                                                                        <CalendarioAgendamiento
                                                                            sedeId={appointmentForm.sede_id}
                                                                            modalityId={selectedModality}
                                                                            onSlotSelect={handleSlotSelect}
                                                                            selectedSlot={selectedSlot}
                                                                            disabled={!appointmentForm.sede_id || !selectedModality}
                                                                            onDateChange={handleCalendarDateChange}
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
                                                                </>
                                                            }

                                                            {/* Dirección (solo si es modalidad domicilio) */}
                                                            {selectedModality && allModalities.find(m => m.id.toString() === selectedModality)?.code === 'DOMICILIO' && (
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
    );
};

export default AgentOrderPanel; 