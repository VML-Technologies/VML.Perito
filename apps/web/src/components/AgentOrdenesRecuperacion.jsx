import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useAuth } from '@/contexts/auth-context';
import AgentOrderPanel from '@/components/AgentOrderPanel';
import { Search, Phone, MessageSquare, User, Car, FileText, Clock, RefreshCw, UserCheck, Calendar } from 'lucide-react';

const AgentOrdenesRecuperacion = () => {
    const { showToast } = useNotificationContext();
    const { user } = useAuth();

    const [ordenesRecuperacion, setOrdenesRecuperacion] = useState([]);
    const [ordenesNoRecuperadas, setOrdenesNoRecuperadas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('recuperacion');

    // Estados para el AgentOrderPanel
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
    const [callStatuses, setCallStatuses] = useState([]);

    // Paginación para Recuperación (server-side)
    const [pageRecuperacion, setPageRecuperacion] = useState(1);
    const [paginationRecuperacion, setPaginationRecuperacion] = useState(null);
    const limitRecuperacion = 12;

    // Paginación para No Recuperadas (server-side)
    const [pageNoRecuperadas, setPageNoRecuperadas] = useState(1);
    const [paginationNoRecuperadas, setPaginationNoRecuperadas] = useState(null);
    const limitNoRecuperadas = 12;

    useEffect(() => {
        loadOrdenes();
        loadCallStatuses();
    }, []);

    useEffect(() => {
        loadOrdenes();
    }, [pageRecuperacion, pageNoRecuperadas]);

    // Debounce para el término de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efecto para búsqueda - resetea la paginación cuando se busca
    useEffect(() => {
        if (debouncedSearchTerm !== searchTerm) return; // Solo ejecutar cuando el debounce esté listo

        if (debouncedSearchTerm !== '') {
            setPageRecuperacion(1);
            setPageNoRecuperadas(1);
        }

        // Activar indicador de búsqueda solo si hay término de búsqueda
        if (debouncedSearchTerm.trim()) {
            setSearching(true);
        }

        loadOrdenes();
    }, [debouncedSearchTerm]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOrdenes();
        setRefreshing(false);
        showToast('Órdenes actualizadas', 'success');
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

    const handleContactOrder = (orden) => {
        setSelectedOrder(orden);
        setIsOrderPanelOpen(true);
    };

    // Debounce del término de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const loadOrdenes = async () => {
        try {
            // Solo mostrar loading completo en la carga inicial
            if (!searching) {
                setLoading(true);
            }

            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Construir parámetros de búsqueda
            const searchParam = debouncedSearchTerm.trim() ? `&search=${encodeURIComponent(debouncedSearchTerm.trim())}` : '';

            // Cargar órdenes en recuperación (días 2-5) con paginación y búsqueda
            const recuperacionUrl = `${API_ROUTES.COORDINADOR_CONTACTO.ORDENES_RECUPERACION}?page=${pageRecuperacion}&limit=${limitRecuperacion}${searchParam}`;
            const recuperacionResponse = await fetch(recuperacionUrl, { headers });
            if (!recuperacionResponse.ok) throw new Error('Error al cargar órdenes en recuperación');
            const recuperacionData = await recuperacionResponse.json();

            // Cargar órdenes no recuperadas (día 6+) con paginación y búsqueda
            const noRecuperadasUrl = `${API_ROUTES.COORDINADOR_CONTACTO.ORDENES_NO_RECUPERADAS}?page=${pageNoRecuperadas}&limit=${limitNoRecuperadas}${searchParam}`;
            const noRecuperadasResponse = await fetch(noRecuperadasUrl, { headers });
            if (!noRecuperadasResponse.ok) throw new Error('Error al cargar órdenes no recuperadas');
            const noRecuperadasData = await noRecuperadasResponse.json();

            setOrdenesRecuperacion(recuperacionData.data || []);
            setPaginationRecuperacion(recuperacionData.pagination || null);

            setOrdenesNoRecuperadas(noRecuperadasData.data || []);
            setPaginationNoRecuperadas(noRecuperadasData.pagination || null);
        } catch (error) {
            console.error('Error cargando órdenes:', error);
            showToast('Error al cargar órdenes de recuperación', 'error');
        } finally {
            setLoading(false);
            setSearching(false); // Desactivar indicador de búsqueda
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'En proceso de recuperacion':
                return 'default';
            case 'Recuperacion fallida':
                return 'destructive';
            case 'Recuperacion Efectiva - en tiempos':
                return 'secondary';
            case 'Recuperacion Efectiva - fuera de de tiempos':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const OrdenCard = ({ orden }) => {
        return (
            <Card key={orden.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Header con número y estado */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Orden #{orden.numero}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Creada: {formatDate(orden.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Información del cliente */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{orden.nombre_cliente}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{orden.celular_cliente}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono font-medium">{orden.placa}</span>
                                <span className="text-muted-foreground">
                                    {orden.marca} {orden.modelo}
                                </span>
                            </div>
                        </div>

                        {/* Información de intentos de contacto */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Intentos:</span>
                                <span className={`font-medium text-sm px-2 py-1 rounded-full ${(orden.call_count || 0) === 0
                                    ? 'bg-gray-100 text-gray-600'
                                    : (orden.call_count || 0) <= 2
                                        ? 'bg-blue-100 text-blue-700'
                                        : (orden.call_count || 0) <= 4
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {orden.call_count || 0}
                                </span>
                            </div>
                        </div>

                        {/* Botón de acción */}
                        <div className="pt-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                onClick={() => handleContactOrder(orden)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Gestionar Recuperacion
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const PaginationControls = ({ pagination, currentPage, onPageChange, itemName }) => {
        if (!pagination || pagination.totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                    Mostrando {pagination.totalCount} {itemName}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm px-2">
                        Página {currentPage} de {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= pagination.totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        );
    };

    const SearchIndicator = () => {
        if (!searching) return null;

        return (
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Buscando órdenes...</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Autogestiones sin actividad</h1>
                    <p className="text-muted-foreground">
                        Gestiona las órdenes que requieren seguimiento para completar la inspección
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {/* Búsqueda */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por número, cliente, placa..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-8"
                    />
                </div>
            </div>

            <SearchIndicator />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recuperacion">
                        En gestión activa
                    </TabsTrigger>
                    <TabsTrigger value="fallidas">
                        Gestión concluida sin acción
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="recuperacion" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes en gestión activa</CardTitle>
                            <CardDescription>
                                Órdenes que están en proceso de gestión (2-5 días sin contacto exitoso)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordenesRecuperacion.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay órdenes en recuperación</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm ? 'No se encontraron órdenes que coincidan con tu búsqueda.' : 'Todas las órdenes están en buen estado.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ordenesRecuperacion.map((orden) => (
                                            <OrdenCard key={orden.id} orden={orden} />
                                        ))}
                                    </div>
                                    <PaginationControls
                                        pagination={paginationRecuperacion}
                                        currentPage={pageRecuperacion}
                                        onPageChange={setPageRecuperacion}
                                        itemName="órdenes en recuperación"
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fallidas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes con gestión concluida sin acción</CardTitle>
                            <CardDescription>
                                Órdenes que han fallado en el proceso de gestión (6+ días sin contacto)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordenesNoRecuperadas.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay órdenes con recuperación fallida</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm ? 'No se encontraron órdenes que coincidan con tu búsqueda.' : 'Excelente trabajo en la recuperación de órdenes.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ordenesNoRecuperadas.map((orden) => (
                                            <OrdenCard key={orden.id} orden={orden} />
                                        ))}
                                    </div>
                                    <PaginationControls
                                        pagination={paginationNoRecuperadas}
                                        currentPage={pageNoRecuperadas}
                                        onPageChange={setPageNoRecuperadas}
                                        itemName="órdenes fallidas"
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Panel de gestión de recuperación */}
            <AgentOrderPanel
                isOpen={isOrderPanelOpen}
                onOpenChange={setIsOrderPanelOpen}
                selectedOrder={selectedOrder}
                callStatuses={callStatuses}
                onOrderUpdate={() => {
                    // Recargar las órdenes cuando se actualice una
                    loadOrdenes();
                }}
            />
        </div>
    );
};

export default AgentOrdenesRecuperacion;