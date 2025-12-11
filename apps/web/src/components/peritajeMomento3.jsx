import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, UserCheck, UserX, Calendar as CalendarIcon, Phone, Mail, Car, FileText, AlertCircle, Search, Filter, ChevronDown, Building } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { isHoliday } from '@/utils/holidays';

const PeritajeMomento3 = () => {
    const { user } = useAuth();
    const { hasRole } = useRoles();
    const { showToast } = useNotificationContext();

    const [peritajes, setPeritajes] = useState([]);
    const [filteredPeritajes, setFilteredPeritajes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningAgent, setAssigningAgent] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedPeritaje, setSelectedPeritaje] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        fecha_agendada: '',
        hora: '',
        direccion_peritaje: '',
        ciudad: '',
        modalidad_peritaje: 'presencial',
        observaciones: ''
    });
    const [disponibilidad, setDisponibilidad] = useState({});
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

    // Horarios disponibles
    const timeSlots = [
        { time: '08:00', label: '8:00 AM', icon: '🌅', description: 'Mañana' },
        { time: '11:00', label: '11:00 AM', icon: '☀️', description: 'Mediodía' },
        { time: '14:00', label: '2:00 PM', icon: '🌤️', description: 'Tarde' }
    ];

    // Verificar roles
    const isCoordinador = hasRole('coordinador_contacto');
    const isAgente = hasRole('agente_contacto');

    useEffect(() => {
        loadPeritajes();
        if (isCoordinador) {
            loadAgents();
        }
    }, [isCoordinador]);

    // Efecto para filtrar peritajes cuando cambian los criterios de búsqueda
    useEffect(() => {
        let filtered = [...peritajes];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(peritaje =>
                peritaje.numero?.toLowerCase().includes(searchLower) ||
                peritaje.nombre_cliente?.toLowerCase().includes(searchLower) ||
                peritaje.placa?.toLowerCase().includes(searchLower) ||
                peritaje.celular_cliente?.toLowerCase().includes(searchLower) ||
                peritaje.correo_cliente?.toLowerCase().includes(searchLower) ||
                peritaje.marca?.toLowerCase().includes(searchLower) ||
                peritaje.modelo?.toLowerCase().includes(searchLower)
            );
        }

        // Filtrar por estado de asignación
        if (filterStatus !== 'all') {
            if (filterStatus === 'assigned') {
                filtered = filtered.filter(peritaje => peritaje.assigned_agent_id);
            } else if (filterStatus === 'unassigned') {
                filtered = filtered.filter(peritaje => !peritaje.assigned_agent_id);
            }
        }

        setFilteredPeritajes(filtered);
    }, [peritajes, searchTerm, filterStatus]);

    const loadPeritajes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const response = await fetch(API_ROUTES.PERITAJES.GET_PENDING_TO_SCHEDULE, { headers });

            if (!response.ok) {
                throw new Error('Error al cargar peritajes');
            }

            const data = await response.json();

            // Validar que la respuesta tenga la estructura esperada
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.warn('Respuesta de peritajes no tiene la estructura esperada:', data);
                setPeritajes([]);
                return;
            }

            setPeritajes(data.data);
        } catch (error) {
            console.error('Error cargando peritajes:', error);
            showToast('Error al cargar peritajes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const response = await fetch(API_ROUTES.PERITAJES.GET_AGENTES_CONTACTO, { headers });

            if (!response.ok) {
                throw new Error('Error al cargar agentes');
            }

            const data = await response.json();

            // Validar que la respuesta tenga la estructura esperada
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.warn('Respuesta de agentes no tiene la estructura esperada:', data);
                setAgents([]);
                return;
            }

            // Los agentes ya vienen filtrados desde el backend
            setAgents(data.data);
        } catch (error) {
            console.error('Error cargando agentes:', error);
            showToast('Error al cargar agentes', 'error');
        }
    };

    const loadDisponibilidad = async (fecha) => {
        try {
            setLoadingDisponibilidad(true);
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${API_ROUTES.PERITAJES.DISPONIBILIDAD_HORARIOS}?fecha=${fecha}`, {
                method: 'GET',
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cargar disponibilidad');
            }

            setDisponibilidad(data.data || {});
        } catch (error) {
            console.error('Error cargando disponibilidad:', error);
            showToast('Error al cargar disponibilidad de horarios', 'error');
            setDisponibilidad({});
        } finally {
            setLoadingDisponibilidad(false);
        }
    };

    const handleAssignAgent = async (peritajeId, agentId) => {
        try {
            setAssigningAgent(peritajeId);
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(API_ROUTES.PERITAJES.ASSIGN_AGENT, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    peritaje_order_id: peritajeId,
                    agent_id: agentId === 'unassign' ? null : agentId
                })
            });

            if (!response.ok) {
                throw new Error('Error al asignar agente');
            }

            const data = await response.json();
            showToast(data.message, 'success');
            loadPeritajes(); // Recargar la lista
        } catch (error) {
            console.error('Error asignando agente:', error);
            showToast('Error al asignar agente', 'error');
        } finally {
            setAssigningAgent(null);
            setSelectedAgent('');
        }
    };

    const handleSchedulePeritaje = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(API_ROUTES.PERITAJES.SCHEDULE, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    peritaje_order_id: selectedPeritaje.id,
                    ...scheduleForm
                })
            });

            if (!response.ok) {
                throw new Error('Error al agendar peritaje');
            }

            const data = await response.json();
            showToast(data.message, 'success');
            setShowScheduleDialog(false);
            setSelectedPeritaje(null);
            setScheduleForm({
                fecha_agendada: '',
                hora: '',
                direccion_peritaje: '',
                ciudad: '',
                modalidad_peritaje: 'presencial',
                observaciones: ''
            });
            loadPeritajes(); // Recargar la lista
        } catch (error) {
            console.error('Error agendando peritaje:', error);
            showToast('Error al agendar peritaje', 'error');
        }
    };

    const openScheduleDialog = (peritaje) => {
        setSelectedPeritaje(peritaje);
        setScheduleForm({
            fecha_agendada: '',
            hora: '',
            direccion_peritaje: '',
            ciudad: '',
            modalidad_peritaje: 'presencial',
            observaciones: ''
        });
        setShowScheduleDialog(true);
    };

    // Función para verificar si una fecha es válida (lunes a viernes, no festivo)
    const isValidDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        const dayOfWeek = date.getDay();

        // Verificar si es fin de semana (0 = domingo, 6 = sábado)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return false;
        }

        // Verificar si es festivo
        const holidayCheck = isHoliday(dateString);
        if (holidayCheck.isHoliday) {
            return false;
        }

        return true;
    };

    // Función para obtener el mensaje de error de fecha inválida
    const getDateErrorMessage = (dateString) => {
        if (!dateString) return null;

        const date = new Date(dateString + 'T00:00:00');
        const dayOfWeek = date.getDay();

        // Verificar si es sábado
        if (dayOfWeek === 6) {
            return 'No disponible el sábado';
        }

        // Verificar si es domingo
        if (dayOfWeek === 0) {
            return 'No disponible el domingo';
        }

        // Verificar si es festivo
        const holidayCheck = isHoliday(dateString);
        if (holidayCheck.isHoliday) {
            return `No disponible por festivo: ${holidayCheck.celebration}`;
        }

        return null;
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

    const getAssignedAgentName = (peritaje) => {
        if (!peritaje.assigned_agent_id) return 'Sin asignar';
        const agent = agents.find(a => a.id === peritaje.assigned_agent_id);
        return agent ? agent.name : 'Agente no encontrado';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando peritajes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Peritajes - Momento 3 y 4
                    </CardTitle>
                    <CardDescription>
                        {isCoordinador
                            ? 'Gestiona la asignación de agentes a peritajes pendientes'
                            : 'Peritajes asignados para agendar'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Barra de búsqueda y filtros */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Campo de búsqueda */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número, cliente, placa, teléfono..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filtro por estado de asignación */}
                            {isCoordinador && (
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los peritajes</SelectItem>
                                            <SelectItem value="assigned">Con agente asignado</SelectItem>
                                            <SelectItem value="unassigned">Sin agente asignado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>Total: {peritajes.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <UserCheck className="h-4 w-4" />
                                <span>Asignados: {peritajes.filter(p => p.assigned_agent_id).length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <UserX className="h-4 w-4" />
                                <span>Sin asignar: {peritajes.filter(p => !p.assigned_agent_id).length}</span>
                            </div>
                            {searchTerm && (
                                <div className="flex items-center gap-1">
                                    <Search className="h-4 w-4" />
                                    <span>Resultados: {filteredPeritajes.length}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {peritajes.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                {isCoordinador
                                    ? 'No hay peritajes pendientes de asignación'
                                    : 'No tienes peritajes asignados para agendar'
                                }
                            </p>
                        </div>
                    ) : filteredPeritajes.length === 0 ? (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No se encontraron peritajes que coincidan con los criterios de búsqueda
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                className="mt-2"
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredPeritajes.map((peritaje) => {
                                const isAssigned = !!peritaje.assigned_agent_id;
                                return (
                                    <Card key={peritaje.id} className="overflow-hidden border-border hover:shadow-md transition-shadow duration-200">
                                        <CardContent className="p-0">
                                            {/* Header Section */}
                                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b border-border">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/20 rounded-lg">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg text-foreground">{peritaje.placa}</h3>
                                                            <p className="text-sm text-muted-foreground">{formatDate(peritaje.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge
                                                            variant={peritaje.momento === 3 ? "secondary" : "default"}
                                                            className={`${peritaje.momento === 3 ? "bg-blue-500/10 text-blue-700 border-blue-200" : "bg-purple-500/10 text-purple-700 border-purple-200"}`}
                                                        >
                                                            {peritaje.momento}
                                                        </Badge>
                                                        <Badge
                                                            variant={isAssigned ? "default" : "secondary"}
                                                            className={`${isAssigned ? "bg-green-500/10 text-green-700 border-green-200" : "bg-orange-500/10 text-orange-700 border-orange-200"}`}
                                                        >
                                                            {isAssigned ? (
                                                                <>
                                                                    <UserCheck className="h-3 w-3 mr-1.5" />
                                                                    Asignado
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserX className="h-3 w-3 mr-1.5" />
                                                                    Pendiente
                                                                </>
                                                            )}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground bg-white/60 px-2 py-1 rounded-md">
                                                            {peritaje.producto?.split("_").join(" ") || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Perito Asignado */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <UserCheck className="h-4 w-4 text-blue-600" />
                                                        <h4 className="font-medium text-sm text-blue-800 uppercase tracking-wide">Perito Asignado</h4>
                                                    </div>
                                                    <p className="font-semibold text-blue-900">{peritaje.creator?.name || 'Sin asignar'}</p>
                                                </div>

                                                {/* Información en dos columnas */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Datos del Cliente */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                                                            <User className="h-4 w-4 text-primary" />
                                                            <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">Cliente</h4>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="font-medium text-foreground">{peritaje.nombre_cliente || 'N/A'}</p>
                                                            {peritaje.celular_cliente && (
                                                                <a
                                                                    href={`tel:${peritaje.celular_cliente}`}
                                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                                >
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                    {peritaje.celular_cliente}
                                                                </a>
                                                            )}
                                                            {peritaje.correo_cliente && (
                                                                <a
                                                                    href={`mailto:${peritaje.correo_cliente}`}
                                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                                >
                                                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                                    <span className="truncate">{peritaje.correo_cliente}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Datos de Contacto */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                                                            <Phone className="h-4 w-4 text-primary" />
                                                            <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">Contacto</h4>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="font-medium text-foreground">{peritaje.nombre_contacto || 'N/A'}</p>
                                                            {peritaje.celular_contacto && (
                                                                <a
                                                                    href={`tel:${peritaje.celular_contacto}`}
                                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                                >
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                    {peritaje.celular_contacto}
                                                                </a>
                                                            )}
                                                            {peritaje.correo_contacto && (
                                                                <a
                                                                    href={`mailto:${peritaje.correo_contacto}`}
                                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                                >
                                                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                                    <span className="truncate">{peritaje.correo_contacto}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Información del Vehículo */}
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Car className="h-4 w-4 text-gray-600" />
                                                        <h4 className="font-medium text-sm text-gray-800 uppercase tracking-wide">Vehículo</h4>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{peritaje.marca || 'N/A'}</span>
                                                        <span className="text-gray-600">•</span>
                                                        <span className="text-gray-700">{peritaje.modelo || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* Sección de Asignación de Agente */}
                                                <div className="space-y-3 pt-2 border-t border-border">
                                                    {isCoordinador && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="h-4 w-4 text-primary" />
                                                                <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">Agente Asignado</h4>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                                {isAssigned ? (
                                                                    <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                                ) : (
                                                                    <UserX className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                                                )}
                                                                <span className="text-sm font-medium flex-1">{getAssignedAgentName(peritaje)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={assigningAgent === peritaje.id ? selectedAgent : peritaje.assigned_agent_id?.toString() || ""}
                                                                    onValueChange={(value) => {
                                                                        setSelectedAgent(value);
                                                                        handleAssignAgent(peritaje.id, value);
                                                                    }}
                                                                    disabled={assigningAgent === peritaje.id}
                                                                >
                                                                    <SelectTrigger className="flex-1">
                                                                        <SelectValue placeholder="Seleccionar agente" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="unassign">
                                                                            <div className="flex items-center gap-2">
                                                                                <UserX className="h-4 w-4 text-destructive" />
                                                                                <span>Quitar asignación</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                        {agents.map((agent) => (
                                                                            <SelectItem key={agent.id} value={agent.id.toString()}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <UserCheck className="h-4 w-4 text-accent" />
                                                                                    <span>{agent.name}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {assigningAgent === peritaje.id && (
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Botón de Agendar */}
                                                    <Button
                                                        onClick={() => openScheduleDialog(peritaje)}
                                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                                                        size="default"
                                                    >
                                                        <CalendarIcon className="h-4 w-4" />
                                                        Agendar Peritaje
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog para agendar peritaje */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                                <CalendarIcon className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <div>Agendar Peritaje</div>
                                <DialogDescription className="text-sm mt-1">
                                    Configure los detalles del agendamiento para el peritaje <span className="font-semibold text-primary">{selectedPeritaje?.numero}</span>
                                </DialogDescription>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Información del peritaje seleccionado */}
                    {selectedPeritaje && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                            <h4 className="font-semibold mb-4 text-sm text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <div className='flex justify-between w-full'>
                                    <div className='flex'>
                                        <FileText className="h-4 w-4" />
                                        Detalles
                                    </div>
                                    <div>
                                        <p className="font-mono text-sm bg-white px-2 py-1 rounded border border-gray-300 w-fit">{selectedPeritaje.placa}</p>
                                    </div>
                                </div>
                            </h4>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Cliente</span>
                                    <p className="font-semibold text-base">{selectedPeritaje.nombre_cliente}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Vehículo</span>
                                    <p className="font-semibold text-base">{selectedPeritaje.marca} {selectedPeritaje.modelo}</p>

                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Contacto</span>
                                    <p className="font-semibold text-base flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-primary" />
                                        {selectedPeritaje.celular_cliente}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 mt-2">
                        {/* Fecha y Hora */}
                        <div className="space-y-4 bg-white rounded-xl p-5 border border-gray-200">
                            <h4 className="font-semibold text-base text-gray-800 flex items-center gap-2 pb-2 border-b">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Fecha y Horario
                            </h4>

                            {/* Selector de Fecha */}
                            <div className="space-y-3">
                                <Label htmlFor="fecha_agendada" className="text-sm font-medium flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                    Seleccione la fecha del peritaje *
                                </Label>
                                <Input
                                    id="fecha_agendada"
                                    type="date"
                                    value={scheduleForm.fecha_agendada}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        setScheduleForm(prev => ({ ...prev, fecha_agendada: selectedDate, hora: '' }));

                                        // Cargar disponibilidad si la fecha es válida
                                        if (selectedDate && isValidDate(selectedDate)) {
                                            loadDisponibilidad(selectedDate);
                                        } else {
                                            setDisponibilidad({});
                                        }
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full text-base"
                                />
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Solo se permiten días de lunes a viernes (excluyendo festivos)
                                </p>
                            </div>

                            {/* Mensaje de error o Selector de Horario */}
                            {scheduleForm.fecha_agendada && (
                                <>
                                    {!isValidDate(scheduleForm.fecha_agendada) ? (
                                        <div className="pt-2">
                                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-3 bg-amber-100 rounded-full">
                                                        <AlertCircle className="h-8 w-8 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-lg text-amber-900">
                                                            {getDateErrorMessage(scheduleForm.fecha_agendada)}
                                                        </p>
                                                        <p className="text-sm text-amber-700 mt-1">
                                                            Por favor, seleccione otra fecha
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                Seleccione el horario *
                                            </Label>

                                            {loadingDisponibilidad ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-4">
                                                    {timeSlots.map((slot) => {
                                                        const slotKey = `${slot.time}:00`;
                                                        const disponibilidadSlot = disponibilidad[slotKey] || { ocupados: 0, total: 3, completo: false };
                                                        const isDisabled = disponibilidadSlot.completo;

                                                        return (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                onClick={() => !isDisabled && setScheduleForm(prev => ({ ...prev, hora: slot.time }))}
                                                                disabled={isDisabled}
                                                                className={`
                                                                    relative p-5 rounded-xl border-2 transition-all duration-200
                                                                    ${isDisabled
                                                                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                                                                        : scheduleForm.hora === slot.time
                                                                            ? 'border-primary bg-primary/10 shadow-md scale-105'
                                                                            : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <span className="text-2xl">{slot.icon}</span>
                                                                    <span className="text-lg font-bold text-gray-800">{slot.label}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {slot.description}
                                                                    </span>

                                                                    {/* Contador de disponibilidad */}
                                                                    <div className={`
                                                                        mt-2 px-3 py-1 rounded-full text-xs font-semibold
                                                                        ${isDisabled
                                                                            ? 'bg-red-100 text-red-700 border border-red-300'
                                                                            : disponibilidadSlot.ocupados >= 2
                                                                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                                                                : 'bg-green-100 text-green-700 border border-green-300'
                                                                        }
                                                                    `}>
                                                                        {disponibilidadSlot.ocupados}/{disponibilidadSlot.total}
                                                                    </div>
                                                                </div>

                                                                {scheduleForm.hora === slot.time && !isDisabled && (
                                                                    <div className="absolute top-2 right-2">
                                                                        <div className="bg-primary text-white rounded-full p-1">
                                                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modalidad y Ubicación */}
                        <div className="space-y-4 bg-white rounded-xl p-5 border border-gray-200">
                            <h4 className="font-semibold text-base text-gray-800 flex items-center gap-2 pb-2 border-b">
                                <MapPin className="h-5 w-5 text-primary" />
                                Modalidad y Ubicación
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <Label htmlFor="modalidad_peritaje" className="text-sm font-medium">Modalidad del peritaje</Label>
                                    <Select
                                        value={scheduleForm.modalidad_peritaje}
                                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, modalidad_peritaje: value }))}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="presencial">
                                                <div className="flex items-center gap-2 py-1">
                                                    <Building className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">Presencial</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="virtual">
                                                <div className="flex items-center gap-2 py-1">
                                                    <Phone className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">Virtual</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="domicilio">
                                                <div className="flex items-center gap-2 py-1">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">A Domicilio</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="ciudad" className="text-sm font-medium">Ciudad</Label>
                                    <Input
                                        id="ciudad"
                                        value={scheduleForm.ciudad}
                                        onChange={(e) => setScheduleForm(prev => ({ ...prev, ciudad: e.target.value }))}
                                        placeholder="Ej: Bogotá, Medellín, Cali..."
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="direccion_peritaje" className="text-sm font-medium">Dirección del peritaje</Label>
                                <Input
                                    id="direccion_peritaje"
                                    value={scheduleForm.direccion_peritaje}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, direccion_peritaje: e.target.value }))}
                                    placeholder="Dirección completa donde se realizará el peritaje"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-4 bg-white rounded-xl p-5 border border-gray-200">
                            <h4 className="font-semibold text-base text-gray-800 flex items-center gap-2 pb-2 border-b">
                                <FileText className="h-5 w-5 text-primary" />
                                Observaciones Adicionales
                            </h4>
                            <div className="space-y-3">
                                <Label htmlFor="observaciones" className="text-sm font-medium">Notas e información adicional</Label>
                                <Textarea
                                    id="observaciones"
                                    value={scheduleForm.observaciones}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, observaciones: e.target.value }))}
                                    placeholder="Agregue cualquier observación, instrucción especial o detalle importante para el peritaje..."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3 pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                        <Button
                            variant="outline"
                            onClick={() => setShowScheduleDialog(false)}
                            className="h-11"
                        >
                            <span>Cancelar</span>
                        </Button>
                        <Button
                            onClick={handleSchedulePeritaje}
                            disabled={!scheduleForm.fecha_agendada || !scheduleForm.hora || !isValidDate(scheduleForm.fecha_agendada)}
                            className="flex items-center gap-2 h-11 px-6"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Confirmar Agendamiento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PeritajeMomento3;