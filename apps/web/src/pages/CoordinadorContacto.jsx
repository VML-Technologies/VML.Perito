import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Calendar,
    User,
    Clock,
    PhoneCall,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    MapPin,
    FileText,
    TrendingUp,
    TrendingDown,
    UserCheck,
    UserX,
    ChevronUp,
    ChevronDown,
    Eye,
    Settings
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import StatsCards from '@/components/StatsCards';

export default function CoordinadorContacto() {
    // Estados principales
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        en_gestion: 0,
        agendadas: 0,
        sin_asignar: 0
    });

    // Estados de filtros y paginación
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        assigned_agent_id: '',
        date_from: '',
        date_to: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
    });

    // Estados de UI
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');

    const { showToast } = useNotificationContext();

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Cargar datos cuando cambien los filtros o paginación
    useEffect(() => {
        loadOrders();
    }, [filters, pagination.page]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadStats(),
                loadAgents(),
                loadOrders()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast('Error al cargar los datos iniciales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.COORDINADOR_CONTACTO.STATS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            } else {
                throw new Error('Error al cargar estadísticas');
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            showToast('Error al cargar las estadísticas', 'error');
        }
    };

    const loadAgents = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.COORDINADOR_CONTACTO.AGENTS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAgents(data.data);
            } else {
                throw new Error('Error al cargar agentes');
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            showToast('Error al cargar los agentes', 'error');
        }
    };

    const loadOrders = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...filters
            });

            const response = await fetch(`${API_ROUTES.COORDINADOR_CONTACTO.ORDERS}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.data.orders);
                setPagination(prev => ({
                    ...prev,
                    total: data.data.pagination.total,
                    pages: data.data.pagination.pages,
                    hasNext: data.data.pagination.hasNext,
                    hasPrev: data.data.pagination.hasPrev
                }));
            } else {
                throw new Error('Error al cargar órdenes');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            showToast('Error al cargar las órdenes', 'error');
        }
    };

    const loadOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.COORDINADOR_CONTACTO.ORDER_DETAILS(orderId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedOrder(data.data);
                setIsPanelOpen(true);
            } else {
                throw new Error('Error al cargar detalles');
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            showToast('Error al cargar los detalles de la orden', 'error');
        }
    };

    const handleAssignAgent = async (orderId, agentId) => {
        setAssigningOrder(orderId);
        try {
            const token = localStorage.getItem('authToken');
            // Convertir 'unassign' a null para quitar asignación
            const finalAgentId = (agentId === 'unassign') ? null : agentId;

            const response = await fetch(API_ROUTES.COORDINADOR_CONTACTO.ASSIGN, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inspection_order_id: orderId,
                    agent_id: finalAgentId
                })
            });

            if (response.ok) {
                const data = await response.json();
                showToast(data.message, 'success');
                await Promise.all([loadOrders(), loadStats()]);

                // Si estamos viendo los detalles de esta orden, actualizarlos
                if (selectedOrder && selectedOrder.id === orderId) {
                    await loadOrderDetails(orderId);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al asignar agente');
            }
        } catch (error) {
            console.error('Error assigning agent:', error);
            showToast(error.message || 'Error al asignar el agente', 'error');
        } finally {
            setAssigningOrder(null);
            setSelectedAgent('');
        }
    };

    const handleFilterChange = (key, value) => {
        // Convertir valores especiales a string vacío para el backend
        const backendValue = (value === 'all') ? '' : value;

        setFilters(prev => ({
            ...prev,
            [key]: backendValue
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSort = (field) => {
        const newOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: newOrder
        }));
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSortIcon = (field) => {
        if (filters.sortBy !== field) return null;
        return filters.sortOrder === 'ASC' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando panel de coordinación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Coordinador de Contact Center</h1>
                <p className="text-muted-foreground">
                    Supervisa y asigna agentes de contact center a las órdenes de inspección
                </p>
            </div>

            {/* Cards de Estadísticas */}
            <StatsCards stats={stats} variant="colorful" />

            {/* Filtros y Búsqueda */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros y Búsqueda</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                            <Label htmlFor="search">Buscar</Label>
                            <Input
                                id="search"
                                placeholder="Placa, cliente, documento..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Estado</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="1">Creada</SelectItem>
                                    <SelectItem value="2">Contacto exitoso</SelectItem>
                                    <SelectItem value="3">Agendado</SelectItem>
                                    <SelectItem value="4">Finalizada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="agent">Agente Asignado</Label>
                            <Select
                                value={filters.assigned_agent_id}
                                onValueChange={(value) => handleFilterChange('assigned_agent_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los agentes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los agentes</SelectItem>
                                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                                    {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                            {agent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="date_from">Fecha Desde</Label>
                            <Input
                                id="date_from"
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="date_to">Fecha Hasta</Label>
                            <Input
                                id="date_to"
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    setFilters({
                                        search: '',
                                        status: '',
                                        assigned_agent_id: '',
                                        date_from: '',
                                        date_to: '',
                                        sortBy: 'created_at',
                                        sortOrder: 'DESC'
                                    });
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de Órdenes */}
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes de Inspección</CardTitle>
                    <CardDescription>
                        {pagination.total} órdenes encontradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('id')}
                                            className="font-semibold"
                                        >
                                            ID {getSortIcon('id')}
                                        </Button>
                                    </th>
                                    <th className="text-left p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('numero')}
                                            className="font-semibold"
                                        >
                                            Número {getSortIcon('numero')}
                                        </Button>
                                    </th>
                                    <th className="text-left p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('nombre_cliente')}
                                            className="font-semibold"
                                        >
                                            Cliente {getSortIcon('nombre_cliente')}
                                        </Button>
                                    </th>
                                    <th className="text-left p-2">Teléfono</th>
                                    <th className="text-left p-2">Email</th>
                                    <th className="text-left p-2" onClick={() => handleSort('placa')}>
                                        <div className="flex justify-between">
                                            Placa
                                            <span className="mt-2">
                                                {getSortIcon('placa')}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="text-left p-2" onClick={() => handleSort('created_at')}>
                                        <div className="flex justify-between">
                                            Fecha de solicitud
                                            <span className="mt-2">
                                                {getSortIcon('created_at')}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="text-left p-2">Estado</th>
                                    <th className="text-left p-2">Agente Asignado</th>
                                    <th className="text-left p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center p-8">
                                            <div className="text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No se encontraron órdenes</p>
                                                <p className="text-sm">Ajusta los filtros para ver más resultados</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2 font-mono font-medium">#{order.id}</td>
                                            <td className="p-2 font-mono font-medium">#{order.numero}</td>
                                            <td className="p-2">{order.nombre_cliente}</td>
                                            <td className="p-2 font-mono">{order.celular_cliente}</td>
                                            <td className="p-2 text-sm">{order.correo_cliente}</td>
                                            <td className="p-2 font-mono font-medium">{order.placa}</td>
                                            <td className="p-2 text-sm">{formatDate(order.created_at)}</td>
                                            <td className="p-2">
                                                <Badge variant={getStatusBadgeVariant(order.InspectionOrderStatus?.name)}>
                                                    {order.InspectionOrderStatus?.name || 'Sin estado'}
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                {order.AssignedAgent ? (
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm">{order.AssignedAgent.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <UserX className="h-4 w-4 text-red-500" />
                                                        <span className="text-sm text-muted-foreground">Sin asignar</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => loadOrderDetails(order.id)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Ver
                                                    </Button>

                                                    {order.AssignedAgent ? (
                                                        <Select
                                                            value={selectedAgent}
                                                            onValueChange={(value) => {
                                                                setSelectedAgent(value);
                                                                handleAssignAgent(order.id, value);
                                                            }}
                                                            disabled={assigningOrder === order.id}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Reasignar" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="unassign">Quitar asignación</SelectItem>
                                                                {agents.map((agent) => (
                                                                    <SelectItem key={agent.id} value={agent.id.toString()}>
                                                                        {agent.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Select
                                                            value={selectedAgent}
                                                            onValueChange={(value) => {
                                                                setSelectedAgent(value);
                                                                handleAssignAgent(order.id, value);
                                                            }}
                                                            disabled={assigningOrder === order.id}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Asignar" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {agents.map((agent) => (
                                                                    <SelectItem key={agent.id} value={agent.id.toString()}>
                                                                        {agent.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}

                                                    {assigningOrder === order.id && (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Página {pagination.page} de {pagination.pages} ({pagination.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={!pagination.hasPrev}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={!pagination.hasNext}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Panel de Detalles */}
            <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
                <SheetContent className="w-full sm:max-w-4xl overflow-y-auto px-4">
                    {selectedOrder && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Detalles de Orden #{selectedOrder.numero}</SheetTitle>
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
                                        <div>
                                            <span className="font-medium">Cliente:</span>
                                            <p>{selectedOrder.nombre_cliente}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Placa:</span>
                                            <p className="font-mono font-medium">{selectedOrder.placa}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Teléfono:</span>
                                            <p className="font-mono">{selectedOrder.celular_cliente}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Vehículo:</span>
                                            <p>{selectedOrder.marca} {selectedOrder.linea} ({selectedOrder.modelo})</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Email:</span>
                                            <p>{selectedOrder.correo_cliente}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Estado:</span>
                                            <Badge variant={getStatusBadgeVariant(selectedOrder.InspectionOrderStatus?.name)}>
                                                {selectedOrder.InspectionOrderStatus?.name}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="font-medium">Documento:</span>
                                            <p className="font-mono">{selectedOrder.tipo_doc} {selectedOrder.num_doc}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Agente Asignado:</span>
                                            {selectedOrder.AssignedAgent ? (
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4 text-green-600" />
                                                    <span>{selectedOrder.AssignedAgent.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <UserX className="h-4 w-4 text-red-500" />
                                                    <span className="text-muted-foreground">Sin asignar</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Tabs defaultValue="calls" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="calls">Historial de Llamadas</TabsTrigger>
                                        <TabsTrigger value="appointments">Agendamientos</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="calls">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Historial de Llamadas</CardTitle>
                                                <CardDescription>
                                                    Registro de todas las llamadas realizadas
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedOrder.callLogs && selectedOrder.callLogs.length > 0 ? (
                                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                                        {selectedOrder.callLogs
                                                            .sort((a, b) => new Date(b.call_time) - new Date(a.call_time))
                                                            .map((call, index) => (
                                                                <div key={call.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-blue-500">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            <span className="font-medium text-sm">
                                                                                {call.status?.name || 'Estado desconocido'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            {formatDate(call.call_time)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="h-3 w-3" />
                                                                            <span>
                                                                                Agente: {call.Agent?.name || 'No especificado'}
                                                                            </span>
                                                                        </div>

                                                                        {call.comments && (
                                                                            <div className="flex items-start gap-2 mt-2">
                                                                                <FileText className="h-3 w-3 mt-0.5" />
                                                                                <span className="text-xs italic">
                                                                                    "{call.comments}"
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <PhoneCall className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                        <p>No hay llamadas registradas</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="appointments">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Agendamientos</CardTitle>
                                                <CardDescription>
                                                    Citas programadas para inspección
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedOrder.appointments && selectedOrder.appointments.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {selectedOrder.appointments.map((appointment) => (
                                                            <div key={appointment.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span className="font-medium">
                                                                        {appointment.scheduled_date} a las {appointment.scheduled_time}
                                                                    </span>
                                                                </div>
                                                                {appointment.inspectionType && (
                                                                    <div className="text-sm mb-2">
                                                                        <span className="font-medium">Tipo:</span>
                                                                        <span className="ml-2">{appointment.inspectionType.name}</span>
                                                                    </div>
                                                                )}
                                                                {appointment.sede && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                        <span>
                                                                            {appointment.sede.name}
                                                                            {appointment.sede.city && ` - ${appointment.sede.city.name}`}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                        <p>No hay agendamientos registrados</p>
                                                    </div>
                                                )}
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