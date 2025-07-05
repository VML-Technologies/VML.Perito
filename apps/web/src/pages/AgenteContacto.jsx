import { useState, useEffect } from 'react';
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
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { showToast } = useNotificationContext();
    const { isConnected } = useWebSocket();
    const { user } = useAuth();

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

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true);

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
            sede_id: '',
            observaciones: ''
        });
    };

    const handleCallSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !callForm.call_status_id) {
            showToast('Selecciona un estado de llamada', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.CONTACT_AGENT.CALL_LOGS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inspection_order_id: selectedOrder.id,
                    ...callForm
                })
            });

            if (response.ok) {
                showToast('Llamada registrada exitosamente', 'success');
                await loadOrders(); // Refresh orders
                setIsPanelOpen(false);
            } else {
                throw new Error('Error al registrar la llamada');
            }
        } catch (error) {
            console.error('Error submitting call:', error);
            showToast('Error al registrar la llamada', 'error');
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
                        <h1 className="text-3xl font-bold">Agente de Contact</h1>
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
                                    <th className="text-left p-2">Estado</th>
                                    <th className="text-left p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-8">
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
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Gestionar Orden #{selectedOrder.numero}</SheetTitle>
                                <SheetDescription>
                                    Registra la llamada o agenda una inspección
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
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
                                        </div>
                                    </CardContent>
                                </Card>

                                <Tabs defaultValue="call" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="call">Registrar Llamada</TabsTrigger>
                                        <TabsTrigger value="appointment">Agendar Inspección</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="call">
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
                                                            onValueChange={(value) => setCallForm(prev => ({
                                                                ...prev,
                                                                call_status_id: value
                                                            }))}
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
                                                            placeholder="Notas adicionales sobre la llamada"
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
                                                            type="datetime-local"
                                                            value={callForm.fecha_seguimiento}
                                                            onChange={(e) => setCallForm(prev => ({
                                                                ...prev,
                                                                fecha_seguimiento: e.target.value
                                                            }))}
                                                        />
                                                    </div>

                                                    <Button type="submit" className="w-full">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Registrar Llamada
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="appointment">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Agendar Inspección</CardTitle>
                                                <CardDescription>
                                                    Programa una cita para la inspección
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-2">
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
                                                        <Label htmlFor="inspection_type">Tipo de Inspección</Label>
                                                        <Select
                                                            value={appointmentForm.inspection_type_id}
                                                            onValueChange={(value) => setAppointmentForm(prev => ({
                                                                ...prev,
                                                                inspection_type_id: value
                                                            }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecciona el tipo" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {inspectionTypes.map((type) => (
                                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                                        {type.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="direccion_inspeccion">Dirección de Inspección</Label>
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

                                                    <div>
                                                        <Label htmlFor="department">Departamento</Label>
                                                        <Select
                                                            value={selectedDepartment}
                                                            onValueChange={setSelectedDepartment}
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

                                                    <div>
                                                        <Label htmlFor="city">Ciudad</Label>
                                                        <Select
                                                            value={selectedCity}
                                                            onValueChange={setSelectedCity}
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

                                                    <div>
                                                        <Label htmlFor="sede">Sede</Label>
                                                        <Select
                                                            value={appointmentForm.sede_id}
                                                            onValueChange={(value) => setAppointmentForm(prev => ({
                                                                ...prev,
                                                                sede_id: value
                                                            }))}
                                                            disabled={!selectedCity}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecciona sede" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sedes.map((sede) => (
                                                                    <SelectItem key={sede.id} value={sede.id.toString()}>
                                                                        {sede.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

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

                                                    <Button type="submit" className="w-full">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Agendar Inspección
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
} 