import { useState, useEffect } from 'react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCards from '@/components/StatsCards';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersTable from '@/components/OrdersTable';
import OrderDetailsPanel from '@/components/OrderDetailsPanel';
import { useOrders } from '@/hooks/use-orders';
import { ClipboardList, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import PeritajeMomento3 from '@/components/peritajeMomento3';
import OrdenesRecuperacion from '@/components/OrdenesRecuperacion';

export default function CoordinadorContacto() {
    const [agents, setAgents] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');

    const { showToast } = useNotificationContext();
    const { user } = useAuth();

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
        if (agentId == 'reassign') {
            return;
        }

        setAssigningOrder(orderId);
        try {
            const token = localStorage.getItem('authToken');
            // Convertir 'unassign' a null para quitar asignación
            const finalAgentId = (agentId == 'unassign') ? null : agentId;

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
                if (selectedOrder && selectedOrder.id == orderId) {
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
                        <span className="inline">Órdenes de Inspección</span>
                    </TabsTrigger>
                    <TabsTrigger value="recuperacion" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="inline">Recuperación</span>
                    </TabsTrigger>
                    <TabsTrigger value="peritajes" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="inline">Peritaje - Momento 3</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Gestión de Órdenes */}
                <TabsContent value="orders" className="space-y-6">
                    <div className="space-y-6">

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

                {/* Tab: Recuperación */}
                <TabsContent value="recuperacion" className="space-y-6">
                    <div className="space-y-6">
                        <OrdenesRecuperacion />
                    </div>
                </TabsContent>

                {/* Tab: peritajes */}
                <TabsContent value="peritajes" className="space-y-6">
                    <div className="space-y-6">
                        <PeritajeMomento3 />
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
                user={user}
            />
        </div>
    );
}
