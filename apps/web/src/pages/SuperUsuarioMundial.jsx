import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { useNotificationContext } from '@/contexts/notification-context';
import { API_ROUTES } from '@/config/api';
import { useAuth } from '@/contexts/auth-context';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersTable from '@/components/OrdersTable';
import OrderDetailsPanel from '@/components/OrderDetailsPanel';
import { useOrders } from '@/hooks/use-orders';
import { useWebSocket } from '@/hooks/use-websocket';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

const SuperUsuarioMundial = () => {
    const { user } = useAuth();
    const { showToast } = useNotificationContext();
    const { socket } = useWebSocket();

    // Estados para el panel de detalles
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Estados para el modal de cambio de estado
    const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
    const [orderToChangeStatus, setOrderToChangeStatus] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [changingStatus, setChangingStatus] = useState(false);

    // Estados disponibles (solo Aprobado y No Aprobado)
    const availableStatuses = [
        { id: 1, name: 'Aprobado', description: 'Vehículo aprobado - Asegurable' },
        { id: 2, name: 'No Aprobado', description: 'Vehículo no aprobado - No asegurable' }
    ];

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

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

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

        // Suscribirse a eventos
        socket.on('order_updated', handleOrderUpdate);
        socket.on('order_created', handleOrderCreated);

        return () => {
            socket.off('order_updated', handleOrderUpdate);
            socket.off('order_created', handleOrderCreated);
        };
    }, [socket, loadOrders, loadStats]);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true);
    };

    const handleClearFiltersWrapper = () => {
        handleClearFilters();
    };

    const handleOpenChangeStatus = (order) => {
        setOrderToChangeStatus(order);
        setSelectedStatus('');
        setIsChangeStatusModalOpen(true);
    };

    const handleChangeStatus = async () => {
        if (!orderToChangeStatus) {
            showToast('No hay orden seleccionada', 'error');
            return;
        }

        if (!selectedStatus) {
            showToast('Por favor selecciona un estado', 'error');
            return;
        }

        try {
            setChangingStatus(true);

            // Mapear el estado seleccionado al texto completo
            const statusTexts = {
                '1': 'APROBADO - Vehículo asegurable',
                '2': 'RECHAZADO - Vehículo no asegurable'
            };

            const statusText = statusTexts[selectedStatus];
            const statusName = selectedStatus === '1' ? 'Aprobado' : 'No Aprobado';

            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.CHANGE_STATUS(orderToChangeStatus.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    status: statusName,
                    inspectionResult: statusText
                })
            });

            if (response.ok) {
                const data = await response.json();
                showToast(data.message || 'Estado cambiado exitosamente', 'success');
                
                // Recargar órdenes y estadísticas
                await loadOrders();
                await loadStats();

                // Cerrar modal y limpiar
                setIsChangeStatusModalOpen(false);
                setOrderToChangeStatus(null);
                setSelectedStatus('');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar el estado');
            }
        } catch (error) {
            console.error('Error changing status:', error);
            showToast(error.message || 'Error al cambiar el estado', 'error');
        } finally {
            setChangingStatus(false);
        }
    };

    return (
        <div className="w-full max-w-full overflow-hidden px-2 sm:px-4 lg:px-6">
            <div className="space-y-4 sm:space-y-6 max-w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl text-amber-600 lg:text-3xl font-ubuntu font-bold flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                            Super Usuario Mundial
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground font-ubuntu">
                            Consulta órdenes de inspección y actualiza su estado
                        </p>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="w-full max-w-full overflow-hidden">
                    <OrdersFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFiltersWrapper}
                        gridCols="md:grid-cols-5"
                        showAgentFilter={false}
                        role="super_usuario"
                        stats={stats}
                        showCreateModal={null}
                    />
                </div>

                {/* Orders Table */}
                <div className="w-full max-w-full overflow-hidden">
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
                        customActions={(order) => (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenChangeStatus(order)}
                                className="hover:bg-amber-50"
                            >
                                Cambiar Estado
                            </Button>
                        )}
                        emptyMessage="No se encontraron órdenes"
                        emptyDescription="No hay órdenes de inspección disponibles"
                    />
                </div>

                {/* Order Details Panel */}
                <OrderDetailsPanel
                    isOpen={isPanelOpen}
                    onOpenChange={setIsPanelOpen}
                    order={selectedOrder}
                    showCallHistory={true}
                    showAppointments={true}
                    showTabs={true}
                    user={user}
                    customActions={
                        selectedOrder && (
                            <Button
                                onClick={() => {
                                    setIsPanelOpen(false);
                                    handleOpenChangeStatus(selectedOrder);
                                }}
                                className="bg-amber-500 hover:bg-amber-600"
                            >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Cambiar Estado
                            </Button>
                        )
                    }
                />

                {/* Modal de Cambio de Estado */}
                <Dialog open={isChangeStatusModalOpen} onOpenChange={setIsChangeStatusModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-amber-600" />
                                Cambiar Estado de Inspección
                            </DialogTitle>
                            <DialogDescription>
                                {orderToChangeStatus && (
                                    <span>Orden #{orderToChangeStatus.numero} - Placa: {orderToChangeStatus.placa}</span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="status">Nuevo Estado</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {availableStatuses.map((status) => (
                                        <Button
                                            key={status.id}
                                            className={
                                                selectedStatus === status.id.toString()
                                                    ? status.id === 1
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-red-700 hover:bg-red-700 cursor-pointer text-white'
                                                    : 'bg-white border border-gray-300 hover:bg-white cursor-pointer text-gray-700'
                                            }
                                            onClick={() => setSelectedStatus(status.id.toString())}
                                            disabled={changingStatus}
                                        >
                                            {status.id === 1 && <CheckCircle className="h-4 w-4 mr-2" />}
                                            {status.id === 2 && <XCircle className="h-4 w-4 mr-2" />}
                                            {status.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsChangeStatusModalOpen(false)}
                                disabled={changingStatus}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleChangeStatus}
                                disabled={changingStatus || !selectedStatus}
                                className="bg-amber-500 hover:bg-amber-600 cursor-pointer"
                            >
                                {changingStatus ? 'Cambiando...' : 'Cambiar Estado'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SuperUsuarioMundial;

