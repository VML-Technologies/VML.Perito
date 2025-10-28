import { useState, useEffect } from 'react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersTable from '@/components/OrdersTable';
import AgentOrderPanel from '@/components/AgentOrderPanel';
import PeritajeMomento3 from '@/components/peritajeMomento3';
import { useOrders } from '@/hooks/use-orders';
import { ClipboardList, FileText } from 'lucide-react';

export default function AgenteContacto() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [callStatuses, setCallStatuses] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { showToast } = useNotificationContext();
    const { user } = useAuth();

    const {
        orders,
        loading,
        filters,
        pagination,
        loadOrders,
        loadInitialData,
        handleFilterChange,
        handleSort,
        handlePageChange,
        handleClearFilters
    } = useOrders(API_ROUTES.INSPECTION_ORDERS.LIST, {
        context: 'agent'
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
        loadCallStatuses();
    }, []);

    // Escuchar eventos de asignación de órdenes
    useEffect(() => {
        const handleOrderAssigned = (event) => {
            console.log('🎯 Orden asignada recibida en AgenteContacto:', event.detail);

            const { order, message, type, data } = event.detail;

            // Mostrar notificación específica según el tipo
            let notificationMessage = '¡Nueva orden asignada! Actualizando lista...';
            let notificationType = 'info';

            if (type == 'reasignacion_orden') {
                notificationMessage = `¡Orden reasignada! ${order?.numero || ''} - Actualizando lista...`;
                notificationType = 'info';
            } else if (type == 'asignacion_orden') {
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

    // Solo escuchamos 'call_logged' para feedback visual inmediato.
    // El backend también emite 'order_status_updated' al agendar, pero no mostramos toast aquí.
    // En el futuro puedes agregar un listener específico para agendamientos si lo deseas.
    useEffect(() => {
        const handleCallLogged = (event) => {
            const { order_number, message, agent_id } = event.detail;
            if (user && String(agent_id) == String(user.id)) {
                showToast(message || `Llamada registrada para la orden #${order_number}`, 'success');
                loadOrders();
            }
        };
        window.addEventListener('call_logged', handleCallLogged);
        return () => {
            window.removeEventListener('call_logged', handleCallLogged);
        };
    }, [showToast, user]);

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

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true);
    };

    const handleOrderUpdate = () => {
        loadOrders();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Agente CC</h1>
                        <p className="text-muted-foreground">
                            Gestiona llamadas a clientes y programa agendamientos de inspección
                        </p>
                    </div>
                </div>
            </div>

            {/* Sistema de Tabs */}
            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="inline">Órdenes de Inspección</span>
                    </TabsTrigger>
                    <TabsTrigger value="peritajes" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="inline">Peritajes - Momento 3</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Gestión de Órdenes */}
                <TabsContent value="orders" className="space-y-6">
                    <div className="space-y-6">
                        {/* Filtros */}
                        <OrdersFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            gridCols="md:grid-cols-4"
                            showAgentFilter={false}
                        />

                        {/* Orders List */}
                        <OrdersTable
                            orders={orders}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onSort={handleSort}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            tableType="contact"
                            onContactOrder={handleOrderSelect}
                            showAgentColumn={false}
                            showActions={true}
                            emptyMessage="No se encontraron órdenes"
                            emptyDescription="Todas las órdenes han sido contactadas"
                            loading={loading}
                        />
                    </div>
                </TabsContent>

                {/* Tab: Peritajes */}
                <TabsContent value="peritajes" className="space-y-6">
                    <div className="space-y-6">
                        <PeritajeMomento3 />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Agent Order Panel */}
            <AgentOrderPanel
                isOpen={isPanelOpen}
                onOpenChange={setIsPanelOpen}
                selectedOrder={selectedOrder}
                callStatuses={callStatuses}
                onOrderUpdate={handleOrderUpdate}
            />
        </div>
    );
} 