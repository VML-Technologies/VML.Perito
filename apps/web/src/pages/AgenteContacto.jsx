import { useState, useEffect } from 'react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/contexts/auth-context';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersTable from '@/components/OrdersTable';
import AgentOrderPanel from '@/components/AgentOrderPanel';

export default function AgenteContacto() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        date_from: '',
        date_to: '',
        assigned_agent_id: ''
    });
    const [callStatuses, setCallStatuses] = useState([]);
    const [inspectionTypes, setInspectionTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [modalities, setModalities] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const { showToast } = useNotificationContext();
    const { isConnected } = useWebSocket();
    const { user } = useAuth();

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

    // Escuchar eventos de llamadas registradas
    useEffect(() => {
        const handleCallLogged = (event) => {
            const { order_number, message, agent_id } = event.detail;
            if (user && String(agent_id) === String(user.id)) {
                showToast(message || `Llamada registrada para la orden #${order_number}`, 'success');
                loadOrders();
            }
        };
        window.addEventListener('call_logged', handleCallLogged);
        return () => {
            window.removeEventListener('call_logged', handleCallLogged);
        };
    }, [showToast, user]);

    // Recargar órdenes cuando cambien los filtros
    useEffect(() => {
        if (!loading) {
            loadOrders();
        }
    }, [filters]);

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

            // Agregar filtros a la URL
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== '') {
                    url.searchParams.append(key, value);
                }
            });

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

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true);
    };

    const handleOrderUpdated = () => {
        loadOrders();
    };

    const handlePanelClose = () => {
        setIsPanelOpen(false);
        setSelectedOrder(null);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            status: '',
            date_from: '',
            date_to: '',
            assigned_agent_id: ''
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
                        <h1 className="text-3xl font-bold">Agente de Contact Center</h1>
                        <p className="text-muted-foreground">
                            Gestiona llamadas a clientes y programa agendamientos de inspección
                        </p>
                    </div>
                </div>
            </div>

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
                tableType="contact"
                onContactOrder={handleOrderSelect}
                showAgentColumn={false}
                showActions={true}
                emptyMessage="No se encontraron órdenes"
                emptyDescription="Todas las órdenes han sido contactadas"
            />

            {/* Agent Order Panel */}
            <AgentOrderPanel
                isOpen={isPanelOpen}
                onOpenChange={setIsPanelOpen}
                order={selectedOrder}
                callStatuses={callStatuses}
                inspectionTypes={inspectionTypes}
                departments={departments}
                cities={cities}
                sedes={sedes}
                modalities={modalities}
                onOrderUpdated={handleOrderUpdated}
                onPanelClose={handlePanelClose}
            />
        </div>
    );
} 