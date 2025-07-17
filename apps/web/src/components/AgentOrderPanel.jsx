import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Phone,
    Calendar,
    User,
    Clock,
    PhoneCall,
    CheckCircle,
    XCircle,
    AlertCircle,
    MapPin,
    FileText
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import CalendarioAgendamiento from './CalendarioAgendamiento';
import useScheduleValidation from '@/hooks/use-schedule-validation';
import CallHistory from './CallHistory';

const AgentOrderPanel = ({
    isOpen,
    onOpenChange,
    order,
    callStatuses = [],
    inspectionTypes = [],
    departments = [],
    cities = [],
    sedes = [],
    modalities = [],
    onOrderUpdated,
    onPanelClose
}) => {
    const [activeTab, setActiveTab] = useState('call');
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [calendarSelectedDate, setCalendarSelectedDate] = useState('');
    
    // Estados para el flujo de agendamiento
    const [allModalities, setAllModalities] = useState([]);
    const [availableSedesByModality, setAvailableSedesByModality] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);
    const [selectedSede, setSelectedSede] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedModality, setSelectedModality] = useState('');

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

    const { showToast } = useNotificationContext();
    const { validationState, validateRealTime, clearValidations } = useScheduleValidation();

    // Cargar modalidades al abrir el panel
    useEffect(() => {
        if (isOpen && order) {
            loadAllModalities();
        }
    }, [isOpen, order]);

    // Validar en tiempo real cuando cambian los parámetros del agendamiento
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
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [
        appointmentForm.sede_id,
        selectedModality,
        appointmentForm.inspection_type_id,
        appointmentForm.fecha_inspeccion,
        appointmentForm.hora_inspeccion
    ]);

    // Seleccionar automáticamente la modalidad si solo hay una opción
    useEffect(() => {
        if (modalities.length === 1 && !selectedModality) {
            setSelectedModality(modalities[0].id.toString());
            setAppointmentForm(prev => ({
                ...prev,
                inspection_modality_id: modalities[0].id.toString()
            }));
        }
    }, [modalities, selectedModality]);

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

    const handleCallSubmit = async (e) => {
        e.preventDefault();
        if (!order || !callForm.call_status_id) {
            showToast('Selecciona un estado de llamada', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const callData = {
                inspection_order_id: order.id,
                call_status_id: callForm.call_status_id,
                observaciones: callForm.observaciones,
                fecha_seguimiento: callForm.fecha_seguimiento
            };

            // Si hay agendamiento, incluir esos datos
            if (showAppointmentForm && appointmentForm.fecha_inspeccion && appointmentForm.hora_inspeccion) {
                Object.assign(callData, {
                    create_appointment: true,
                    appointment_data: appointmentForm
                });
            }

            const response = await fetch(API_ROUTES.CONTACT_AGENT.CALLS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(callData)
            });

            if (response.ok) {
                const result = await response.json();
                if (showAppointmentForm && appointmentForm.fecha_inspeccion && appointmentForm.hora_inspeccion) {
                    showToast('Llamada registrada y agendamiento creado exitosamente', 'success');
                } else {
                    showToast('Llamada registrada exitosamente', 'success');
                }
                onOrderUpdated?.();
                onPanelClose?.();
            } else {
                throw new Error('Error al registrar la llamada');
            }
        } catch (error) {
            showToast('Error al registrar la llamada o agendamiento', 'error');
        }
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        if (!order || !appointmentForm.fecha_inspeccion || !appointmentForm.hora_inspeccion) {
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
                    inspection_order_id: order.id,
                    ...appointmentForm
                })
            });

            if (response.ok) {
                showToast('Agendamiento creado exitosamente', 'success');
                onOrderUpdated?.();
                onPanelClose?.();
            } else {
                throw new Error('Error al crear el agendamiento');
            }
        } catch (error) {
            console.error('Error submitting appointment:', error);
            showToast('Error al crear el agendamiento', 'error');
        }
    };

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

    // Función para detectar si el estado seleccionado requiere agendamiento
    const handleCallStatusChange = (statusId) => {
        setCallForm(prev => ({
            ...prev,
            call_status_id: statusId
        }));

        const selectedStatus = callStatuses.find(status => status.id.toString() === statusId);
        const needsScheduling = selectedStatus?.creates_schedule;

        setShowAppointmentForm(needsScheduling);
    };

    // Manejar selección de modalidad
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
        loadSedesByModality(modalityId);
    };

    // Manejar selección de departamento
    const handleDepartmentChange = (departmentId) => {
        setSelectedDepartment(departmentId);
        setSelectedCity('');
        setSelectedSede(null);
        setAppointmentForm(prev => ({ ...prev, sede_id: '' }));
        setSelectedSlot(null);
        setCalendarSelectedDate('');
        
        const cities = availableSedesByModality
            .filter(sede => sede.department_id === parseInt(departmentId))
            .map(sede => sede.city)
            .filter((city, index, arr) => arr.findIndex(c => c.id === city.id) === index);
        setFilteredCities(cities);
    };

    // Manejar selección de ciudad
    const handleCityChange = (cityId) => {
        setSelectedCity(cityId);
        setSelectedSede(null);
        setAppointmentForm(prev => ({ ...prev, sede_id: '' }));
        setSelectedSlot(null);
        setCalendarSelectedDate('');
        
        const sedes = availableSedesByModality.filter(sede => sede.city_id === parseInt(cityId));
        setFilteredSedes(sedes);
    };

    // Manejar selección de sede
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

    if (!order) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto py-2 px-4">
                <SheetHeader>
                    <SheetTitle>Gestionar Orden #{order.numero}</SheetTitle>
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
                                <span>{order.cliente_nombre}</span>
                                <span className="font-medium">Teléfono:</span>
                                <span>{order.cliente_telefono}</span>
                                <span className="font-medium">Email:</span>
                                <span>{order.cliente_email}</span>
                                <span className="font-medium">Placa:</span>
                                <span className="font-mono">{order.vehiculo_placa}</span>
                                <span className="font-medium">Marca:</span>
                                <span>{order.vehiculo_marca}</span>
                                <span className="font-medium">Modelo:</span>
                                <span>{order.vehiculo_modelo}</span>
                                <span className="font-medium">Intentos de contacto:</span>
                                <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                                        (order.callLogsCount || order.callLogs?.length || 0) === 0
                                            ? 'bg-gray-100 text-gray-600'
                                            : (order.callLogsCount || order.callLogs?.length || 0) <= 2
                                                ? 'bg-blue-100 text-blue-700'
                                                : (order.callLogsCount || order.callLogs?.length || 0) <= 4
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                        {order.callLogsCount || order.callLogs?.length || 0} intentos
                                    </span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Call History */}
                    {order.callLogs && order.callLogs.length > 0 && (
                        <CallHistory
                            callLogs={order.callLogs}
                            title="Historial de Llamadas"
                            maxHeight="max-h-40"
                            showLimit={5}
                        />
                    )}

                    {/* Tabs for Call Registration and Appointment Scheduling */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="call">Registrar Llamada</TabsTrigger>
                            <TabsTrigger value="appointment">Agendar Inspección</TabsTrigger>
                        </TabsList>

                        {/* Call Registration Tab */}
                        <TabsContent value="call" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Registro de Llamada</CardTitle>
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
                                                            {status.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="observaciones">Observaciones</Label>
                                            <Input
                                                id="observaciones"
                                                placeholder="Detalles de la llamada..."
                                                value={callForm.observaciones}
                                                onChange={(e) => setCallForm(prev => ({
                                                    ...prev,
                                                    observaciones: e.target.value
                                                }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="fecha_seguimiento">Fecha de Seguimiento</Label>
                                            <Input
                                                id="fecha_seguimiento"
                                                type="date"
                                                value={callForm.fecha_seguimiento}
                                                onChange={(e) => setCallForm(prev => ({
                                                    ...prev,
                                                    fecha_seguimiento: e.target.value
                                                }))}
                                            />
                                        </div>

                                        {/* Appointment Form (shown when status requires scheduling) */}
                                        {showAppointmentForm && (
                                            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-blue-800">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">Agendar Inspección</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="fecha_inspeccion">Fecha *</Label>
                                                        <Input
                                                            id="fecha_inspeccion"
                                                            type="date"
                                                            value={appointmentForm.fecha_inspeccion}
                                                            onChange={(e) => setAppointmentForm(prev => ({
                                                                ...prev,
                                                                fecha_inspeccion: e.target.value
                                                            }))}
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="hora_inspeccion">Hora *</Label>
                                                        <Input
                                                            id="hora_inspeccion"
                                                            type="time"
                                                            value={appointmentForm.hora_inspeccion}
                                                            onChange={(e) => setAppointmentForm(prev => ({
                                                                ...prev,
                                                                hora_inspeccion: e.target.value
                                                            }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="direccion_inspeccion">Dirección de Inspección</Label>
                                                    <Input
                                                        id="direccion_inspeccion"
                                                        placeholder="Dirección específica..."
                                                        value={appointmentForm.direccion_inspeccion}
                                                        onChange={(e) => setAppointmentForm(prev => ({
                                                            ...prev,
                                                            direccion_inspeccion: e.target.value
                                                        }))}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="observaciones_agendamiento">Observaciones del Agendamiento</Label>
                                                    <Input
                                                        id="observaciones_agendamiento"
                                                        placeholder="Notas adicionales..."
                                                        value={appointmentForm.observaciones}
                                                        onChange={(e) => setAppointmentForm(prev => ({
                                                            ...prev,
                                                            observaciones: e.target.value
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button type="submit" className="flex-1">
                                                <PhoneCall className="h-4 w-4 mr-2" />
                                                Registrar Llamada
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Appointment Scheduling Tab */}
                        <TabsContent value="appointment" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Agendar Inspección</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                                        {/* Modality Selection */}
                                        <div>
                                            <Label htmlFor="modality">Modalidad de Inspección *</Label>
                                            <Select
                                                value={selectedModality}
                                                onValueChange={handleModalityChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona la modalidad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allModalities.map((modality) => (
                                                        <SelectItem key={modality.id} value={modality.id.toString()}>
                                                            {modality.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Department Selection */}
                                        {selectedModality && (
                                            <div>
                                                <Label htmlFor="department">Departamento</Label>
                                                <Select
                                                    value={selectedDepartment}
                                                    onValueChange={handleDepartmentChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona el departamento" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredDepartments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* City Selection */}
                                        {selectedDepartment && (
                                            <div>
                                                <Label htmlFor="city">Ciudad</Label>
                                                <Select
                                                    value={selectedCity}
                                                    onValueChange={handleCityChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona la ciudad" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredCities.map((city) => (
                                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                                {city.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Sede Selection */}
                                        {selectedCity && (
                                            <div>
                                                <Label htmlFor="sede">Sede *</Label>
                                                <Select
                                                    value={appointmentForm.sede_id}
                                                    onValueChange={handleSedeChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona la sede" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredSedes.map((sede) => (
                                                            <SelectItem key={sede.id} value={sede.id.toString()}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{sede.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {sede.address}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Calendar and Time Slots */}
                                        {appointmentForm.sede_id && selectedModality && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Seleccionar Fecha y Hora</Label>
                                                    <CalendarioAgendamiento
                                                        sedeId={appointmentForm.sede_id}
                                                        modalityId={selectedModality}
                                                        onSlotSelect={handleSlotSelect}
                                                        onDateChange={handleCalendarDateChange}
                                                        selectedDate={calendarSelectedDate}
                                                        validationState={validationState}
                                                    />
                                                </div>

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
                                            </div>
                                        )}

                                        {/* Additional Fields */}
                                        <div>
                                            <Label htmlFor="direccion_inspeccion">Dirección de Inspección</Label>
                                            <Input
                                                id="direccion_inspeccion"
                                                placeholder="Dirección específica..."
                                                value={appointmentForm.direccion_inspeccion}
                                                onChange={(e) => setAppointmentForm(prev => ({
                                                    ...prev,
                                                    direccion_inspeccion: e.target.value
                                                }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="observaciones">Observaciones</Label>
                                            <Input
                                                id="observaciones"
                                                placeholder="Notas adicionales..."
                                                value={appointmentForm.observaciones}
                                                onChange={(e) => setAppointmentForm(prev => ({
                                                    ...prev,
                                                    observaciones: e.target.value
                                                }))}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" className="flex-1">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Crear Agendamiento
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AgentOrderPanel; 