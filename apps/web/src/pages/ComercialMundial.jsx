import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    Calendar
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import CreateOrderModal from '@/components/CreateOrderModal';

export default function ComercialMundial() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { showToast } = useNotificationContext();

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, [currentPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadOrders(),
                loadStats()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const url = new URL(API_ROUTES.INSPECTION_ORDERS.LIST);
            url.searchParams.append('page', currentPage);
            url.searchParams.append('limit', '10');
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
                setTotalPages(data.totalPages || 1);
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
                setStats(data);
            } else {
                throw new Error('Error al cargar estadísticas');
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            // No mostrar toast para estadísticas para no ser invasivo
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        await loadOrders();
    };

    const handleOrderCreated = async (newOrder) => {
        // Refresh the orders list and stats
        await loadData();
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
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando datos...</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.thisMonth || 0} este mes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Esperando contacto
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.scheduled || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Con fecha confirmada
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.completedThisWeek || 0} esta semana
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="orders">Órdenes de Inspección</TabsTrigger>
                    <TabsTrigger value="reports">Reportes</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                    {/* Search and Filters */}
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Buscar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Órdenes</CardTitle>
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
                                            <th className="text-left p-2">Fecha</th>
                                            <th className="text-left p-2">Cliente</th>
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
                                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                        <p>No se encontraron órdenes</p>
                                                        <p className="text-sm">Crea una nueva orden para comenzar</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-2 font-mono">{order.numero}</td>
                                                    <td className="p-2">{formatDate(order.fecha_creacion)}</td>
                                                    <td className="p-2">{order.cliente_nombre}</td>
                                                    <td className="p-2 font-mono">{order.vehiculo_placa}</td>
                                                    <td className="p-2">
                                                        <Badge variant={getStatusBadgeVariant(order.InspectionOrderStatus?.name)}>
                                                            {order.InspectionOrderStatus?.name || 'Sin estado'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {/* TODO: Abrir detalles */ }}
                                                        >
                                                            Ver detalles
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="py-2 px-4">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    >
                                        Siguiente
                                    </Button>
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