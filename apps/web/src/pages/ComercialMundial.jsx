import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PlusCircle,
    BarChart3
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import CreateOrderModal from '@/components/CreateOrderModal';
import StatsCards from '@/components/StatsCards';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersTable from '@/components/OrdersTable';
import OrderDetailsPanel from '@/components/OrderDetailsPanel';
import { useOrders } from '@/hooks/use-orders';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/contexts/auth-context';

export default function ComercialMundial() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const { showToast } = useNotificationContext();
    const { socket } = useWebSocket();
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
        statsEndpoint: API_ROUTES.INSPECTION_ORDERS.STATS
    });

    // Escuchar eventos de WebSocket para actualizaciones en tiempo real
    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdate = (data) => {
            console.log('Orden actualizada via WebSocket:', data);
            loadOrders();
            loadStats();
        };

        const handleOrderCreated = (data) => {
            console.log('Nueva orden creada via WebSocket:', data);
            loadOrders();
            loadStats();
        };

        const handleAgentAssignment = (data) => {
            console.log('Agente asignado via WebSocket:', data);
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
    }, [socket, loadOrders, loadStats]);

    const handleOrderCreated = async (newOrder) => {
        await loadInitialData();
        showToast(`Orden #${newOrder.numero} creada exitosamente`, 'success');
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true);
    };

    const handleClearFiltersWrapper = (defaultFilters) => {
        handleClearFilters(defaultFilters);
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
                    <h1 className="text-3xl font-bold">Dashboard Comercial</h1>
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
            {/* <StatsCards stats={stats} variant="colorful" /> */}

            {/* Main Content */}
            {/* Filtros y Búsqueda */}
            <OrdersFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFiltersWrapper}
                gridCols="md:grid-cols-5"
                showAgentFilter={false}
            />

            {/* Orders Table */}
            <OrdersTable
                orders={orders}
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onViewDetails={handleViewDetails}
                showAgentColumn={false}
                showActions={true}
                emptyMessage="No se encontraron órdenes"
                emptyDescription="Crea una nueva orden para comenzar"
            />

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onOrderCreated={handleOrderCreated}
            />

            {/* Order Details Panel */}
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