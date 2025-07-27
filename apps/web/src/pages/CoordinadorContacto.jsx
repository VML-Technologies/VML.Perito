import { useState, useEffect } from 'react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCards from '@/components/StatsCards';
import AgentAssignmentStats from '@/components/AgentAssignmentStats';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersTable from '@/components/OrdersTable';
import OrderDetailsPanel from '@/components/OrderDetailsPanel';
import { useOrders } from '@/hooks/use-orders';
import { ClipboardList, BarChart3, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

export default function CoordinadorContacto() {
    const [agents, setAgents] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');

    const { showToast } = useNotificationContext();

    const {
        orders,
        loading,
        stats,
        filters,
        pagination,
        loadOrders,
        loadStats,
        loadInitialData,
        handleFilterChange,
        handleSort,
        handlePageChange,
        handleClearFilters
    } = useOrders(API_ROUTES.INSPECTION_ORDERS.LIST, {
        statsEndpoint: API_ROUTES.COORDINADOR_CONTACTO.STATS
    });

    // Cargar agentes
    useEffect(() => {
        loadAgents();
    }, []);

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
        // Si es 'reassign', no hacer nada (solo mostrar el dropdown)
        if (agentId === 'reassign') {
            return;
        }

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

    const handleViewDetails = (order) => {
        loadOrderDetails(order.id);
    };

    const handleAgentChange = (value) => {
        setSelectedAgent(value);
    };

    const handleClearFiltersWrapper = (defaultFilters) => {
        handleClearFilters(defaultFilters);
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

            {/* Sistema de Tabs */}
            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="hidden sm:inline">Gestión de Órdenes</span>
                        <span className="sm:hidden">Órdenes</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Análisis Detallado</span>
                        <span className="sm:hidden">Análisis</span>
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Rendimiento</span>
                        <span className="sm:hidden">Rendimiento</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Gestión de Órdenes */}
                <TabsContent value="orders" className="space-y-6">
                    <div className="space-y-6">
                        {/* Cards de Estadísticas */}
                        <StatsCards stats={stats} variant="colorful" />

                        {/* Filtros y Búsqueda */}
                        <OrdersFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFiltersWrapper}
                            agents={agents}
                            showAgentFilter={true}
                            gridCols="md:grid-cols-6"
                        />

                        {/* Tabla de Órdenes */}
                        <OrdersTable
                            orders={orders}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onSort={handleSort}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onViewDetails={handleViewDetails}
                            onAssignAgent={handleAssignAgent}
                            agents={agents}
                            assigningOrder={assigningOrder}
                            selectedAgent={selectedAgent}
                            onAgentChange={handleAgentChange}
                            showAgentColumn={true}
                            showActions={true}
                            emptyMessage="No se encontraron órdenes"
                            emptyDescription="Ajusta los filtros para ver más resultados"
                        />
                    </div>
                </TabsContent>

                {/* Tab: Análisis Detallado */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="space-y-6">

                        {/* Componente de Distribución por Estado */}
                        <OrderStatusDistribution orders={orders} />

                        {/* Componente de Tendencias Temporales */}
                        <TemporalTrends orders={orders} />

                        {/* Estadísticas por Asesor */}
                        <AgentAssignmentStats />
                    </div>
                </TabsContent>

                {/* Tab: Rendimiento */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="space-y-6">
                        {/* Cards de Estadísticas */}
                        <StatsCards stats={stats} variant="colorful" />

                        {/* Métricas de Rendimiento */}
                        <PerformanceMetrics orders={orders} agents={agents} />

                        {/* Indicadores de Calidad */}
                        <QualityIndicators orders={orders} />

                        {/* Análisis de Productividad */}
                        <ProductivityAnalysis orders={orders} agents={agents} />
                    </div>
                </TabsContent>


            </Tabs>

            {/* Panel de Detalles */}
            <OrderDetailsPanel
                isOpen={isPanelOpen}
                onOpenChange={setIsPanelOpen}
                order={selectedOrder}
                showCallHistory={true}
                showAppointments={true}
                showTabs={true}
            />
        </div>
    );
}

// Componente de Distribución por Estado
const OrderStatusDistribution = ({ orders }) => {
    const statusCounts = orders.reduce((acc, order) => {
        const status = order.InspectionOrderStatus?.name || 'Sin Estado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const total = orders.length;
    const statusColors = {
        'Creada': 'bg-blue-500',
        'En contacto': 'bg-yellow-500',
        'Agendado': 'bg-green-500',
        'Finalizada': 'bg-emerald-500',
        'Cancelada': 'bg-red-500',
        'Sin Estado': 'bg-gray-500'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
                <div className="space-y-3">
                    {Object.entries(statusCounts).map(([status, count]) => {
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const color = statusColors[status] || 'bg-gray-500';

                        return (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                    <span className="text-sm font-medium">{status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{count}</span>
                                    <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen de Estados</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {statusCounts['Creada'] || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Pendientes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {statusCounts['Finalizada'] || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Completadas</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {statusCounts['En contacto'] || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">En Gestión</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                            {statusCounts['Agendado'] || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Agendadas</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de Tendencias Temporales
const TemporalTrends = ({ orders }) => {
    const getLast7Days = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const dailyCounts = getLast7Days().map(date => {
        const count = orders.filter(order =>
            order.created_at?.startsWith(date)
        ).length;
        return { date, count };
    });

    const maxCount = Math.max(...dailyCounts.map(d => d.count));
    const totalWeekOrders = dailyCounts.reduce((sum, day) => sum + day.count, 0);
    const avgDailyOrders = totalWeekOrders / 7;

    // Calcular tendencia (comparar últimos 3 días vs primeros 4 días)
    const recentDays = dailyCounts.slice(-3);
    const previousDays = dailyCounts.slice(0, 4);
    const recentAvg = recentDays.reduce((sum, day) => sum + day.count, 0) / 3;
    const previousAvg = previousDays.reduce((sum, day) => sum + day.count, 0) / 4;
    const trend = recentAvg > previousAvg ? 'up' : recentAvg < previousAvg ? 'down' : 'stable';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Tendencias de los Últimos 7 Días
                        </CardTitle>
                        <CardDescription>
                            Análisis diario de órdenes creadas
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-semibold text-blue-600">{totalWeekOrders}</div>
                            <div className="text-muted-foreground">Total semana</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-green-600">{avgDailyOrders.toFixed(1)}</div>
                            <div className="text-muted-foreground">Promedio diario</div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Resumen de tendencia */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tendencia de la semana:</span>
                        <div className="flex items-center gap-2">
                            {trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : trend === 'down' ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                                <Minus className="h-4 w-4 text-gray-600" />
                            )}
                            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' :
                                trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                {trend === 'up' ? 'En aumento' :
                                    trend === 'down' ? 'En descenso' : 'Estable'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid de cards para cada día */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                    {dailyCounts.map(({ date, count }, index) => {
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        const formattedDate = new Date(date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric'
                        });
                        const isToday = index === 6;
                        const isYesterday = index === 5;

                        return (
                            <Card key={date} className={`hover:shadow-md transition-shadow ${isToday ? 'ring-2 ring-blue-500' : ''
                                }`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            {formattedDate}
                                        </CardTitle>
                                        {isToday && (
                                            <Badge variant="secondary" className="text-xs">
                                                Hoy
                                            </Badge>
                                        )}
                                        {isYesterday && (
                                            <Badge variant="outline" className="text-xs">
                                                Ayer
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 mb-2">
                                            {count}
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            órdenes
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {percentage.toFixed(0)}% del máximo
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// Componente de Métricas de Rendimiento
const PerformanceMetrics = ({ orders, agents }) => {
    const totalOrders = orders.length;
    // Considerar "agendada" como gestión completa para el agente
    const completedOrders = orders.filter(o =>
        o.InspectionOrderStatus?.name === 'Finalizada' ||
        o.InspectionOrderStatus?.name === 'Agendado'
    ).length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const avgOrdersPerAgent = agents.length > 0 ? totalOrders / agents.length : 0;

    const recentOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
    }).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{completionRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Tasa de Gestión Completa</div>
                <div className="text-xs text-muted-foreground mt-1">
                    {completedOrders} de {totalOrders} órdenes (incluye agendadas)
                </div>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{avgOrdersPerAgent.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Promedio por Agente</div>
                <div className="text-xs text-muted-foreground mt-1">
                    {agents.length} agentes activos
                </div>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{recentOrders}</div>
                <div className="text-sm text-muted-foreground">Órdenes Esta Semana</div>
                <div className="text-xs text-muted-foreground mt-1">
                    Últimos 7 días
                </div>
            </div>
        </div>
    );
};

// Componente de Análisis de Productividad
const ProductivityAnalysis = ({ orders, agents }) => {
    const agentProductivity = agents.map(agent => {
        const agentOrders = orders.filter(o => o.AssignedAgent?.id === agent.id);
        // Considerar "agendada" como gestión completa para el agente
        const completed = agentOrders.filter(o =>
            o.InspectionOrderStatus?.name === 'Finalizada' ||
            o.InspectionOrderStatus?.name === 'Agendado'
        ).length;
        const productivity = agentOrders.length > 0 ? (completed / agentOrders.length) * 100 : 0;

        return {
            agent,
            totalOrders: agentOrders.length,
            completed,
            productivity
        };
    }).filter(a => a.totalOrders > 0).sort((a, b) => b.productivity - a.productivity);

    const avgProductivity = agentProductivity.length > 0
        ? agentProductivity.reduce((sum, a) => sum + a.productivity, 0) / agentProductivity.length
        : 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Análisis de Productividad por Agente
                        </CardTitle>
                        <CardDescription>
                            Rendimiento individual de agentes de contacto
                        </CardDescription>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{avgProductivity.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Promedio general</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {agentProductivity.slice(0, 8).map(({ agent, totalOrders, completed, productivity }) => (
                        <Card key={agent.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-primary">
                                            {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-sm">{agent.name}</CardTitle>
                                        <CardDescription className="text-xs">{agent.email}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-2">
                                        {productivity.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3">
                                        {completed}/{totalOrders} gestionadas
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${productivity}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Eficiencia operativa
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Componente de Indicadores de Calidad
const QualityIndicators = ({ orders }) => {
    const totalOrders = orders.length;
    const ordersWithCalls = orders.filter(o => o.callLogsCount > 0).length;
    const ordersWithAppointments = orders.filter(o => o.InspectionOrderStatus?.name === 'Agendado').length;

    const callRate = totalOrders > 0 ? (ordersWithCalls / totalOrders) * 100 : 0;
    const appointmentRate = totalOrders > 0 ? (ordersWithAppointments / totalOrders) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Indicadores de Contacto</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Órdenes con llamadas</span>
                        <span className="font-semibold">{callRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${callRate}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {ordersWithCalls} de {totalOrders} órdenes han sido contactadas
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tasa de Agendamiento</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Órdenes agendadas</span>
                        <span className="font-semibold">{appointmentRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${appointmentRate}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {ordersWithAppointments} de {totalOrders} órdenes han sido agendadas
                    </div>
                </div>
            </div>
        </div>
    );
};

