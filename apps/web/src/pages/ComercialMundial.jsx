import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PlusCircle,
    Search,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    BarChart3,
    Calendar,
    ChevronUp,
    ChevronDown,
    Eye
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import CreateOrderModal from '@/components/CreateOrderModal';
import StatsCards from '@/components/StatsCards';
import { useWebSocket } from '@/hooks/use-websocket';

export default function ComercialMundial() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        en_gestion: 0,
        agendadas: 0,
        completadas: 0,
        sin_asignar: 0
    });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Estados de filtros y paginación
    const [filters, setFilters] = useState({
        search: '',
        status: '',
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

    const { showToast } = useNotificationContext();
    const { socket } = useWebSocket();

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Cargar datos cuando cambien los filtros o paginación
    useEffect(() => {
        loadOrders();
    }, [filters, pagination.page]);

    // Escuchar eventos de WebSocket para actualizaciones en tiempo real
    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdate = (data) => {
            console.log('Orden actualizada via WebSocket:', data);
            // Recargar datos cuando se actualice una orden
            loadOrders();
            loadStats();
        };

        const handleOrderCreated = (data) => {
            console.log('Nueva orden creada via WebSocket:', data);
            // Recargar datos cuando se cree una nueva orden
            loadOrders();
            loadStats();
        };

        const handleAgentAssignment = (data) => {
            console.log('Agente asignado via WebSocket:', data);
            // Recargar datos cuando se asigne un agente
            loadOrders();
            loadStats();
        };

        // Suscribirse a eventos
        socket.on('order_updated', handleOrderUpdate);
        socket.on('order_created', handleOrderCreated);
        socket.on('agent_assigned', handleAgentAssignment);

        return () => {
            socket.off('order_updated', handleOrderUpdate);
            socket.off('order_created', handleOrderCreated);
            socket.off('agent_assigned', handleAgentAssignment);
        };
    }, [socket]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadStats(),
                loadOrders()
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
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...filters
            });

            const response = await fetch(`${API_ROUTES.INSPECTION_ORDERS.LIST}?${params}`, {
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

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.STATS, {
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

    const handleOrderCreated = async (newOrder) => {
        // Refresh the orders list and stats
        await loadInitialData();
        showToast(`Orden #${newOrder.numero} creada exitosamente`, 'success');
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
                    <p className="mt-4 text-muted-foreground">Cargando panel comercial...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Comercial Mundial</h1>
                    <p className="text-muted-foreground">
                        Gestiona órdenes de inspección y revisa estadísticas de rendimiento
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nueva Orden
                </Button>
            </div>

            {/* Statistics Cards */}
            <StatsCards stats={stats} variant="colorful" />

            {/* Main Content */}
            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="orders">Órdenes de Inspección</TabsTrigger>
                    <TabsTrigger value="reports">Reportes</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                    {/* Filtros y Búsqueda */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros y Búsqueda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                    {/* Orders Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Órdenes</CardTitle>
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
                                            <th className="text-left p-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSort('placa')}
                                                    className="font-semibold"
                                                >
                                                    Placa {getSortIcon('placa')}
                                                </Button>
                                            </th>
                                            <th className="text-left p-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSort('created_at')}
                                                    className="font-semibold"
                                                >
                                                    Fecha de solicitud {getSortIcon('created_at')}
                                                </Button>
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
                                                        <p className="text-sm">Crea una nueva orden para comenzar</p>
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
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm">{order.AssignedAgent.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                                <span className="text-sm text-muted-foreground">Sin asignar</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {/* TODO: Abrir detalles */ }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Ver
                                                        </Button>
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
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reportes y Estadísticas</CardTitle>
                            <CardDescription>
                                Análisis de rendimiento y métricas del comercial
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-muted-foreground">Reportes próximamente</p>
                                <p className="text-sm text-muted-foreground">
                                    Esta sección incluirá gráficos y reportes detallados
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onOrderCreated={handleOrderCreated}
            />
        </div>
    );
} 