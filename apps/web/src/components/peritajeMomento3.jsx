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

            // Si es agente, filtrar solo los peritajes asignados a él
            if (isAgente && !isCoordinador) {
                const filteredPeritajes = data.data.filter(peritaje =>
                    peritaje.assigned_agent_id === user.id
                );
                setPeritajes(filteredPeritajes);
            } else {
                setPeritajes(data.data);
            }
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
        setShowScheduleDialog(true);
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
                        Peritajes - Momento 3
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
                                        <CardContent className="p-4">
                                            {/* Header Section */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-primary/10 rounded-lg">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-foreground">{peritaje.placa}</h3>
                                                        <p className="text-sm text-muted-foreground mt-0.5">{formatDate(peritaje.created_at)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge
                                                        variant={isAssigned ? "default" : "secondary"}
                                                        className={`${isAssigned ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
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
                                                    <span className='text-sm text-muted-foreground mt-0.5'>
                                                        {peritaje.producto.split("_").join(" ")}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="space-y-6 mb-6">
                                                {/* Cliente Section */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                                                        <User className="h-4 w-4 text-primary" />
                                                        <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">Cliente</h4>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <p className="font-medium text-foreground">{peritaje.nombre_cliente}</p>
                                                        <a
                                                            href={`tel:${peritaje.celular_cliente}`}
                                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {peritaje.celular_cliente}
                                                        </a>
                                                        <a
                                                            href={`mailto:${peritaje.correo_cliente}`}
                                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors truncate"
                                                        >
                                                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                            <span className="truncate">{peritaje.correo_cliente}</span>
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Vehículo Section */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Car className="h-4 w-4 text-primary" />
                                                        <div className="font-medium text-sm text-foreground uppercase tracking-wide space-y-2.5">
                                                            <p className="text-sm text-foreground">
                                                                <span className="font-medium">{peritaje.marca}</span>
                                                                <span className="text-muted-foreground"> • {peritaje.modelo}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Asignación Section */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <div
                                                            className={`flex w-full items-center gap-2 p-2 rounded-lg`}
                                                        >
                                                            {isAssigned ? (
                                                                <UserCheck className="h-4 w-4 flex-shrink-0" />
                                                            ) : (
                                                                <UserX className="h-4 w-4 flex-shrink-0" />
                                                            )}
                                                            <span className="text-sm font-medium">{getAssignedAgentName(peritaje)}</span>
                                                        </div>

                                                        <div className="flex w-full flex-col">
                                                            {isCoordinador && (
                                                                <div className="flex items-center gap-2">
                                                                    <Select
                                                                        value={assigningAgent === peritaje.id ? selectedAgent : peritaje.assigned_agent_id?.toString() || ""}
                                                                        onValueChange={(value) => {
                                                                            setSelectedAgent(value);
                                                                            handleAssignAgent(peritaje.id, value);
                                                                        }}
                                                                        disabled={assigningAgent === peritaje.id}
                                                                    >
                                                                        <SelectTrigger className="flex-1 bg-card">
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
                                                            )}

                                                            {isAgente && peritaje.assigned_agent_id === user.id && (
                                                                <Button
                                                                    onClick={() => openScheduleDialog(peritaje)}
                                                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                                                                    size="default"
                                                                >
                                                                    <CalendarIcon className="h-4 w-4" />
                                                                    Agendar Peritaje
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <CalendarIcon className="h-6 w-6 text-primary" />
                            </div>
                            Agendar Peritaje
                        </DialogTitle>
                        <DialogDescription>
                            Configura los detalles del agendamiento para el peritaje {selectedPeritaje?.numero}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Información del peritaje seleccionado */}
                    {selectedPeritaje && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                                Información del Peritaje
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Cliente:</span>
                                    <p className="font-medium">{selectedPeritaje.nombre_cliente}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Vehículo:</span>
                                    <p className="font-medium">{selectedPeritaje.marca} {selectedPeritaje.modelo}</p>
                                    <p className="font-mono text-xs bg-gray-200 px-1 rounded w-fit">{selectedPeritaje.placa}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Contacto:</span>
                                    <p className="font-medium">{selectedPeritaje.celular_cliente}</p>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="space-y-6">
                        {/* Fecha y Hora */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Fecha y Hora
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_agendada" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha del peritaje *
                                    </Label>
                                    <Input
                                        id="fecha_agendada"
                                        type="date"
                                        value={scheduleForm.fecha_agendada}
                                        onChange={(e) => setScheduleForm(prev => ({ ...prev, fecha_agendada: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hora" className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Hora del peritaje
                                    </Label>
                                    <Input
                                        id="hora"
                                        type="time"
                                        value={scheduleForm.hora}
                                        onChange={(e) => setScheduleForm(prev => ({ ...prev, hora: e.target.value }))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modalidad y Ubicación */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Modalidad y Ubicación
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="modalidad_peritaje">Modalidad del peritaje</Label>
                                    <Select
                                        value={scheduleForm.modalidad_peritaje}
                                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, modalidad_peritaje: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="presencial">
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4" />
                                                    Presencial
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="virtual">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Virtual
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="domicilio">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    A Domicilio
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ciudad">Ciudad</Label>
                                    <Input
                                        id="ciudad"
                                        value={scheduleForm.ciudad}
                                        onChange={(e) => setScheduleForm(prev => ({ ...prev, ciudad: e.target.value }))}
                                        placeholder="Ciudad del peritaje"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direccion_peritaje">Dirección del peritaje</Label>
                                <Input
                                    id="direccion_peritaje"
                                    value={scheduleForm.direccion_peritaje}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, direccion_peritaje: e.target.value }))}
                                    placeholder="Dirección completa del peritaje"
                                />
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Observaciones Adicionales
                            </h4>
                            <div className="space-y-2">
                                <Label htmlFor="observaciones">Notas e información adicional</Label>
                                <Textarea
                                    id="observaciones"
                                    value={scheduleForm.observaciones}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, observaciones: e.target.value }))}
                                    placeholder="Observaciones adicionales para el peritaje, instrucciones especiales, etc."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3 pt-6 border-t">
                        <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                            <span>Cancelar</span>
                        </Button>
                        <Button
                            onClick={handleSchedulePeritaje}
                            disabled={!scheduleForm.fecha_agendada}
                            className="flex items-center gap-2"
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