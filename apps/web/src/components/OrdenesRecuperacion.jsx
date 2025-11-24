import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { AlertCircle, Search, Phone, MessageSquare, Calendar, User, Car, FileText, Clock, Filter, UserPlus, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const OrdenesRecuperacion = () => {
    const { showToast } = useNotificationContext();

    const [ordenesRecuperacion, setOrdenesRecuperacion] = useState([]);
    const [ordenesNoRecuperadas, setOrdenesNoRecuperadas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'placa', 'numero'
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('recuperacion');
    const [agents, setAgents] = useState([]);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [expanded, setExpanded] = useState({}); // { [orderId]: boolean }
    const [activityByOrder, setActivityByOrder] = useState({}); // { [orderId]: { events: [], counts: {calls,sms} } }
    const [activityLoading, setActivityLoading] = useState({}); // { [orderId]: boolean }

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
        loadAgents();
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
                setAgents(data.data || []);
            }
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOrdenes();
        setRefreshing(false);
        showToast('Órdenes actualizadas', 'success');
    };

    const handleAssignAgent = async (inspectionOrderId, agentId) => {
        setAssigningOrder(inspectionOrderId);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.COORDINADOR_CONTACTO.ASSIGN, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inspection_order_id: inspectionOrderId,
                    agent_id: agentId
                })
            });

            if (response.ok) {
                await loadOrdenes();
                setSelectedAgent('');
            } else {
                console.error('Error assigning agent');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setAssigningOrder(null);
        }
    };

    const handleAgentChange = (value) => {
        setSelectedAgent(value);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleExpand = async (ordenId) => {
        const isOpen = !!expanded[ordenId];
        const next = { ...expanded, [ordenId]: !isOpen };
        setExpanded(next);
        if (!isOpen && !activityByOrder[ordenId]) {
            await loadActividad(ordenId);
        }
    };

    const loadActividad = async (ordenId) => {
        try {
            setActivityLoading(prev => ({ ...prev, [ordenId]: true }));
            const token = localStorage.getItem('authToken');
            const resp = await fetch(API_ROUTES.COORDINADOR_CONTACTO.ORDEN_ACTIVIDAD(ordenId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!resp.ok) throw new Error('Error cargando actividad');
            const data = await resp.json();
            setActivityByOrder(prev => ({ ...prev, [ordenId]: data.data }));
        } catch (e) {
            console.error('Error cargando actividad:', e);
            showToast('No se pudo cargar la actividad de la orden', 'error');
        } finally {
            setActivityLoading(prev => ({ ...prev, [ordenId]: false }));
        }
    };

    const getDaysFromCreation = (createdAt) => {
        if (!createdAt) return 0;
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const renderOrdenCard = (orden, showDays = false) => {
        const diasDesdeCreacion = getDaysFromCreation(orden.created_at);

        return (
            <Card key={orden.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Orden #{orden.numero}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Creada: {formatDate(orden.created_at)}
                            </CardDescription>
                        </div>
                        {showDays && (
                            <Badge variant={diasDesdeCreacion >= 6 ? 'destructive' : 'warning'} className="ml-2">
                                Día {diasDesdeCreacion}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Información del cliente */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{orden.nombre_cliente || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{orden.celular_cliente || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>{orden.marca} {orden.modelo} - {orden.placa}</span>
                        </div>
                    </div>

                    {/* Contadores de actividad */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Actividad de Contacto</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Llamadas</span>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                                    {orden.call_count || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">SMS</span>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-900">
                                    {orden.sms_count || 0}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Estado y agente asignado */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Estado: <span className="font-medium">{orden.estado || 'Pendiente'}</span>
                                </span>
                            </div>
                            {orden.assigned_agent_name && (
                                <Badge variant="outline">
                                    <User className="h-3 w-3 mr-1" />
                                    {orden.assigned_agent_name}
                                </Badge>
                            )}
                        </div>

                        {/* Selector de agente */}
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={assigningOrder === orden.id ? selectedAgent : (orden.AssignedAgent?.id?.toString() || '')}
                                onValueChange={(value) => {
                                    handleAgentChange(value);
                                    handleAssignAgent(orden.id, value);
                                }}
                                disabled={assigningOrder === orden.id}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder={orden.assigned_agent_name ? "Reasignar agente" : "Asignar agente"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                            {agent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {assigningOrder === orden.id && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            )}
                        </div>

                        {/* Botón para ver actividad */}
                        <div className="pt-2">
                            <Button variant="outline" size="sm" onClick={() => toggleExpand(orden.id)}>
                                {expanded[orden.id] ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                                {expanded[orden.id] ? 'Ocultar actividad' : 'Ver actividad'}
                            </Button>
                        </div>

                        {/* Timeline de actividad */}
                        {expanded[orden.id] && (
                            <div className="mt-3 border-t pt-3">
                                {activityLoading[orden.id] ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                        <span className="ml-2 text-sm text-muted-foreground">Cargando actividad...</span>
                                    </div>
                                ) : !activityByOrder[orden.id] ? (
                                    <div className="text-center py-4 text-sm text-muted-foreground">Sin actividad reciente</div>
                                ) : activityByOrder[orden.id].events.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-muted-foreground">Sin actividad registrada</div>
                                ) : (
                                    <div className="relative pl-8 pr-2 py-2">
                                        {/* Línea vertical del timeline */}
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

                                        {/* Eventos del timeline */}
                                        <div className="space-y-4">
                                            {activityByOrder[orden.id].events.map((ev, idx) => (
                                                <div key={`${ev.type}-${ev.id}`} className="relative">
                                                    {/* Punto del timeline */}
                                                    <div className={`absolute -left-[1.7rem] top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${ev.type === 'call'
                                                        ? 'bg-blue-500 ring-4 ring-blue-100'
                                                        : 'bg-green-500 ring-4 ring-green-100'
                                                        }`}>
                                                        {ev.type === 'call' ? (
                                                            <Phone className="h-3 w-3 text-white" />
                                                        ) : (
                                                            <MessageSquare className="h-3 w-3 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Contenido del evento */}
                                                    <div className={`ml-2 p-3 rounded-lg border transition-all hover:shadow-md ${ev.type === 'call'
                                                        ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                                                        : 'bg-green-50 border-green-200 hover:border-green-300'
                                                        }`}>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-sm text-gray-900">
                                                                    {ev.type === 'call' ? (
                                                                        <span className="flex items-center gap-1">
                                                                            <span>Llamada</span>
                                                                            {ev.agent?.name && (
                                                                                <Badge variant="secondary" className="ml-1 text-xs">
                                                                                    {ev.agent.name}
                                                                                </Badge>
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1">
                                                                            <span>SMS enviado</span>
                                                                            {ev.recipient?.phone && (
                                                                                <Badge variant="secondary" className="ml-1 text-xs font-mono">
                                                                                    {ev.recipient.phone}
                                                                                </Badge>
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-600">
                                                                    {ev.type === 'call' ? (
                                                                        <div className="space-y-0.5">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-medium">Estado:</span>
                                                                                <Badge variant={ev.creates_schedule ? "default" : "outline"} className="text-xs">
                                                                                    {ev.status}
                                                                                </Badge>
                                                                                {ev.creates_schedule && (
                                                                                    <span className="text-green-600 text-xs">✓ Crea agenda</span>
                                                                                )}
                                                                            </div>
                                                                            {ev.comments && (
                                                                                <div className="mt-1 italic text-gray-500">
                                                                                    "{ev.comments}"
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <Badge variant={
                                                                                ev.status === 'sent' || ev.status === 'delivered' ? 'default' :
                                                                                    ev.status === 'failed' || ev.status === 'error' ? 'destructive' :
                                                                                        'secondary'
                                                                            } className="text-xs">
                                                                                {ev.status}
                                                                            </Badge>
                                                                            <span className="text-gray-400">•</span>
                                                                            <span className="text-xs">{ev.sms_type}</span>
                                                                            {ev.priority && ev.priority !== 'normal' && (
                                                                                <>
                                                                                    <span className="text-gray-400">•</span>
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {ev.priority}
                                                                                    </Badge>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                                                    {new Date(ev.at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                                                                </div>
                                                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                                                    {new Date(ev.at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando órdenes en recuperación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con filtros y búsqueda */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Autogestiones sin actividad</h2>
                        <p className="text-muted-foreground">
                            Seguimiento de órdenes sin citas agendadas o en cola de inspección
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Actualizando...' : 'Actualizar'}
                        </Button>

                        {/* Indicador de búsqueda */}
                        {searching && (
                            <Button
                                disabled
                                variant="outline"
                                size="sm"
                            >
                                <Search className="h-4 w-4 mr-2 animate-pulse" />
                                Buscando...
                            </Button>
                        )}
                    </div>
                </div>

                {/* Controles de filtro y búsqueda */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tipo de búsqueda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los campos</SelectItem>
                                <SelectItem value="placa">Por Placa</SelectItem>
                                <SelectItem value="numero">Por Número de Orden</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 max-w-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={
                                    filterType === 'placa' ? 'Buscar por placa...' :
                                        filterType === 'numero' ? 'Buscar por número de orden...' :
                                            'Buscar por número, cliente, placa...'
                                }
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs para Recuperación y No Recuperadas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recuperacion" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        En gestión activa
                        <Badge variant="secondary" className="ml-2">
                            {paginationRecuperacion?.total || 0}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="no-recuperadas" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Gestión concluida sin acción
                    </TabsTrigger>
                </TabsList>

                {/* Tab: En Recuperación */}
                <TabsContent value="recuperacion">
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes en Proceso de Recuperación</CardTitle>
                            <CardDescription>
                                Órdenes creadas entre el día 2 y el día 5 sin cita agendada ni en cola de inspección.
                                Se monitorean las llamadas y SMS enviados durante este período.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordenesRecuperacion.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay órdenes en recuperación</h3>
                                    <p className="text-muted-foreground">
                                        No hay órdenes en el período de recuperación (días 2-5)
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ordenesRecuperacion.map(orden => renderOrdenCard(orden, true))}
                                    </div>

                                    {/* Paginación */}
                                    {paginationRecuperacion && paginationRecuperacion.pages > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Página {paginationRecuperacion.page} de {paginationRecuperacion.pages} ({paginationRecuperacion.total} órdenes)
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageRecuperacion(prev => Math.max(1, prev - 1))}
                                                    disabled={!paginationRecuperacion.hasPrev}
                                                >
                                                    Anterior
                                                </Button>
                                                <span className="text-sm">
                                                    Página {paginationRecuperacion.page} de {paginationRecuperacion.pages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageRecuperacion(prev => prev + 1)}
                                                    disabled={!paginationRecuperacion.hasNext}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: No Recuperadas */}
                <TabsContent value="no-recuperadas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Órdenes No Recuperadas</CardTitle>
                            <CardDescription>
                                Órdenes con 6 o más días desde su creación que no tienen cita agendada ni están en cola de inspección.
                                Requieren atención prioritaria o escalamiento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordenesNoRecuperadas.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay órdenes no recuperadas</h3>
                                    <p className="text-muted-foreground">
                                        No hay órdenes con 6 o más días sin recuperar
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ordenesNoRecuperadas.map(orden => renderOrdenCard(orden, true))}
                                    </div>

                                    {/* Paginación */}
                                    {paginationNoRecuperadas && paginationNoRecuperadas.pages > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Página {paginationNoRecuperadas.page} de {paginationNoRecuperadas.pages} ({paginationNoRecuperadas.total} órdenes)
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageNoRecuperadas(prev => Math.max(1, prev - 1))}
                                                    disabled={!paginationNoRecuperadas.hasPrev}
                                                >
                                                    Anterior
                                                </Button>
                                                <span className="text-sm">
                                                    Página {paginationNoRecuperadas.page} de {paginationNoRecuperadas.pages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPageNoRecuperadas(prev => prev + 1)}
                                                    disabled={!paginationNoRecuperadas.hasNext}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OrdenesRecuperacion;
